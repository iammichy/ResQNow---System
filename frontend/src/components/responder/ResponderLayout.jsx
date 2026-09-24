// src/components/responder/ResponderLayout.jsx

import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Home,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const navItems = [
  {
    to: '/responder/dashboard',
    icon: Home,
    label: 'Home',
    active: (pathname) => pathname.startsWith('/responder/dashboard'),
  },
  {
    to: '/responder/incidents',
    icon: MapPin,
    label: 'Track',
    active: (pathname) =>
      pathname.startsWith('/responder/incidents') ||
      pathname.startsWith('/responder/track'),
  },
  {
    to: '/responder/contacts',
    icon: Phone,
    label: 'Contacts',
    active: (pathname) => pathname.startsWith('/responder/contacts'),
  },
  {
    to: '/responder/safety-tips',
    icon: ShieldCheck,
    label: 'Safety',
    active: (pathname) => pathname.startsWith('/responder/safety-tips'),
  },
];

export default function ResponderLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const firstLetter = (user?.fullName || 'Responder')
    .charAt(0)
    .toUpperCase();

  const fullScreenMap = location.pathname === '/responder/incidents/map';

  return (
    <div className="min-h-screen responder-page pb-28 overflow-x-hidden">
      {!fullScreenMap && (
        <header className="bg-resqnow-violet border-b-4 border-b-bgy-yellow shadow-[0_3px_14px_rgba(7,55,99,0.16)]">
          <div className="max-w-lg mx-auto min-h-[84px] px-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/responder/dashboard')}
              className="min-h-[52px] flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
            >
              <div className="w-11 h-11 rounded-xl bg-bgy-yellow text-bgy-navy flex items-center justify-center border border-white/20 shadow-sm shrink-0">
                <Shield className="w-5 h-5" strokeWidth={2.4} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[18px] font-extrabold tracking-[-0.02em] text-white leading-tight">
                    ResQNow
                  </p>
                  <span className="inline-flex text-[8px] font-extrabold uppercase tracking-[0.12em] text-bgy-navy bg-bgy-yellow px-1.5 py-0.5 rounded-full">
                    Responder
                  </span>
                </div>
                <p className="text-[11px] font-medium text-white/80 mt-0.5">
                  Barangay Camunatan Response Operations
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/responder/updates')}
                aria-label="Updates and announcements"
                className={`relative w-11 h-11 rounded-xl border flex items-center justify-center text-white active:scale-95 transition-all ${
                  location.pathname.startsWith('/responder/updates')
                    ? 'bg-white/20 border-white/30'
                    : 'bg-white/10 border-white/20 hover:bg-white/15'
                }`}
              >
                <Bell className="w-[18px] h-[18px]" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/responder/settings')}
                aria-label="Responder profile and settings"
                className="w-11 h-11 rounded-full bg-bgy-yellow border-2 border-white text-bgy-navy flex items-center justify-center font-extrabold text-[13px] shadow-sm active:scale-95 transition-transform"
              >
                {firstLetter}
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={fullScreenMap ? 'relative z-20' : 'relative z-20 max-w-lg mx-auto'}>
        <div
          key={location.pathname}
          className={fullScreenMap ? '' : 'resqnow-page-transition'}
        >
          <Outlet />
        </div>
      </main>

      {!fullScreenMap && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 px-3 pointer-events-none"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <nav className="relative max-w-lg mx-auto h-[72px] bg-white/95 backdrop-blur-xl border border-resqnow-border-soft rounded-[22px] shadow-[0_8px_28px_rgba(7,55,99,0.14)] pointer-events-auto">
            <div className="relative z-10 grid grid-cols-4 items-center h-full px-1.5">
              {navItems.map((item) => (
                <ResponderNavItem
                  key={item.to}
                  {...item}
                  currentPath={location.pathname}
                />
              ))}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

function ResponderNavItem({ to, icon: Icon, label, active, currentPath }) {
  const selected = active(currentPath);

  return (
    <NavLink
      to={to}
      className="relative h-full flex items-center justify-center px-1 focus:outline-none"
      aria-current={selected ? 'page' : undefined}
    >
      <div
        className={`relative w-full max-w-[68px] min-h-[52px] rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
          selected
            ? 'text-resqnow-violet font-bold'
            : 'text-resqnow-muted hover:text-resqnow-primary'
        }`}
      >
        {selected && (
          <span className="absolute top-0 w-5 h-1 rounded-full bg-bgy-yellow" />
        )}
        <Icon className="w-5 h-5" strokeWidth={selected ? 2.5 : 2} />
        <span className="text-[10px] whitespace-nowrap">{label}</span>
      </div>
    </NavLink>
  );
}
