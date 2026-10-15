/**
 * integrations/fx/mock/FxMockProvider.js
 *
 * Deterministic Mock & Configured Benchmark FX provider.
 * Fallback for offline development, repeatable tests, and demo benchmarks.
 */

import { FxProvider } from '../interface/FxProvider.js';
import { CORRIDOR_CONFIG } from '../../../server/src/config/orchestrationConfig.js';

const STATIC_BENCHMARKS = {
  AED: 24.12,
  USD: 83.95,
  GBP: 108.50,
  SGD: 63.80,
  EUR: 91.40,
};

export class FxMockProvider extends FxProvider {
  get id() {
    return 'mock';
  }

  get name() {
    return 'Configured Indicative Benchmark (Offline)';
  }

  get provenance() {
    return 'CONFIGURED_ESTIMATE';
  }

  async getReferenceRate(fromCurrency, toCurrency = 'INR') {
    const code = fromCurrency.toUpperCase();
    const rate = STATIC_BENCHMARKS[code] || 24.12;
    return {
      rate,
      timestamp: new Date().toISOString(),
      provider: this.name,
      providerId: this.id,
      provenance: this.provenance,
      isLive: false,
      isCached: false,
    };
  }
}
