/**
 * integrations/fx/live/FxLiveProvider.js
 *
 * Live FX rate provider — connects to a real FX API.
 *
 * STATUS: Not yet implemented. Requires:
 *   - FX_PROVIDER_API_KEY env var
 *   - Decision on which provider to use (e.g. Open Exchange Rates, Fixer.io)
 */

export class FxLiveProvider {
  async getRate(_toCurrency) {
    throw new Error('FxLiveProvider: not yet implemented');
  }

  async convert(_params) {
    throw new Error('FxLiveProvider: not yet implemented');
  }
}
