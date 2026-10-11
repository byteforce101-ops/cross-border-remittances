/**
 * client/src/services/transactionService.js
 * Transaction builder and generator for the Ledger prototype.
 */

import { TRANSACTION_STATUS } from '@shared/constants/transactionStatus.js';

export const transactionService = {
  generateId(existingTransactions = []) {
    let maxNum = 42;
    for (const t of existingTransactions) {
      if (t.id && t.id.startsWith('TXN-D-')) {
        const n = parseInt(t.id.replace('TXN-D-', ''), 10);
        if (!isNaN(n) && n > maxNum) {
          maxNum = n;
        }
      }
    }
    const nextNum = maxNum + 1;
    return `TXN-D-${String(nextNum).padStart(4, '0')}`;
  },

  buildTransaction({
    existingTransactions = [],
    amount,
    fromCurrency = 'AED',
    recipient,
    purpose = 'Family support',
    route,
    calc,
  }) {
    const id = this.generateId(existingTransactions);
    const now = new Date();

    return {
      id,
      date: now.toISOString(),
      senderName: 'Arjun Patel',
      senderCountry: 'United Arab Emirates',
      senderCountryCode: 'AE',
      senderCurrency: fromCurrency,
      recipientName: recipient.name,
      recipientUpi: recipient.upiId,
      recipientBank: recipient.bankName || 'Axis Bank',
      fromAmount: parseFloat(amount),
      fromCurrency,
      toAmount: calc.recipientINR,
      toCurrency: 'INR',
      fxRate: calc.appliedRate,
      midMarketRate: calc.midRate,
      transferFee: calc.feeAED,
      fxFee: calc.fxCostAED,
      totalFee: calc.totalCostAED,
      route: route.id,
      routeName: route.name,
      routeShort: route.shortName,
      status: TRANSACTION_STATUS.PROCESSING,
      statusLabel: 'Processing (simulated)',
      purpose,
      settlementTime: null,
      settlementTimeLabel: route.eta,
      blockchainTxHash: route.id === 'blockchain_partner' ? '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('') : null,
      riskScore: 12,
      riskLevel: 'LOW',
      note: `Simulated transfer initiated via ${route.name}. No money has moved.`,
      timeline: [
        {
          title: 'Transfer created',
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          detail: 'quote and route locked',
          status: 'done',
        },
        {
          title: 'Checks passed (simulated)',
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          detail: 'Amount & corridor verification complete',
          status: 'done',
        },
        {
          title: `Routing to ${route.shortName} rail`,
          time: 'Now',
          detail: `Usually ${route.eta}. We will flag it here if it takes longer.`,
          status: 'now',
        },
        {
          title: 'Settlement & delivery to recipient',
          time: 'Next',
          detail: 'Crediting recipient bank account',
          status: 'next',
        },
      ],
    };
  },
};

