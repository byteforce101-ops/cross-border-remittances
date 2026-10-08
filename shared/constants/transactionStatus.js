/**
 * shared/constants/transactionStatus.js
 *
 * Canonical transaction status codes — used across server, client, and blockchain.
 * Having a single source of truth prevents string literals from diverging.
 */

export const TRANSACTION_STATUS = Object.freeze({
  PENDING:             'PENDING',             // Received, awaiting compliance check
  COMPLIANCE_REVIEW:   'COMPLIANCE_REVIEW',   // Under KYC/AML review
  COMPLIANCE_REJECTED: 'COMPLIANCE_REJECTED', // Failed compliance
  RISK_FLAGGED:        'RISK_FLAGGED',        // Flagged by risk engine, manual review
  ROUTE_SELECTED:      'ROUTE_SELECTED',      // Optimal rail identified
  PROCESSING:          'PROCESSING',          // Settlement in progress on selected rail
  SETTLEMENT_PENDING:  'SETTLEMENT_PENDING',  // Awaiting final confirmation from rail
  COMPLETED:           'COMPLETED',           // Funds received by beneficiary
  FAILED:              'FAILED',              // Settlement failed
  REFUNDED:            'REFUNDED',            // Amount returned to sender
  CANCELLED:           'CANCELLED',           // Cancelled before settlement began
});

export const TERMINAL_STATUSES = [
  TRANSACTION_STATUS.COMPLIANCE_REJECTED,
  TRANSACTION_STATUS.COMPLETED,
  TRANSACTION_STATUS.FAILED,
  TRANSACTION_STATUS.REFUNDED,
  TRANSACTION_STATUS.CANCELLED,
];
