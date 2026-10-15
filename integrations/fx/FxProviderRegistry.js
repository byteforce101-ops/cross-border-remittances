/**
 * integrations/fx/FxProviderRegistry.js
 *
 * Resilient multi-provider FX aggregator.
 * Tries live providers first, reports provenance, and gracefully falls back to configured benchmarks.
 */

import { OpenErApiProvider } from './live/OpenErApiProvider.js';
import { FrankfurterProvider } from './live/FrankfurterProvider.js';
import { FxMockProvider } from './mock/FxMockProvider.js';

export class FxProviderRegistry {
  constructor() {
    this.openErApi = new OpenErApiProvider();
    this.frankfurter = new FrankfurterProvider();
    this.mock = new FxMockProvider();
  }

  /**
   * Fetches the best available exchange rate with transparent provenance.
   * @param {string} fromCurrency
   * @param {string} toCurrency
   * @param {boolean} [forceMock=false]
   */
  async getRate(fromCurrency, toCurrency = 'INR', forceMock = false) {
    const code = fromCurrency.toUpperCase();

    if (forceMock || process.env.NODE_ENV === 'test') {
      return this.mock.getReferenceRate(code, toCurrency);
    }

    // 1. For AED, use OpenErApiProvider (Frankfurter has no AED)
    if (code === 'AED') {
      try {
        return await this.openErApi.getReferenceRate(code, toCurrency);
      } catch (err) {
        console.warn(`[FxProviderRegistry] OpenErApi failed for AED, falling back to configured benchmark: ${err.message}`);
        return this.mock.getReferenceRate(code, toCurrency);
      }
    }

    // 2. For EUR/USD/GBP/SGD, try Frankfurter first (ECB benchmark)
    try {
      return await this.frankfurter.getReferenceRate(code, toCurrency);
    } catch (e1) {
      try {
        return await this.openErApi.getReferenceRate(code, toCurrency);
      } catch (e2) {
        console.warn(`[FxProviderRegistry] Live FX failed for ${code}, falling back to mock: ${e2.message}`);
        return this.mock.getReferenceRate(code, toCurrency);
      }
    }
  }
}

export const fxProviderRegistry = new FxProviderRegistry();
