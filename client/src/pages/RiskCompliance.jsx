import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore.js';
import { AlertTriangle, Eye } from 'lucide-react';
import { TRANSACTION_STATUS } from '@shared/constants/transactionStatus.js';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

export default function RiskCompliance() {
  const navigate = useNavigate();
  const transactions = useStore(s => s.transactions);

  const low = transactions.filter(t => t.riskLevel === 'LOW').length;
  const med = transactions.filter(t => t.riskLevel === 'MEDIUM').length;
  const high = transactions.filter(t => t.riskLevel === 'HIGH').length;
  const review = transactions.filter(t => t.status === TRANSACTION_STATUS.RISK_FLAGGED || t.status === TRANSACTION_STATUS.COMPLIANCE_REVIEW);
  const highRisk = transactions.filter(t => t.riskScore >= 60).slice(0, 8);

  const pieData = [
    { name: 'Low', value: low, color: '#10b981' },
    { name: 'Medium', value: med, color: '#f59e0b' },
    { name: 'High', value: high, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="section-title">Risk & Compliance</h2>
          <p className="section-subtitle">Demo risk analysis overview — not production AML/compliance</p>
        </div>
        <span className="badge-demo">DEMO RISK ANALYSIS</span>
      </div>

      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
        <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <span>
          This is a <strong>demo risk analysis system</strong>. It uses rule-based heuristics for illustration purposes only.
          Do not use for real financial compliance decisions.
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          ['Analysed', transactions.length, 'text-gray-100'],
          ['Low Risk', low, 'text-emerald-700'],
          ['Medium Risk', med, 'text-amber-700'],
          ['High Risk', high, 'text-red-700'],
          ['Under Review', review.length, 'text-brand-700'],
        ].map(([label, val, cls]) => (
          <div key={label} className="card p-4 text-center bg-white border border-surface-700 shadow-card">
            <div className={clsx('text-2xl font-bold', cls)}>{val}</div>
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Risk distribution */}
        <div className="card p-5 bg-white border border-surface-700 shadow-card">
          <h3 className="section-title mb-4">Risk Distribution</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={4}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center justify-between gap-6">
                  <span className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    {d.name} Risk
                  </span>
                  <span className="text-sm font-bold text-gray-100">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="card p-5 bg-white border border-surface-700 shadow-card">
          <h3 className="section-title mb-4">Recent Risk Alerts</h3>
          <div className="space-y-2">
            {highRisk.length === 0 && <p className="text-sm text-gray-400">No risk alerts at this time.</p>}
            {highRisk.map(tx => (
              <div key={tx.id}
                onClick={() => navigate(`/transactions/${tx.id}`)}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100/80 cursor-pointer transition-all group">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={15} className={tx.riskScore >= 65 ? 'text-red-600 mt-0.5' : 'text-amber-600 mt-0.5'} />
                  <div>
                    <div className="font-mono text-xs font-bold text-brand-700">{tx.id}</div>
                    <div className="text-xs text-gray-400 font-medium mt-0.5">{tx.senderName} → {tx.recipientName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={clsx('text-sm font-bold', tx.riskScore >= 65 ? 'text-red-700' : 'text-amber-700')}>{tx.riskScore}</div>
                  <div className="text-[10px] text-gray-400 font-medium uppercase">risk score</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions under review */}
      {review.length > 0 && (
        <div className="card p-5 bg-white border border-surface-700 shadow-card">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Eye size={16} className="text-brand-600" /> Transactions Under Review
          </h3>
          <div className="table-wrapper border-0">
            <table className="table">
              <thead><tr><th>ID</th><th>Sender</th><th>Amount</th><th>Risk Score</th><th>Status</th></tr></thead>
              <tbody>
                {review.map(tx => (
                  <tr key={tx.id} onClick={() => navigate(`/transactions/${tx.id}`)}>
                    <td className="font-mono text-xs font-bold text-brand-700">{tx.id}</td>
                    <td className="text-gray-100 font-medium">{tx.senderName}</td>
                    <td className="text-gray-100 font-semibold">{tx.fromAmount.toLocaleString()} {tx.fromCurrency}</td>
                    <td className={tx.riskScore >= 65 ? 'text-red-700 font-bold' : 'text-amber-700 font-bold'}>{tx.riskScore}</td>
                    <td><span className="badge-warning">{tx.status.replace(/_/g, ' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
