// src/components/resident/ResidentLayout.jsx

import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  CirclePlus,
  Home,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { getNotifications } from '../../services/notificationService';

// ============ RESIDENT LAYOUT ============
// Stable app shell for all resident routes. The layout deliberately keeps
// the existing routes and navigation behavior while using a more official
// barangay visual identity.
export default function ResidentLayout() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const result = await getNotifications();
      setUnreadCount(result.unreadCount || 0);
    } catch {
      // Preserve the last confirmed count on temporary failures.
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshUnreadCount();
      }
    }, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshUnreadCount();
      }
    };

    const handleNotificationsChanged = () => {
      refreshUnreadCount();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener(
      'resqnow:notifications-changed',
      handleNotificationsChanged
    );

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener(
        'resqnow:notifications-changed',
        handleNotificationsChanged
      );
    };
  }, [refreshUnreadCount]);

  const firstLetter = (user?.fullName || t('common.resident'))
    .charAt(0)
    .toUpperCase();

  const reportActive = location.pathname.startsWith('/submit');

  return (
    <div className="min-h-screen resqnow-page pb-28 overflow-x-hidden">
      {/* ============ OFFICIAL BARANGAY HEADER ============ */}
      <header className="bg-resqnow-violet border-b-4 border-b-bgy-yellow shadow-[0_3px_14px_rgba(7,55,99,0.16)]">
        <div className="max-w-lg mx-auto min-h-[84px] px-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
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
                  Resident
                </span>
              </div>

              <p className="text-[11px] font-medium text-white/80 mt-0.5">
                Barangay Camunatan Emergency Response
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/updates')}
              aria-label={t('nav.updates')}
              className="relative w-11 h-11 rounded-xl border border-white/20 bg-white/10 text-white flex items-center justify-center hover:bg-white/15 active:scale-95 transition-all"
            >
              <Bell className="w-[18px] h-[18px]" />

              {unreadCount > 0 && (
                <span
                  key={unreadCount}
                  className="resqnow-badge-pop absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-resqnow-critical text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-resqnow-violet"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/settings')}
              aria-label={t('nav.profileSettings')}
              className="w-11 h-11 rounded-full bg-bgy-yellow border-2 border-white text-bgy-navy flex items-center justify-center font-extrabold text-[13px] shadow-sm active:scale-95 transition-transform"
            >
              {firstLetter}
            </button>
          </div>
        </div>
      </header>

      {/* ============ PAGE CONTENT ============ */}
      <main className="relative max-w-lg mx-auto">
        <div key={location.pathname} className="resqnow-page-transition">
          <Outlet />
        </div>
      </main>

      {/* ============ BOTTOM NAVIGATION ============ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 px-3 pointer-events-none"
        style={{
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}
      >
        <nav className="relative max-w-lg mx-auto h-[72px] bg-white/95 backdrop-blur-xl border border-resqnow-border-soft rounded-[22px] shadow-[0_8px_28px_rgba(7,55,99,0.14)] pointer-events-auto">
          <div className="relative z-10 grid grid-cols-5 items-center h-full px-1.5">
            <NavItem to="/dashboard" icon={Home} label={t('nav.home')} />
            <NavItem to="/track" icon={MapPin} label={t('nav.track')} />

            {/* Generic report entry remains available for both report types.
                The Home screen now carries the dedicated emergency CTA. */}
            <div className="relative h-full flex flex-col items-center justify-end">
              <button
                type="button"
                onClick={() => navigate('/submit')}
                aria-label={t('nav.submitReport')}
                className={`absolute -top-5 w-[60px] h-[60px] rounded-full bg-resqnow-violet text-white flex items-center justify-center border-[4px] border-white ring-2 ring-bgy-yellow transition-all duration-200 active:scale-90 ${
                  reportActive
                    ? 'shadow-[0_9px_24px_rgba(11,79,156,0.32)] -translate-y-0.5'
                    : 'shadow-[0_7px_20px_rgba(11,79,156,0.24)]'
                }`}
              >
                <CirclePlus className="w-7 h-7" />
              </button>

              <span className="text-[10px] font-bold text-resqnow-violet mb-1">
                {t('nav.report')}
              </span>
            </div>

            <NavItem
              to="/safety-tips"
              icon={ShieldCheck}
              label={t('nav.safety')}
            />
            <NavItem to="/contacts" icon={Phone} label={t('nav.contacts')} />
          </div>
        </nav>
      </div>
    </div>
  );
}

// ============ NAV ITEM ============
function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className="relative h-full flex items-center justify-center px-1 focus:outline-none"
    >
      {({ isActive }) => (
        <div
          className={`relative w-full max-w-[60px] min-h-[52px] rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
            isActive
              ? 'text-resqnow-violet font-bold'
              : 'text-resqnow-muted hover:text-resqnow-primary'
          }`}
        >
          {isActive && (
            <span className="absolute top-0 w-5 h-1 rounded-full bg-bgy-yellow" />
          )}

          <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />

          <span className="text-[10px] whitespace-nowrap">
            {label}
          </span>
        </div>
      )}
    </NavLink>
  );
}
