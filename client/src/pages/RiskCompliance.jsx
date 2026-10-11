import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore.js';
import { TRANSACTION_STATUS } from '@shared/constants/transactionStatus.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { fxService } from '../services/fxService.js';

export default function RiskCompliance() {
  const navigate = useNavigate();
  const transactions = useStore(s => s.transactions);

  const inReview = transactions.filter(
    t => t.status === TRANSACTION_STATUS.COMPLIANCE_REVIEW || t.attentionRequired
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[28px] text-ink font-semibold">Risk &amp; Compliance</h1>
          <p className="text-mute text-sm mt-0.5">
            Pre-flight screening, corridor compliance rules, and exception management.
          </p>
        </div>
        <span className="demo">SIMULATED CHECKS</span>
      </div>

      {/* Compliance Rules Notice */}
      <div className="bg-white border border-rule rounded p-5 space-y-2">
        <h2 className="font-serif text-lg font-semibold text-ink">Corridor Compliance Engine (UAE → India)</h2>
        <p className="text-sm text-ink leading-relaxed">
          Every remittance is checked for corridor value thresholds (AED 100 to 10,000 in demo), beneficiary account and UPI handle syntax validation, authorized cross-border purposes (Family support, Education, Medical), and sanction screening.
        </p>
      </div>

      {/* Review Queue */}
      <section className="bg-white border border-rule rounded p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Compliance Review Queue ({inReview.length})
          </h2>
          <span className="chip bg-infosoft text-info text-xs">Action Required</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-mute bg-canvas border-b border-rule">
              <tr>
                <th className="p-3 font-medium">Reference</th>
                <th className="p-3 font-medium">Sender</th>
                <th className="p-3 font-medium">Recipient</th>
                <th className="p-3 font-medium">Flag Reason</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {inReview.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-mute">
                    No transactions currently requiring compliance intervention.
                  </td>
                </tr>
              ) : (
                inReview.map((tx) => (
                  <tr key={tx.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="p-3 font-mono text-xs font-semibold text-ink">{tx.id}</td>
                    <td className="p-3 text-ink">{tx.senderName}</td>
                    <td className="p-3 text-ink">{tx.recipientName}</td>
                    <td className="p-3 text-xs text-ink max-w-xs">{tx.note || 'Review flag'}</td>
                    <td className="p-3"><StatusBadge status={tx.status} customLabel={tx.statusLabel} /></td>
                    <td className="p-3">
                      <button
                        onClick={() => navigate(`/transactions/${tx.id}`)}
                        className="btn btn-s text-xs py-1 px-3 min-h-[32px]"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Screening Checklist */}
      <section className="bg-white border border-rule rounded p-5 space-y-3">
        <h2 className="font-serif text-lg font-semibold text-ink">Corridor Verification Checkpoints</h2>
        <ul className="divide-y divide-rule text-sm">
          <li className="py-3 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-ink">Corridor Limits</p>
              <p className="text-xs text-mute">Enforces UAE Central Bank and RBI personal remittance bounds (AED 100 – 10,000 demo).</p>
            </div>
            <span className="chip bg-oksoft text-ok text-[11px]">Enforced</span>
          </li>
          <li className="py-3 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-ink">Beneficiary UPI ID Resolution</p>
              <p className="text-xs text-mute">Validates VPA format against participating PSP switch endpoints prior to locking quote.</p>
            </div>
            <span className="chip bg-oksoft text-ok text-[11px]">Enforced</span>
          </li>
          <li className="py-3 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-ink">Permitted Purpose Screening</p>
              <p className="text-xs text-mute">Cross-checks selected purpose against bilateral LRS (Liberalised Remittance Scheme) exemptions.</p>
            </div>
            <span className="chip bg-oksoft text-ok text-[11px]">Enforced</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

