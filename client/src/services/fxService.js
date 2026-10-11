/**
 * client/src/services/fxService.js
 * FX rate and conversion calculations matching the Ledger design prototype.
 */

const MID_MARKET_RATES = {
  AED: 24.12, // 1 AED = 24.12 INR
  USD: 83.95, // 1 USD = 83.95 INR
  GBP: 108.50, // 1 GBP = 108.50 INR
  SGD: 63.80, // 1 SGD = 63.80 INR
  EUR: 91.40, // 1 EUR = 91.40 INR
  INR: 1.0,
};

export const fxService = {
  getMidMarketRate(fromCurrency = 'AED') {
    return MID_MARKET_RATES[fromCurrency] || 24.12;
  },

  calculate({ fromAmount, fromCurrency = 'AED', route }) {
    const amt = parseFloat(fromAmount) || 0;
    const midRate = this.getMidMarketRate(fromCurrency);

    // Route-specific transfer fee and rate
    const feeAED = route ? route.feeAED : 12.00;
    const spreadPct = route ? route.rateSpreadPct : 0.0058; // 0.58% default
    const appliedRate = route && route.appliedRate ? route.appliedRate : parseFloat((midRate * (1 - spreadPct)).toFixed(2));

    const convertedAmount = Math.max(0, amt - feeAED);
    const recipientINR = parseFloat((convertedAmount * appliedRate).toFixed(2));
    const fxCostAED = parseFloat((convertedAmount * ((midRate - appliedRate) / midRate)).toFixed(2));
    const totalCostAED = parseFloat((feeAED + fxCostAED).toFixed(2));
    const totalCostPct = amt > 0 ? parseFloat(((totalCostAED / amt) * 100).toFixed(2)) : 0;
    const fxSpreadPct = parseFloat((((midRate - appliedRate) / midRate) * 100).toFixed(2));

    return {
      fromAmount: amt,
      fromCurrency,
      feeAED,
      convertedAmount,
      midRate,
      appliedRate,
      fxSpreadPct,
      fxCostAED,
      otherFeesAED: 0.00,
      totalCostAED,
      totalCostPct,
      recipientINR,
      isSimulated: true,
    };
  },

  formatINR(val) {
    if (val === null || val === undefined || isNaN(val)) return '₹0.00';
    const num = Number(val);
    // Indian number formatting: e.g. 1,19,612.24
    const parts = num.toFixed(2).split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];

    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    if (otherNumbers !== '') {
      integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }
    return `₹${integerPart}.${decimalPart}`;
  },

  formatAED(val) {
    if (val === null || val === undefined || isNaN(val)) return 'AED 0.00';
    const num = Number(val);
    return `AED ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  getSupportedCurrencies() {
    return [
      { code: 'AED', name: 'AED — UAE dirham' },
      { code: 'USD', name: 'USD — US dollar' },
      { code: 'GBP', name: 'GBP — British pound' },
      { code: 'SGD', name: 'SGD — Singapore dollar' },
    ];
  },

  getSupportedCountries() {
    return [
      { code: 'AE', name: 'United Arab Emirates', currency: 'AED' },
      { code: 'US', name: 'United States', currency: 'USD' },
      { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
      { code: 'SG', name: 'Singapore', currency: 'SGD' },
    ];
  },
};

