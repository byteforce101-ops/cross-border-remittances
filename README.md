# Cross-Border Remittance Platform
### Drunix × Citi Hackathon — *Build the Future of Payments in India*

---

## Project Vision

An **intelligent cross-border payment orchestration and settlement platform** for transfers into India.

For every transaction, the system determines the most appropriate payment/settlement route based on **cost, speed, risk, liquidity, FX rates, reliability, and compliance** — using blockchain where it provides genuine value (settlement records, audit trails, verification).

---

## Architecture Overview

```
cross-border-remittances-main/
├── client/                   # React + Vite + Tailwind CSS frontend
├── server/                   # Node.js + Express API backend
│   └── src/
│       ├── routes/           # API route handlers
│       ├── services/         # Business logic (pure, framework-agnostic)
│       ├── models/           # Database query helpers (Supabase/PostgreSQL)
│       ├── middleware/        # Auth, rate limiting, validation
│       └── config/           # Env vars, DB client, logger
├── blockchain/               # Hardhat + Solidity (Ethereum Sepolia)
│   ├── contracts/            # Smart contracts (SettlementRecord, AuditTrail)
│   ├── scripts/              # Deployment scripts
│   └── test/                 # Contract tests
├── integrations/             # Payment rail adapter layer
│   ├── interface/            # PaymentRailAdapter abstract interface
│   ├── npci/mock|live/       # NPCI/UPI adapters (mock default, live when credentialed)
│   ├── swift/                # SWIFT correspondent banking adapter
│   ├── blockchain/           # Ethereum settlement rail adapter
│   ├── fx/mock|live/         # FX rate providers
│   └── factory.js            # Resolves adapter by rail ID + environment
├── ai/                       # Risk analysis, route intelligence, anomaly detection
│   ├── risk/                 # RiskAnalyzer (rule-based → AI-powered)
│   └── routing/              # RouteIntelligence (AI-assisted recommendations)
├── shared/                   # Constants and utilities used by client + server
│   ├── constants/            # corridors, transactionStatus, paymentRails
│   └── utils/                # currency formatting, validation
├── database/
│   ├── migrations/           # PostgreSQL schema migration SQL files
│   └── seeds/                # Development seed data
└── docs/
    ├── architecture/         # ADRs and architecture diagrams
    └── api/                  # API reference documentation
```

---

## Key Design Principles

| Principle | Implementation |
|---|---|
| Adapter Pattern for Rails | `integrations/factory.js` + `PaymentRailAdapter` interface |
| Mock → Live without code changes | `NPCI_ADAPTER=mock\|live` env var |
| Blockchain as complement | Records settlement outcomes — does not replace banking rails |
| No PII on-chain | Only hashed references stored in smart contracts |
| Shared constants | `shared/` imported by both client and server |
| Graceful AI degradation | AI services fall back to rule-based logic if unavailable |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Lucide Icons, Recharts, Framer Motion |
| Backend | Node.js, Express, Zod |
| Database | Supabase / PostgreSQL |
| Blockchain | Solidity, Hardhat, Ethereum Sepolia, ethers.js |
| AI/Risk | TBD (Gemini / OpenAI) |

---

## Getting Started

```bash
# Install all dependencies
npm run install:all

# Run client + server concurrently
npm run dev

# Run only server
npm run dev:server

# Run only client
npm run dev:client
```

---

## Development Status

> **Phase 1 — Project Structure** ✅ Complete
>
> No features have been implemented yet. This is the foundation scaffold.

---

## Hackathon

**Drunix × Citi | Theme: Build the Future of Payments in India**  
**Problem Statement: Cross-Border Remittances**
