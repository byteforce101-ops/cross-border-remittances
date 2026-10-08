import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Send, ArrowUpRight, CheckCircle2, AlertTriangle, TrendingUp, Zap, Globe } from 'lucide-react';
import { useStore } from '../store/useStore.js';
import { KPICard } from '../components/common/KPICard.jsx';
import { StatusBadge, RouteBadge } from '../components/common/StatusBadge.jsx';
import { VOLUME_CHART_DATA } from '../services/mockData.js';

const ROUTE_DIST = [
  { name: 'UPI / NPCI', value: 62, color: '#4f46e5' },
  { name: 'Bank Transfer', value: 18, color: '#10b981' },
  { name: 'SWIFT', value: 12, color: '#f59e0b' },
  { name: 'Blockchain', value: 8, color: '#8b5cf6' },
];

const STATUS_DATA = [
  { name: 'Completed', value: 10842, fill: '#10b981' },
  { name: 'Processing', value: 342, fill: '#6366f1' },
  { name: 'Under Review', value: 184, fill: '#f59e0b' },
  { name: 'Failed', value: 118, fill: '#ef4444' },
];

const CORRIDOR_DATA = [
  { corridor: 'UAE→IN', txCount: 4820, volume: 38.2 },
  { corridor: 'USA→IN', txCount: 3940, volume: 31.5 },
  { corridor: 'UK→IN',  txCount: 2180, volume: 17.4 },
  { corridor: 'SG→IN',  txCount: 1546, volume: 12.9 },
];

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '12px',
  color: '#0f172a',
  boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const transactions = useStore(s => s.transactions);
  const recent = transactions.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Demo banner */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium">
        <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
        <span>
          <strong>DEMO / SANDBOX MODE</strong> — All data is simulated for demonstration.
          Payment infrastructure is running with mock adapters.
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="Total Transfers"  value="12,486"  delta="+8.2%" deltaPositive icon={TrendingUp} iconColor="bg-brand-50 text-brand-600" highlight />
        <KPICard label="Total Volume"     value="₹8.42 Cr" delta="+12.4%" deltaPositive icon={Globe} iconColor="bg-emerald-50 text-emerald-600" />
        <KPICard label="Avg Settlement"   value="42 sec"   subvalue="last 24h" icon={Zap} iconColor="bg-purple-50 text-purple-600" />
        <KPICard label="Success Rate"     value="98.7%"    delta="+0.3%" deltaPositive icon={CheckCircle2} iconColor="bg-emerald-50 text-emerald-600" />
        <KPICard label="Risk Alerts"      value="24"       subvalue="open" icon={AlertTriangle} iconColor="bg-red-50 text-red-600" />
        <KPICard label="Avg Transfer Cost" value="₹186"   delta="-4.1%" deltaPositive icon={TrendingUp} iconColor="bg-brand-50 text-brand-600" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Volume over time */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">Transaction Volume</h2>
              <p className="section-subtitle">Daily transfer volume — last 8 days</p>
            </div>
            <span className="badge-demo">MOCK DATA</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={VOLUME_CHART_DATA}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v) => [v, 'Transactions']} />
              <Area type="monotone" dataKey="txCount" stroke="#4f46e5" strokeWidth={2} fill="url(#volGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Route distribution */}
        <div className="card p-5">
          <div className="mb-4">
            <h2 className="section-title">Settlement Routes</h2>
            <p className="section-subtitle">Distribution by rail</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={ROUTE_DIST} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {ROUTE_DIST.map((entry, i) => (
                  <Cell key={i} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="space-y-1.5 mt-2">
            {ROUTE_DIST.map(d => (
              <li key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-gray-400 font-medium">{d.name}</span>
                </span>
                <span className="text-gray-100 font-semibold">{d.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Corridor activity */}
        <div className="card p-5">
          <div className="mb-4">
            <h2 className="section-title">Corridor Activity</h2>
            <p className="section-subtitle">Volume share by remittance corridor</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CORRIDOR_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="corridor" type="category" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} width={56} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Volume share']} />
              <Bar dataKey="volume" fill="#4f46e5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction status */}
        <div className="card p-5">
          <div className="mb-4">
            <h2 className="section-title">Transaction Status</h2>
            <p className="section-subtitle">All-time breakdown</p>
          </div>
          <div className="space-y-3">
            {STATUS_DATA.map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-medium w-24">{s.name}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(s.value / 11486) * 100}%`, background: s.fill }}
                  />
                </div>
                <span className="text-xs text-gray-100 font-mono font-semibold w-14 text-right">{s.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-surface-700 bg-white">
          <div>
            <h2 className="section-title">Recent Transactions</h2>
            <p className="section-subtitle">Latest remittance activity</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/send')} className="btn-primary text-xs py-2">
              <Send size={13} /> Send Money
            </button>
            <button onClick={() => navigate('/transactions')} className="btn-secondary text-xs py-2">
              View All <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
        <div className="table-wrapper rounded-none border-0">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sender</th>
                <th>Recipient</th>
                <th>Corridor</th>
                <th>Amount</th>
                <th>Route</th>
                <th>Risk</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(tx => (
                <tr key={tx.id} onClick={() => navigate(`/transactions/${tx.id}`)}>
                  <td className="font-mono text-xs font-semibold text-brand-600">{tx.id}</td>
                  <td className="text-gray-100 font-medium">{tx.senderName}</td>
                  <td className="text-gray-300">{tx.recipientName}</td>
                  <td className="text-gray-400 text-xs font-medium">{tx.senderCountry} → IN</td>
                  <td>
                    <div className="text-gray-100 font-semibold">{tx.fromAmount.toLocaleString()} {tx.fromCurrency}</div>
                    <div className="text-xs text-gray-400 font-medium">₹{tx.toAmount.toLocaleString()}</div>
                  </td>
                  <td><RouteBadge route={tx.route} /></td>
                  <td>
                    <span className={tx.riskLevel === 'LOW' ? 'text-emerald-700 text-xs font-bold' : tx.riskLevel === 'MEDIUM' ? 'text-amber-700 text-xs font-bold' : 'text-red-700 text-xs font-bold'}>
                      {tx.riskScore} — {tx.riskLevel}
                    </span>
                  </td>
                  <td><StatusBadge status={tx.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
