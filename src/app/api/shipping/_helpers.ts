import { CarrierError, parseCarrier } from "@/lib/shipping";

export function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 });
}

export function carrierFromRequest(url: URL, body?: { carrier?: unknown }): "ups" | "fedex" {
  const raw = body?.carrier ?? url.searchParams.get("carrier");
  return parseCarrier(raw);
}

export function handleError(err: unknown): Response {
  if (err instanceof CarrierError) {
    return Response.json(
      {
        error: err.message,
        carrier: err.carrier,
        status: err.status ?? 502,
      },
      { status: err.status && err.status >= 400 && err.status < 600 ? err.status : 502 }
    );
  }
  if (err instanceof Error) {
    return Response.json({ error: err.message }, { status: 500 });
  }
  return Response.json({ error: "Unknown error" }, { status: 500 });
}
