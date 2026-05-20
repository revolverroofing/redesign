# UPS / FedEx Shipping Connector

A unified connector that exposes UPS and FedEx shipping operations to your
application — and to Claude via an MCP server.

## Architecture

```
┌────────────┐         ┌──────────────────────┐         ┌───────────────┐
│  Claude    │ ──MCP── │  mcp-server (stdio)  │ ──HTTP─ │  Next.js API  │ ──HTTPS── UPS / FedEx
│  Desktop   │ ◀────── │  shipping-mcp        │ ◀────── │  /api/shipping│ ◀────────
└────────────┘         └──────────────────────┘         └───────────────┘
                                                                │
                                                                └─ src/lib/shipping/
                                                                   (UPS + FedEx providers)
```

- `src/lib/shipping/` — provider abstraction with concrete `UpsProvider` and
  `FedexProvider` classes. Handles OAuth, request signing, and shape
  normalization.
- `src/app/api/shipping/*` — Next.js Route Handlers that expose the providers
  over HTTP. These are server-only (`runtime = "nodejs"`) and read credentials
  from environment variables — they never reach the browser.
- `mcp-server/server.mjs` — a stdio MCP server that wraps the HTTP routes so
  Claude can call them as tools.

## Operations

| Operation         | HTTP endpoint                          | MCP tool             |
| ----------------- | -------------------------------------- | -------------------- |
| Get rates         | `POST /api/shipping/rates`             | `get_shipping_rates` |
| Create shipment   | `POST /api/shipping/ship`              | `create_shipment`    |
| Track shipment    | `GET  /api/shipping/track`             | `track_shipment`     |
| Validate address  | `POST /api/shipping/validate-address`  | `validate_address`   |

All endpoints accept either `carrier=ups` or `carrier=fedex` (as a JSON field
on POST bodies or a query parameter on GET).

## Configuration

Copy `.env.example` to `.env.local` and fill in credentials.

### UPS — https://developer.ups.com

1. Create an app under "Apps". Choose the APIs you need (Rating, Shipping,
   Tracking, Address Validation – Street Level).
2. The app gives you a **client ID** and **client secret** (OAuth 2.0 client
   credentials grant).
3. Find your six-character **shipper account number** under "My Account".
4. Set `UPS_CLIENT_ID`, `UPS_CLIENT_SECRET`, `UPS_ACCOUNT_NUMBER`.
5. For sandbox testing set `UPS_BASE_URL=https://wwwcie.ups.com`. Leave unset
   to default to production (`https://onlinetools.ups.com`).

### FedEx — https://developer.fedex.com

1. Register a project, create production or test API credentials.
2. You'll receive an **API Key** and **Secret Key**.
3. Provide the FedEx **account number** the credentials are tied to.
4. Set `FEDEX_API_KEY`, `FEDEX_API_SECRET`, `FEDEX_ACCOUNT_NUMBER`.
5. For sandbox testing set `FEDEX_BASE_URL=https://apis-sandbox.fedex.com`.
   Leave unset to default to production (`https://apis.fedex.com`).

## Using the HTTP API

```bash
# Get rates from FedEx
curl -X POST http://localhost:3000/api/shipping/rates \
  -H "content-type: application/json" \
  -d '{
    "carrier": "fedex",
    "shipper":   { "street": ["1600 Amphitheatre Pkwy"], "city": "Mountain View", "stateCode": "CA", "postalCode": "94043", "countryCode": "US" },
    "recipient": { "street": ["410 Terry Ave N"],         "city": "Seattle",       "stateCode": "WA", "postalCode": "98109", "countryCode": "US" },
    "packages": [{ "weight": 5, "weightUnit": "LB" }]
  }'

# Track a UPS package
curl "http://localhost:3000/api/shipping/track?carrier=ups&trackingNumber=1Z999AA10123456784"
```

## Using the MCP server with Claude Desktop

1. Start the Next.js app so the API routes are reachable: `pnpm dev`.
2. Add this entry to your Claude Desktop config
   (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

   ```json
   {
     "mcpServers": {
       "shipping": {
         "command": "node",
         "args": ["/absolute/path/to/redesign/mcp-server/server.mjs"],
         "env": {
           "SHIPPING_API_BASE_URL": "http://localhost:3000"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop. The four tools (`get_shipping_rates`,
   `create_shipment`, `track_shipment`, `validate_address`) will appear and
   Claude can call them on your behalf.

### Quick local sanity check

You can speak the protocol directly without Claude:

```bash
SHIPPING_API_BASE_URL=http://localhost:3000 node mcp-server/server.mjs <<'EOF'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
EOF
```

## Service codes cheat sheet

UPS (a few common ones — `serviceCode` field):

| Code | Service                     |
| ---- | --------------------------- |
| 01   | UPS Next Day Air            |
| 02   | UPS 2nd Day Air             |
| 03   | UPS Ground                  |
| 12   | UPS 3 Day Select            |
| 13   | UPS Next Day Air Saver      |

FedEx common services (pass the string as `serviceCode`):

| Value                    | Service                |
| ------------------------ | ---------------------- |
| `FEDEX_GROUND`           | Ground                 |
| `FEDEX_2_DAY`            | 2Day                   |
| `STANDARD_OVERNIGHT`     | Standard Overnight     |
| `PRIORITY_OVERNIGHT`     | Priority Overnight     |
| `FEDEX_EXPRESS_SAVER`    | Express Saver          |

## Security notes

- Credentials live only in server-side env vars; they are never sent to the
  browser. The Next.js routes set `runtime = "nodejs"` so they can't be
  accidentally bundled into an edge function with leaked secrets.
- The MCP server does not store credentials at all — it just forwards
  requests to the Next.js API.
- In production you should add authentication to the `/api/shipping/*`
  routes (e.g. a session check or signed token) so they aren't open to the
  internet.
