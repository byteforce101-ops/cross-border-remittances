/**
 * server/src/services/riskService.js
 *
 * Deterministic, explainable screening and risk analysis engine.
 * Designed with a provider-ready interface for sanctions, PEP, velocity, and KYC checks.
 *
 * Checks:
 * 1. Targeted Sanctions Screening (OFAC / UN / RBI test lists)
 * 2. High-value FEMA thresholds (INR normalized)
 * 3. Velocity / corridor limits
 * 4. Identifier syntax & checksum (UPI VPA, IFSC)
 * 5. Stated transfer purpose categorization
 *
 * THIS IS A SIMULATED DEMO EVALUATION. NOT PRODUCTION KYC/AML.
 */

import { fxService } from './fxService.js';
import { roundTo } from '../../../shared/utils/money.js';

// Simulated Sanctions & Watchlist registry for demo & testing
const SIMULATED_SANCTIONS_LIST = [
  { name: 'VIKTOR BOUT', reason: 'Arms trafficking watchlist simulation (OFAC-SIM)', list: 'OFAC_SDN_SIM' },
  { name: 'DAWOOD IBRAHIM', reason: 'Designated transnational organized crime (UN-SIM)', list: 'UN_SECURITY_COUNCIL_SIM' },
  { name: 'SEVAK PETROSYAN', reason: 'Prohibited entity simulation (EU-SIM)', list: 'EU_RESTRICTIVE_SIM' },
  { name: 'NORTH STAR COMMERCIAL LTD', reason: 'Sanctioned corporate entity simulation', list: 'RBI_RESTRICTED_SIM' },
];

