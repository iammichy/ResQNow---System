// src/components/resident/Dashboard.jsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  House,
  Loader2,
  MapPin,
  MessageSquareText,
  Navigation,
  Phone,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Tent,
  Users,
  WifiOff,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import { getContactDirectory } from '../../services/contactService';
import {
  getEvacuationCenters,
  getOperationalAnnouncements,
} from '../../services/operationsService';
import { getReports } from '../../services/reportService';
import { getStatusStyle } from '../../utils/statusUtils';

const TERMINAL_STATUSES = ['Resolved', 'Invalid'];
const HOME_REPORT_POLL_MS = 15000;
const HOME_OPERATIONS_POLL_MS = 30000;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOnline = useOnlineStatus();

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportError, setReportError] = useState('');
  const [lastChecked, setLastChecked] = useState(null);

  const [announcements, setAnnouncements] = useState([]);
  const [announcementsSource, setAnnouncementsSource] = useState('api');
  const [operationsError, setOperationsError] = useState('');
  const [evacuationCenters, setEvacuationCenters] = useState([]);
  const [evacuationSource, setEvacuationSource] = useState('api');
  const [hotline, setHotline] = useState(null);

  const loadReports = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

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

  const loadOperations = useCallback(async () => {
    const homeLat = Number(user?.homeLocation?.latitude);
    const homeLng = Number(user?.homeLocation?.longitude);
    const hasHomeCoordinates = Number.isFinite(homeLat) && Number.isFinite(homeLng);

    try {
      const [announcementResult, evacuationResult] = await Promise.all([
        getOperationalAnnouncements({ limit: 20 }),
        getEvacuationCenters({
          lat: hasHomeCoordinates ? homeLat : undefined,
          lng: hasHomeCoordinates ? homeLng : undefined,
          nearest: true,
          limit: 1,
        }),
      ]);

      setAnnouncements(announcementResult.data);
      setAnnouncementsSource(announcementResult.source);
      setEvacuationCenters(evacuationResult.data);
      setEvacuationSource(evacuationResult.source);
      setOperationsError('');
    } catch (error) {
      setOperationsError(
        error?.message || 'Unable to refresh barangay operational information.'
      );
    }
  }, [user?.homeLocation?.latitude, user?.homeLocation?.longitude]);

  const loadHotline = useCallback(async () => {
    try {
      const { directory } = await getContactDirectory();
      const preferred = directory.contacts.find(
        (contact) => contact.id === 'barangay-emergency-hotline'
      );
      const fallback = directory.contacts.find(
        (contact) => Array.isArray(contact.phoneNumbers) && contact.phoneNumbers.length > 0
      );
      const contact = preferred || fallback;
      const phone = contact?.phoneNumbers?.[0];

      if (phone?.number) {
        setHotline({
          name: contact.name,
          number: phone.number,
          displayNumber: phone.displayNumber || phone.number,
        });
      }
    } catch {
      // Contacts page still has its own saved-directory fallback.
    }
  }, []);

  useEffect(() => {
    loadReports();
    loadOperations();
    loadHotline();

    const reportIntervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadReports({ refresh: true });
      }
    }, HOME_REPORT_POLL_MS);

    const operationsIntervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadOperations();
      }
    }, HOME_OPERATIONS_POLL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadReports({ refresh: true });
        loadOperations();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(reportIntervalId);
      window.clearInterval(operationsIntervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadReports, loadOperations, loadHotline]);

  const openReports = useMemo(
    () => reports.filter((report) => !TERMINAL_STATUSES.includes(report.status)),
    [reports]
  );

  const pendingCount = useMemo(
    () => reports.filter((report) => report.status === 'Pending Verification').length,
    [reports]
  );

  const resolvedCount = useMemo(
    () => reports.filter((report) => report.status === 'Resolved').length,
    [reports]
  );

  const activeReport = useMemo(() => {
    if (openReports.length === 0) return null;
    return [...openReports].sort((a, b) => getReportTime(b) - getReportTime(a))[0];
  }, [openReports]);

  const recentReports = useMemo(() => {
    return [...reports]
      .sort((a, b) => getReportTime(b) - getReportTime(a))
      .filter((report) => report.id !== activeReport?.id)
      .slice(0, 2);
  }, [reports, activeReport]);

  const criticalAlert = useMemo(
    () => announcements.find((item) => item.category === 'critical') || null,
    [announcements]
  );

  const nonCriticalAnnouncements = useMemo(
    () => announcements.filter((item) => item.category !== 'critical'),
    [announcements]
  );

  const nearestCenter = evacuationCenters[0] || null;

  const lastCheckedText = lastChecked
    ? lastChecked.toLocaleTimeString('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  const callHotline = () => {
    if (hotline?.number) {
      window.location.href = `tel:${hotline.number}`;
      return;
    }
    navigate('/contacts');
  };

  return (
    <div className="px-4 pt-2 pb-6 space-y-4">
      {criticalAlert && (
        <CriticalAlertBanner
          alert={criticalAlert}
          onOpen={() => navigate('/updates')}
          source={announcementsSource}
        />
      )}

      {!isOnline && (
        <OfflineModeBanner
          hotline={hotline}
          onOpenSms={() => navigate('/submit/emergency?offline=1')}
          onCall={callHotline}
        />
      )}

      <HomePriorityStack
        activeReport={activeReport}
        announcements={nonCriticalAnnouncements}
        onOpenReport={(reportCode) =>
          navigate(`/track/${encodeURIComponent(reportCode)}`)
        }
        onOpenUpdates={() => navigate('/updates')}
      />

      <section>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <h1 className="text-[14px] font-extrabold text-resqnow-primary">
              My Reports
            </h1>
            <p className="text-[11px] text-resqnow-muted mt-0.5">
              {isRefreshing
                ? 'Checking for updates...'
                : lastCheckedText
                ? `Last checked ${lastCheckedText}`
                : 'Checking your latest report status'}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Refresh reports"
              onClick={() => loadReports({ refresh: true })}
              disabled={isRefreshing}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-resqnow-violet hover:bg-resqnow-violet/10 disabled:opacity-50 transition-colors"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/track')}
              className="min-h-[40px] px-2 text-[12px] font-bold text-resqnow-violet active:scale-95 transition-transform"
            >
              View all
            </button>
          </div>
        </div>

        {isLoading && reports.length === 0 ? (
          <div className="bg-white border border-resqnow-border-soft rounded-2xl p-5 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 text-resqnow-violet animate-spin" />
            <p className="text-[12px] text-resqnow-muted">Loading your reports...</p>
          </div>
        ) : (
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
        )}
      </section>

      {reportError && (
        <InlineError
          title="Could not refresh your reports"
          message={reportError}
          onRetry={() => loadReports({ refresh: true })}
        />
      )}

      {!isLoading && activeReport && (
        <ActiveReportCard
          report={activeReport}
          onOpen={() => navigate(`/track/${encodeURIComponent(activeReport.id)}`)}
        />
      )}

      <QuickAccess
        hotline={hotline}
        onCallHotline={callHotline}
        onHousehold={() => navigate('/settings')}
      />

      <EvacuationCenterCard
        center={nearestCenter}
        source={evacuationSource}
        hasSavedLocation={Boolean(user?.homeLocation?.latitude && user?.homeLocation?.longitude)}
        onCallHotline={callHotline}
      />

      <SafetySnapshot
        offline={!isOnline}
        onOpen={() => navigate('/safety-tips')}
      />

      {operationsError && !criticalAlert && !nearestCenter && (
        <InlineError
          title="Barangay information could not refresh"
          message={operationsError}
          onRetry={loadOperations}
        />
      )}

      {!isLoading && recentReports.length > 0 && (
        <RecentActivity
          reports={recentReports}
          onOpen={(report) => navigate(`/track/${encodeURIComponent(report.id)}`)}
        />
      )}
    </div>
  );
}

