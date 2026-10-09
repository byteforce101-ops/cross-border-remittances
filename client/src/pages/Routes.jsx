import { Zap, Globe, Link, Building2 } from 'lucide-react';
import { ROUTE_STATS } from '../services/mockData.js';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import clsx from 'clsx';

const RAILS = [
  {
    id: 'npci', name: 'UPI / NPCI', icon: Zap, color: '#4f46e5',
    description: 'Direct settlement via India\'s National Payments Corporation (NPCI) UPI infrastructure. Fastest route for INR delivery.',
    badge: null, availability: 'operational',
    pros: ['Instant settlement (10–30s)', 'Lowest cost', 'Native Indian payment rail', 'NPCI regulated'],
    cons: ['Requires UPI ID', 'India-only destination'],
    integrationStatus: 'mock',
  },
  {
    id: 'blockchain', name: 'Blockchain', icon: Link, color: '#8b5cf6',
    description: 'Ethereum Sepolia smart-contract settlement. Provides immutable on-chain audit trail and programmable settlement conditions.',
    badge: 'TESTNET', availability: 'testnet',
    pros: ['Immutable audit trail', 'Programmable settlement', 'Lowest cost per transaction', 'Transparent verification'],
    cons: ['Testnet only (not production)', 'Gas cost variability', 'Technical complexity'],
    integrationStatus: 'testnet',
  },
  {
    id: 'bank', name: 'Bank Transfer', icon: Building2, color: '#10b981',
    description: 'Direct bank-to-bank transfer via correspondent banking network. Suitable for recipients without UPI.',
    badge: null, availability: 'operational',
    pros: ['Wide bank coverage', 'No UPI required', 'High reliability'],
    cons: ['1–2 business days', 'Higher fees', 'Manual reconciliation'],
    integrationStatus: 'mock',
  },
  {
    id: 'swift', name: 'SWIFT', icon: Globe, color: '#f59e0b',
    description: 'SWIFT interbank messaging network via correspondent banks. Used for large-value or complex cross-border transfers.',
    badge: null, availability: 'operational',
    pros: ['Universal acceptance', 'Highest reliability', 'Handles large amounts', 'Industry standard'],
    cons: ['1–3 business days', 'Highest cost', 'Multiple intermediary banks'],
    integrationStatus: 'mock',
  },
];

const COMPARISON_DATA = [
  { subject: 'Speed', npci: 95, blockchain: 98, bank: 40, swift: 25 },
  { subject: 'Cost', npci: 88, blockchain: 95, bank: 55, swift: 30 },
  { subject: 'Reliability', npci: 92, blockchain: 78, bank: 96, swift: 95 },
  { subject: 'Coverage', npci: 70, blockchain: 60, bank: 88, swift: 98 },
  { subject: 'Compliance', npci: 95, blockchain: 72, bank: 92, swift: 98 },
];

const STATUS_COLORS = { operational: 'text-emerald-700 font-bold', testnet: 'text-amber-700 font-bold', degraded: 'text-red-700 font-bold' };
const STATUS_DOTS = { operational: 'bg-emerald-500', testnet: 'bg-amber-500', degraded: 'bg-red-500' };

export default function Routes() {
  const stats = ROUTE_STATS;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="section-title">Payment Route Intelligence</h2>
          <p className="section-subtitle">Available settlement rails — the platform orchestrates across all of these</p>
        </div>
        <span className="badge-demo">MOCK ADAPTERS</span>
      </div>

      {/* Orchestration banner */}
      <div className="card p-5 border-brand-200 bg-brand-50/50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-brand-800">Intelligent Orchestration Layer</div>
            <p className="text-sm text-gray-300 mt-1">
              RemittanceOS sits above all payment rails. For each transaction, it analyses cost, speed, risk,
              liquidity, and reliability to select the optimal route. You are not locked to a single rail.
            </p>
          </div>
        </div>
      </div>

      {/* Rail cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {RAILS.map(rail => {
          const Icon = rail.icon;
          const s = stats[rail.id];
          return (
            <div key={rail.id} className="card p-5 space-y-4 bg-white border border-surface-700 shadow-card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs" style={{ background: `${rail.color}15`, border: `1px solid ${rail.color}30` }}>
                    <Icon size={18} style={{ color: rail.color }} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-100">{rail.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={clsx('w-2 h-2 rounded-full', STATUS_DOTS[rail.availability])} />
                      <span className={clsx('text-xs', STATUS_COLORS[rail.availability])}>
                        {rail.availability === 'operational' ? 'Operational' : rail.availability === 'testnet' ? 'Testnet' : 'Degraded'}
                      </span>
                      {rail.badge && <span className="badge-demo">{rail.badge}</span>}
                      {rail.integrationStatus === 'mock' && <span className="badge-neutral text-[10px]">MOCK</span>}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">{rail.description}</p>

              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  ['Avg Cost', `₹${s.avgCostINR}`],
                  ['Avg Speed', s.avgSpeedSec < 120 ? `${s.avgSpeedSec}s` : s.avgSpeedSec < 7200 ? `${Math.round(s.avgSpeedSec/60)}m` : `${Math.round(s.avgSpeedSec/86400)}d`],
                  ['Reliability', `${s.reliability}%`],
                ].map(([k, v]) => (
                  <div key={k} className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                    <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{k}</div>
                    <div className="text-sm font-bold text-gray-100 mt-0.5">{v}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-gray-400 font-bold mb-1 uppercase tracking-wide">Advantages</div>
                  <ul className="space-y-1">
                    {rail.pros.map(p => <li key={p} className="text-emerald-700 font-medium flex items-start gap-1"><span className="mt-0.5 font-bold">✓</span>{p}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="text-gray-400 font-bold mb-1 uppercase tracking-wide">Limitations</div>
                  <ul className="space-y-1">
                    {rail.cons.map(c => <li key={c} className="text-gray-400 font-medium flex items-start gap-1"><span className="mt-0.5 font-bold">—</span>{c}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison radar */}
      <div className="card p-5 bg-white border border-surface-700 shadow-card">
        <h3 className="section-title mb-1">Route Comparison</h3>
        <p className="section-subtitle mb-5">Multi-factor scoring across key dimensions (higher = better)</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={COMPARISON_DATA}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} />
              <Radar name="UPI" dataKey="npci" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
              <Radar name="Blockchain" dataKey="blockchain" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
              <Radar name="Bank" dataKey="bank" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
              <Radar name="SWIFT" dataKey="swift" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="overflow-x-auto">
            <table className="table text-xs">
              <thead><tr><th>Route</th><th>Cost</th><th>Speed</th><th>Reliability</th><th>Transactions</th></tr></thead>
              <tbody>
                {RAILS.map(r => {
                  const s = stats[r.id];
                  return (
                    <tr key={r.id}>
                      <td className="font-bold text-gray-100">{r.name}</td>
                      <td className="font-medium">₹{s.avgCostINR}</td>
                      <td className="font-medium">{s.avgSpeedSec < 120 ? `${s.avgSpeedSec}s` : s.avgSpeedSec < 7200 ? `${Math.round(s.avgSpeedSec/60)}m` : `${Math.round(s.avgSpeedSec/86400)}d`}</td>
                      <td className="font-medium">{s.reliability}%</td>
                      <td className="font-mono font-semibold">{s.txCount.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
