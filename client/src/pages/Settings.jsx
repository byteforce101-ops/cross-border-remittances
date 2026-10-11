import { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { RotateCcw } from 'lucide-react';

export default function Settings() {
  const resetTransactions = useStore(s => s.resetTransactions);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    resetTransactions();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-serif text-[28px] text-ink font-semibold">Settings</h1>
        <p className="text-mute text-sm mt-0.5">
          Platform configurations, corridor policies, and demo sandbox controls.
        </p>
      </div>

      {/* Corridor Config */}
      <section className="bg-white border border-rule rounded p-5 space-y-4">
        <h2 className="font-serif text-lg font-semibold text-ink">Corridor Limits &amp; Parameters</h2>
        <dl className="divide-y divide-rule text-sm">
          <div className="row">
            <dt>Default Corridor</dt>
            <dd>United Arab Emirates (AED) → India (INR)</dd>
          </div>
          <div className="row">
            <dt>Per-Transfer Minimum</dt>
            <dd>AED 100.00</dd>
          </div>
          <div className="row">
            <dt>Per-Transfer Maximum</dt>
            <dd>AED 10,000.00 (Demo Cap)</dd>
          </div>
          <div className="row">
            <dt>Quote Lock Duration</dt>
            <dd>5 minutes (300 seconds)</dd>
          </div>
        </dl>
      </section>

      {/* Mock Rails & Transparency Notice */}
      <section className="bg-white border border-rule rounded p-5 space-y-3">
        <h2 className="font-serif text-lg font-semibold text-ink">Integration &amp; Environment Disclosures</h2>
        <div className="text-sm text-mute space-y-2">
          <p>
            • <strong>NPCI / UPI Rail:</strong> Running on mock sandbox adapters for bilateral prototype demonstration.
          </p>
          <p>
            • <strong>IMPS Correspondent Banking:</strong> Simulated with real-time bank cut-off clearing rules.
          </p>
          <p>
            • <strong>Blockchain Rail:</strong> Ethereum Sepolia testnet settlement simulation with cryptographic hashes.
          </p>
          <p>
            • <strong>Financial Movements:</strong> No real fiat currency or bank deposits are moved.
          </p>
        </div>
      </section>

      {/* Demo State Reset */}
      <section className="bg-white border border-rule rounded p-5 space-y-3">
        <h2 className="font-serif text-lg font-semibold text-ink">Demo State Management</h2>
        <p className="text-sm text-mute">
          Reset all stored demo transactions back to the prototype initial state.
        </p>
        <button onClick={handleReset} className="btn btn-s text-xs">
          <RotateCcw size={14} /> Reset demo transactions
        </button>
        {resetDone && (
          <p className="text-xs text-ok font-medium">✓ Stored transactions reset successfully.</p>
        )}
      </section>
    </div>
  );
}

