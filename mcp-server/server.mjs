#!/usr/bin/env node
// Minimal Model Context Protocol stdio server exposing UPS/FedEx shipping
// tools backed by the Next.js API routes in this repo.
//
// Speaks JSON-RPC 2.0 with newline-delimited messages on stdin/stdout
// (the "stdio transport" used by Claude Desktop and the MCP CLI).

import { createInterface } from "node:readline";

const BASE_URL = process.env.SHIPPING_API_BASE_URL ?? "http://localhost:3000";
const PROTOCOL_VERSION = "2024-11-05";
const SERVER_INFO = { name: "shipping-connector", version: "0.1.0" };

const TOOLS = [
  {
    name: "get_shipping_rates",
    description:
      "Get shipping rate quotes from UPS or FedEx for a package between two addresses.",
    inputSchema: {
      type: "object",
      required: ["carrier", "shipper", "recipient", "packages"],
      properties: {
        carrier: { type: "string", enum: ["ups", "fedex"] },
        shipper: { $ref: "#/$defs/address" },
        recipient: { $ref: "#/$defs/address" },
        packages: { type: "array", items: { $ref: "#/$defs/package" }, minItems: 1 },
        serviceCode: {
          type: "string",
          description: "Optional carrier service code. Omit to get all available services.",
        },
      },
      $defs: addressAndPackageDefs(),
    },
  },
  {
    name: "create_shipment",
    description:
      "Book a UPS or FedEx shipment and return tracking numbers plus a base64-encoded label.",
    inputSchema: {
      type: "object",
      required: ["carrier", "shipper", "recipient", "packages", "serviceCode"],
      properties: {
        carrier: { type: "string", enum: ["ups", "fedex"] },
        shipper: { $ref: "#/$defs/address" },
        recipient: { $ref: "#/$defs/address" },
        packages: { type: "array", items: { $ref: "#/$defs/package" }, minItems: 1 },
        serviceCode: { type: "string" },
        labelFormat: { type: "string", enum: ["PDF", "PNG", "ZPL"], default: "PDF" },
        reference: { type: "string" },
      },
      $defs: addressAndPackageDefs(),
    },
  },
  {
    name: "track_shipment",
    description: "Look up tracking status and scan events for a UPS or FedEx tracking number.",
    inputSchema: {
      type: "object",
      required: ["carrier", "trackingNumber"],
      properties: {
        carrier: { type: "string", enum: ["ups", "fedex"] },
        trackingNumber: { type: "string" },
      },
    },
  },
  {
    name: "validate_address",
    description: "Validate and normalize a postal address via UPS or FedEx.",
    inputSchema: {
      type: "object",
      required: ["carrier", "address"],
      properties: {
        carrier: { type: "string", enum: ["ups", "fedex"] },
        address: { $ref: "#/$defs/address" },
      },
      $defs: addressAndPackageDefs(),
    },
  },
];

function addressAndPackageDefs() {
  return {
    address: {
      type: "object",
      required: ["street", "city", "stateCode", "postalCode", "countryCode"],
      properties: {
        name: { type: "string" },
        company: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        street: { type: "array", items: { type: "string" }, minItems: 1 },
        city: { type: "string" },
        stateCode: { type: "string" },
        postalCode: { type: "string" },
        countryCode: { type: "string", description: "ISO-3166-1 alpha-2, e.g. 'US'" },
        residential: { type: "boolean" },
      },
    },
    package: {
      type: "object",
      required: ["weight", "weightUnit"],
      properties: {
        weight: { type: "number" },
        weightUnit: { type: "string", enum: ["LB", "KG"] },
        length: { type: "number" },
        width: { type: "number" },
        height: { type: "number" },
        dimensionUnit: { type: "string", enum: ["IN", "CM"] },
        declaredValue: {
          type: "object",
          properties: {
            amount: { type: "number" },
            currency: { type: "string" },
          },
        },
      },
    },
  };
}

async function callApi(path, init) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      detail = JSON.stringify(JSON.parse(text));
    } catch {}
    throw new Error(`API ${path} failed (${res.status}): ${detail}`);
  }
  return text ? JSON.parse(text) : {};
}

const HANDLERS = {
  async get_shipping_rates(args) {
    return callApi("/api/shipping/rates", {
      method: "POST",
      body: JSON.stringify(args),
    });
  },
  async create_shipment(args) {
    return callApi("/api/shipping/ship", {
      method: "POST",
      body: JSON.stringify(args),
    });
  },
  async track_shipment(args) {
    const params = new URLSearchParams({
      carrier: args.carrier,
      trackingNumber: args.trackingNumber,
    });
    return callApi(`/api/shipping/track?${params}`, { method: "GET" });
  },
  async validate_address(args) {
    return callApi("/api/shipping/validate-address", {
      method: "POST",
      body: JSON.stringify(args),
    });
  },
};

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function respond(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function error(id, code, message, data) {
  send({ jsonrpc: "2.0", id, error: { code, message, data } });
}

async function handleRequest(req) {
  const { id, method, params } = req;
  try {
    switch (method) {
      case "initialize":
        return respond(id, {
          protocolVersion: PROTOCOL_VERSION,
          serverInfo: SERVER_INFO,
          capabilities: { tools: { listChanged: false } },
        });
      case "notifications/initialized":
        return; // notification — no response
      case "ping":
        return respond(id, {});
      case "tools/list":
        return respond(id, { tools: TOOLS });
      case "tools/call": {
        const handler = HANDLERS[params?.name];
        if (!handler) {
          return error(id, -32601, `Unknown tool: ${params?.name}`);
        }
        try {
          const result = await handler(params.arguments ?? {});
          return respond(id, {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            isError: false,
          });
        } catch (err) {
          return respond(id, {
            content: [{ type: "text", text: err instanceof Error ? err.message : String(err) }],
            isError: true,
          });
        }
      }
      default:
        return error(id, -32601, `Method not found: ${method}`);
    }
  } catch (err) {
    return error(id, -32603, err instanceof Error ? err.message : "Internal error");
  }
}

const rl = createInterface({ input: process.stdin });
rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let req;
  try {
    req = JSON.parse(trimmed);
  } catch {
    return error(null, -32700, "Parse error");
  }
  handleRequest(req);
});

process.stderr.write(
  `shipping-connector MCP server ready (api base: ${BASE_URL})\n`
);
