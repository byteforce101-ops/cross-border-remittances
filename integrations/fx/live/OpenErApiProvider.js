/**
 * integrations/fx/live/OpenErApiProvider.js
 *
 * Live public exchange rates from open.er-api.com.
 * Real-time daily FX benchmark provider supporting AED -> INR.
 * License: Open data with attribution to ExchangeRate-API.
 */

import { FxProvider } from '../interface/FxProvider.js';

export class OpenErApiProvider extends FxProvider {
  constructor(cacheTtlMs = 60 * 60 * 1000) { // 1 hour cache
    super();
    this.cacheTtlMs = cacheTtlMs;
    this.cache = new Map();
  }

  get id() {
    return 'open_er_api';
  }

  get name() {
    return 'ExchangeRate-API (Open Benchmark)';
  }

  get provenance() {
    return 'PUBLIC_REFERENCE';
  }

  async getReferenceRate(fromCurrency, toCurrency = 'INR') {
    const fromCode = fromCurrency.toUpperCase();
    const toCode = toCurrency.toUpperCase();
    const cacheKey = `${fromCode}_${toCode}`;

    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < this.cacheTtlMs) {
      return {
        ...cached.data,
        isCached: true,
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${fromCode}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`OpenErApi responded with status ${res.status}`);
      }

      const json = await res.json();
      if (json.result !== 'success' || !json.rates || !json.rates[toCode]) {
        throw new Error(`Rate for ${fromCode}/${toCode} unavailable from OpenErApi`);
      }

      const rate = Number(json.rates[toCode]);
      const data = {
        rate,
        timestamp: json.time_last_update_utc || new Date().toISOString(),
        provider: this.name,
        providerId: this.id,
        provenance: this.provenance,
        isLive: true,
        isCached: false,
      };

      this.cache.set(cacheKey, { data, cachedAt: Date.now() });
      return data;
    } catch (err) {
      // If we have any cached data even if expired, return it as STALE
      if (cached) {
        return {
          ...cached.data,
          isStale: true,
          staleWarning: `Live fetch failed (${err.message}). Using last known rate.`,
        };
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}
