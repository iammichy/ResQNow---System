// src/components/resident/Dashboard.jsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Siren,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { getReports } from '../../services/reportService';
import { getStatusStyle } from '../../utils/statusUtils';
import { getBarangayHotline } from '../../utils/contactUtils';

const TERMINAL_STATUSES = ['Resolved', 'Invalid'];

const HOTLINE = getBarangayHotline();

// ============ DASHBOARD ============
export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportError, setReportError] = useState('');
  const [lastChecked, setLastChecked] = useState(null);

  const firstName = (user?.fullName || user?.name || 'Resident')
    .trim()
    .split(/\s+/)[0];

  const loadReports = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setReportError('');

    try {
      const result = await getReports();
      setReports(Array.isArray(result) ? result : []);
      setLastChecked(new Date());
    } catch (error) {
      setReportError(error?.message || 'Unable to load your reports.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const openReports = useMemo(
    () => reports.filter((report) => !TERMINAL_STATUSES.includes(report.status)),
    [reports]
  );

  const activeReport = openReports[0] || null;
  const latestReport = reports[0] || null;

  const pendingCount = useMemo(
    () => reports.filter((report) => report.status === 'Pending Verification').length,
    [reports]
  );

  const resolvedCount = useMemo(
    () => reports.filter((report) => report.status === 'Resolved').length,
    [reports]
  );

  const lastCheckedText = lastChecked
    ? lastChecked.toLocaleTimeString('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      {/* ============ RESIDENT CONTEXT ============ */}
      <section className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-resqnow-violet">
            Resident emergency services
          </p>
          <h1 className="mt-1 text-[20px] font-extrabold tracking-[-0.02em] text-resqnow-primary">
            Hello, {firstName}
          </h1>
          <p className="mt-1 text-[12px] text-resqnow-muted">
            Report urgent incidents or check an existing response.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadReports({ refresh: true })}
          disabled={isRefreshing}
          aria-label="Refresh dashboard"
          className="w-11 h-11 shrink-0 rounded-xl border border-resqnow-border-soft bg-white text-resqnow-violet flex items-center justify-center shadow-sm active:scale-95 disabled:opacity-50 transition-all"
        >
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>
      </section>

      {/* ============ PRIMARY EMERGENCY ACTION ============ */}
      <section className="rounded-2xl border border-resqnow-critical/25 bg-white overflow-hidden shadow-[0_8px_24px_rgba(217,45,32,0.08)]">
        <button
          type="button"
          onClick={() => navigate('/submit/emergency')}
          className="w-full min-h-[78px] bg-resqnow-critical px-4 py-4 text-white text-left flex items-center gap-3 active:scale-[0.995] transition-transform"
        >
          <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
            <Siren className="w-6 h-6" strokeWidth={2.4} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-extrabold tracking-[0.01em]">
              REPORT EMERGENCY
            </p>
            <p className="text-[11px] text-white/85 mt-1 leading-relaxed">
              Flood rescue · Medical · Fire · Accident · Evacuation
            </p>
          </div>

          <ChevronRight className="w-5 h-5 shrink-0 text-white/85" />
        </button>

        {HOTLINE ? (
          <a
            href={HOTLINE.href}
            className="min-h-[52px] px-4 flex items-center justify-between gap-3 bg-white text-resqnow-violet border-t border-resqnow-border-soft active:bg-resqnow-canvas transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Phone className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <p className="text-[12px] font-bold">Call Barangay Hotline</p>
                <p className="text-[10px] text-resqnow-muted mt-0.5">
                  {HOTLINE.display} · tap to call
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-resqnow-violet">
              Call now
            </span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/contacts')}
            className="w-full min-h-[52px] px-4 flex items-center justify-between gap-3 bg-white text-resqnow-violet border-t border-resqnow-border-soft"
          >
            <span className="flex items-center gap-2 text-[12px] font-bold">
              <Phone className="w-4 h-4" />
              Open Emergency Contacts
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
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
              {reports.length > 0 && (
                <p className="text-[11px] text-resqnow-muted mt-1">
                  Showing the last successfully loaded information.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadReports({ refresh: true })}
            disabled={isRefreshing}
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

      {/* ============ ACTIVE REPORT ============ */}
      {isLoading && reports.length === 0 ? (
        <section className="bg-white border border-resqnow-border-soft rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-resqnow-violet animate-spin" />
            <div>
              <p className="text-[12px] font-bold text-resqnow-primary">
                Checking active reports
              </p>
              <p className="text-[11px] text-resqnow-muted mt-0.5">
                Loading the latest confirmed status from the barangay system.
              </p>
            </div>
          </div>
        </section>
      ) : activeReport ? (
        <ActiveReportCard
          report={activeReport}
          onOpen={() =>
            navigate(`/track/${encodeURIComponent(activeReport.id)}`)
          }
          lastCheckedText={lastCheckedText}
        />
      ) : (
        <section className="rounded-2xl border border-resqnow-safe/20 bg-resqnow-safe/5 px-4 py-3.5 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-resqnow-safe mt-0.5 shrink-0" />
          <div>
            <p className="text-[12px] font-bold text-resqnow-primary">
              No active reports
            </p>
            <p className="text-[11px] text-resqnow-muted mt-1 leading-relaxed">
              Your open emergency or community reports will appear here with their latest response status.
            </p>
          </div>
        </section>
      )}

      {/* ============ BARANGAY UPDATES ============ */}
      <button
        type="button"
        onClick={() => navigate('/updates')}
        className="w-full rounded-2xl border border-bgy-yellow/60 bg-bgy-yellow-soft px-4 py-3.5 flex items-center gap-3 text-left active:scale-[0.995] transition-transform"
      >
        <div className="w-10 h-10 rounded-xl bg-bgy-yellow text-bgy-navy flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-bgy-navy/70">
            Barangay updates
          </p>
          <p className="text-[13px] font-bold text-bgy-navy mt-0.5">
            View official report notifications and notices
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-bgy-navy shrink-0" />
      </button>

      {/* ============ QUICK ACTIONS ============ */}
      <section>
        <div className="flex items-end justify-between gap-3 mb-2.5">
          <div>
            <h2 className="text-[14px] font-extrabold text-resqnow-primary">
              Quick Actions
            </h2>
            <p className="text-[11px] text-resqnow-muted mt-0.5">
              Common barangay services and emergency information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <QuickAction
            icon={FileText}
            label="Community Concern"
            helper="Non-emergency report"
            onClick={() => navigate('/submit/non-emergency')}
          />
          <QuickAction
            icon={ClipboardList}
            label="Report History"
            helper="Track all reports"
            onClick={() => navigate('/track')}
          />
          <QuickAction
            icon={Phone}
            label="Emergency Contacts"
            helper="Hotlines and services"
            onClick={() => navigate('/contacts')}
          />
          <QuickAction
            icon={ShieldCheck}
            label="Safety Guides"
            helper="Preparedness steps"
            onClick={() => navigate('/safety-tips')}
          />
        </div>
      </section>

      {/* ============ REPORT COUNTS ============ */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="text-[14px] font-extrabold text-resqnow-primary">
              My Reports
            </h2>
            <p className="text-[11px] text-resqnow-muted mt-0.5">
              {isRefreshing
                ? 'Refreshing reports...'
                : lastCheckedText
                ? `Last checked ${lastCheckedText}`
                : 'Status information from the barangay system'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/track')}
            className="min-h-[40px] px-2 text-[12px] font-bold text-resqnow-violet active:scale-95 transition-transform"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatCard
            icon={Activity}
            value={openReports.length}
            label="Open"
            color="blue"
            onClick={() => navigate('/track')}
          />
          <StatCard
            icon={Clock}
            value={pendingCount}
            label="Pending"
            color="orange"
            onClick={() => navigate('/track')}
          />
          <StatCard
            icon={CheckCircle2}
            value={resolvedCount}
            label="Resolved"
            color="green"
            onClick={() => navigate('/track')}
          />
        </div>
      </section>

      {/* ============ MOST RECENT CLOSED REPORT ============ */}
      {!activeReport && latestReport && (
        <section className="bg-white rounded-2xl border border-resqnow-border-soft overflow-hidden">
          <div className="border-l-4 border-resqnow-violet p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-resqnow-muted">
              Most recent report
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(`/track/${encodeURIComponent(latestReport.id)}`)
              }
              className="w-full text-left mt-2 active:scale-[0.995] transition-transform"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12px] font-extrabold text-resqnow-primary">
                    {latestReport.id}
                  </p>
                  <p className="text-[13px] font-semibold text-resqnow-primary mt-1 line-clamp-2">
                    {latestReport.concernType}
                  </p>
                </div>

                <span
                  className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(
                    latestReport.status
                  )}`}
                >
                  {latestReport.status}
                </span>
              </div>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function ActiveReportCard({ report, onOpen, lastCheckedText }) {
  const isEmergency = report.reportType === 'Emergency';

  return (
    <section
      className={`bg-white rounded-2xl border border-resqnow-border-soft overflow-hidden shadow-[0_6px_20px_rgba(7,55,99,0.06)] ${
        isEmergency ? 'border-l-4 border-l-resqnow-critical' : 'border-l-4 border-l-resqnow-violet'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-resqnow-muted">
              Active report
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[12px] font-extrabold text-resqnow-primary">
                {report.id}
              </span>
              <span
                className={`text-[9px] font-extrabold uppercase tracking-wide px-2 py-1 rounded-full ${
                  isEmergency
                    ? 'bg-resqnow-critical/10 text-resqnow-critical'
                    : 'bg-resqnow-violet/10 text-resqnow-violet'
                }`}
              >
                {report.reportType}
              </span>
            </div>
          </div>

          <span
            className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(
              report.status
            )}`}
          >
            {report.status}
          </span>
        </div>

        <h2 className="text-[15px] font-bold text-resqnow-primary mt-3">
          {report.concernType}
        </h2>

        {report.location && (
          <div className="flex items-start gap-2 mt-2 text-[11px] text-resqnow-muted">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{report.location}</span>
          </div>
        )}

        {report.latestUpdate && (
          <div className="mt-3 rounded-xl bg-resqnow-canvas border border-resqnow-border-soft px-3 py-2.5">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-resqnow-muted">
              Latest confirmed update
            </p>
            <p className="text-[11px] text-resqnow-secondary mt-1 leading-relaxed line-clamp-2">
              {report.latestUpdate}
            </p>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[10px] text-resqnow-muted">
            {lastCheckedText ? `Checked ${lastCheckedText}` : 'Live status available in Track'}
          </p>

          <button
            type="button"
            onClick={onOpen}
            className="min-h-[42px] px-4 rounded-xl bg-resqnow-violet text-white text-[11px] font-extrabold flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            Track report
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function QuickAction({ icon: Icon, label, helper, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[86px] rounded-2xl border border-resqnow-border-soft bg-white p-3 text-left flex items-start gap-2.5 hover:border-resqnow-violet/25 active:scale-[0.985] transition-all"
    >
      <div className="w-9 h-9 rounded-xl bg-resqnow-violet/8 text-resqnow-violet flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-resqnow-primary leading-snug">
          {label}
        </p>
        <p className="text-[10px] text-resqnow-muted mt-1 leading-snug">
          {helper}
        </p>
      </div>
    </button>
  );
}

function StatCard({ icon: Icon, value, label, color, onClick }) {
  const styles = {
    blue: {
      icon: 'text-resqnow-violet',
      border: 'border-resqnow-violet/20',
      hover: 'hover:bg-resqnow-violet/5',
    },
    orange: {
      icon: 'text-resqnow-pending',
      border: 'border-resqnow-pending/20',
      hover: 'hover:bg-resqnow-pending/5',
    },
    green: {
      icon: 'text-resqnow-safe',
      border: 'border-resqnow-safe/20',
      hover: 'hover:bg-resqnow-safe/5',
    },
  };

  const selected = styles[color] || styles.blue;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-white border ${selected.border} ${selected.hover} rounded-2xl p-3 text-center active:scale-[0.98] transition-all`}
    >
      <Icon className={`w-5 h-5 mx-auto ${selected.icon}`} />
      <p className="text-lg font-extrabold text-resqnow-primary mt-1">{value}</p>
      <p className="text-[11px] text-resqnow-muted mt-0.5">{label}</p>
    </button>
  );
}
