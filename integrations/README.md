/**
 * integrations/README.md
 *
 * # Payment Rail Integration Layer
 *
 * This directory contains the **adapter layer** for all external payment
 * integrations. Every payment rail, FX provider, and NPCI connection is
 * accessed exclusively through a well-defined adapter interface.
 *
 * ## Design Principle
 *
 * The rest of the application (server/services) NEVER imports a specific
 * integration directly. It imports a named adapter resolved by the
 * factory. Swapping a live integration for a mock, sandbox, or a
 * completely different rail requires NO changes to business logic.
 *
 * ## Directory Layout
 *
 * integrations/
 * ├── interface/
 * │   └── PaymentRailAdapter.js   ← Abstract interface / JSDoc contract
 * ├── npci/
 * │   ├── mock/
 * │   │   └── NpciMockAdapter.js  ← Simulated NPCI — safe for demos
 * │   └── live/
 * │       └── NpciLiveAdapter.js  ← Real NPCI API (requires credentials)
 * ├── swift/
 * │   └── SwiftAdapter.js         ← SWIFT / correspondent banking rail
 * ├── blockchain/
 * │   └── BlockchainRailAdapter.js← Ethereum-based settlement rail
 * ├── fx/
 * │   ├── mock/
 * │   │   └── FxMockProvider.js   ← Static/seeded FX rates for demo
 * │   └── live/
 * │       └── FxLiveProvider.js   ← Real FX API (e.g. Open Exchange Rates)
 * └── factory.js                  ← Resolves and returns the correct adapter
 *
 * ## Adding a New Rail
 *
 * 1. Implement the PaymentRailAdapter interface.
 * 2. Register it in factory.js.
 * 3. Add the relevant env vars to .env.example.
 * 4. Done — no changes needed elsewhere.
 */
