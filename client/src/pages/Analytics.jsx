import { VOLUME_CHART_DATA } from '../services/mockData.js';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const ROUTE_DIST = [
  { name: 'UPI/NPCI', value: 62, color: '#4f46e5' },
  { name: 'Bank', value: 18, color: '#10b981' },
  { name: 'SWIFT', value: 12, color: '#f59e0b' },
  { name: 'Blockchain', value: 8, color: '#8b5cf6' },
];

const COST_DATA = [
  { date: 'Oct 1', avgCost: 198 }, { date: 'Oct 2', avgCost: 185 },
  { date: 'Oct 3', avgCost: 204 }, { date: 'Oct 4', avgCost: 178 },
  { date: 'Oct 5', avgCost: 192 }, { date: 'Oct 6', avgCost: 171 },
  { date: 'Oct 7', avgCost: 183 }, { date: 'Oct 8', avgCost: 186 },
];

const TT = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#0f172a',
  boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
};

export default function Analytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-100">Analytics</h2>
          <p className="text-sm text-gray-400 mt-0.5">Platform performance metrics and trends</p>
        </div>
        <span className="badge-demo">MOCK DATA</span>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ['Transfer Volume', '₹8.42 Cr', 'This month'],
          ['Transactions', '12,486', 'This month'],
          ['Avg Transaction', '₹67,430', 'Per transfer'],
          ['Avg Cost/Tx', '₹186', 'Total fees'],
        ].map(([label, val, sub]) => (
          <div key={label} className="card p-5 bg-white border border-surface-700 shadow-card">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</div>
            <div className="text-2xl font-bold text-gray-100 mt-1">{val}</div>
            <div className="text-xs text-gray-400 font-medium mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Volume & cost */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5 bg-white border border-surface-700 shadow-card">
          <h3 className="section-title mb-4">Daily Transaction Count</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={VOLUME_CHART_DATA}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT} />
              <Area type="monotone" dataKey="txCount" stroke="#4f46e5" strokeWidth={2} fill="url(#grad1)" name="Transactions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 bg-white border border-surface-700 shadow-card">
          <h3 className="section-title mb-4">Avg Cost per Transaction (₹)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={COST_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[150, 220]} />
              <Tooltip contentStyle={TT} formatter={v => [`₹${v}`, 'Avg cost']} />
              <Bar dataKey="avgCost" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Route + risk distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5 bg-white border border-surface-700 shadow-card">
          <h3 className="section-title mb-4">Route Distribution</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={ROUTE_DIST} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {ROUTE_DIST.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip contentStyle={TT} formatter={v => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="space-y-2 flex-1">
              {ROUTE_DIST.map(d => (
                <li key={d.name} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-sm" style={{ background: d.color }} />
                  <span className="text-sm text-gray-400 font-medium">{d.name}</span>
                  <span className="text-sm font-bold text-gray-100 ml-auto">{d.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card p-5 bg-white border border-surface-700 shadow-card">
          <h3 className="section-title mb-4">Corridor Volume Share</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={[
              { corridor: 'UAE→IN', share: 38.2 },
              { corridor: 'USA→IN', share: 31.5 },
              { corridor: 'UK→IN', share: 17.4 },
              { corridor: 'SG→IN', share: 12.9 },
            ]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <YAxis dataKey="corridor" type="category" tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={TT} formatter={v => [`${v}%`, 'Volume']} />
              <Bar dataKey="share" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
