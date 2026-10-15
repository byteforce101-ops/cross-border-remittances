/**
 * integrations/fx/live/FrankfurterProvider.js
 *
 * Official European Central Bank reference rate provider via Frankfurter API.
 * License: MIT.
 * Note: Covers EUR, USD, GBP, SGD into INR.
 * Note: AED is not published by the ECB.
 */

import { FxProvider } from '../interface/FxProvider.js';

export class FrankfurterProvider extends FxProvider {
  constructor(cacheTtlMs = 60 * 60 * 1000) {
    super();
    this.cacheTtlMs = cacheTtlMs;
    this.cache = new Map();
  }

  get id() {
    return 'frankfurter';
  }

  get name() {
    return 'Frankfurter API (ECB Public Reference)';
  }

  get provenance() {
    return 'PUBLIC_REFERENCE';
  }

  async getReferenceRate(fromCurrency, toCurrency = 'INR') {
    const fromCode = fromCurrency.toUpperCase();
    const toCode = toCurrency.toUpperCase();

    // ECB does not publish AED
    if (fromCode === 'AED') {
      throw new Error('AED is not tracked by the European Central Bank (Frankfurter)');
    }

    const cacheKey = `${fromCode}_${toCode}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < this.cacheTtlMs) {
      return { ...cached.data, isCached: true };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${fromCode}&symbols=${toCode}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Frankfurter responded with status ${res.status}`);
      }

      const json = await res.json();
      if (!json.rates || !json.rates[toCode]) {
        throw new Error(`Rate for ${fromCode}/${toCode} unavailable from Frankfurter`);
      }

      const rate = Number(json.rates[toCode]);
      const data = {
        rate,
        timestamp: json.date ? `${json.date}T16:00:00Z` : new Date().toISOString(),
        provider: this.name,
        providerId: this.id,
        provenance: this.provenance,
        isLive: true,
        isCached: false,
      };

      this.cache.set(cacheKey, { data, cachedAt: Date.now() });
      return data;
    } finally {
      clearTimeout(timeout);
    }
  }
}
