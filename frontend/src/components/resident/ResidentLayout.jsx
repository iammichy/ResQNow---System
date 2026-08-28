// src/components/resident/ResidentLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, MapPin, CirclePlus, Bell, Phone, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockAnnouncements, mockNotifications } from '../../data/mockData';

const unreadCount =
  mockNotifications.filter((n) => !n.isRead).length +
  mockAnnouncements.filter((a) => !a.isRead).length;

export default function ResidentLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = (user?.fullName || 'Resident').split(' ')[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">

      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16 max-w-lg mx-auto">

          {/* ResQNow Logo — shield icon so it reads as BRAND, not another letter */}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="w-9 h-9 bg-resqnow-red rounded-xl flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>

            <div>
              <p className="text-[15px] font-bold text-slate-900 leading-tight">
                ResQNow
              </p>
              <p className="text-[10px] text-slate-500">
                Barangay Camunatan
              </p>
            </div>
          </button>

          {/* Profile Shortcut — "J" avatar stays as the PERSON marker */}
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2.5 group"
          >
            <div className="text-right">
              <p className="text-[11px] text-slate-500">Hello,</p>
              <p className="text-[12px] font-semibold text-slate-800 max-w-[110px] truncate">
                {firstName}
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-[13px] shadow-sm group-hover:shadow-md transition-shadow">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </button>
        </div>
      </header>

      {/* ============ PAGE CONTENT ============ */}
      <main className="max-w-lg mx-auto">
        <Outlet />
      </main>

      {/* ============ BOTTOM NAVIGATION ============ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {/* 5 equal columns = mathematically dead-center REPORT button */}
        <div className="grid grid-cols-5 items-end max-w-lg mx-auto h-[70px] pb-2">

          <NavItem to="/dashboard" icon={Home} label="Home" />
          <NavItem to="/track" icon={MapPin} label="Track" />

          {/* CENTER REPORT CTA */}
          <div className="relative h-full flex flex-col items-center justify-end">
            <button
              type="button"
              onClick={() => navigate('/submit')}
              aria-label="Submit Report"
              className="absolute -top-6 w-[62px] h-[62px] rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white flex items-center justify-center shadow-[0_8px_24px_rgba(239,68,68,0.45)] border-4 border-white ring-2 ring-red-100 active:scale-95 transition-transform"
            >
              <CirclePlus className="w-8 h-8" />
            </button>

            <span className="text-[10px] font-bold text-resqnow-red mb-0.5">
              Report
            </span>
          </div>

          <NavItem to="/updates" icon={Bell} label="Updates" badge={unreadCount} />
          <NavItem to="/contacts" icon={Phone} label="Contacts" />
        </div>
      </nav>
    </div>
  );
}

// ============ NAV ITEM ============
function NavItem({ to, icon: Icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative h-full flex flex-col items-center justify-end gap-1 pb-0.5 min-w-0 transition-colors ${
          isActive ? 'text-resqnow-red' : 'text-slate-400 hover:text-slate-600'
        }`
      }
    >
      <div className="relative">
        <Icon className="w-5 h-5" />

        {badge > 0 && (
          <span className="absolute -top-2 -right-3 min-w-[17px] h-[17px] px-1 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>

      <span className="text-[9px] font-medium whitespace-nowrap">
        {label}
      </span>
    </NavLink>
  );
}
