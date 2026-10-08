/** client/src/services/transactionService.js
 * Transaction CRUD — backed by the Zustand store in production,
 * falls back to local state for demo. */

import { TRANSACTION_STATUS } from '@shared/constants/transactionStatus.js';

let idCounter = 1246;

export const transactionService = {
  generateId() {
    return `CBR-2026-0${idCounter++}`;
  },

  buildTransaction({ senderDetails, amountDetails, recipientDetails, purposeDetails, selectedRoute, fxCalc, risk }) {
    const id = this.generateId();
    return {
      id,
      date: new Date().toISOString(),
      senderName: senderDetails.name,
      senderCountry: senderDetails.country,
      senderCurrency: amountDetails.currency,
      recipientName: recipientDetails.name,
      recipientUpi: recipientDetails.upiId,
      corridor: `${senderDetails.countryCode}_INR`,
      fromAmount: amountDetails.amount,
      fromCurrency: amountDetails.currency,
      toAmount: fxCalc.netINR - selectedRoute.costINR + (fxCalc.transferFeeINR),
      toCurrency: 'INR',
      fxRate: fxCalc.clientRate,
      transferFee: selectedRoute.costINR,
      fxFee: fxCalc.fxFeeINR,
      totalFee: selectedRoute.costINR + fxCalc.fxFeeINR,
      route: selectedRoute.id,
      riskScore: risk.score,
      riskLevel: risk.level,
      status: risk.requiresReview ? TRANSACTION_STATUS.COMPLIANCE_REVIEW : TRANSACTION_STATUS.PROCESSING,
      purpose: purposeDetails.purpose,
      settlementTime: null,
      blockchainTxHash: null,
    };
  },
};
