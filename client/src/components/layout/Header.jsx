import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, X } from 'lucide-react';
import { useStore } from '../../store/useStore.js';

const PAGE_TITLES = {
  '/':             'Overview',
  '/send':         'Send money',
  '/transactions': 'Transactions',
  '/recipients':   'Recipients',
  '/routes':       'Payment routes',
  '/risk':         'Risk & compliance',
  '/settlement':   'Settlement monitor',
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

  const title =
    Object.entries(PAGE_TITLES).find(([path]) =>
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
    <header className="h-14 flex items-center justify-between px-4 lg:px-8 border-b border-rule bg-canvas sticky top-0 z-20">
      {/* Left — Logo / Title on mobile, Title on desktop */}
      <div className="flex items-center gap-3">
        <span className="lg:hidden font-serif font-bold text-lg text-ink">
          Remit<span className="text-acc">Ledger</span>
        </span>
        <span className="hidden lg:inline text-sm font-semibold text-ink">
          {title}
        </span>
        <span className="demo hidden sm:inline-block">DEMO SIMULATOR</span>
      </div>

      {/* Right — Search & Notifications */}
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search TXN-D-..."
            className="pl-8 pr-3 py-1.5 bg-white border border-rule rounded text-xs text-ink placeholder-mute focus:outline-none focus:border-acc w-36 sm:w-48 transition-all focus:w-56"
          />
        </form>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-mute hover:text-ink hover:bg-white rounded transition-colors"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warn rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-rule rounded p-3 shadow-lg z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-rule mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-mute">Alerts &amp; Notices</span>
                <button onClick={() => setShowNotifications(false)}>
                  <X size={14} className="text-mute hover:text-ink" />
                </button>
              </div>
              <div className="divide-y divide-rule max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markRead(n.id);
                      setShowNotifications(false);
                    }}
                    className={`py-2 px-1 cursor-pointer transition-colors ${
                      !n.read ? 'bg-canvas/50' : ''
                    }`}
                  >
                    <p className="text-xs font-medium text-ink">{n.message}</p>
                    <p className="text-[10px] text-mute mt-0.5">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

