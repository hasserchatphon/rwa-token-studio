# API Contract

The local API lives in `apps/api` and is intentionally simulated. It persists demo assets, investor state, orders, holdings, and ledger entries in SQLite through Prisma Client.

Default local URL:

```text
http://127.0.0.1:8787
```

## Health

### `GET /health`

Returns API liveness.

```json
{
  "ok": true,
  "service": "rwa-token-studio-api"
}
```

## Assets

### `GET /api/assets`

Returns public asset cards.

```json
{
  "assets": [
    {
      "id": "asset_warehouse_01",
      "name": "North Loop Logistics Hub",
      "category": "real_estate",
      "tokenSymbol": "NLH",
      "tokenSupply": 250000,
      "tokensSold": 168400,
      "tokenPriceCents": 1000,
      "riskRating": "medium"
    }
  ]
}
```

### `GET /api/assets/:id`

Returns asset details, documents, rules, and current funding state.

Possible responses:

- `200 OK` with `{ "asset": ... }`
- `404 Not Found` when the asset does not exist

## Orders

### `POST /api/orders`

Creates a simulated subscription order after eligibility checks.

```json
{
  "assetId": "asset_warehouse_01",
  "tokens": 250
}
```

Possible responses:

- `201 Created` with order, updated asset, updated investor, and ledger entry.
- `400 Bad Request` for invalid quantity.
- `403 Forbidden` for KYC or jurisdiction restrictions.
- `409 Conflict` when the requested token supply is no longer available.

Example success response:

```json
{
  "order": {
    "id": "order_1782250000000",
    "assetId": "asset_warehouse_01",
    "investorId": "investor_demo_01",
    "tokens": 250,
    "amountCents": 250000,
    "status": "settled",
    "createdAt": "2026-06-24"
  },
  "ledgerEntry": {
    "id": "ledger_1782250000000",
    "assetId": "asset_warehouse_01",
    "investorId": "investor_demo_01",
    "type": "subscription",
    "tokens": 250,
    "amountCents": 250000,
    "createdAt": "2026-06-24",
    "status": "settled"
  }
}
```

## Portfolio

### `GET /api/portfolio`

Returns cash balance, token holdings, pending orders, and ledger history for the authenticated investor.

## Admin

Admin endpoints are open in the prototype. A production version should require role-based access control and immutable audit logs.

- `POST /api/admin/assets`

### `POST /api/admin/assets`

Creates a draft demo asset.

```json
{
  "name": "Civic Storage Portfolio",
  "category": "real_estate",
  "tokenSymbol": "CSP",
  "tokenSupply": 100000,
  "tokenPriceCents": 1000,
  "minTokensPerOrder": 100,
  "distributionRateBps": 750
}
```
