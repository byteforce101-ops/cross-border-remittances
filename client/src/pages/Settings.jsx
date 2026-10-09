import { useState } from 'react';
import { User, Palette, Bell, Shield } from 'lucide-react';

export default function Settings() {
  const [profile, setProfile] = useState({ name: 'Demo Operator', email: 'ops@remittanceos.demo', country: 'India' });
  const [currency, setCurrency] = useState('INR');
  const [notifications, setNotifications] = useState({ risk: true, settlement: true, failures: true });

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h2 className="section-title">Settings</h2>
        <p className="section-subtitle">Platform configuration and preferences</p>
      </div>

      {/* Profile */}
      <div className="card p-5 space-y-4 bg-white border border-surface-700 shadow-card">
        <div className="flex items-center gap-3 mb-2">
          <User size={16} className="text-brand-600" />
          <h3 className="font-bold text-gray-100">Profile</h3>
        </div>
        {[['Full Name', 'name', 'text'], ['Email Address', 'email', 'email'], ['Country', 'country', 'text']].map(([label, key, type]) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input className="input" type={type} value={profile[key]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} />
          </div>
        ))}
        <button className="btn-primary text-sm">Save Profile</button>
      </div>

      {/* Application */}
      <div className="card p-5 space-y-4 bg-white border border-surface-700 shadow-card">
        <div className="flex items-center gap-3 mb-2">
          <Palette size={16} className="text-brand-600" />
          <h3 className="font-bold text-gray-100">Application</h3>
        </div>
        <div>
          <label className="label">Display Currency</label>
          <select className="select" value={currency} onChange={e => setCurrency(e.target.value)}>
            <option value="INR">₹ INR — Indian Rupee</option>
            <option value="USD">$ USD — US Dollar</option>
            <option value="AED">AED — UAE Dirham</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-5 space-y-4 bg-white border border-surface-700 shadow-card">
        <div className="flex items-center gap-3 mb-2">
          <Bell size={16} className="text-brand-600" />
          <h3 className="font-bold text-gray-100">Notifications</h3>
        </div>
        {[
          ['risk', 'Risk alerts (high-risk transactions)'],
          ['settlement', 'Settlement status updates'],
          ['failures', 'Transaction failures'],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-300 font-medium">{label}</span>
            <button
              onClick={() => setNotifications(p => ({ ...p, [key]: !p[key] }))}
              className={`w-10 h-5 rounded-full transition-all ${notifications[key] ? 'bg-brand-600' : 'bg-slate-300'} relative`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow ${notifications[key] ? 'left-5' : 'left-0.5'}`} />
            </button>
          </label>
        ))}
      </div>

      {/* Environment */}
      <div className="card p-5 bg-white border border-surface-700 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={16} className="text-brand-600" />
          <h3 className="font-bold text-gray-100">Environment Configuration</h3>
        </div>
        <div className="space-y-3 font-mono text-sm">
          {[
            ['Environment', 'DEMO / SANDBOX', 'text-amber-700 font-bold'],
            ['NPCI Adapter', 'MOCK', 'text-amber-700 font-bold'],
            ['FX Provider', 'MOCK (static rates)', 'text-amber-700 font-bold'],
            ['Blockchain Network', 'Ethereum Sepolia (Testnet)', 'text-purple-700 font-bold'],
            ['AI Risk Engine', 'Rule-based (no API)', 'text-gray-400 font-semibold'],
            ['Backend', 'Express (http://localhost:4000)', 'text-brand-700 font-bold'],
          ].map(([k, v, cls]) => (
            <div key={k} className="flex justify-between py-2 border-b border-surface-700 last:border-0">
              <span className="text-gray-400 font-sans font-medium">{k}</span>
              <span className={cls}>{v}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          To connect real NPCI APIs, set <code className="text-brand-700 font-semibold bg-brand-50 px-1 py-0.5 rounded border border-brand-200">NPCI_ADAPTER=live</code> in <code className="text-brand-700 font-semibold bg-brand-50 px-1 py-0.5 rounded border border-brand-200">server/.env</code>.
          See <code className="bg-slate-100 px-1 py-0.5 rounded text-gray-600">integrations/README.md</code> for the adapter pattern.
        </p>
      </div>
    </div>
  );
}
