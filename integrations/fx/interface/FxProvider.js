/**
 * integrations/fx/interface/FxProvider.js
 *
 * Abstract contract for FX reference rate providers.
 */

export class FxProvider {
  /**
   * Returns identifier for the provider (e.g., 'open_er_api', 'frankfurter', 'mock').
   * @returns {string}
   */
  get id() {
    throw new Error('Not implemented');
  }

  /**
   * Human-readable provider name.
   * @returns {string}
   */
  get name() {
    throw new Error('Not implemented');
  }

  /**
   * Returns data provenance classification (PUBLIC_REFERENCE, LIVE_PROVIDER, MOCK).
   * @returns {string}
   */
  get provenance() {
    throw new Error('Not implemented');
  }

  /**
   * Retrieves mid-market reference rate for a currency pair.
   * @param {string} fromCurrency - e.g. 'AED'
   * @param {string} toCurrency - e.g. 'INR'
   * @returns {Promise<{ rate: number, timestamp: string, provider: string, provenance: string, isLive: boolean }>}
   */
  async getReferenceRate(fromCurrency, toCurrency = 'INR') {
    throw new Error('Not implemented');
  }
}
