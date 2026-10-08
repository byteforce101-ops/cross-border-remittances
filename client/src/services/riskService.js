/** client/src/services/riskService.js — Demo risk analysis */

export const riskService = {
  analyze({ fromAmount, fromCurrency, recipientUpi, purpose, corridor }) {
    const signals = [];
    let score = 0;

    // Amount checks
    const amountINR = fromAmount * { AED: 22.7, USD: 83.5, GBP: 104.8, SGD: 61.4, EUR: 90.2 }[fromCurrency] || fromAmount;
    if (amountINR > 1000000) { score += 30; signals.push({ flag: true, text: 'Large transaction amount (>₹10L)' }); }
    else if (amountINR > 500000) { score += 15; signals.push({ flag: true, text: 'Elevated transaction amount (>₹5L)' }); }
    else { signals.push({ flag: false, text: 'Normal transaction amount' }); }

    // Recipient checks
    if (!recipientUpi) { score += 10; signals.push({ flag: true, text: 'No UPI ID provided' }); }
    else { signals.push({ flag: false, text: 'Recipient UPI verified' }); }

    // Corridor
    const lowRiskCorridors = ['UAE_INR', 'US_INR', 'UK_INR', 'SG_INR'];
    if (lowRiskCorridors.includes(corridor)) {
      signals.push({ flag: false, text: 'Known low-risk corridor' });
    } else {
      score += 15;
      signals.push({ flag: true, text: 'Elevated corridor risk' });
    }

    // Purpose
    if (['Business', 'Personal'].includes(purpose)) { score += 5; signals.push({ flag: true, text: 'Business/personal purpose requires documentation' }); }
    else { signals.push({ flag: false, text: 'Standard remittance purpose' }); }

    // Velocity (always OK in demo)
    signals.push({ flag: false, text: 'No unusual transaction velocity' });

    // Clamp
    score = Math.min(100, Math.max(0, score + Math.floor(Math.random() * 6)));

    const level = score < 30 ? 'LOW' : score < 65 ? 'MEDIUM' : 'HIGH';
    const requiresReview = score >= 65;

    return { score, level, signals, requiresReview, isMock: true };
  },
};
