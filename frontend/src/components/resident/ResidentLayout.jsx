// src/components/resident/ResidentLayout.jsx
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, MapPin, CirclePlus, Bell, Phone, Shield, ShieldCheck } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { mockAnnouncements, mockNotifications } from '../../data/mockData';

// ============ UNREAD COUNT ============
// Count unread notifications and announcements
const unreadCount =
  mockNotifications.filter((item) => !item.isRead).length +
  mockAnnouncements.filter((item) => !item.isRead).length;

// ============ RESIDENT LAYOUT ============
// Main layout used by all resident pages
export default function ResidentLayout() {
  // Get the logged-in resident
  const { user } = useAuth();

  // Used for changing pages
  const navigate = useNavigate();

  // Get the current page
  const location = useLocation();

  // Get first letter for the profile avatar
  const firstLetter = (user?.fullName || 'Resident').charAt(0).toUpperCase();

  // Check if user is inside any report page
  const reportActive = location.pathname.startsWith('/submit');

  // ============ ACTIVE NAV TAB ============
  // Get position of the selected bottom tab
  const getActiveTab = () => {
    if (location.pathname.startsWith('/dashboard')) return 0;
    if (location.pathname.startsWith('/track')) return 1;
    if (location.pathname.startsWith('/submit')) return 2;
    if (location.pathname.startsWith('/safety-tips')) return 3;
    if (location.pathname.startsWith('/contacts')) return 4;

    return null;
  };

  // Current bottom tab position
  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen resqnow-page pb-28">

      {/* ============ BRAND HEADER ============ */}
      {/* Main ResQNow header with gradient and grid pattern */}
      <header className="relative h-[132px] bg-brand-gradient overflow-hidden">

        {/* ============ HEADER GRID ============ */}
        {/* Small grid lines for a simple background pattern */}
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

        {/* ============ HEADER CONTENT ============ */}
        <div className="relative z-20 max-w-lg mx-auto px-4 pt-4 flex items-center justify-between">

          {/* ResQNow brand */}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 text-left active:scale-[0.98] transition-transform"
          >
            {/* Brand shield */}
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-sm backdrop-blur-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>

            {/* Brand name */}
            <div>
              <p className="text-[17px] font-bold text-white leading-tight">
                ResQNow
              </p>

              <p className="text-[9px] text-white/75 mt-0.5">
                Barangay Camunatan
              </p>
            </div>
          </button>

          {/* Notification and profile */}
          <div className="flex items-center gap-2.5">

            {/* ============ NOTIFICATION BELL ============ */}
            {/* Opens Updates page */}
            <button
              type="button"
              onClick={() => navigate('/updates')}
              aria-label="Updates"
              className="relative w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm hover:bg-white/25 active:scale-90 transition-all"
            >
              <Bell className="w-4 h-4" />

              {/* Unread badge */}
              {/* Pops once when the unread number changes */}
              {unreadCount > 0 && (
            <span
              key={unreadCount}
              className="resqnow-badge-pop absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 bg-resqnow-critical text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-[0_2px_6px_rgba(255,45,85,0.30)]"
            >
                {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            )}
            </button>

            {/* ============ PROFILE ============ */}
            {/* Opens Profile and Settings */}
            <button
              type="button"
              onClick={() => navigate('/settings')}
              aria-label="Profile and Settings"
              className="group active:scale-95 transition-transform"
            >
              {/* Resident avatar */}
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-resqnow-mint to-resqnow-violet border-2 border-white flex items-center justify-center text-white font-bold text-[13px] shadow-sm group-hover:scale-[1.03] transition-transform">
                {firstLetter}
              </div>
            </button>
          </div>
        </div>

        {/* ============ FOLDER SHAPE ============ */}
        {/* Shallow folder shape below the header */}
        <svg
          className="absolute bottom-[-1px] left-0 w-full h-[54px] z-10"
          viewBox="0 0 500 60"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="
              M0,34
              C8,18 25,12 50,12
              H160
              C184,12 198,16 217,28
              L250,47
              C265,55 282,57 307,57
              H500
              V60
              H0
              Z
            "
            fill="#F8FAFC"
          />
        </svg>
      </header>

    {/* ============ PAGE CONTENT ============ */}
    {/* Current resident page appears here with a small transition */}
    <main className="relative z-20 max-w-lg mx-auto -mt-px">
    <div
      key={location.pathname}
      className="resqnow-page-transition"
    >
      <Outlet />
    </div>
  </main>

      {/* ============ BOTTOM NAVIGATION ============ */}
      {/* Floating navigation with safe space for phone gesture bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 px-3 pointer-events-none"
        style={{
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}
      >
        <nav className="relative max-w-lg mx-auto h-[72px] bg-white/95 backdrop-blur-xl border border-resqnow-border-soft rounded-[24px] shadow-[0_8px_30px_rgba(31,29,71,0.12)] pointer-events-auto">

          {/* ============ SLIDING ACTIVE PILL ============ */}
          {/* Violet pill moves smoothly between normal tabs */}
          {activeTab !== null && !reportActive && (
            <div className="absolute left-1.5 right-1.5 top-[12px] h-[48px] pointer-events-none z-0">

              <div
                className="w-1/5 h-full flex justify-center transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(${activeTab * 100}%)`,
                }}
              >
                {/* Active tab background */}
                <div className="w-[58px] h-[48px] rounded-[16px] bg-resqnow-violet/10 shadow-[0_4px_14px_rgba(131,70,242,0.10)]" />
              </div>
            </div>
          )}

          {/* 5 navigation items */}
          <div className="relative z-10 grid grid-cols-5 items-center h-full px-1.5">

            {/* Home */}
            <NavItem
              to="/dashboard"
              icon={Home}
              label="Home"
            />

            {/* Track */}
            <NavItem
              to="/track"
              icon={MapPin}
              label="Track"
            />

            {/* ============ REPORT BUTTON ============ */}
            {/* Main Report action stays emphasized in the center */}
            <div className="relative h-full flex flex-col items-center justify-end">

              {/* Large circular Report button */}
              <button
                type="button"
                onClick={() => navigate('/submit')}
                aria-label="Submit Report"
                className={`absolute -top-6 w-[64px] h-[64px] rounded-full bg-report-gradient text-white flex items-center justify-center border-4 border-white ring-2 ring-resqnow-coral/20 transition-all duration-300 ease-out active:scale-90 ${
                  reportActive
                    ? '-translate-y-1 scale-[1.06] shadow-[0_10px_28px_rgba(255,90,54,0.42)]'
                    : 'shadow-[0_8px_22px_rgba(255,90,54,0.32)] hover:-translate-y-1 hover:scale-[1.03]'
                }`}
              >
                {/* Plus icon */}
                <CirclePlus
                  className={`w-8 h-8 transition-all duration-300 ${
                    reportActive
                      ? 'rotate-90 scale-110'
                      : ''
                  }`}
                />
              </button>

              {/* Report label */}
              <span
                className={`text-[10px] font-bold mb-1 transition-all duration-300 ${
                  reportActive
                    ? 'text-resqnow-coral -translate-y-0.5'
                    : 'text-resqnow-coral'
                }`}
              >
                Report
              </span>
            </div>

            {/* Safety */}
            <NavItem
              to="/safety-tips"
              icon={ShieldCheck}
              label="Safety"
            />

            {/* Contacts */}
            <NavItem
              to="/contacts"
              icon={Phone}
              label="Contacts"
            />
          </div>
        </nav>
      </div>
    </div>
  );
}

// ============ NAV ITEM ============
// Reusable button for normal bottom navigation tabs
function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className="relative h-full flex items-center justify-center px-1 focus:outline-none"
    >
      {({ isActive }) => (
        <div
          className={`relative z-10 w-full max-w-[58px] h-[48px] rounded-[16px] flex flex-col items-center justify-center gap-0.5 transition-all duration-300 ease-out active:scale-95 ${
            isActive
              ? 'text-resqnow-violet -translate-y-0.5'
              : 'text-resqnow-muted hover:text-resqnow-primary'
          }`}
        >
          {/* Navigation icon */}
          <Icon
            className={`w-5 h-5 transition-all duration-300 ${
              isActive
                ? '-translate-y-0.5 scale-110'
                : ''
            }`}
          />

          {/* Navigation label */}
          <span
            className={`text-[9px] whitespace-nowrap transition-all duration-300 ${
              isActive
                ? 'font-bold -translate-y-0.5'
                : 'font-medium'
            }`}
          >
            {label}
          </span>
        </div>
      )}
    </NavLink>
  );
}