import { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { UserPlus, Edit2, Trash2, CheckCircle2, XCircle, Search, ArrowUpRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function RecipientModal({ recipient, onSave, onClose }) {
  const [name, setName] = useState(recipient ? recipient.name : '');
  const [upiId, setUpiId] = useState(recipient ? recipient.upiId : '');
  const [bankName, setBankName] = useState(recipient ? recipient.bankName : '');
  const [phoneMask, setPhoneMask] = useState(recipient ? recipient.phoneMask || '•••• 1234' : '•••• ' + Math.floor(1000 + Math.random() * 9000));

  const isValid = name.trim() && upiId.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    onSave({
      name: name.trim(),
      upiId: upiId.trim(),
      bankName: bankName.trim() || 'Indian Bank',
      phoneMask,
      country: 'India',
      verified: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-ink/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-rule rounded p-6 max-w-md w-full space-y-4 shadow-xl animate-fade-in">
        <div className="flex items-center justify-between pb-2 border-b border-rule">
          <h2 className="font-serif text-xl font-semibold text-ink">
            {recipient ? 'Edit recipient' : 'Add new recipient'}
          </h2>
          <button onClick={onClose} className="p-1 text-mute hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="lbl">Full Name *</label>
            <input
              className="field"
              placeholder="e.g. Anita Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="lbl">UPI ID *</label>
            <input
              className="field font-mono text-sm"
              placeholder="e.g. anita.sharma@okaxis"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="lbl">Bank Name</label>
            <input
              className="field"
              placeholder="e.g. Axis Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </div>
          <div className="pt-3 flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-s flex-1">
              Cancel
            </button>
            <button type="submit" disabled={!isValid} className="btn btn-p flex-1">
              {recipient ? 'Update' : 'Save recipient'}
            </button>
          </div>
        </form>
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

  const [modalMode, setModalMode] = useState(null); // null | 'add' | recipient object
  const [search, setSearch] = useState('');

  const filtered = recipients.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.upiId.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data) => {
    if (modalMode === 'add') {
      addRecipient({
        ...data,
        id: `rec-${Date.now()}`,
        totalTransfers: 0,
        lastTransfer: 'Never',
        totalVolumeINR: 0,
      });
    } else if (modalMode && modalMode.id) {
      updateRecipient(modalMode.id, data);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {modalMode && (
        <RecipientModal
          recipient={modalMode === 'add' ? null : modalMode}
          onSave={handleSave}
          onClose={() => setModalMode(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[28px] text-ink font-semibold">Recipients</h1>
          <p className="text-mute text-sm mt-0.5">
            Manage verified beneficiaries in India for instant cross-border routing.
          </p>
        </div>
        <button className="btn btn-p" onClick={() => setModalMode('add')}>
          <UserPlus size={15} /> Add recipient
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-rule rounded p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipients by name or UPI ID..."
            className="field pl-9 text-sm"
          />
        </div>
      </div>

      {/* Recipient Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <div key={r.id} className="bg-white border border-rule rounded p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-ink text-base">{r.name}</p>
                <p className="font-mono text-xs text-mute mt-0.5">{r.upiId}</p>
              </div>
              {r.verified ? (
                <span className="chip bg-oksoft text-ok text-[11px]">✓ Verified</span>
              ) : (
                <span className="chip bg-warnsoft text-warn text-[11px]">Unverified</span>
              )}
            </div>

            <div className="text-xs text-mute space-y-0.5">
              <p>Bank: <strong className="text-ink font-medium">{r.bankName || 'Axis Bank'}</strong></p>
              <p>Country: <strong className="text-ink font-medium">India (INR)</strong></p>
              <p>Transfers: <strong className="text-ink font-medium">{r.totalTransfers || 0} completed</strong></p>
            </div>

            <div className="pt-2 border-t border-rule flex items-center gap-2">
              <button
                onClick={() => navigate('/send')}
                className="btn btn-p text-xs py-1.5 px-3 min-h-[34px] flex-1"
              >
                Send money <ArrowUpRight size={13} />
              </button>
              <button
                onClick={() => setModalMode(r)}
                className="p-2 border border-rule text-mute hover:text-ink rounded"
                title="Edit Recipient"
              >
                <Edit2 size={13} />
              </button>
              <button
                onClick={() => deleteRecipient(r.id)}
                className="p-2 border border-rule text-bad hover:bg-badsoft rounded"
                title="Delete Recipient"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

