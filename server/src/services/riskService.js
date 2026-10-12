/**
 * server/src/services/riskService.js
 *
 * Deterministic and explainable demo risk analysis engine.
 * Evaluates transfers based on:
 * - Amount thresholds (INR normalized)
 * - Remittance corridor
 * - Recipient UPI / banking details
 * - Stated purpose of transfer
 *
 * THIS IS A SIMULATED DEMO EVALUATION. NOT PRODUCTION KYC/AML.
 */

import { fxService } from './fxService.js';

export class RiskService {
  /**
   * Evaluates risk deterministically. Same inputs produce identical results.
   */
  evaluate({
    fromAmount = 1000,
    fromCurrency = 'AED',
    recipientUpi = '',
    recipientName = '',
    purpose = 'Family support',
    corridor = 'UAE_INR',
  }) {
    const signals = [];
    let score = 5; // Base starting score for international transfers

    const amt = parseFloat(fromAmount) || 0;
    const rate = fxService.getMidMarketRate(fromCurrency);
    const amountINR = amt * rate;

    // 1. Amount threshold rules
    if (amountINR >= 1000000) { // >= 10 Lakhs INR (~$12,000 USD)
      score += 45;
      signals.push({
        rule: 'HIGH_VALUE_THRESHOLD',
        flag: true,
        severity: 'HIGH',
        text: 'High-value transfer exceeding ₹10,00,000 threshold. Triggers enhanced reporting.',
      });
    } else if (amountINR >= 400000) { // >= 4 Lakhs INR
      score += 20;
      signals.push({
        rule: 'ELEVATED_VALUE_THRESHOLD',
        flag: true,
        severity: 'MEDIUM',
        text: 'Elevated transaction amount (> ₹4,00,000 INR). Secondary review recommended.',
      });
    } else {
      signals.push({
        rule: 'STANDARD_VALUE',
        flag: false,
        severity: 'LOW',
        text: 'Transfer amount is within normal retail remittance limits.',
      });
    }

    // 2. Recipient verification rules
    if (!recipientUpi || typeof recipientUpi !== 'string' || !recipientUpi.includes('@')) {
      score += 25;
      signals.push({
        rule: 'INVALID_UPI_IDENTIFIER',
        flag: true,
        severity: 'HIGH',
        text: 'Missing or non-standard UPI Virtual Payment Address (VPA).',
      });
    } else {
      signals.push({
        rule: 'VALID_UPI_IDENTIFIER',
        flag: false,
        severity: 'LOW',
        text: `Recipient VPA (${recipientUpi}) matches standard NPCI UPI address structure.`,
      });
    }

    // 3. Corridor risk rules
    const lowRiskCorridors = ['UAE_INR', 'US_INR', 'UK_INR', 'SG_INR'];
    const normalizedCorridor = corridor ? corridor.toUpperCase() : `${fromCurrency.toUpperCase()}_INR`;

    if (lowRiskCorridors.includes(normalizedCorridor)) {
      signals.push({
        rule: 'ESTABLISHED_CORRIDOR',
        flag: false,
        severity: 'LOW',
        text: `Corridor ${normalizedCorridor} is an established bilateral payment route.`,
      });
    } else {
      score += 20;
      signals.push({
        rule: 'NON_STANDARD_CORRIDOR',
        flag: true,
        severity: 'MEDIUM',
        text: `Corridor ${normalizedCorridor} is unrated or non-standard in demo environment.`,
      });
    }

    // 4. Stated Purpose rules
    const standardPurposes = ['Family support', 'Education', 'Medical expenses', 'Gift'];
    if (standardPurposes.includes(purpose)) {
      signals.push({
        rule: 'RETAIL_PURPOSE_VERIFIED',
        flag: false,
        severity: 'LOW',
        text: `Stated purpose "${purpose}" corresponds to personal / family maintenance (FEMA Category).`,
      });
    } else {
      score += 15;
      signals.push({
        rule: 'COMMERCIAL_OR_UNSPECIFIED_PURPOSE',
        flag: true,
        severity: 'MEDIUM',
        text: `Purpose "${purpose}" requires commercial invoice or export documentation.`,
      });
    }

    // Clamp score strictly between 0 and 100
    const finalScore = Math.min(100, Math.max(0, Math.round(score)));

    // Categorize
    let level = 'LOW';
    if (finalScore >= 65) {
      level = 'HIGH';
    } else if (finalScore >= 30) {
      level = 'MEDIUM';
    }

    const requiresManualReview = finalScore >= 65;

    return {
      score: finalScore,
      level,
      requiresManualReview,
      signals,
      corridor: normalizedCorridor,
      evaluatedAt: new Date().toISOString(),
      isSimulated: true,
      disclaimer: 'Deterministic simulated risk evaluation for hackathon prototype. Not production AML/KYC.',
    };
  }
}

export const riskService = new RiskService();
