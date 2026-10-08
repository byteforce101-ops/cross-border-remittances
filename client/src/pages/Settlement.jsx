import { useStore } from '../store/useStore.js';
import { useNavigate } from 'react-router-dom';
import { TRANSACTION_STATUS } from '@shared/constants/transactionStatus.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Clock, XCircle, Link } from 'lucide-react';
import { StatusBadge, RouteBadge } from '../components/common/StatusBadge.jsx';
import clsx from 'clsx';

export default function Settlement() {
  const navigate = useNavigate();
  const transactions = useStore(s => s.transactions);

  const pending = transactions.filter(t => t.status === TRANSACTION_STATUS.PROCESSING || t.status === TRANSACTION_STATUS.SETTLEMENT_PENDING);
  const completed = transactions.filter(t => t.status === TRANSACTION_STATUS.COMPLETED);
  const failed = transactions.filter(t => t.status === TRANSACTION_STATUS.FAILED);
  const avgTime = completed.filter(t => t.settlementTime).reduce((acc, t) => acc + t.settlementTime, 0) / (completed.filter(t => t.settlementTime).length || 1);

  const timelineData = [
    { rail: 'UPI', avgSec: 29, count: 8 },
    { rail: 'Blockchain', avgSec: 12, count: 2 },
    { rail: 'Bank', avgSec: 86400, count: 1 },
    { rail: 'SWIFT', avgSec: 259200, count: 1 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="section-title">Settlement Monitor</h2>
          <p className="section-subtitle">Real-time settlement tracking across all payment rails</p>
        </div>
        <span className="badge-demo">DEMO</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ['Pending', pending.length, 'text-brand-700', Clock],
          ['Completed', completed.length, 'text-emerald-700', CheckCircle2],
          ['Failed', failed.length, 'text-red-700', XCircle],
          ['Avg Time', `${Math.round(avgTime)}s`, 'text-gray-100', Clock],
        ].map(([label, val, cls, Icon]) => (
          <div key={label} className="card p-5 bg-white border border-surface-700 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</span>
              <Icon size={16} className={cls} />
            </div>
            <div className={clsx('text-2xl font-bold', cls)}>{val}</div>
          </div>
        ))}
      </div>

      {/* Pending settlements */}
      <div className="card p-5 bg-white border border-surface-700 shadow-card">
        <h3 className="section-title mb-4">Pending Settlements</h3>
        {pending.length === 0
          ? <p className="text-sm text-gray-400 font-medium">No pending settlements.</p>
          : <div className="table-wrapper border-0">
              <table className="table">
                <thead><tr><th>ID</th><th>Sender</th><th>Amount</th><th>Route</th><th>Status</th></tr></thead>
                <tbody>
                  {pending.map(tx => (
                    <tr key={tx.id} onClick={() => navigate(`/transactions/${tx.id}`)}>
                      <td className="font-mono text-xs font-bold text-brand-700">{tx.id}</td>
                      <td className="text-gray-100 font-medium">{tx.senderName}</td>
                      <td className="font-semibold text-gray-100">₹{tx.toAmount.toLocaleString()}</td>
                      <td><RouteBadge route={tx.route} /></td>
                      <td><StatusBadge status={tx.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>

      {/* Blockchain banner */}
      <div className="card p-5 border-dashed border-purple-300 bg-purple-50/40">
        <div className="flex items-start gap-3">
          <Link size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-purple-900">Blockchain Settlement — Ethereum Sepolia</div>
            <p className="text-sm text-gray-300 mt-1 leading-relaxed">
              Blockchain settlement records are stored as immutable on-chain events via the SettlementRecord smart contract.
              Each blockchain-routed transaction produces a tamper-proof audit entry. Currently operating on Sepolia testnet.
            </p>
            <span className="badge-demo mt-2">TESTNET / DEMO</span>
          </div>
        </div>
      </div>

      {/* Settlement time chart */}
      <div className="card p-5 bg-white border border-surface-700 shadow-card">
        <h3 className="section-title mb-1">Average Settlement Time by Rail</h3>
        <p className="section-subtitle mb-4">Seconds</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="rail" tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}
              formatter={(v) => [`${v}s`, 'Avg time']} />
            <Bar dataKey="avgSec" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
