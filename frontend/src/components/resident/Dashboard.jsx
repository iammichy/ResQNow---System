// src/components/resident/Dashboard.jsx

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Activity,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

import {
  useAuth,
} from '../../context/AuthContext';

import {
  getReports,
} from '../../services/reportService';

import {
  getStatusStyle,
} from '../../utils/statusUtils';

// ============ HELPERS ============

// Time-based greeting
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
//
// IMPORTANT:
//
// Reports on this page come from the same
// Laravel API used by Track Reports.
//
// No report IDs, counts, statuses, or latest
// report information are generated locally.
export default function Dashboard() {
  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();

  // ============ REPORT STATE ============

  const [
    reports,
    setReports,
  ] = useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    reportError,
    setReportError,
  ] = useState('');

  const [
    lastChecked,
    setLastChecked,
  ] = useState(null);

  // ============ RESIDENT NAME ============

  const firstName = (
    user?.fullName ||
    user?.name ||
    'Resident'
  )
    .trim()
    .split(/\s+/)[0];

  // ============ LOAD REPORTS ============

  const loadReports =
    useCallback(
      async ({
        refresh = false,
      } = {}) => {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setReportError('');

        try {
          const result =
            await getReports();

          setReports(
            Array.isArray(result)
              ? result
              : []
          );

          setLastChecked(
            new Date()
          );
        } catch (error) {
          /**
           * Keep previously loaded reports
           * when a refresh fails.
           *
           * A temporary connection problem
           * should not erase information the
           * resident was already viewing.
           */
          setReportError(
            error?.message ||
              'Unable to load your reports.'
          );
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // ============ REPORT COUNTS ============

  /**
   * OPEN REPORT
   *
   * Any report that has not reached a terminal
   * status is considered open.
   *
   * Pending Verification is therefore included
   * in Open, while the Pending card shows the
   * subset still awaiting barangay verification.
   */
  const openCount =
    useMemo(
      () =>
        reports.filter(
          (report) =>
            ![
              'Resolved',
              'Invalid',
            ].includes(
              report.status
            )
        ).length,
      [reports]
    );

  const pendingCount =
    useMemo(
      () =>
        reports.filter(
          (report) =>
            report.status ===
            'Pending Verification'
        ).length,
      [reports]
    );

  const resolvedCount =
    useMemo(
      () =>
        reports.filter(
          (report) =>
            report.status ===
            'Resolved'
        ).length,
      [reports]
    );

  // ============ LATEST REPORT ============

  /**
   * Laravel's /api/reports endpoint already
   * returns the resident's reports newest first.
   *
   * Therefore the first record is the real
   * latest report.
   */
  const latestReport =
    reports[0] || null;

  // ============ LAST CHECKED TEXT ============

  const lastCheckedText =
  lastChecked
    ? lastChecked.toLocaleTimeString(
        'en-PH',
        {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
        }
      )
    : '';

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
          aria-label="Open emergency contacts"
          onClick={() =>
            navigate('/contacts')
          }
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-resqnow-violet/10 text-resqnow-violet hover:bg-resqnow-violet/20 active:scale-95 transition-all"
        >
          <Phone className="w-5 h-5" />
        </button>
      </div>

      {/* ============ IMPORTANT UPDATES ============ */}
      {/*
        Real announcement/notification publishing
        is not connected yet.

        Do not show mock flood alerts or fake unread
        report notifications as operational data.
      */}
      <section className="bg-white rounded-2xl border border-resqnow-border-soft overflow-hidden">

        <div className="px-4 py-3 flex items-center gap-2 border-b border-resqnow-border-soft">

          <Bell className="w-4 h-4 text-resqnow-violet" />

          <h2 className="text-[14px] font-bold text-resqnow-primary">
            Important Updates
          </h2>
        </div>

        <div className="px-4 py-4 flex items-start gap-3">

          <div className="w-9 h-9 rounded-xl bg-resqnow-violet/10 flex items-center justify-center shrink-0">

            <Bell className="w-4 h-4 text-resqnow-violet" />
          </div>

          <div>

            <p className="text-[13px] font-semibold text-resqnow-primary">
              No current barangay advisories
            </p>

            <p className="text-[12px] text-resqnow-muted mt-1 leading-relaxed">
              Published barangay advisories and report notifications will appear here once available.
            </p>
          </div>
        </div>
      </section>

      {/* ============ REPORT API ERROR ============ */}
      {reportError && (
        <div
          role="alert"
          className="bg-resqnow-critical/10 border border-resqnow-critical/20 rounded-xl px-4 py-3"
        >
          <div className="flex items-start gap-2.5">

            <AlertCircle className="w-4 h-4 text-resqnow-critical shrink-0 mt-0.5" />

            <div className="flex-1">

              <p className="text-[12px] font-semibold text-resqnow-crimson">
                Could not refresh your reports
              </p>

              <p className="text-[12px] text-resqnow-secondary mt-1 leading-relaxed">
                {reportError}
              </p>

              {reports.length >
                0 && (
                <p className="text-[11px] text-resqnow-muted mt-1">
                  Showing the last successfully loaded information.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              loadReports({
                refresh: true,
              })
            }
            disabled={
              isRefreshing
            }
            className="mt-3 min-h-[40px] px-3 py-2 rounded-lg border border-resqnow-critical/20 bg-white text-resqnow-crimson text-[12px] font-semibold flex items-center gap-2 disabled:opacity-60"
          >
            {isRefreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}

            Try Again
          </button>
        </div>
      )}

      {/* ============ MY REPORTS ============ */}
      <section>

        <div className="flex items-center justify-between gap-3 mb-2">

          <div>

            <h2 className="text-[14px] font-bold text-resqnow-primary">
              My Reports
            </h2>

            <p className="text-[11px] text-resqnow-muted mt-0.5">
              {isRefreshing
                ? 'Refreshing reports...'
                : lastCheckedText
                ? `Last checked ${lastCheckedText}`
                : 'Checking reports...'}
            </p>
          </div>

          <div className="flex items-center gap-1">

            <button
              type="button"
              aria-label="Refresh reports"
              onClick={() =>
                loadReports({
                  refresh: true,
                })
              }
              disabled={
                isRefreshing
              }
              className="w-9 h-9 rounded-lg flex items-center justify-center text-resqnow-violet hover:bg-resqnow-violet/10 disabled:opacity-50 transition-colors"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/track')
              }
              className="min-h-[40px] px-2 text-[12px] font-semibold text-resqnow-violet active:scale-95 transition-transform"
            >
              View all
            </button>
          </div>
        </div>

        {/* INITIAL LOADING */}
        {isLoading &&
        reports.length === 0 ? (
          <div className="bg-white border border-resqnow-border-soft rounded-2xl p-5 flex items-center justify-center gap-2">

            <Loader2 className="w-4 h-4 text-resqnow-violet animate-spin" />

            <p className="text-[12px] text-resqnow-muted">
              Loading your reports...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">

            <StatCard
              icon={Activity}
              value={
                openCount
              }
              label="Open"
              color="violet"
              onClick={() =>
                navigate(
                  '/track'
                )
              }
            />

            <StatCard
              icon={Clock}
              value={
                pendingCount
              }
              label="Pending"
              color="pending"
              onClick={() =>
                navigate(
                  '/track'
                )
              }
            />

            <StatCard
              icon={
                CheckCircle2
              }
              value={
                resolvedCount
              }
              label="Resolved"
              color="safe"
              onClick={() =>
                navigate(
                  '/track'
                )
              }
            />
          </div>
        )}
      </section>

      {/* ============ LATEST REPORT ============ */}
      {!isLoading &&
      latestReport && (
        <section className="bg-white rounded-2xl border border-resqnow-border-soft overflow-hidden">

          <div className="h-1 bg-brand-gradient" />

          <div className="p-4">

            <div className="mb-3">

              <h2 className="text-[14px] font-bold text-resqnow-primary">
                Latest Report
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/track/${encodeURIComponent(
                    latestReport.id
                  )}`
                )
              }
              className="w-full text-left active:scale-[0.995] transition-transform"
            >

              {/* ID + TYPE */}
              <div className="flex items-center justify-between gap-3 mb-2">

                <span className="text-[12px] font-bold text-resqnow-muted">
                  {
                    latestReport.id
                  }
                </span>

                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    latestReport.reportType ===
                    'Emergency'
                      ? 'bg-resqnow-critical/15 text-resqnow-critical'
                      : 'bg-resqnow-violet/15 text-resqnow-violet'
                  }`}
                >
                  {
                    latestReport.reportType
                  }
                </span>
              </div>

              {/* CONCERN */}
              <p className="text-[15px] font-semibold text-resqnow-primary">
                {
                  latestReport.concernType
                }
              </p>

              {/* LOCATION */}
              {latestReport.location && (
                <div className="flex items-start gap-1.5 mt-1.5 text-[12px] text-resqnow-muted">

                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />

                  <span className="line-clamp-2">
                    {
                      latestReport.location
                    }
                  </span>
                </div>
              )}

              {/* LATEST UPDATE */}
              {latestReport.latestUpdate && (
                <div className="mt-3 bg-resqnow-canvas rounded-xl px-3 py-2.5">

                  <p className="text-[10px] font-bold text-resqnow-muted uppercase tracking-wide">
                    Latest Update
                  </p>

                  <p className="text-[12px] text-resqnow-secondary mt-1 leading-relaxed line-clamp-2">
                    {
                      latestReport.latestUpdate
                    }
                  </p>
                </div>
              )}

              {/* STATUS + UPDATED */}
              <div className="mt-3 flex items-center justify-between gap-3">

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatusStyle(
                    latestReport.status
                  )}`}
                >
                  {
                    latestReport.status
                  }
                </span>

                {latestReport.updatedAt && (
                  <span className="text-[11px] text-resqnow-muted flex items-center gap-1 shrink-0">

                    <Clock className="w-3 h-3" />

                    {
                      latestReport.updatedAt
                    }
                  </span>
                )}
              </div>

              {/* PROGRESS */}
              {Array.isArray(
                latestReport.timeline
              ) &&
                latestReport.timeline
                  .length >
                  0 && (
                  <div className="flex items-center gap-1 mt-3">

                    {latestReport.timeline.map(
                      (
                        step,
                        index
                      ) => (
                        <div
                          key={`${step.status}-${index}`}
                          title={
                            step.status
                          }
                          className={`h-1.5 flex-1 rounded-full ${
                            step.done
                              ? 'bg-resqnow-violet'
                              : 'bg-resqnow-border-soft'
                          }`}
                        />
                      )
                    )}
                  </div>
                )}
            </button>
          </div>
        </section>
      )}

      {/* ============ NO REPORTS ============ */}
      {!isLoading &&
        !latestReport &&
        !reportError && (
          <section className="bg-white rounded-2xl border border-resqnow-border-soft p-5 text-center">

            <div className="w-11 h-11 rounded-full bg-resqnow-violet/10 flex items-center justify-center mx-auto">

              <Activity className="w-5 h-5 text-resqnow-violet" />
            </div>

            <h2 className="text-[14px] font-bold text-resqnow-primary mt-3">
              No reports yet
            </h2>

            <p className="text-[12px] text-resqnow-muted mt-1 leading-relaxed">
              Reports you submit will appear here and in Track Reports.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate('/submit')
              }
              className="mt-4 min-h-[44px] px-4 py-2.5 rounded-xl bg-brand-gradient text-white text-[13px] font-semibold"
            >
              Submit a Report
            </button>
          </section>
        )}

      {/* ============ SAFETY INFORMATION ============ */}
      <button
        type="button"
        onClick={() =>
          navigate(
            '/safety-tips'
          )
        }
        className="w-full flex items-center gap-3 bg-white border border-resqnow-info/20 rounded-2xl px-4 py-3.5 hover:border-resqnow-info/40 active:scale-[0.99] transition-all"
      >

        <div className="w-10 h-10 rounded-xl bg-resqnow-info/10 flex items-center justify-center shrink-0">

          <ShieldCheck className="w-5 h-5 text-resqnow-info" />
        </div>

        <div className="flex-1 text-left">

          <p className="text-[11px] font-bold text-resqnow-secondary uppercase tracking-wide">
            Safety & Preparedness
          </p>

          <p className="text-[14px] font-semibold text-resqnow-primary mt-0.5">
            Stay informed and prepared
          </p>

          <p className="text-[12px] text-resqnow-muted mt-1 leading-relaxed">
            Read practical safety information and emergency preparedness guidance.
          </p>
        </div>

        <ChevronRight className="w-4 h-4 text-resqnow-muted shrink-0" />
      </button>
    </div>
  );
}

// ============ STAT CARD ============

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

  const selectedColor =
    colorMap[color] ||
    colorMap.violet;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-white border ${selectedColor.border} rounded-2xl p-3 text-center ${selectedColor.hover} active:scale-[0.98] transition-all`}
    >
      <Icon
        className={`w-5 h-5 mx-auto ${selectedColor.icon}`}
      />

      <p className="text-lg font-bold text-resqnow-primary mt-1">
        {value}
      </p>

      <p className="text-[11px] text-resqnow-muted mt-0.5">
        {label}
      </p>
    </button>
  );
}