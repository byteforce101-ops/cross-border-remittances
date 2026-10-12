import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowUpDown } from 'lucide-react';
import { useStore } from '../store/useStore.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { fxService } from '../services/fxService.js';

const SORT_KEYS = { date: 'date', amount: 'fromAmount', id: 'id' };

export default function Transactions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactions = useStore(s => s.transactions);
  const fetchTransactions = useStore(s => s.fetchTransactions);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [routeFilter, setRouteFilter] = useState('all');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.senderName?.toLowerCase().includes(q) ||
        t.recipientName?.toLowerCase().includes(q) ||
        t.recipientUpi?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter(t => t.status === statusFilter || t.statusLabel === statusFilter);
    }
    if (routeFilter !== 'all') {
      list = list.filter(t => t.route === routeFilter || t.routeShort === routeFilter);
    }
    list.sort((a, b) => {
      let av = a[SORT_KEYS[sortKey]], bv = b[SORT_KEYS[sortKey]];
      if (sortDir === 'asc') return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });
    return list;
  }, [transactions, query, statusFilter, routeFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[28px] text-ink font-semibold">Transactions</h1>
          <p className="text-mute text-sm mt-0.5">
            History and status of simulated remittances · Corridor: UAE → India · <span className="demo">DEMO</span>
          </p>
        </div>
        <button className="btn btn-p" onClick={() => navigate('/send')}>
          Send money
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-rule rounded p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by ID, sender, recipient..."
            className="field pl-9 text-sm"
          />
        </div>
        <select
          className="field w-auto text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLIANCE_REVIEW">In review</option>
          <option value="SETTLEMENT_PENDING">Delayed</option>
          <option value="FAILED">Failed</option>
        </select>
        <select
          className="field w-auto text-sm"
          value={routeFilter}
          onChange={e => setRouteFilter(e.target.value)}
        >
          <option value="all">All Routes</option>
          <option value="upi_partner">UPI-linked</option>
          <option value="imps_bank">IMPS</option>
          <option value="blockchain_partner">Blockchain-settled</option>
        </select>
        <div className="text-xs text-mute font-medium ml-auto">
          Showing <span className="font-bold text-ink">{filtered.length}</span> of {transactions.length}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-rule rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-mute bg-canvas border-b border-rule">
            <tr>
              <th className="p-3 font-medium">
                <button onClick={() => toggleSort('id')} className="flex items-center gap-1 hover:text-ink">
                  Reference <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="p-3 font-medium">
                <button onClick={() => toggleSort('date')} className="flex items-center gap-1 hover:text-ink">
                  Date <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="p-3 font-medium">Sender</th>
              <th className="p-3 font-medium">Recipient</th>
              <th className="p-3 font-medium">
                <button onClick={() => toggleSort('amount')} className="flex items-center gap-1 hover:text-ink">
                  Amount <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="p-3 font-medium">Route</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-mute">
                  No simulated transactions match your query.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => navigate(`/transactions/${tx.id}`)}
                  className="hover:bg-canvas/50 transition-colors cursor-pointer"
                >
                  <td className="p-3 font-mono font-medium text-ink">
                    {tx.id}
                  </td>
                  <td className="p-3 text-mute text-xs whitespace-nowrap">
                    {new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3 font-medium text-ink">
                    {tx.senderName}
                  </td>
                  <td className="p-3 text-ink">
                    <div>{tx.recipientName}</div>
                    <div className="text-xs font-mono text-mute">{tx.recipientUpi}</div>
                  </td>
                  <td className="p-3 num font-medium text-ink">
                    <div>{fxService.formatAED(tx.fromAmount)}</div>
                    <div className="text-xs text-mute">{fxService.formatINR(tx.toAmount)}</div>
                  </td>
                  <td className="p-3 text-mute">
                    {tx.routeShort || (tx.route === 'upi_partner' ? 'UPI-linked' : tx.route === 'imps_bank' ? 'IMPS' : 'Blockchain-settled')}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={tx.status} customLabel={tx.statusLabel} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

