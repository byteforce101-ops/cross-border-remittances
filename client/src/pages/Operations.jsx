import { useStore } from '../store/useStore.js';
import { TRANSACTION_STATUS } from '@shared/constants/transactionStatus.js';
import { Activity, AlertTriangle, Clock, XCircle } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const RAIL_STATUS = [
  { name: 'UPI / NPCI', status: 'Operational', color: 'emerald', note: 'Mock adapter active' },
  { name: 'Bank Transfer', status: 'Operational', color: 'emerald', note: 'Mock adapter active' },
  { name: 'SWIFT', status: 'Operational', color: 'emerald', note: 'Mock adapter active' },
  { name: 'Blockchain (Sepolia)', status: 'Testnet', color: 'amber', note: 'Testnet — not production' },
  { name: 'NPCI Live API', status: 'Not Connected', color: 'gray', note: 'Requires NPCI credentials' },
  { name: 'FX Provider', status: 'Mock Rates', color: 'amber', note: 'Using static demo rates' },
];

export default function Operations() {
  const navigate = useNavigate();
  const transactions = useStore(s => s.transactions);

  const active = transactions.filter(t => t.status === TRANSACTION_STATUS.PROCESSING).length;
  const pending = transactions.filter(t => t.status === TRANSACTION_STATUS.PENDING || t.status === TRANSACTION_STATUS.COMPLIANCE_REVIEW).length;
  const highRisk = transactions.filter(t => t.riskLevel === 'HIGH').length;
  const failed = transactions.filter(t => t.status === TRANSACTION_STATUS.FAILED).length;

  const recentActivity = transactions.slice(0, 8);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="section-title">Operations Dashboard</h2>
          <p className="section-subtitle">Payment infrastructure monitoring and operational overview</p>
        </div>
        <span className="badge-demo">DEMO</span>
      </div>

      {/* Operational KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ['Active', active, 'text-brand-700', Activity, 'bg-brand-50'],
          ['Pending', pending, 'text-amber-700', Clock, 'bg-amber-50'],
          ['High Risk', highRisk, 'text-red-700', AlertTriangle, 'bg-red-50'],
          ['Failed', failed, 'text-red-700', XCircle, 'bg-red-50'],
        ].map(([label, val, cls, Icon, iconBg]) => (
          <div key={label} className="card p-5 bg-white border border-surface-700 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</span>
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', iconBg)}>
                <Icon size={16} className={cls} />
              </div>
            </div>
            <div className={clsx('text-3xl font-bold', cls)}>{val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Rail status */}
        <div className="card p-5 bg-white border border-surface-700 shadow-card">
          <h3 className="section-title mb-4">Payment Rail Status</h3>
          <div className="space-y-3">
            {RAIL_STATUS.map(rail => (
              <div key={rail.name} className="flex items-center justify-between py-2.5 border-b border-surface-700 last:border-0">
                <div>
                  <div className="text-sm font-bold text-gray-100">{rail.name}</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">{rail.note}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    'w-2 h-2 rounded-full',
                    rail.color === 'emerald' ? 'bg-emerald-500' :
                    rail.color === 'amber' ? 'bg-amber-500 animate-pulse-slow' : 'bg-slate-300'
                  )} />
                  <span className={clsx(
                    'text-xs font-bold',
                    rail.color === 'emerald' ? 'text-emerald-700' :
                    rail.color === 'amber' ? 'text-amber-700' : 'text-gray-400'
                  )}>{rail.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card p-5 bg-white border border-surface-700 shadow-card">
          <h3 className="section-title mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {recentActivity.map(tx => (
              <div key={tx.id}
                onClick={() => navigate(`/transactions/${tx.id}`)}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 hover:bg-slate-100/80 rounded-lg cursor-pointer transition-all">
                <div>
                  <div className="font-mono text-xs font-bold text-brand-700">{tx.id}</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">{tx.senderName} · {tx.fromAmount} {tx.fromCurrency}</div>
                </div>
                <StatusBadge status={tx.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
