/** client/src/services/fxService.js — Mock FX rate service */

const MOCK_RATES_TO_INR = { AED: 22.7, USD: 83.5, GBP: 104.8, SGD: 61.4, EUR: 90.2, INR: 1 };
const FEE_RATE = 0.005; // 0.5%
const FX_SPREAD = 0.008; // 0.8%

export const fxService = {
  getRate(fromCurrency, toCurrency = 'INR') {
    const fromRate = MOCK_RATES_TO_INR[fromCurrency];
    const toRate = MOCK_RATES_TO_INR[toCurrency];
    if (!fromRate || !toRate) throw new Error(`Unsupported currency: ${fromCurrency} or ${toCurrency}`);
    return fromRate / toRate;
  },

  calculate(fromAmount, fromCurrency) {
    const rate = this.getRate(fromCurrency);
    const midRate = rate;
    const clientRate = midRate * (1 - FX_SPREAD);
    const fxFeeINR = fromAmount * midRate * FX_SPREAD;
    const transferFeeINR = Math.max(fromAmount * midRate * FEE_RATE, 150);
    const grossINR = fromAmount * clientRate;
    const netINR = grossINR - transferFeeINR;
    const totalFeeINR = fxFeeINR + transferFeeINR;
    return {
      midRate,
      clientRate: parseFloat(clientRate.toFixed(4)),
      grossINR: Math.round(grossINR),
      netINR: Math.round(netINR),
      fxFeeINR: Math.round(fxFeeINR),
      transferFeeINR: Math.round(transferFeeINR),
      totalFeeINR: Math.round(totalFeeINR),
      isMock: true,
    };
  },

  getSupportedCurrencies() {
    return ['AED', 'USD', 'GBP', 'SGD', 'EUR'];
  },

  getSupportedCountries() {
    return [
      { code: 'AE', name: 'United Arab Emirates', currency: 'AED', flag: '🇦🇪' },
      { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
      { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
      { code: 'SG', name: 'Singapore', currency: 'SGD', flag: '🇸🇬' },
      { code: 'EU', name: 'Euro Zone', currency: 'EUR', flag: '🇪🇺' },
    ];
  },
};
