import { BookOpen, ClipboardList, History, LayoutDashboard, LogOut, Upload } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

const userLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/exam/start', label: 'Start Exam', icon: ClipboardList },
  { to: '/history', label: 'History', icon: History },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Admin', icon: LayoutDashboard },
  { to: '/admin/questions', label: 'Questions', icon: BookOpen },
  { to: '/admin/import', label: 'Import', icon: Upload },
];

function LinkItem({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded px-3 py-2 text-sm font-medium focus-ring ${
          isActive ? 'bg-signal text-white' : 'text-slate-700 hover:bg-slate-100'
        }`
      }
    >
      <Icon size={18} />
      {item.label}
    </NavLink>
  );
}

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">AFPSAT</p>
            <h1 className="text-xl font-semibold text-ink">Mock Exam System</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.name}</span>
            <button
              onClick={logout}
              className="focus-ring inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[230px_1fr]">
        <nav className="panel h-fit p-3">
          <div className="space-y-1">
            {userLinks.map((item) => (
              <LinkItem key={item.to} item={item} />
            ))}
          </div>
          {isAdmin && (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Admin
              </p>
              <div className="space-y-1">
                {adminLinks.map((item) => (
                  <LinkItem key={item.to} item={item} />
                ))}
              </div>
            </div>
          )}
        </nav>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
