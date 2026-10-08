import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowUpDown } from 'lucide-react';
import { useStore } from '../store/useStore.js';
import { StatusBadge, RouteBadge } from '../components/common/StatusBadge.jsx';
import { format } from 'date-fns';
import clsx from 'clsx';

const SORT_KEYS = { date: 'date', amount: 'fromAmount', risk: 'riskScore', id: 'id' };

export default function Transactions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactions = useStore(s => s.transactions);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [routeFilter, setRouteFilter] = useState('all');
  const [corridorFilter, setCorridorFilter] = useState('all');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.senderName.toLowerCase().includes(q) ||
        t.recipientName.toLowerCase().includes(q) ||
        t.recipientUpi?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') list = list.filter(t => t.status === statusFilter);
    if (routeFilter !== 'all') list = list.filter(t => t.route === routeFilter);
    if (corridorFilter !== 'all') list = list.filter(t => t.corridor === corridorFilter);
    list.sort((a, b) => {
      let av = a[SORT_KEYS[sortKey]], bv = b[SORT_KEYS[sortKey]];
      if (sortDir === 'asc') return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });
    return list;
  }, [transactions, query, statusFilter, routeFilter, corridorFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const allStatuses = [...new Set(transactions.map(t => t.status))];
  const corridors = [...new Set(transactions.map(t => t.corridor))];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Filters */}
      <div className="card p-4 bg-white border border-surface-700 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by ID, sender, recipient…"
              className="input pl-8" />
          </div>
          <select className="select w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            {allStatuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select className="select w-auto" value={routeFilter} onChange={e => setRouteFilter(e.target.value)}>
            <option value="all">All Routes</option>
            <option value="npci">UPI / NPCI</option>
            <option value="swift">SWIFT</option>
            <option value="blockchain">Blockchain</option>
            <option value="bank">Bank</option>
          </select>
          <select className="select w-auto" value={corridorFilter} onChange={e => setCorridorFilter(e.target.value)}>
            <option value="all">All Corridors</option>
            {corridors.map(c => <option key={c} value={c}>{c.replace('_', ' → ').replace('INR', 'India')}</option>)}
          </select>
          <div className="text-xs text-gray-400 font-medium flex items-center gap-1 ml-auto">
            <span className="font-bold text-gray-100">{filtered.length}</span> of {transactions.length} transactions
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th><button onClick={() => toggleSort('id')} className="flex items-center gap-1 hover:text-gray-100">ID <ArrowUpDown size={11} /></button></th>
              <th><button onClick={() => toggleSort('date')} className="flex items-center gap-1 hover:text-gray-100">Date <ArrowUpDown size={11} /></button></th>
              <th>Sender</th>
              <th>Recipient</th>
              <th>Corridor</th>
              <th><button onClick={() => toggleSort('amount')} className="flex items-center gap-1 hover:text-gray-100">Amount <ArrowUpDown size={11} /></button></th>
              <th>Route</th>
              <th><button onClick={() => toggleSort('risk')} className="flex items-center gap-1 hover:text-gray-100">Risk <ArrowUpDown size={11} /></button></th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-gray-400 py-12">No transactions match your filters.</td></tr>
            ) : filtered.map(tx => (
              <tr key={tx.id} onClick={() => navigate(`/transactions/${tx.id}`)}>
                <td className="font-mono text-xs font-semibold text-brand-600">{tx.id}</td>
                <td className="text-gray-400 text-xs whitespace-nowrap font-medium">
                  {format(new Date(tx.date), 'MMM d, HH:mm')}
                </td>
                <td>
                  <div className="text-gray-100 font-medium text-sm">{tx.senderName}</div>
                  <div className="text-gray-400 text-xs">{tx.senderCountry}</div>
                </td>
                <td>
                  <div className="text-gray-100 font-medium text-sm">{tx.recipientName}</div>
                  <div className="text-gray-400 text-xs font-mono">{tx.recipientUpi}</div>
                </td>
                <td className="text-xs text-gray-400 font-medium">{tx.senderCountry} → 🇮🇳</td>
                <td>
                  <div className="text-gray-100 font-bold text-sm">{tx.fromAmount.toLocaleString()} {tx.fromCurrency}</div>
                  <div className="text-gray-400 text-xs font-medium">₹{tx.toAmount.toLocaleString()}</div>
                </td>
                <td><RouteBadge route={tx.route} /></td>
                <td>
                  <div className={clsx('text-xs font-bold', tx.riskLevel === 'LOW' ? 'text-emerald-700' : tx.riskLevel === 'MEDIUM' ? 'text-amber-700' : 'text-red-700')}>
                    {tx.riskScore} — {tx.riskLevel}
                  </div>
                </td>
                <td><StatusBadge status={tx.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
