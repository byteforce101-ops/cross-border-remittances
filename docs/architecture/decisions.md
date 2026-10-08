# Architecture Decision Records

This directory captures important architectural decisions made during the project.

Each ADR follows the format:
- **Status**: Proposed / Accepted / Deprecated
- **Context**: Why this decision was needed
- **Decision**: What was decided
- **Consequences**: What this implies going forward

---

## ADR-001 — Adapter Pattern for Payment Rails

**Status**: Accepted

**Context**: The platform needs to integrate with multiple payment rails (NPCI, SWIFT, Blockchain) and must support mock/sandbox/live variants without changing business logic. We also do not yet have real NPCI API credentials.

**Decision**: All payment rail integrations are accessed exclusively through the `PaymentRailAdapter` interface in `integrations/interface/PaymentRailAdapter.js`. The `integrations/factory.js` module resolves which concrete adapter to use based on environment variables. Business logic (server/services) never imports a concrete adapter directly.

**Consequences**:
- Adding a new rail requires only: implementing the interface + registering in factory.js.
- Switching from mock to live NPCI requires only changing `NPCI_ADAPTER=live` in env.
- All adapters are tested against the same interface contract.

---

## ADR-002 — Blockchain as Complement, Not Replacement

**Status**: Accepted

**Context**: Hackathon involves blockchain but the platform vision is about intelligent orchestration, not blockchain maximalism.

**Decision**: Blockchain (Ethereum Sepolia) is used exclusively for: immutable settlement records, audit trails, and optional smart-contract-based conditional settlement. It is NOT used as the primary payment rail. No PII is stored on-chain — only hashed references.

**Consequences**:
- Blockchain integration is encapsulated in `blockchain/` and `integrations/blockchain/`.
- Settlement can be recorded on-chain after an off-chain transfer succeeds.
- The platform remains functional even if the blockchain layer is unavailable.

---

## ADR-003 — Shared Constants as Single Source of Truth

**Status**: Accepted

**Context**: Transaction status codes, corridor definitions, and rail identifiers are used by frontend, backend, and blockchain. Duplicating them causes divergence bugs.

**Decision**: All shared constants live in `shared/constants/`. Both client and server import from there. The client Vite config aliases `@shared` to this directory.

**Consequences**:
- One change propagates everywhere.
- Adding a new corridor or status requires editing exactly one file.
