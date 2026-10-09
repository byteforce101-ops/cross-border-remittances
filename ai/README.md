/**
 * ai/README.md
 *
 * # AI / Risk Intelligence Layer
 *
 * This directory contains AI-powered analysis services.
 * All services in this layer are optional enhancements — the platform
 * functions (with reduced intelligence) even if these services are unavailable.
 *
 * ## Planned Modules
 *
 * ai/
 * ├── risk/
 * │   ├── RiskAnalyzer.js       ← Transaction risk scoring (rule-based → AI-powered)
 * │   └── AnomalyDetector.js    ← Flag unusual patterns in transaction streams
 * ├── routing/
 * │   └── RouteIntelligence.js  ← AI-assisted route recommendation
 * ├── compliance/
 * │   └── SanctionsScreener.js  ← Name / entity screening (initially rule-based)
 * └── providers/
 *     └── AIProviderClient.js   ← Thin wrapper over chosen AI API (Gemini, OpenAI, etc.)
 *
 * ## Integration Approach
 *
 * 1. Each AI module exposes a clean async interface.
 * 2. If an AI API key is absent, the module falls back to deterministic rule-based logic.
 * 3. AI prompts and model choices are configurable via environment variables.
 * 4. No raw PII is ever sent to external AI APIs — only anonymised, structured risk signals.
 */
