import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronDown, User, X } from 'lucide-react';
import { useStore } from '../../store/useStore.js';
import clsx from 'clsx';

const PAGE_TITLES = {
  '/':             'Overview',
  '/send':         'Send Money',
  '/transactions': 'Transactions',
  '/recipients':   'Recipients',
  '/routes':       'Payment Routes',
  '/risk':         'Risk & Compliance',
  '/settlement':   'Settlement',
  '/operations':   'Operations',
  '/analytics':    'Analytics',
  '/settings':     'Settings',
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifications = useStore(s => s.notifications);
  const markRead = useStore(s => s.markNotificationRead);
  const unread = notifications.filter(n => !n.read).length;

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  )?.[1] || 'Platform';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/transactions?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-surface-700 sticky top-0 z-20 shadow-sm">
      {/* Left — Page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-gray-100">{title}</h1>
        <span className="badge-demo">DEMO / SANDBOX</span>
      </div>

      {/* Right — Search + actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search transactions…"
            className="pl-8 pr-3 py-1.5 bg-surface-850 border border-surface-700 rounded-lg text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 w-48 transition-all focus:w-64"
          />
        </form>

        {/* Environment indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-slow" />
          <span className="text-[10px] font-mono text-amber-800 font-bold tracking-wider uppercase">Mock APIs</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-400 hover:text-gray-100 hover:bg-surface-750 rounded-lg transition-all"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 card py-2 shadow-card-hover z-50 animate-fade-in bg-white border border-surface-700">
              <div className="flex items-center justify-between px-4 py-2 border-b border-surface-700">
                <span className="text-sm font-semibold text-gray-100">Notifications</span>
                <button onClick={() => setShowNotifications(false)}>
                  <X size={14} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => { markRead(n.id); setShowNotifications(false); }}
                  className={clsx(
                    'flex items-start gap-3 px-4 py-3 hover:bg-surface-750 cursor-pointer transition-colors border-b border-surface-700/40 last:border-0',
                    !n.read ? 'bg-brand-50/40' : 'bg-white'
                  )}
                >
                  <span className={clsx(
                    'mt-1 w-2 h-2 rounded-full flex-shrink-0',
                    n.type === 'risk' ? 'bg-red-500' : n.type === 'success' ? 'bg-emerald-500' : 'bg-brand-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-200 font-medium leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                  {!n.read && <span className="w-1.5 h-1.5 bg-brand-500 rounded-full flex-shrink-0 mt-1" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-750 rounded-lg transition-all border border-transparent hover:border-surface-700">
          <div className="w-7 h-7 bg-brand-gradient rounded-full flex items-center justify-center shadow-sm">
            <User size={13} className="text-white" />
          </div>
          <span className="text-sm font-medium text-gray-200 hidden sm:block">Operator</span>
          <ChevronDown size={13} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
}
