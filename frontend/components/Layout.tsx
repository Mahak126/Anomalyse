import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, UploadCloud, LogOut, AlertTriangle } from 'lucide-react';
import { authService } from '../services/authService';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/fraud-transactions', label: 'Fraud Alerts', icon: AlertTriangle },
    { path: '/transactions', label: 'All Transactions', icon: List },
    { path: '/upload', label: 'Upload Data', icon: UploadCloud },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10 hidden md:flex">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <img src="/logo.jpeg" alt="Anomalyse Logo" className="w-8 h-8 rounded-full object-cover border-2 border-slate-600" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Anomalyse</h1>
            <p className="text-xs text-slate-400">Fraud Detection System</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => authService.logout()}
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 w-full rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header Placeholder (Visible only on small screens) */}
      <div className="md:hidden fixed w-full bg-slate-900 text-white z-20 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo.jpeg" alt="Anomalyse Logo" className="w-8 h-8 rounded-full object-cover border border-slate-600" />
          <span className="font-bold">Anomalyse</span>
        </div>
        <button onClick={() => authService.logout()}><LogOut className="w-5 h-5" /></button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 overflow-y-auto mt-14 md:mt-0">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;