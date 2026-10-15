/**
 * server/src/services/fxService.js
 *
 * Backend FX quote calculation service.
 * Connects to FxProviderRegistry for live public rates or benchmark fallback.
 * Uses decimal-safe monetary arithmetic from shared/utils/money.js.
 */

import { fxProviderRegistry } from '../../../integrations/fx/FxProviderRegistry.js';
import { CORRIDOR_CONFIG, RAIL_CATALOG, DATA_PROVENANCE } from '../config/orchestrationConfig.js';
import { roundTo, calculateRemittanceEconomics } from '../../../shared/utils/money.js';

export class FxService {
  getSupportedCurrencies() {
    return Object.values(CORRIDOR_CONFIG).map(c => c.sourceCurrency);
  }

  isCurrencySupported(currency) {
    if (!currency || typeof currency !== 'string') return false;
    const code = currency.toUpperCase();
    return Object.values(CORRIDOR_CONFIG).some(c => c.sourceCurrency === code);
  }

  getCorridorConfig(currency = 'AED') {
    const code = currency.toUpperCase();
    const found = Object.values(CORRIDOR_CONFIG).find(c => c.sourceCurrency === code);
    return found || CORRIDOR_CONFIG.UAE_INR;
  }

  getMidMarketRate(currency = 'AED') {
    const corridor = this.getCorridorConfig(currency);
    return corridor.defaultMidMarketRate;
  }

  getCorridorLimits(currency = 'AED') {
    const corridor = this.getCorridorConfig(currency);
    return { min: corridor.minAmount, max: corridor.maxAmount };
  }

  /**
   * Resolves mid-market reference rate asynchronously from live registry or fallback.
   */
  async resolveRateWithProvenance(fromCurrency = 'AED') {
    try {
      const result = await fxProviderRegistry.getRate(fromCurrency, 'INR');
      return result;
    } catch (err) {
      const benchmark = this.getMidMarketRate(fromCurrency);
      return {
        rate: benchmark,
        timestamp: new Date().toISOString(),
        provider: 'Configured Benchmark (Emergency Fallback)',
        providerId: 'mock',
        provenance: DATA_PROVENANCE.CONFIGURED_ESTIMATE,
        isLive: false,
        isCached: false,
      };
    }
  }

  /**
   * Generates a formal, decimal-safe indicative FX quote with route fee transparency.
   */
  calculateQuote({
    fromAmount,
    fromCurrency = 'AED',
    routeId = 'upi_partner',
    liveReferenceRate = null,
    rateProvenance = DATA_PROVENANCE.CONFIGURED_ESTIMATE,
    rateProviderName = 'Configured Benchmark',
  }) {
    const code = fromCurrency?.toUpperCase();
    if (!this.isCurrencySupported(code)) {
      throw new Error(`Unsupported sender currency: ${fromCurrency}. Supported: ${this.getSupportedCurrencies().join(', ')}`);
    }

    const amt = parseFloat(fromAmount);
    if (isNaN(amt) || amt <= 0) {
      throw new Error('Transaction amount must be a positive number');
    }

    const limits = this.getCorridorLimits(code);
    if (amt < limits.min) {
      throw new Error(`Minimum transfer amount is ${code} ${limits.min}`);
    }
    if (amt > limits.max) {
      throw new Error(`Maximum transfer amount on this demo corridor is ${code} ${limits.max}`);
    }

    const corridor = this.getCorridorConfig(code);
    const midRate = liveReferenceRate ? roundTo(liveReferenceRate, 4) : corridor.defaultMidMarketRate;

    // Look up route configuration
    const rail = RAIL_CATALOG.find(r => r.id === routeId) || RAIL_CATALOG[0];

    // Compute route-specific fee
    let baseFee = rail.fixedFeeAED;
    if (code === 'USD') baseFee = roundTo(baseFee * 0.27, 2);
    else if (code === 'GBP') baseFee = roundTo(baseFee * 0.22, 2);
    else if (code === 'EUR') baseFee = roundTo(baseFee * 0.25, 2);
    else if (code === 'SGD') baseFee = roundTo(baseFee * 0.37, 2);

    const spreadPct = rail.spreadPct || 0.0058;
    const appliedRate = roundTo(midRate * (1 - spreadPct), 4);

    // Decimal-safe remittance economics
    const economics = calculateRemittanceEconomics({
      sendAmount: amt,
      fixedFee: baseFee,
      midMarketRate: midRate,
      appliedRate,
      deductFeeFromPrincipal: true,
    });

    const quoteValiditySec = corridor.quoteValiditySeconds || 45;
    const expiresAt = new Date(Date.now() + quoteValiditySec * 1000).toISOString();

    return {
      quoteId: `QTE-${Date.now().toString(36).toUpperCase()}`,
      fromAmount: economics.sendAmount,
      fromCurrency: code,
      toCurrency: 'INR',
      feeAmount: economics.fixedFee,
      feeCurrency: code,
      convertedAmount: economics.convertedPrincipal,
      midRate: economics.midMarketRate,
      appliedRate: economics.appliedRate,
      fxSpreadPct: economics.fxSpreadPct,
      fxCost: economics.fxSpreadCost,
      totalCost: economics.totalCost,
      totalCostPct: economics.totalCostPct,
      effectiveRate: economics.effectiveRate,
      recipientINR: economics.recipientAmount,
      routeId: rail.id,
      routeName: rail.name,
      expiresAt,
      validitySeconds: quoteValiditySec,
      provenance: rateProvenance,
      rateProvider: rateProviderName,
      isSimulated: true,
      disclaimer: 'Simulated indicative rate for hackathon prototype testing. No real currency is exchanged.',
    };
  }
}

export const fxService = new FxService();
