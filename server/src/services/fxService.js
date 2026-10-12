/**
 * server/src/services/fxService.js
 *
 * Backend FX quote calculation service.
 * Supports multi-currency cross-border transfers into INR.
 *
 * All rates and fees are explicitly attributed to their currency units.
 */

// Indicative mid-market benchmark rates into INR
const MID_MARKET_RATES = {
  AED: 24.12, // 1 AED = 24.12 INR
  USD: 83.95, // 1 USD = 83.95 INR
  GBP: 108.50, // 1 GBP = 108.50 INR
  SGD: 63.80, // 1 SGD = 63.80 INR
  EUR: 91.40, // 1 EUR = 91.40 INR
};

// Base transfer fees per currency (fixed baseline component)
const BASE_FEES = {
  AED: 12.00,
  USD: 3.50,
  GBP: 2.80,
  SGD: 4.80,
  EUR: 3.20,
};

// Corridor transfer limits in source currency
const CORRIDOR_LIMITS = {
  AED: { min: 50, max: 25000 },
  USD: { min: 20, max: 10000 },
  GBP: { min: 15, max: 8000 },
  SGD: { min: 25, max: 15000 },
  EUR: { min: 20, max: 10000 },
};

export class FxService {
  getSupportedCurrencies() {
    return Object.keys(MID_MARKET_RATES);
  }

  isCurrencySupported(currency) {
    if (!currency || typeof currency !== 'string') return false;
    return Boolean(MID_MARKET_RATES[currency.toUpperCase()]);
  }

  getMidMarketRate(currency) {
    const code = currency?.toUpperCase();
    const rate = MID_MARKET_RATES[code];
    if (!rate) {
      throw new Error(`Unsupported sender currency: ${currency}. Supported currencies: ${Object.keys(MID_MARKET_RATES).join(', ')}`);
    }
    return rate;
  }

  getCorridorLimits(currency = 'AED') {
    const code = currency?.toUpperCase();
    return CORRIDOR_LIMITS[code] || { min: 10, max: 10000 };
  }

  /**
   * Generates a formal indicative FX quote.
   */
  calculateQuote({ fromAmount, fromCurrency = 'AED', routeId = 'upi_partner' }) {
    const code = fromCurrency?.toUpperCase();
    if (!this.isCurrencySupported(code)) {
      throw new Error(`Unsupported sender currency: ${fromCurrency}. Supported: ${Object.keys(MID_MARKET_RATES).join(', ')}`);
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

    const midRate = this.getMidMarketRate(code);

    // Route-specific fee adjustment factors
    let feeAmount = BASE_FEES[code] || 5.00;
    let spreadPct = 0.0058; // 0.58% standard

    if (routeId === 'imps_bank' || routeId === 'bank') {
      feeAmount = parseFloat((feeAmount * 1.5).toFixed(2));
      spreadPct = 0.0041; // lower spread
    } else if (routeId === 'blockchain_partner' || routeId === 'blockchain') {
      feeAmount = parseFloat((feeAmount * 0.75).toFixed(2));
      spreadPct = 0.0087;
    } else if (routeId === 'swift') {
      feeAmount = parseFloat((feeAmount * 3.5).toFixed(2));
      spreadPct = 0.0120;
    }

    // Applied retail rate into INR
    const appliedRate = parseFloat((midRate * (1 - spreadPct)).toFixed(4));
    const convertedAmount = Math.max(0, amt - feeAmount);
    const recipientINR = parseFloat((convertedAmount * appliedRate).toFixed(2));

    // FX margin cost in sender currency
    const fxCost = parseFloat((convertedAmount * ((midRate - appliedRate) / midRate)).toFixed(2));
    const totalCost = parseFloat((feeAmount + fxCost).toFixed(2));
    const totalCostPct = parseFloat(((totalCost / amt) * 100).toFixed(2));
    const fxSpreadPct = parseFloat((spreadPct * 100).toFixed(2));

    return {
      quoteId: `QTE-${Date.now().toString(36).toUpperCase()}`,
      fromAmount: amt,
      fromCurrency: code,
      toCurrency: 'INR',
      feeAmount,
      feeCurrency: code,
      convertedAmount,
      midRate,
      appliedRate,
      fxSpreadPct,
      fxCost,
      totalCost,
      totalCostPct,
      recipientINR,
      routeId,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min expiry
      isSimulated: true,
      disclaimer: 'Simulated indicative rate for hackathon prototype testing. No real currency is exchanged.',
    };
  }
}

export const fxService = new FxService();
