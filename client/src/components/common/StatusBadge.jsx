import clsx from 'clsx';
import { TRANSACTION_STATUS } from '@shared/constants/transactionStatus.js';

const CONFIG = {
  [TRANSACTION_STATUS.COMPLETED]:           { cls: 'badge-success', label: 'Completed' },
  [TRANSACTION_STATUS.PROCESSING]:          { cls: 'badge-info',    label: 'Processing' },
  [TRANSACTION_STATUS.PENDING]:             { cls: 'badge-neutral', label: 'Pending' },
  [TRANSACTION_STATUS.RISK_FLAGGED]:        { cls: 'badge-danger',  label: 'Risk Flagged' },
  [TRANSACTION_STATUS.COMPLIANCE_REVIEW]:   { cls: 'badge-warning', label: 'Under Review' },
  [TRANSACTION_STATUS.COMPLIANCE_REJECTED]: { cls: 'badge-danger',  label: 'Rejected' },
  [TRANSACTION_STATUS.FAILED]:              { cls: 'badge-danger',  label: 'Failed' },
  [TRANSACTION_STATUS.ROUTE_SELECTED]:      { cls: 'badge-info',    label: 'Route Selected' },
  [TRANSACTION_STATUS.SETTLEMENT_PENDING]:  { cls: 'badge-warning', label: 'Settling' },
  [TRANSACTION_STATUS.REFUNDED]:            { cls: 'badge-neutral', label: 'Refunded' },
  [TRANSACTION_STATUS.CANCELLED]:           { cls: 'badge-neutral', label: 'Cancelled' },
};

export function StatusBadge({ status }) {
  const cfg = CONFIG[status] || { cls: 'badge-neutral', label: status };
  return <span className={cfg.cls}>{cfg.label}</span>;
}

export function RiskBadge({ level }) {
  const cls = level === 'LOW' ? 'badge-success' : level === 'MEDIUM' ? 'badge-warning' : 'badge-danger';
  return <span className={cls}>{level}</span>;
}

export function RouteBadge({ route }) {
  const labels = { npci: 'UPI', swift: 'SWIFT', blockchain: 'Blockchain', bank: 'Bank' };
  return (
    <span className="badge bg-brand-500/15 text-brand-400 border border-brand-500/25">
      {labels[route] || route}
    </span>
  );
}
