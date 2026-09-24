import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  ShieldCheck,
  Siren,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { safetyTips } from '../../data/mockData';
import { getAssignedReports } from '../../services/responderService';
import IncidentCard from './IncidentCard';
import {
  directionsInfo,
  formatClock,
  isOpenReport,
  needsAcknowledgement,
  sortOperationalReports,
} from './responderViewUtils';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function findSafetyGuide(report) {
  if (!report?.concernCode) return null;

  for (const group of safetyTips || []) {
    const guide = group.items?.find((item) => item.id === report.concernCode);
    if (guide) return guide;
  }

  return null;
}

export default function ResponderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadReports = useCallback(async () => {
    setError('');
    if (!hasLoaded) setIsLoading(true);

    try {
      const data = await getAssignedReports();
      setReports(data);
      setLastUpdated(new Date());
      setHasLoaded(true);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load assigned incidents.');
    } finally {
      setIsLoading(false);
    }
  }, [hasLoaded]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const openReports = useMemo(
    () => reports.filter(isOpenReport),
    [reports]
  );

  const queue = useMemo(
    () => sortOperationalReports(openReports, user?.id),
    [openReports, user?.id]
  );

  const attentionReport = queue[0] || null;
  const remainingQueue = attentionReport ? queue.slice(1, 4) : [];

  const summary = useMemo(() => {
    const high = openReports.filter((report) => report.priority === 'High').length;
    const inProgress = openReports.filter((report) =>
      ['In Progress', 'Responders En Route', 'Responded'].includes(report.status)
    ).length;
    const toAcknowledge = openReports.filter((report) =>
      needsAcknowledgement(report, user?.id)
    ).length;

    return {
      open: openReports.length,
      high,
      inProgress,
      toAcknowledge,
    };
  }, [openReports, user?.id]);

  const safetyGuide = useMemo(
    () => findSafetyGuide(attentionReport),
    [attentionReport]
  );

  const firstName = user?.fullName?.split(' ')[0] || 'Responder';
  const attentionDirections = attentionReport
    ? directionsInfo(attentionReport)
    : null;

  function openIncident(report) {
    navigate(`/responder/incidents/${report.id}`, {
      state: {
        returnTo: location.pathname,
      },
    });
  }

  return (
    <div className="px-4 pt-4 pb-28 min-h-screen space-y-4">
      <section className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] text-resqnow-muted">{getGreeting()},</p>
          <h1 className="text-[21px] font-extrabold text-resqnow-primary leading-tight mt-0.5">
            {firstName}
          </h1>
          <p className="mt-1 text-[10px] text-resqnow-placeholder">
            {lastUpdated
              ? `Last updated ${formatClock(lastUpdated)}`
              : hasLoaded
              ? 'Assignment data loaded'
              : 'Checking assignments…'}
          </p>
        </div>

        <button
          type="button"
          onClick={loadReports}
          disabled={isLoading}
          aria-label="Refresh assigned incidents"
          className="w-11 h-11 rounded-xl border border-resqnow-border-soft bg-white text-resqnow-violet flex items-center justify-center shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </section>

      {error && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-resqnow-critical/20 bg-resqnow-critical/8 p-3 text-[11px] text-resqnow-crimson"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-bold">
              {hasLoaded ? 'Unable to refresh assignments' : 'Unable to load assignments'}
            </p>
            <p className="mt-1">{error}</p>
            {hasLoaded && (
              <p className="mt-1 text-resqnow-muted">
                Showing previously loaded information
                {lastUpdated ? ` from ${formatClock(lastUpdated)}` : ''}.
              </p>
            )}
            {!hasLoaded && (
              <button
                type="button"
                onClick={loadReports}
                className="mt-2 min-h-[40px] rounded-xl bg-white px-3 text-[11px] font-bold text-resqnow-crimson border border-resqnow-critical/20"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {isLoading && !hasLoaded ? (
        <DashboardSkeleton />
      ) : hasLoaded && openReports.length === 0 ? (
        <section className="rounded-2xl border border-resqnow-border-soft bg-white px-5 py-9 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-resqnow-safe" />
          <p className="mt-3 text-[14px] font-bold text-resqnow-primary">
            No active assignments
          </p>
          <p className="mt-1 text-[11px] text-resqnow-muted">
            New incidents assigned to your account will appear here.
          </p>
        </section>
      ) : (
        <>
          {attentionReport && (
            <section className="overflow-hidden rounded-2xl border border-resqnow-critical/20 bg-white shadow-[0_6px_20px_rgba(31,29,71,.06)]">
              <div className="border-t-4 border-resqnow-critical px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[.14em] text-resqnow-critical">
                      Needs your attention
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-extrabold text-resqnow-primary">
                        {attentionReport.id}
                      </span>
                      <span className="rounded-full border border-resqnow-critical/20 bg-resqnow-critical/10 px-2 py-1 text-[9px] font-bold text-resqnow-critical">
                        {attentionReport.priority} priority
                      </span>
                      {needsAcknowledgement(attentionReport, user?.id) && (
                        <span className="rounded-full bg-resqnow-caution/15 px-2 py-1 text-[9px] font-bold text-resqnow-pending">
                          Needs acknowledgement
                        </span>
                      )}
                    </div>
                  </div>
                  <Siren className="h-5 w-5 shrink-0 text-resqnow-critical" />
                </div>

                <h2 className="mt-2 text-[16px] font-bold text-resqnow-primary">
                  {attentionReport.concernType}
                </h2>

                <div className="mt-2 flex items-start gap-2 text-[11px] text-resqnow-muted">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    {attentionReport.location || 'Location unavailable'}
                    {attentionReport.landmark ? ` · ${attentionReport.landmark}` : ''}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openIncident(attentionReport)}
                    className="min-h-[48px] rounded-xl bg-brand-gradient px-3 text-[11px] font-bold text-white shadow-[0_5px_16px_rgba(131,70,242,.18)]"
                  >
                    Open incident
                  </button>

                  <a
                    href={attentionDirections.href}
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[48px] rounded-xl border border-resqnow-violet/20 bg-resqnow-violet/5 px-3 text-[11px] font-bold text-resqnow-violet flex items-center justify-center gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    {attentionDirections.label}
                  </a>
                </div>
              </div>
            </section>
          )}

          <section className="grid grid-cols-2 gap-2">
            <MetricCard icon={ClipboardList} value={summary.open} label="Open" tone="violet" />
            <MetricCard icon={Siren} value={summary.high} label="High priority" tone="critical" />
            <MetricCard icon={Activity} value={summary.inProgress} label="In progress" tone="info" />
            <MetricCard icon={CheckCircle2} value={summary.toAcknowledge} label="To acknowledge" tone="warning" />
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.12em] text-resqnow-placeholder">
                  Priority queue
                </p>
                <h2 className="mt-1 text-[15px] font-bold text-resqnow-primary">
                  Remaining assignments
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/responder/incidents')}
                className="flex min-h-[40px] items-center gap-1 text-[10px] font-bold text-resqnow-violet"
              >
                Track all
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {remainingQueue.length ? (
              <div className="space-y-3">
                {remainingQueue.map((report) => (
                  <IncidentCard
                    key={report.id}
                    report={report}
                    onOpen={() => openIncident(report)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-resqnow-border-soft bg-white px-4 py-4 text-[11px] text-resqnow-muted">
                No other active assignments are waiting in your queue.
              </div>
            )}
          </section>

          <section className="grid gap-3">
            <button
              type="button"
              onClick={() => navigate('/responder/contacts')}
              className="min-h-[64px] rounded-2xl border border-resqnow-border-soft bg-white px-4 py-3 flex items-center gap-3 text-left shadow-[0_4px_14px_rgba(31,29,71,.04)]"
            >
              <div className="w-10 h-10 rounded-xl bg-resqnow-violet/10 text-resqnow-violet flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-resqnow-primary">Contact Directory</p>
                <p className="mt-0.5 text-[10px] text-resqnow-muted">Barangay and emergency contact numbers.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-resqnow-placeholder" />
            </button>

            <section className="rounded-2xl border border-resqnow-border-soft bg-white p-4 shadow-[0_4px_14px_rgba(31,29,71,.04)]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-resqnow-safe/10 text-resqnow-safe flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-extrabold uppercase tracking-[.12em] text-resqnow-safe">
                    Safety reminder
                  </p>
                  <h2 className="mt-1 text-[13px] font-bold text-resqnow-primary">
                    {safetyGuide?.title || 'Field response safety'}
                  </h2>
                  <ul className="mt-2 space-y-1.5">
                    {(safetyGuide?.tips || [
                      'Confirm the incident location before entering the response area.',
                      'Use appropriate protective equipment for the reported hazard.',
                    ])
                      .slice(0, 2)
                      .map((tip) => (
                        <li key={tip} className="flex items-start gap-2 text-[11px] leading-relaxed text-resqnow-muted">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-resqnow-safe shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/responder/safety-tips')}
                className="mt-3 min-h-[42px] w-full rounded-xl bg-resqnow-safe/8 text-[11px] font-bold text-resqnow-safe"
              >
                View all Safety Tips
              </button>
            </section>
          </section>
        </>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, value, label, tone }) {
  const tones = {
    violet: 'bg-resqnow-violet/10 text-resqnow-violet',
    critical: 'bg-resqnow-critical/10 text-resqnow-critical',
    info: 'bg-resqnow-info/10 text-resqnow-info',
    warning: 'bg-resqnow-caution/12 text-resqnow-pending',
  };

  return (
    <div className="rounded-2xl border border-resqnow-border-soft bg-white p-3.5 shadow-[0_3px_12px_rgba(31,29,71,.04)]">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <p className="mt-3 text-[20px] font-extrabold text-resqnow-primary">{value}</p>
      <p className="mt-0.5 text-[10px] font-medium text-resqnow-muted">{label}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading assignments">
      <div className="h-48 animate-pulse rounded-2xl border border-resqnow-border-soft bg-white" />
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-2xl border border-resqnow-border-soft bg-white" />
        ))}
      </div>
      <div className="h-36 animate-pulse rounded-2xl border border-resqnow-border-soft bg-white" />
    </div>
  );
}
