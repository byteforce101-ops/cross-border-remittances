import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { Outlet } from 'react-router-dom';

export default function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
