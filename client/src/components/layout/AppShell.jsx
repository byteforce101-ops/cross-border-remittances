import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();

  const isOverview = location.pathname === '/';
  const isSend = location.pathname === '/send';

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans">
      {/* Persistent demo banner */}
      <div className="bg-warnsoft text-warn text-sm px-4 py-2 border-b border-rule" role="status">
        <strong>Demo environment.</strong> All balances, rates, routes and transactions are simulated. No money moves.
      </div>

      <div className="lg:grid lg:grid-cols-[220px_1fr] flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0">
          <Header />

          <main className="p-4 lg:p-8 pb-32 lg:pb-8 max-w-[1200px] w-full mx-auto">
            {/* Mobile nav quick toggles if on overview or send */}
            <div className="lg:hidden flex gap-2 mb-4" role="tablist">
              <button
                className={`btn flex-1 ${isOverview ? 'btn-p' : 'btn-s'}`}
                onClick={() => navigate('/')}
              >
                Overview
              </button>
              <button
                className={`btn flex-1 ${isSend ? 'btn-p' : 'btn-s'}`}
                onClick={() => navigate('/send')}
              >
                Send money
              </button>
            </div>

            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

