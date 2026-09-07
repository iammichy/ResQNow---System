// src/components/resident/ResidentLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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

  // Get first letter for the profile avatar
  const firstLetter = (user?.fullName || 'Resident').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen resqnow-page pb-24">

      {/* ============ BRAND HEADER ============ */}
      {/* Main ResQNow header */}
      <header className="relative h-[132px] bg-brand-gradient overflow-hidden">

{/* ============ HEADER GRID ============ */}
{/* Small grid lines for a simple background pattern */}
<div
  className="absolute inset-0 opacity-[0.12]"
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
            className="flex items-center gap-2.5 text-left"
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
              className="relative w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm hover:bg-white/25 active:scale-95 transition-all"
            >
              <Bell className="w-4 h-4" />

              {/* Unread badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 bg-resqnow-critical text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white">
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
              className="group"
            >
              {/* Resident avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-resqnow-mint to-resqnow-violet border-2 border-white flex items-center justify-center text-white font-bold text-[13px] shadow-sm group-hover:scale-[1.03] transition-transform">
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
      {/* Current resident page appears here */}
      <main className="relative z-20 max-w-lg mx-auto -mt-px">
        <Outlet />
      </main>

      {/* ============ BOTTOM NAVIGATION ============ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">

        {/* Brand line on top */}
        <div className="h-[2px] bg-brand-gradient" />

        {/* 5 columns keep Report in the center */}
        <div className="grid grid-cols-5 items-end max-w-lg mx-auto h-[70px] pb-2">

          {/* Home */}
          <NavItem
            to="/dashboard"
            icon={Home}
            label="Home"
          />

          {/* Track reports */}
          <NavItem
            to="/track"
            icon={MapPin}
            label="Track"
          />

          {/* ============ REPORT BUTTON ============ */}
          <div className="relative h-full flex flex-col items-center justify-end">

            {/* Main Report button */}
            <button
              type="button"
              onClick={() => navigate('/submit')}
              aria-label="Submit Report"
              className="absolute -top-7 w-[64px] h-[64px] rounded-full bg-report-gradient text-white flex items-center justify-center shadow-[0_8px_24px_rgba(255,90,54,0.38)] border-4 border-white ring-2 ring-orange-100 active:scale-95 transition-transform"
            >
              <CirclePlus className="w-8 h-8" />
            </button>

            {/* Report label */}
            <span className="text-[10px] font-bold text-resqnow-coral mb-0.5">
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
  );
}

// ============ NAV ITEM ============
// Reusable button for bottom navigation
function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}

      // Change color when the page is active
      className={({ isActive }) =>
        `relative h-full flex flex-col items-center justify-end gap-1 pb-0.5 min-w-0 transition-colors ${
          isActive
            ? 'text-resqnow-mint'
            : 'text-resqnow-muted hover:text-resqnow-primary'
        }`
      }
    >
      {/* Navigation icon */}
      <Icon className="w-5 h-5" />

      {/* Navigation label */}
      <span className="text-[9px] font-medium whitespace-nowrap">
        {label}
      </span>
    </NavLink>
  );
}