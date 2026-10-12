/**
 * client/src/services/riskService.js
 *
 * Demo risk analysis service connecting to backend /api/risk/evaluate.
 */

import { apiClient } from './apiClient.js';

export const riskService = {
  /**
   * Fetches deterministic risk assessment from backend.
   */
  async evaluateRisk({ fromAmount, fromCurrency, recipientUpi, recipientName, purpose, corridor }) {
    return apiClient.post('/risk/evaluate', {
      fromAmount: parseFloat(fromAmount),
      fromCurrency,
      recipientUpi,
      recipientName,
      purpose,
      corridor,
    });
  },

  analyze({ fromAmount, fromCurrency, recipientUpi, purpose, corridor }) {
    const signals = [];
    let score = 5;

    const rate = { AED: 24.12, USD: 83.95, GBP: 108.50, SGD: 63.80, EUR: 91.40 }[fromCurrency] || 24.12;
    const amountINR = fromAmount * rate;
    if (amountINR > 1000000) { score += 45; signals.push({ flag: true, text: 'Large transaction amount (>₹10L)' }); }
    else if (amountINR > 400000) { score += 20; signals.push({ flag: true, text: 'Elevated transaction amount (>₹4L)' }); }
    else { signals.push({ flag: false, text: 'Normal retail transaction amount' }); }

    if (!recipientUpi) { score += 25; signals.push({ flag: true, text: 'No standard UPI VPA provided' }); }
    else { signals.push({ flag: false, text: 'Recipient UPI VPA verified' }); }

    const lowRiskCorridors = ['UAE_INR', 'US_INR', 'UK_INR', 'SG_INR'];
    if (lowRiskCorridors.includes(corridor)) {
      signals.push({ flag: false, text: 'Known low-risk corridor' });
    } else {
      score += 20;
      signals.push({ flag: true, text: 'Elevated corridor risk' });
    }

    if (['Business', 'Personal'].includes(purpose)) { score += 15; signals.push({ flag: true, text: 'Commercial purpose requires documentation' }); }
    else { signals.push({ flag: false, text: 'Standard family maintenance remittance' }); }

    score = Math.min(100, Math.max(0, score));
    const level = score < 30 ? 'LOW' : score < 65 ? 'MEDIUM' : 'HIGH';
    const requiresReview = score >= 65;

    return { score, level, signals, requiresReview, isMock: true };
  },
};
