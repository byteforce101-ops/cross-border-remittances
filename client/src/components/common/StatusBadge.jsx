import { TRANSACTION_STATUS } from '@shared/constants/transactionStatus.js';

export function StatusBadge({ status, customLabel }) {
  if (status === TRANSACTION_STATUS.COMPLETED) {
    return <span className="chip bg-oksoft text-ok">✓ {customLabel || 'Completed (simulated)'}</span>;
  }
  if (status === TRANSACTION_STATUS.COMPLIANCE_REVIEW || status === 'IN_REVIEW') {
    return <span className="chip bg-infosoft text-info">◆ {customLabel || 'In review'}</span>;
  }
  if (status === TRANSACTION_STATUS.SETTLEMENT_PENDING || status === 'DELAYED') {
    return <span className="chip bg-warnsoft text-warn">▲ {customLabel || 'Delayed'}</span>;
  }
  if (status === TRANSACTION_STATUS.PROCESSING || status === TRANSACTION_STATUS.ROUTE_SELECTED) {
    return <span className="chip bg-warnsoft text-warn">◔ {customLabel || 'Processing'}</span>;
  }
  if (status === TRANSACTION_STATUS.FAILED || status === TRANSACTION_STATUS.COMPLIANCE_REJECTED) {
    return <span className="chip bg-badsoft text-bad">✕ {customLabel || 'Failed · refund simulated'}</span>;
  }
  return <span className="chip bg-canvas text-ink border border-rule">{customLabel || status}</span>;
}

export function RouteBadge({ route }) {
  const labels = {
    upi_partner: 'UPI-linked',
    npci: 'UPI-linked',
    imps_bank: 'IMPS',
    swift: 'IMPS',
    blockchain_partner: 'Blockchain-settled',
    blockchain: 'Blockchain-settled',
    bank: 'Bank Transfer',
  };
  return <span className="text-sm font-medium text-ink">{labels[route] || route}</span>;
}

