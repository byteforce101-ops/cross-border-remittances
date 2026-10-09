/**
 * integrations/factory.js
 *
 * Adapter factory — resolves and returns the correct adapter instance
 * based on rail identifier and environment configuration.
 *
 * Usage (future):
 *   import { getAdapter } from '../integrations/factory.js';
 *   const adapter = getAdapter('npci');   // returns mock or live depending on env
 *
 * This is the ONLY place where the decision between mock/live adapters is made.
 * Business logic never needs to know which variant is active.
 */

// TODO: Import adapters once they are implemented
// import { NpciMockAdapter } from './npci/mock/NpciMockAdapter.js';
// import { NpciLiveAdapter } from './npci/live/NpciLiveAdapter.js';
// import { SwiftAdapter } from './swift/SwiftAdapter.js';
// import { BlockchainRailAdapter } from './blockchain/BlockchainRailAdapter.js';

const ADAPTERS = {
  // npci: () => { ... },
  // swift: () => { ... },
  // blockchain: () => { ... },
};

/**
 * @param {'npci' | 'swift' | 'blockchain'} railId
 * @returns {import('./interface/PaymentRailAdapter.js').PaymentRailAdapter}
 */
export function getAdapter(railId) {
  const factory = ADAPTERS[railId];
  if (!factory) throw new Error(`Unknown payment rail: ${railId}`);
  return factory();
}

/**
 * Returns all registered rail identifiers.
 * @returns {string[]}
 */
export function getAvailableRails() {
  return Object.keys(ADAPTERS);
}
