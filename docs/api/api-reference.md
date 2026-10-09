# Cross-Border Remittance Platform — API Reference

> **Status**: Placeholder. Endpoints will be documented here as they are implemented.

## Base URL

```
http://localhost:4000/api
```

## Planned Endpoints

### Health
- `GET /health` — Service health check ✅ (implemented)

### Transactions
- `POST /api/transactions` — Initiate a new remittance
- `GET /api/transactions/:id` — Get transaction status
- `GET /api/transactions` — List transactions (paginated)

### Route Optimizer
- `POST /api/route/analyze` — Analyse and recommend optimal route for a given transfer

### FX
- `GET /api/fx/rate?from=AED&to=INR` — Get current exchange rate
- `POST /api/fx/convert` — Convert amount between currencies

### Compliance
- `POST /api/compliance/check` — Run KYC/AML check for a sender

### Webhooks
- `POST /api/webhooks/npci` — Receive NPCI settlement notifications
- `POST /api/webhooks/blockchain` — Receive blockchain confirmation events
