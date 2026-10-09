import { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { UserPlus, Edit2, Trash2, CheckCircle2, XCircle, Search, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function RecipientModal({ recipient, onSave, onClose }) {
  const [form, setForm] = useState(recipient || { name: '', upiId: '', bankName: '', country: 'India' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-6 space-y-4 animate-fade-in bg-white border border-surface-700 shadow-xl">
        <h2 className="section-title">{recipient ? 'Edit Recipient' : 'Add Recipient'}</h2>
        {[
          ['Full Name', 'name', 'text', 'e.g. Priya Sharma'],
          ['UPI ID', 'upiId', 'text', 'name@bank'],
          ['Bank Name', 'bankName', 'text', 'e.g. ICICI Bank'],
        ].map(([label, key, type, ph]) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input className="input" type={type} placeholder={ph} value={form[key] || ''} onChange={e => set(key, e.target.value)} />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} className="btn-primary flex-1"
            disabled={!form.name || !form.upiId}>Save Recipient</button>
        </div>
      </div>
    </div>
  );
}

export default function Recipients() {
  const navigate = useNavigate();
  const recipients = useStore(s => s.recipients);
  const addRecipient = useStore(s => s.addRecipient);
  const updateRecipient = useStore(s => s.updateRecipient);
  const deleteRecipient = useStore(s => s.deleteRecipient);
  const [modal, setModal] = useState(null); // null | 'add' | recipient object
  const [query, setQuery] = useState('');

  const filtered = recipients.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.upiId.toLowerCase().includes(query.toLowerCase())
  );

  const handleSave = (form) => {
    if (modal === 'add') {
      addRecipient({ ...form, id: `rec-${Date.now()}`, verified: false, totalTransfers: 0, totalVolume: 0, lastTransfer: null });
    } else {
      updateRecipient(modal.id, form);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {modal && <RecipientModal recipient={modal === 'add' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Recipients</h2>
          <p className="section-subtitle">{recipients.length} saved recipients in India</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary">
          <UserPlus size={15} /> Add Recipient
        </button>
      </div>

      <div className="card p-4 bg-white border border-surface-700 shadow-card">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search recipients…" className="input pl-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(r => (
          <div key={r.id} className="card-hover p-5 space-y-3 bg-white border border-surface-700">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold text-gray-100">{r.name}</div>
                <div className="font-mono text-xs font-semibold text-brand-700 mt-0.5">{r.upiId}</div>
              </div>
              <div className="flex items-center gap-1">
                {r.verified
                  ? <CheckCircle2 size={18} className="text-emerald-600" title="Verified" />
                  : <XCircle size={18} className="text-gray-300" title="Not verified" />}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span>🇮🇳 {r.country}</span>
              {r.bankName && <><span>·</span><span>{r.bankName}</span></>}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                <div className="text-gray-400 font-medium">Transfers</div>
                <div className="text-gray-100 font-bold mt-0.5">{r.totalTransfers}</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                <div className="text-gray-400 font-medium">Volume</div>
                <div className="text-gray-100 font-bold mt-0.5">₹{r.totalVolume > 0 ? (r.totalVolume / 100000).toFixed(1) + 'L' : '—'}</div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => navigate('/send')} className="flex-1 btn-ghost text-xs font-semibold justify-center border border-surface-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200">
                <ArrowUpRight size={13} /> Send Money
              </button>
              <button onClick={() => setModal(r)} className="p-2 text-gray-400 hover:text-gray-100 hover:bg-slate-100 rounded-lg transition-all border border-transparent hover:border-surface-700">
                <Edit2 size={13} />
              </button>
              <button onClick={() => deleteRecipient(r.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
