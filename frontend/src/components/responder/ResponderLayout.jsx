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

  const activeIndex = navItems.findIndex((item) => item.active(location.pathname));
  const fullScreenMap = location.pathname === '/responder/incidents/map';

  return (
    <div className="min-h-screen resqnow-page pb-28 overflow-x-hidden">
      {!fullScreenMap && (
        <>
          <header className="relative h-[132px] bg-brand-gradient overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.10]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            />

            <div className="relative z-20 max-w-lg mx-auto px-4 pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/responder/dashboard')}
                className="flex items-center gap-2.5 text-left active:scale-[0.98] transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-sm backdrop-blur-sm">
                  <Shield className="w-5 h-5 text-white" />
                </div>

                <div>
                  <p className="text-[17px] font-bold text-white leading-tight">
                    ResQNow
                  </p>
                  <p className="text-[9px] text-white/75 mt-0.5">
                    Barangay Camunatan · Responder
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/responder/updates')}
                  aria-label="Updates and announcements"
                  className={`relative w-9 h-9 rounded-xl border flex items-center justify-center text-white backdrop-blur-sm active:scale-90 transition-all ${
                    location.pathname.startsWith('/responder/updates')
                      ? 'bg-white/30 border-white/35'
                      : 'bg-white/15 border-white/20 hover:bg-white/25'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/responder/settings')}
                  aria-label="Responder profile and settings"
                  className="group active:scale-95 transition-transform"
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-[13px] shadow-sm group-hover:scale-[1.03] transition-transform ${
                      location.pathname.startsWith('/responder/settings')
                        ? 'bg-white/30'
                        : 'bg-linear-to-br from-resqnow-mint to-resqnow-violet'
                    }`}
                  >
                    {firstLetter}
                  </div>
                </button>
              </div>
            </div>

            <svg
              className="absolute bottom-0 left-0 w-full h-[55px] z-10 block"
              viewBox="0 0 500 60"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0,34 C8,18 25,12 50,12 H160 C184,12 198,16 217,28 L250,47 C265,55 282,57 307,57 H500 V60 H0 Z"
                fill="var(--warm-ivory)"
              />
              <rect x="0" y="58" width="500" height="2" fill="var(--warm-ivory)" />
            </svg>

            <div
              className="absolute bottom-0 left-0 right-0 h-[2px] z-[11]"
              style={{ background: 'var(--warm-ivory)' }}
            />
          </header>

          <div
            className="relative z-30 h-[2px] -mt-px"
            style={{ background: 'var(--warm-ivory)' }}
          />
        </>
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
          <nav className="relative max-w-lg mx-auto h-[72px] bg-white/95 backdrop-blur-xl border border-resqnow-border-soft rounded-[24px] shadow-[0_8px_30px_rgba(31,29,71,0.12)] pointer-events-auto">
            {activeIndex >= 0 && (
              <div className="absolute left-1.5 right-1.5 top-[12px] h-[48px] pointer-events-none z-0">
                <div
                  className="w-1/4 h-full flex justify-center transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(${activeIndex * 100}%)` }}
                >
                  <div className="w-[68px] h-[48px] rounded-[16px] bg-resqnow-violet/10 shadow-[0_4px_14px_rgba(131,70,242,0.10)]" />
                </div>
              </div>
            )}

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
        className={`relative z-10 w-full max-w-[68px] h-[48px] rounded-[16px] flex flex-col items-center justify-center gap-0.5 transition-all duration-300 ease-out active:scale-95 ${
          selected
            ? 'text-resqnow-violet -translate-y-0.5'
            : 'text-resqnow-muted hover:text-resqnow-primary'
        }`}
      >
        <Icon
          className={`w-5 h-5 transition-all duration-300 ${
            selected ? '-translate-y-0.5 scale-110' : ''
          }`}
        />
        <span
          className={`text-[9px] whitespace-nowrap transition-all duration-300 ${
            selected ? 'font-bold -translate-y-0.5' : 'font-medium'
          }`}
        >
          {label}
        </span>
      </div>
    </NavLink>
  );
}