function CriticalAlertBanner({ alert, onOpen, source }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl bg-resqnow-critical text-white px-4 py-3.5 text-left shadow-[0_8px_22px_rgba(217,45,32,0.24)] active:scale-[0.995] transition-transform"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <Siren className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.12em]">
              Critical Barangay Alert
            </span>
            {source === 'cache' && (
              <span className="text-[8px] font-bold bg-white/15 px-2 py-0.5 rounded-full">
                Saved copy
              </span>
            )}
          </div>
          <p className="text-[13px] font-extrabold mt-1 leading-snug">{alert.title}</p>
          <p className="text-[10px] text-white/90 mt-1 line-clamp-2 leading-relaxed">
            {alert.body}
          </p>
          <p className="text-[9px] text-white/75 mt-2">Tap to review the official update.</p>
        </div>
        <ChevronRight className="w-4 h-4 shrink-0 mt-3" />
      </div>
    </button>
  );
}

function OfflineModeBanner({ hotline, onOpenSms, onCall }) {
  return (
    <section className="rounded-2xl border border-resqnow-pending/30 bg-resqnow-pending/10 px-3.5 py-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-resqnow-pending/15 text-resqnow-pending flex items-center justify-center shrink-0">
          <WifiOff className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold text-resqnow-primary">Offline Mode</p>
          <p className="text-[10px] text-resqnow-secondary mt-0.5 leading-relaxed">
            Live status may be outdated. You can prepare a formatted emergency SMS or call the barangay directly.
          </p>
          <div className="flex gap-2 mt-2.5">
            <button
              type="button"
              onClick={onOpenSms}
              className="min-h-[40px] px-3 rounded-xl bg-resqnow-pending text-white text-[10px] font-extrabold flex items-center gap-1.5"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              SMS SOS
            </button>
            <button
              type="button"
              onClick={onCall}
              className="min-h-[40px] px-3 rounded-xl bg-white border border-resqnow-pending/25 text-resqnow-primary text-[10px] font-extrabold flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              {hotline?.displayNumber ? 'Call Hotline' : 'Contacts'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePriorityStack({ activeReport, announcements, onOpenReport, onOpenUpdates }) {
  const items = useMemo(() => {
    const selected = [];

    if (activeReport) {
      selected.push(buildReportStateNotice(activeReport));
    }

    const advisory = announcements.find((item) => item.category === 'advisory');
    const general = announcements.find((item) => item.category === 'general');

    if (advisory && selected.length < 3) selected.push({ ...advisory, kind: 'announcement' });
    if (general && selected.length < 3) selected.push({ ...general, kind: 'announcement' });

    for (const announcement of announcements) {
      if (selected.length >= 3) break;
      if (selected.some((item) => item.id === announcement.id)) continue;
      selected.push({ ...announcement, kind: 'announcement' });
    }

    return selected.slice(0, 3);
  }, [activeReport, announcements]);

  if (items.length === 0) return null;

  return (
    <section aria-label="Priority updates">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-resqnow-muted mb-2">
        Priority updates
      </p>
      <div className="relative">
        {items.map((item, index) => {
          const reportItem = item.kind === 'report';
          const advisory = item.category === 'advisory';

          return (
            <button
              key={reportItem ? `report-${item.reportCode}` : `announcement-${item.id}`}
              type="button"
              onClick={() => reportItem ? onOpenReport(item.reportCode) : onOpenUpdates()}
              style={{ zIndex: 30 - index, marginTop: index === 0 ? 0 : '-8px' }}
              className={`relative w-full min-h-[68px] rounded-2xl border px-3.5 py-3 text-left shadow-[0_5px_16px_rgba(7,55,99,0.08)] active:scale-[0.995] transition-transform ${
                reportItem
                  ? 'bg-white border-resqnow-violet/25 border-l-4 border-l-resqnow-violet'
                  : advisory
                  ? 'bg-bgy-yellow-soft border-bgy-yellow/40 border-l-4 border-l-bgy-yellow'
                  : 'bg-white border-resqnow-border-soft border-l-4 border-l-resqnow-violet'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  reportItem
                    ? 'bg-resqnow-violet/10 text-resqnow-violet'
                    : advisory
                    ? 'bg-bgy-yellow text-bgy-navy'
                    : 'bg-resqnow-violet/10 text-resqnow-violet'
                }`}>
                  {reportItem ? <Activity className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-resqnow-muted">
                    {reportItem ? 'Report update' : advisory ? 'Barangay advisory' : 'Barangay announcement'}
                  </p>
                  <p className="text-[12px] font-extrabold text-resqnow-primary mt-0.5 line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-resqnow-muted mt-0.5 line-clamp-1">
                    {reportItem ? item.message : item.body}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-resqnow-muted shrink-0 mt-2" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function QuickAccess({ hotline, onCallHotline, onHousehold }) {
  return (
    <section>
      <h2 className="text-[14px] font-extrabold text-resqnow-primary mb-2.5">Quick Access</h2>
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onHousehold}
          className="min-h-[72px] bg-white border border-resqnow-border-soft rounded-2xl p-3 text-left flex items-center gap-3 active:scale-[0.99] transition-transform"
        >
          <div className="w-9 h-9 rounded-xl bg-resqnow-violet/10 text-resqnow-violet flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-resqnow-primary">Household Information</p>
            <p className="text-[9px] text-resqnow-muted mt-0.5">Update family and home details</p>
          </div>
        </button>

        <button
          type="button"
          onClick={onCallHotline}
          className="min-h-[72px] bg-white border border-resqnow-violet/20 rounded-2xl p-3 text-left flex items-center gap-3 active:scale-[0.99] transition-transform"
        >
          <div className="w-9 h-9 rounded-xl bg-resqnow-violet text-white flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-resqnow-primary">Call Barangay Hotline</p>
            <p className="text-[9px] text-resqnow-muted mt-0.5">
              {hotline?.displayNumber || 'One-tap emergency contact'}
            </p>
          </div>
        </button>
      </div>
    </section>
  );
}

function EvacuationCenterCard({ center, source, hasSavedLocation, onCallHotline }) {
  if (!center) {
    return (
      <section className="bg-white border border-resqnow-border-soft rounded-2xl p-3.5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-resqnow-violet/10 text-resqnow-violet flex items-center justify-center shrink-0">
            <Tent className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-extrabold text-resqnow-primary">Evacuation center information</p>
            <p className="text-[10px] text-resqnow-muted mt-1 leading-relaxed">
              No operational evacuation center has been published in ResQNow yet. Call the barangay for current instructions.
            </p>
            <button
              type="button"
              onClick={onCallHotline}
              className="mt-2.5 min-h-[40px] px-3 rounded-xl border border-resqnow-violet/20 text-resqnow-violet text-[10px] font-extrabold"
            >
              Call Hotline
            </button>
          </div>
        </div>
      </section>
    );
  }

  const statusStyles = {
    open: 'bg-resqnow-safe/10 text-resqnow-safe border-resqnow-safe/20',
    full: 'bg-resqnow-critical/10 text-resqnow-critical border-resqnow-critical/20',
    standby: 'bg-bgy-yellow-soft text-bgy-navy border-bgy-yellow/40',
    closed: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const occupancyText =
    center.currentOccupancy !== null && center.capacity !== null
      ? `${center.currentOccupancy}/${center.capacity} persons`
      : center.capacity !== null
      ? `Capacity ${center.capacity}`
      : 'Capacity not published';

  return (
    <section className="bg-white border border-resqnow-border-soft rounded-2xl overflow-hidden">
      <div className="p-3.5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-resqnow-violet/10 text-resqnow-violet flex items-center justify-center shrink-0">
            <Tent className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-resqnow-muted">
                {center.distanceMeters !== null ? 'Nearest evacuation center' : 'Evacuation center'}
              </p>
              {source === 'cache' && (
                <span className="text-[8px] font-bold text-resqnow-pending">Saved data</span>
              )}
            </div>
            <p className="text-[13px] font-extrabold text-resqnow-primary mt-1">{center.name}</p>
            <p className="text-[10px] text-resqnow-muted mt-1 line-clamp-2">{center.address}</p>
          </div>
          <span className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded-full border ${statusStyles[center.status] || statusStyles.standby}`}>
            {center.status}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
          <div className="rounded-xl bg-resqnow-canvas px-3 py-2">
            <p className="text-resqnow-muted">Occupancy</p>
            <p className="font-bold text-resqnow-primary mt-0.5">{occupancyText}</p>
          </div>
          <div className="rounded-xl bg-resqnow-canvas px-3 py-2">
            <p className="text-resqnow-muted">Distance</p>
            <p className="font-bold text-resqnow-primary mt-0.5">
              {formatDistance(center.distanceMeters, hasSavedLocation)}
            </p>
          </div>
        </div>

        {center.directionsUrl && (
          <a
            href={center.directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 min-h-[42px] px-3.5 rounded-xl bg-resqnow-violet text-white text-[10px] font-extrabold flex items-center justify-center gap-2"
          >
            <Navigation className="w-3.5 h-3.5" />
            Get Directions
          </a>
        )}
      </div>
    </section>
  );
}

function SafetySnapshot({ offline, onOpen }) {
  return (
    <section className="bg-white border border-bgy-yellow/35 rounded-2xl overflow-hidden">
      <div className="px-3.5 py-3 bg-bgy-yellow-soft/60 border-b border-bgy-yellow/20 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-bgy-yellow text-bgy-navy flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-bgy-navy/70">
            {offline ? 'Offline safety tips' : 'Flood safety snapshot'}
          </p>
          <p className="text-[12px] font-bold text-bgy-navy mt-0.5">Know what to do before water rises</p>
        </div>
      </div>
      <div className="p-3.5 space-y-2 text-[10px] text-resqnow-secondary leading-relaxed">
        <p>• Move to higher ground before floodwater becomes difficult to cross.</p>
        <p>• Turn off electricity only when it is safe to do so.</p>
        <p>• Never walk or drive through fast-moving floodwater.</p>
        <button
          type="button"
          onClick={onOpen}
          className="mt-1 min-h-[40px] text-resqnow-violet font-extrabold flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Open Safety Guides
        </button>
      </div>
    </section>
  );
}

function ActiveReportCard({ report, onOpen }) {
  const isEmergency = report.reportType === 'Emergency';

  return (
    <section className={`bg-white rounded-2xl border border-resqnow-border-soft overflow-hidden ${
      isEmergency ? 'border-l-4 border-l-resqnow-critical' : 'border-l-4 border-l-resqnow-violet'
    }`}>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-resqnow-muted">Active rescue</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[12px] font-extrabold text-resqnow-primary">{report.id}</span>
              <span className={`text-[8px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                isEmergency ? 'bg-resqnow-critical/10 text-resqnow-critical' : 'bg-resqnow-violet/10 text-resqnow-violet'
              }`}>
                {report.reportType}
              </span>
            </div>
          </div>
          <span className={`shrink-0 text-[9px] font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(report.status)}`}>
            {report.status}
          </span>
        </div>
        <h2 className="text-[13px] font-bold text-resqnow-primary mt-2.5 line-clamp-1">{report.concernType}</h2>
        {report.location && (
          <div className="flex items-start gap-2 mt-1.5 text-[10px] text-resqnow-muted">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{report.location}</span>
          </div>
        )}
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <p className="min-w-0 text-[10px] text-resqnow-secondary line-clamp-1">
            {report.latestUpdate || 'Open Track for the confirmed report history.'}
          </p>
          <button
            type="button"
            onClick={onOpen}
            className="shrink-0 min-h-[40px] px-3.5 rounded-xl bg-resqnow-violet text-white text-[10px] font-extrabold flex items-center gap-1"
          >
            Track
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function RecentActivity({ reports, onOpen }) {
  return (
    <section>
      <h2 className="text-[14px] font-extrabold text-resqnow-primary mb-2.5">Recent Activity</h2>
      <div className="bg-white border border-resqnow-border-soft rounded-2xl overflow-hidden">
        {reports.map((report, index) => (
          <button
            key={report.id}
            type="button"
            onClick={() => onOpen(report)}
            className={`w-full px-3.5 py-3 flex items-center gap-3 text-left active:bg-resqnow-canvas transition-colors ${
              index > 0 ? 'border-t border-resqnow-border-soft' : ''
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              report.reportType === 'Emergency'
                ? 'bg-resqnow-critical/10 text-resqnow-critical'
                : 'bg-resqnow-violet/10 text-resqnow-violet'
            }`}>
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-extrabold text-resqnow-primary shrink-0">{report.id}</span>
                <span className="text-[11px] text-resqnow-muted truncate">{report.concernType}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 min-w-0">
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getStatusStyle(report.status)}`}>
                  {report.status}
                </span>
                {report.updatedAt && <span className="text-[9px] text-resqnow-muted truncate">{report.updatedAt}</span>}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-resqnow-muted shrink-0" />
          </button>
        ))}
      </div>
    </section>
  );
}

function InlineError({ title, message, onRetry }) {
  return (
    <div role="alert" className="bg-resqnow-critical/10 border border-resqnow-critical/20 rounded-xl px-4 py-3">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-resqnow-critical shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-resqnow-crimson">{title}</p>
          <p className="text-[11px] text-resqnow-secondary mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2.5 min-h-[40px] px-3 rounded-lg border border-resqnow-critical/20 bg-white text-resqnow-crimson text-[10px] font-extrabold flex items-center gap-2"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Try Again
      </button>
    </div>
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
      className={`min-h-[88px] bg-white border ${selected.border} ${selected.hover} rounded-2xl p-3 text-center active:scale-[0.98] transition-all`}
    >
      <Icon className={`w-5 h-5 mx-auto ${selected.icon}`} />
      <p className="text-lg font-extrabold text-resqnow-primary mt-1">{value}</p>
      <p className="text-[11px] text-resqnow-muted mt-0.5">{label}</p>
    </button>
  );
}

function buildReportStateNotice(report) {
  const assignments = Array.isArray(report?.assignedPersonnelList)
    ? report.assignedPersonnelList
    : [];
  const acknowledgedAssignment = assignments.find((assignment) => assignment?.acknowledged);

  let title = report.latestUpdate || 'Report status updated';
  let message = 'Open Track to view the confirmed status and full history.';

  switch (report.status) {
    case 'Submitted':
      title = 'Emergency report received';
      message = 'Barangay Camunatan has received your report. Keep your phone reachable.';
      break;
    case 'Pending Verification':
      title = 'Barangay is reviewing your report';
      message = 'Your report is waiting for verification and response coordination.';
      break;
    case 'Verified':
      title = 'Report verified';
      message = 'Barangay personnel confirmed your report and are coordinating the response.';
      break;
    case 'Assigned':
      title = acknowledgedAssignment ? 'Responder acknowledged your report' : 'Responder assigned';
      message = acknowledgedAssignment
        ? 'Your assigned responder has confirmed the assignment.'
        : 'A responder has been assigned and is awaiting acknowledgement.';
      break;
    case 'In Progress':
      title = 'Response started';
      message = 'The assigned responder has started handling your report.';
      break;
    case 'Responders En Route':
      title = 'Responders are on the way';
      message = 'Responders are traveling to your reported location. Stay in a safe area.';
      break;
    case 'Responded':
      title = 'Responders arrived / response recorded';
      message = 'A responder has recorded arrival or an on-scene response.';
      break;
    default:
      break;
  }

  return {
    kind: 'report',
    reportCode: report.id,
    title,
    message,
  };
}

function formatDistance(distanceMeters, hasSavedLocation) {
  if (distanceMeters === null || distanceMeters === undefined) {
    return hasSavedLocation ? 'Not available' : 'Add home pin for distance';
  }
  if (distanceMeters < 1000) return `${distanceMeters} m`;
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

function getReportTime(report) {
  const value = report?.updatedAtIso || report?.createdAt || report?.updatedAt || report?.submittedAt;
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}
