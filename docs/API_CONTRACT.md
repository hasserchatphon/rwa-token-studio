# API Contract Draft

This draft describes the backend shape the demo is designed to grow into.

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

## Orders

### `POST /api/orders`

Creates a subscription or secondary-transfer order after eligibility checks.

```json
{
  "assetId": "asset_warehouse_01",
  "tokens": 250
}
```

Possible responses:

- `201 Created` with order details.
- `400 Bad Request` for invalid quantity.
- `403 Forbidden` for KYC or jurisdiction restrictions.
- `409 Conflict` when the requested token supply is no longer available.

## Portfolio

### `GET /api/portfolio`

Returns cash balance, token holdings, pending orders, and ledger history for the authenticated investor.

## Admin

Admin endpoints should require role-based access control and immutable audit logs.

- `POST /api/admin/assets`
- `PATCH /api/admin/assets/:id`
- `POST /api/admin/assets/:id/documents`
- `POST /api/admin/investors/:id/eligibility`

