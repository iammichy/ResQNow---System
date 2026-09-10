// src/components/resident/Dashboard.jsx
import { useNavigate } from 'react-router-dom';
import {
  Siren,
  ChevronRight,
  Bell,
  MapPin,
  Clock,
  Phone,
  Activity,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import {
  mockAllReports,
  mockAnnouncements,
  mockNotifications,
} from '../../data/mockData';

import { getDashboardUpdates } from '../../utils/updateUtils';
import { getStatusStyle } from '../../utils/statusUtils';
import { formatDate } from '../../utils/dateUtils';

// ============ HELPERS ============
// Returns a time-based greeting
function getGreeting() {
  const hour =
    new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 18) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

// ============ DASHBOARD ============
// Greeting, updates, reports, and safety reminder
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Resident first name
  const firstName = (
    user?.fullName ||
    'Resident'
  ).split(' ')[0];

  // ============ REPORT COUNTS ============
  const pendingCount =
    mockAllReports.filter(
      (report) =>
        report.status ===
        'Pending Verification'
    ).length;

  const resolvedCount =
    mockAllReports.filter(
      (report) =>
        report.status ===
        'Resolved'
    ).length;

  const activeCount =
    mockAllReports.filter(
      (report) =>
        ![
          'Pending Verification',
          'Resolved',
          'Invalid',
        ].includes(
          report.status
        )
    ).length;

  // ============ IMPORTANT UPDATES ============
  // Already removes expired items
  // and keeps only 2 items
  const dashboardUpdates =
    getDashboardUpdates(
      mockAnnouncements,
      mockNotifications
    );

  // ============ LATEST REPORT ============
  const latestReport =
    mockAllReports[0];

  // ============ CRITICAL ALERT ============
  // Only show a critical alert while active
  const activeCritical =
    mockAnnouncements.find(
      (announcement) => {
        if (
          announcement.priority !==
          'critical'
        ) {
          return false;
        }

        if (
          !announcement.expiresAt
        ) {
          return true;
        }

        return (
          new Date(
            announcement.expiresAt
          ) > new Date()
        );
      }
    );

  // ============ OPEN UPDATE ============
  // Report update → Report Detail
  // Announcement / alert → Specific Update Detail
  const handleUpdateClick = (
    update
  ) => {
    if (
      update.relatedReportId
    ) {
      navigate(
        `/track/${update.relatedReportId}`
      );

      return;
    }

    navigate(
      `/updates/${update.id}`
    );
  };

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">

      {/* ============ GREETING ============ */}
      <div className="flex items-center justify-between">

        <div>
          <p className="text-[13px] text-resqnow-muted">
            {getGreeting()},
          </p>

          <h1 className="text-[22px] font-extrabold text-resqnow-primary leading-tight mt-0.5">
            {firstName} 👋
          </h1>
        </div>

        {/* Emergency contacts shortcut */}
        <button
          type="button"
          aria-label="Emergency Contacts"
          onClick={() =>
            navigate('/contacts')
          }
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-resqnow-violet/10 text-resqnow-violet hover:bg-resqnow-violet/20 active:scale-95 transition-all"
        >
          <Phone className="w-5 h-5" />
        </button>
      </div>

      {/* ============ CRITICAL ALERT ============ */}
      {activeCritical && (
        <button
          type="button"
          onClick={() =>
            navigate(
              `/updates/${activeCritical.id}`
            )
          }
          className="w-full flex items-center gap-3 bg-resqnow-critical/10 border border-resqnow-critical/20 rounded-xl px-4 py-3 text-left active:scale-[0.99] transition-all"
        >
          <div className="w-9 h-9 rounded-lg bg-resqnow-critical/15 flex items-center justify-center shrink-0">
            <Siren className="w-5 h-5 text-resqnow-critical" />
          </div>

          <div className="flex-1 min-w-0">

            <p className="text-[10px] font-bold text-resqnow-critical uppercase tracking-wide">
              Critical Alert
            </p>

            <p className="text-[12px] font-semibold text-resqnow-crimson mt-0.5 truncate">
              {activeCritical.title}
            </p>
          </div>

          <ChevronRight className="w-4 h-4 text-resqnow-critical/50 shrink-0" />
        </button>
      )}

      {/* ============ IMPORTANT UPDATES ============ */}
      {dashboardUpdates.length > 0 && (
        <section className="bg-white rounded-2xl border border-resqnow-border-soft overflow-hidden">

          {/* Section header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-resqnow-border-soft">

            <div className="flex items-center gap-2">

              <Bell className="w-4 h-4 text-resqnow-violet" />

              <h2 className="text-[13px] font-bold text-resqnow-primary">
                Important Updates
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate('/updates')
              }
              className="text-[11px] font-semibold text-resqnow-violet flex items-center gap-1 active:scale-95 transition-transform"
            >
              View all

              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Updates */}
          <div className="divide-y divide-resqnow-border-soft">

            {dashboardUpdates.map(
              (update) => {
                const isCritical =
                  update.priority ===
                  'critical';

                const isReport =
                  update.updateCategory ===
                  'report';

                return (
                  <button
                    key={update.id}
                    type="button"
                    onClick={() =>
                      handleUpdateClick(
                        update
                      )
                    }
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                      isCritical
                        ? 'bg-resqnow-critical/5 hover:bg-resqnow-critical/10'
                        : 'hover:bg-resqnow-canvas'
                    }`}
                  >
                    {/* Semantic indicator */}
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isCritical
                          ? 'bg-resqnow-critical'
                          : isReport
                          ? 'bg-resqnow-violet'
                          : 'bg-resqnow-info'
                      }`}
                    />

                    <div className="flex-1 min-w-0">

                      {/* Update type */}
                      <div className="flex items-center gap-2">

                        <span
                          className={`text-[9px] font-bold uppercase tracking-wide ${
                            isCritical
                              ? 'text-resqnow-critical'
                              : isReport
                              ? 'text-resqnow-violet'
                              : 'text-resqnow-info'
                          }`}
                        >
                          {isCritical
                            ? 'Alert'
                            : isReport
                            ? 'Report Update'
                            : 'Announcement'}
                        </span>

                        {!update.isRead && (
                          <span className="w-1.5 h-1.5 bg-resqnow-critical rounded-full" />
                        )}
                      </div>

                      {/* Title */}
                      <p className="text-[12px] font-semibold text-resqnow-primary mt-0.5 truncate">
                        {update.title}
                      </p>

                      {/* Date */}
                      <p className="text-[10px] text-resqnow-muted mt-0.5">
                        {formatDate(
                          update.createdAt
                        )}
                      </p>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-resqnow-placeholder shrink-0" />
                  </button>
                );
              }
            )}
          </div>
        </section>
      )}

      {/* ============ MY REPORTS ============ */}
      <section>

        <div className="flex items-center justify-between mb-2">

          <h2 className="text-[13px] font-bold text-resqnow-primary">
            My Reports
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate('/track')
            }
            className="text-[11px] font-semibold text-resqnow-violet active:scale-95 transition-transform"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">

          <StatCard
            icon={Activity}
            value={activeCount}
            label="Active"
            color="violet"
            onClick={() =>
              navigate('/track')
            }
          />

          <StatCard
            icon={Clock}
            value={pendingCount}
            label="Pending"
            color="pending"
            onClick={() =>
              navigate('/track')
            }
          />

          <StatCard
            icon={CheckCircle2}
            value={resolvedCount}
            label="Resolved"
            color="safe"
            onClick={() =>
              navigate('/track')
            }
          />
        </div>
      </section>

      {/* ============ LATEST REPORT ============ */}
      {latestReport && (
        <section className="bg-white rounded-2xl border border-resqnow-border-soft overflow-hidden">

          <div className="h-1 bg-brand-gradient" />

          <div className="p-4">

            <div className="flex items-center justify-between mb-3">

              <h2 className="text-[13px] font-bold text-resqnow-primary">
                Latest Report
              </h2>

              <button
                type="button"
                onClick={() =>
                  navigate('/track')
                }
                className="text-[11px] font-semibold text-resqnow-violet flex items-center gap-1 active:scale-95 transition-transform"
              >
                View all

                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/track/${latestReport.id}`
                )
              }
              className="w-full text-left active:scale-[0.995] transition-transform"
            >
              {/* ID + report type */}
              <div className="flex items-center justify-between mb-2">

                <span className="text-[11px] font-bold text-resqnow-muted">
                  {latestReport.id}
                </span>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    latestReport.reportType ===
                    'Emergency'
                      ? 'bg-resqnow-critical/15 text-resqnow-critical'
                      : 'bg-resqnow-violet/15 text-resqnow-violet'
                  }`}
                >
                  {latestReport.reportType}
                </span>
              </div>

              {/* Concern */}
              <p className="text-sm font-semibold text-resqnow-primary">
                {latestReport.concernType}
              </p>

              {/* Location */}
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-resqnow-muted">

                <MapPin className="w-3.5 h-3.5 shrink-0" />

                <span className="line-clamp-1">
                  {latestReport.location}
                </span>
              </div>

              {/* Latest update */}
              {latestReport.latestUpdate && (
                <div className="mt-3 bg-resqnow-canvas rounded-xl px-3 py-2.5">

                  <p className="text-[9px] font-bold text-resqnow-muted uppercase tracking-wide">
                    Latest Update
                  </p>

                  <p className="text-[11px] text-resqnow-secondary mt-1 leading-relaxed line-clamp-2">
                    {latestReport.latestUpdate}
                  </p>
                </div>
              )}

              {/* Status */}
              <div className="mt-3 flex items-center justify-between gap-3">

                <span
                  className={`text-[9px] font-bold px-2 py-1 rounded-full ${getStatusStyle(
                    latestReport.status
                  )}`}
                >
                  {latestReport.status}
                </span>

                <span className="text-[10px] text-resqnow-muted flex items-center gap-1 shrink-0">

                  <Clock className="w-3 h-3" />

                  {latestReport.updatedAt}
                </span>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-1 mt-2">

                {latestReport.timeline.map(
                  (step) => (
                    <div
                      key={step.status}
                      title={step.status}
                      className={`h-1.5 flex-1 rounded-full ${
                        step.done
                          ? 'bg-resqnow-mint'
                          : 'bg-resqnow-border-soft'
                      }`}
                    />
                  )
                )}
              </div>
            </button>
          </div>
        </section>
      )}

      {/* ============ SAFETY INFORMATION ============ */}
      {/* Generic reminder instead of showing one specific guide */}
      <button
        type="button"
        onClick={() =>
          navigate('/safety-tips')
        }
        className="w-full flex items-center gap-3 bg-white border border-resqnow-info/20 rounded-2xl px-4 py-3.5 hover:border-resqnow-info/40 active:scale-[0.99] transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-resqnow-info/10 flex items-center justify-center shrink-0">

          <ShieldCheck className="w-5 h-5 text-resqnow-info" />
        </div>

        <div className="flex-1 text-left">

          <p className="text-[9px] font-bold text-resqnow-info uppercase tracking-wide">
            Safety & Preparedness
          </p>

          <p className="text-[13px] font-semibold text-resqnow-primary mt-0.5">
            Stay informed and prepared
          </p>

          <p className="text-[10px] text-resqnow-muted mt-1 leading-relaxed">
            Take time to read the safety tips for more information, awareness, and emergency preparedness.
          </p>
        </div>

        <ChevronRight className="w-4 h-4 text-resqnow-muted shrink-0" />
      </button>
    </div>
  );
}

// ============ STAT CARD ============
// Small report summary card
function StatCard({
  icon: Icon,
  value,
  label,
  color,
  onClick,
}) {
  const colorMap = {
    violet: {
      icon:
        'text-resqnow-violet',

      border:
        'border-resqnow-violet/20',

      hover:
        'hover:bg-resqnow-violet/5',
    },

    pending: {
      icon:
        'text-resqnow-pending',

      border:
        'border-resqnow-pending/20',

      hover:
        'hover:bg-resqnow-pending/5',
    },

    safe: {
      icon:
        'text-resqnow-safe',

      border:
        'border-resqnow-safe/20',

      hover:
        'hover:bg-resqnow-safe/5',
    },
  };

  const c =
    colorMap[color] ||
    colorMap.violet;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-white border ${c.border} rounded-2xl p-3 text-center ${c.hover} active:scale-[0.98] transition-all`}
    >
      <Icon
        className={`w-5 h-5 mx-auto ${c.icon}`}
      />

      <p className="text-lg font-bold text-resqnow-primary mt-1">
        {value}
      </p>

      <p className="text-[10px] text-resqnow-muted">
        {label}
      </p>
    </button>
  );
}