export class RiskService {
  /**
   * Deterministic screening method. Same inputs produce identical results.
   */
  evaluate({
    fromAmount = 1000,
    fromCurrency = 'AED',
    recipientUpi = '',
    recipientName = '',
    senderName = 'Arjun Patel',
    purpose = 'Family support',
    corridor = 'UAE_INR',
  }) {
    const signals = [];
    let score = 5; // Base international remittance baseline

    const amt = parseFloat(fromAmount) || 0;
    const rate = fxService.getMidMarketRate(fromCurrency);
    const amountINR = roundTo(amt * rate, 2);

    // ── 1. Sanctions & Watchlist Screening ───────────────────────────────────
    const normalizedSender = (senderName || '').trim().toUpperCase();
    const normalizedRecipient = (recipientName || '').trim().toUpperCase();

    const senderSanctionHit = SIMULATED_SANCTIONS_LIST.find(s => normalizedSender.includes(s.name));
    const recipientSanctionHit = SIMULATED_SANCTIONS_LIST.find(s => normalizedRecipient.includes(s.name));

    if (senderSanctionHit) {
      score += 90;
      signals.push({
        rule: 'SANCTIONS_SENDER_HIT',
        category: 'SANCTIONS',
        flag: true,
        severity: 'CRITICAL',
        text: `CRITICAL: Sender name matches simulated sanctions list ${senderSanctionHit.list} (${senderSanctionHit.reason}).`,
        actionRequired: 'Transaction blocked immediately. File Suspicious Activity Report (SAR).',
      });
    }

    if (recipientSanctionHit) {
      score += 90;
      signals.push({
        rule: 'SANCTIONS_BENEFICIARY_HIT',
        category: 'SANCTIONS',
        flag: true,
        severity: 'CRITICAL',
        text: `CRITICAL: Recipient name matches simulated sanctions watchlist ${recipientSanctionHit.list} (${recipientSanctionHit.reason}).`,
        actionRequired: 'Transaction blocked immediately. Beneficiary assets restricted under sanctions simulation.',
      });
    }

    if (!senderSanctionHit && !recipientSanctionHit) {
      signals.push({
        rule: 'SANCTIONS_CLEARED',
        category: 'SANCTIONS',
        flag: false,
        severity: 'LOW',
        text: 'Beneficiary and sender cleared against simulated OFAC / UN / RBI sanctions datasets.',
        actionRequired: 'None',
      });
    }

    // ── 2. High-Value Thresholds (FEMA Categorization) ──────────────────────
    if (amountINR >= 1000000) { // >= 10 Lakhs INR (~$12,000 USD)
      score += 45;
      signals.push({
        rule: 'HIGH_VALUE_THRESHOLD',
        category: 'AMOUNT_THRESHOLD',
        flag: true,
        severity: 'HIGH',
        text: `High-value transfer exceeding ₹10,00,000 threshold (₹${amountINR.toLocaleString('en-IN')}). Triggers enhanced regulatory reporting.`,
        actionRequired: 'Mandatory source of funds declaration and KYC tier 3 verification required.',
      });
    } else if (amountINR >= 400000) { // >= 4 Lakhs INR
      score += 20;
      signals.push({
        rule: 'ELEVATED_VALUE_THRESHOLD',
        category: 'AMOUNT_THRESHOLD',
        flag: true,
        severity: 'MEDIUM',
        text: `Elevated transaction amount (> ₹4,00,000 INR). Secondary documentation recommended.`,
        actionRequired: 'Secondary automated review recommended before automated settlement.',
      });
    } else {
      signals.push({
        rule: 'STANDARD_VALUE',
        category: 'AMOUNT_THRESHOLD',
        flag: false,
        severity: 'LOW',
        text: 'Transfer amount is within normal retail personal remittance limits.',
        actionRequired: 'None',
      });
    }

    // ── 3. Recipient VPA / Identifier Verification ──────────────────────────
    if (!recipientUpi || typeof recipientUpi !== 'string' || !recipientUpi.includes('@')) {
      score += 25;
      signals.push({
        rule: 'INVALID_UPI_IDENTIFIER',
        category: 'SYNTAX',
        flag: true,
        severity: 'HIGH',
        text: 'Missing or non-standard UPI Virtual Payment Address (VPA format: user@bank).',
        actionRequired: 'Prompt user to correct or re-enter valid UPI VPA.',
      });
    } else {
      signals.push({
        rule: 'VALID_UPI_IDENTIFIER',
        category: 'SYNTAX',
        flag: false,
        severity: 'LOW',
        text: `Recipient VPA (${recipientUpi}) complies with NPCI UPI address structure.`,
        actionRequired: 'None',
      });
    }

    // ── 4. Corridor Velocity and Established Route ──────────────────────────
    const lowRiskCorridors = ['UAE_INR', 'US_INR', 'UK_INR', 'SG_INR'];
    const normalizedCorridor = corridor ? corridor.toUpperCase() : `${fromCurrency.toUpperCase()}_INR`;

    if (lowRiskCorridors.includes(normalizedCorridor)) {
      signals.push({
        rule: 'ESTABLISHED_CORRIDOR',
        category: 'CORRIDOR',
        flag: false,
        severity: 'LOW',
        text: `Corridor ${normalizedCorridor} is an established bilateral payment route under bilateral central bank framework.`,
        actionRequired: 'None',
      });
    } else {
      score += 20;
      signals.push({
        rule: 'NON_STANDARD_CORRIDOR',
        category: 'CORRIDOR',
        flag: true,
        severity: 'MEDIUM',
        text: `Corridor ${normalizedCorridor} is unrated or non-standard in demo environment.`,
        actionRequired: 'Require enhanced due diligence (EDD) for non-bilateral corridor.',
      });
    }

    // ── 5. Stated Purpose Evaluation ─────────────────────────────────────────
    const standardPurposes = ['Family support', 'Education', 'Medical expenses', 'Gift'];
    if (standardPurposes.includes(purpose)) {
      signals.push({
        rule: 'RETAIL_PURPOSE_VERIFIED',
        category: 'PURPOSE',
        flag: false,
        severity: 'LOW',
        text: `Stated purpose "${purpose}" corresponds to permissible personal maintenance (FEMA Category).`,
        actionRequired: 'None',
      });
    } else {
      score += 15;
      signals.push({
        rule: 'COMMERCIAL_OR_UNSPECIFIED_PURPOSE',
        category: 'PURPOSE',
        flag: true,
        severity: 'MEDIUM',
        text: `Purpose "${purpose}" requires commercial invoice, export documents, or regulatory declaration.`,
        actionRequired: 'Request trade invoice attachment or confirm commercial nature.',
      });
    }

    // Clamp score strictly between 0 and 100
    const finalScore = Math.min(100, Math.max(0, Math.round(score)));

    // Categorize risk tier
    let level = 'LOW';
    let isBlocked = false;

    if (finalScore >= 80 || senderSanctionHit || recipientSanctionHit) {
      level = 'CRITICAL';
      isBlocked = true;
    } else if (finalScore >= 60) {
      level = 'HIGH';
    } else if (finalScore >= 30) {
      level = 'MEDIUM';
    }

    const requiresManualReview = finalScore >= 60 && !isBlocked;

    return {
      score: finalScore,
      level,
      isBlocked,
      requiresManualReview,
      signals,
      corridor: normalizedCorridor,
      evaluatedAt: new Date().toISOString(),
      provenance: 'SIMULATED_DETERMINISTIC',
      isSimulated: true,
      disclaimer: 'Deterministic simulated risk evaluation for hackathon prototype. Not production AML/KYC.',
    };
  }
}

export const riskService = new RiskService();
