// src/components/resident/Dashboard.jsx
import { useNavigate } from 'react-router-dom';
import {
  Siren,
  FileText,
  ChevronRight,
  Megaphone,
  Bell,
  AlertTriangle,
  MapPin,
  Clock,
  Phone,
  Activity,
  CheckCircle2,
  ShieldCheck,
  Backpack,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import {
  mockAllReports,
  mockAnnouncements,
  mockNotifications,
  safetyTips,
} from '../../data/mockData';

import { getAllUpdates, isUpdateExpired } from '../../utils/updateUtils';

// ============ HELPERS ============
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getStatusStyle(status) {
  switch (status) {
    case 'Resolved':
      return 'bg-green-100 text-green-700';
    case 'In Progress':
    case 'Responded':
    case 'Responders En Route':
      return 'bg-orange-100 text-orange-700';
    case 'Pending Verification':
      return 'bg-blue-100 text-blue-700';
    case 'Verified':
      return 'bg-teal-100 text-teal-700';
    case 'Invalid':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const priorityScore = {
  critical: 3,
  important: 2,
  normal: 1,
};

// ============ DASHBOARD ============
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = (user?.fullName || 'Resident').split(' ')[0];

  // Keep current report order for now
  const latestReport = mockAllReports[0];
  const recentReports = mockAllReports.slice(0, 3);

  // ===== REPORT COUNTS =====
  const pendingCount = mockAllReports.filter(
    (report) => report.status === 'Pending Verification'
  ).length;

  const resolvedCount = mockAllReports.filter(
    (report) => report.status === 'Resolved'
  ).length;

  const activeCount = mockAllReports.filter(
    (report) =>
      !['Pending Verification', 'Resolved', 'Invalid'].includes(report.status)
  ).length;

  // ===== IMPORTANT UPDATES =====
  const activeUpdates = getAllUpdates(mockAnnouncements, mockNotifications)
    .filter((update) => !isUpdateExpired(update))
    .sort((a, b) => {
      const priorityDiff =
        (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);

      if (priorityDiff !== 0) return priorityDiff;

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // Prevent multiple updates from the same report from filling the Top 3
  const seenReports = new Set();

  const dashboardUpdates = activeUpdates
    .filter((update) => {
      if (!update.relatedReportId) return true;
      if (seenReports.has(update.relatedReportId)) return false;

      seenReports.add(update.relatedReportId);
      return true;
    })
    .slice(0, 3);

  const unreadCount = activeUpdates.filter((update) => !update.isRead).length;

  // ===== SAFETY PREVIEW =====
  const activeCritical = mockAnnouncements.find(
    (announcement) =>
      announcement.priority === 'critical' &&
      (!announcement.expiresAt || new Date(announcement.expiresAt) > new Date())
  );

  const safetyGuideId = activeCritical?.safetyGuideId || 'flood';
  const allSafetyTips = safetyTips.flatMap((group) => group.items);

  const featuredSafety =
    allSafetyTips.find((item) => item.id === safetyGuideId) ||
    allSafetyTips.find((item) => item.id === 'flood');

  const safetyTitle =
    featuredSafety?.id === 'flood'
      ? 'Flood Safety'
      : featuredSafety?.title || 'Safety Preparedness';

  const safetyPreview = featuredSafety?.tips?.slice(0, 3) || [];

  const handleUpdateClick = (update) => {
    if (update.relatedReportId) {
      navigate(`/track/${update.relatedReportId}`);
      return;
    }

    navigate('/updates');
  };

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 bg-slate-50">

      {/* ============ GREETING ============ */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{getGreeting()},</p>
          <h1 className="text-xl font-bold text-slate-900">{firstName} 👋</h1>
        </div>

        {/* KEEP: Emergency Contacts Shortcut */}
        <button
          type="button"
          aria-label="Emergency Contacts"
          title="Emergency Contacts"
          onClick={() => navigate('/contacts')}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all"
        >
          <Phone className="w-5 h-5" />
        </button>
      </div>

      {/* ============ IMPORTANT UPDATES ============ */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3.5 flex items-center justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Important Updates</h2>

                {unreadCount > 0 && (
                  <span className="min-w-5 h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>

              <p className="text-[10px] text-slate-400 mt-0.5">
                Alerts, announcements and report updates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/updates')}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
          >
            View all
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {dashboardUpdates.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {dashboardUpdates.map((update) => {
              const isCritical = update.priority === 'critical';
              const isReport = update.updateCategory === 'report';
              const isAnnouncement = update.updateSource === 'announcement';

              return (
                <button
                  key={update.id}
                  type="button"
                  onClick={() => handleUpdateClick(update)}
                  className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors ${
                    isCritical
                      ? 'bg-red-50 hover:bg-red-100'
                      : update.priority === 'important'
                      ? 'bg-blue-50/70 hover:bg-blue-50'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCritical
                        ? 'bg-red-100 text-red-600'
                        : isReport
                        ? 'bg-teal-50 text-teal-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {isCritical ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : isReport ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <Megaphone className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wide ${
                          isCritical
                            ? 'text-red-600'
                            : isReport
                            ? 'text-teal-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {isCritical
                          ? 'Critical Alert'
                          : isReport
                          ? 'Report Update'
                          : isAnnouncement
                          ? 'Announcement'
                          : 'Update'}
                      </span>

                      {!update.isRead && (
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      )}
                    </div>

                    <p
                      className={`text-[13px] font-semibold leading-snug ${
                        isCritical ? 'text-red-900' : 'text-slate-900'
                      }`}
                    >
                      {update.title}
                    </p>

                    <p
                      className={`text-[11px] mt-1 leading-relaxed line-clamp-2 ${
                        isCritical ? 'text-red-700' : 'text-slate-500'
                      }`}
                    >
                      {update.message}
                    </p>

                    <p className="text-[9px] text-slate-400 mt-2">
                      {formatDate(update.createdAt)}
                    </p>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 mt-3 shrink-0 ${
                      isCritical ? 'text-red-300' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-6 text-center">
            <Bell className="w-7 h-7 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-600 mt-2">No active updates</p>
            <p className="text-[10px] text-slate-400 mt-1">You're all caught up.</p>
          </div>
        )}
      </section>

      {/* ============ MY REPORTS ============ */}
      <section>
        <div className="flex items-center justify-between px-1 mb-2">
          <h2 className="text-sm font-bold text-slate-900">My Reports</h2>

          <button
            type="button"
            onClick={() => navigate('/track')}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatCard
            icon={Activity}
            value={activeCount}
            label="Active"
            iconColor="text-blue-500"
            borderColor="border-blue-100"
            onClick={() => navigate('/track')}
          />

          <StatCard
            icon={Clock}
            value={pendingCount}
            label="Pending"
            iconColor="text-amber-500"
            borderColor="border-amber-100"
            onClick={() => navigate('/track')}
          />

          <StatCard
            icon={CheckCircle2}
            value={resolvedCount}
            label="Resolved"
            iconColor="text-green-500"
            borderColor="border-green-100"
            onClick={() => navigate('/track')}
          />
        </div>
      </section>

      {/* ============ LATEST REPORT ============ */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-600 to-teal-500" />

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">Latest Report</h2>

            <button
              type="button"
              onClick={() => navigate('/track')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {latestReport ? (
            <button
              type="button"
              onClick={() => navigate(`/track/${latestReport.id}`)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">{latestReport.id}</span>

                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    latestReport.reportType === 'Emergency'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {latestReport.reportType}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-800">
                {latestReport.concernType}
              </p>

              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                {latestReport.location}
              </div>

              {latestReport.latestUpdate && (
                <div className="mt-3 bg-slate-50 rounded-xl px-3 py-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Latest Update
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {latestReport.latestUpdate}
                  </p>
                </div>
              )}

              <div className="mt-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full ${getStatusStyle(
                      latestReport.status
                    )}`}
                  >
                    {latestReport.status}
                  </span>

                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {latestReport.updatedAt}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {latestReport.timeline.map((step) => (
                    <div
                      key={step.status}
                      title={step.status}
                      className={`h-1.5 flex-1 rounded-full ${
                        step.done ? 'bg-teal-500' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </button>
          ) : (
            <div className="py-5 text-center">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">You have no reports yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ============ RECENT REPORTS ============ */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">Recent Reports</h2>

          <button
            type="button"
            onClick={() => navigate('/track')}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
          >
            View all
          </button>
        </div>

        {recentReports.length > 0 ? (
          <div className="space-y-2">
            {recentReports.map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() => navigate(`/track/${report.id}`)}
                className="w-full flex items-center gap-3 text-left hover:bg-slate-50 rounded-xl p-2 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    report.reportType === 'Emergency' ? 'bg-red-50' : 'bg-blue-50'
                  }`}
                >
                  {report.reportType === 'Emergency' ? (
                    <Siren className="w-5 h-5 text-red-500" />
                  ) : (
                    <FileText className="w-5 h-5 text-blue-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-800 truncate">
                    {report.concernType}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {report.id} · {report.submittedAt}
                  </p>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-1 rounded-full shrink-0 ${getStatusStyle(
                    report.status
                  )}`}
                >
                  {report.status}
                </span>

                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No recent reports.</p>
        )}
      </section>

      {/* ============ SAFETY & PREPAREDNESS ============ */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3.5 flex items-center gap-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">Safety & Preparedness</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Quick guidance for emergencies and community concerns
            </p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-50/70 to-teal-50/50">
          <span className="inline-flex px-2 py-1 rounded-full bg-blue-100 text-blue-600 text-[9px] font-bold uppercase tracking-wide">
            Featured Guide
          </span>

          <h3 className="text-sm font-bold text-slate-900 mt-2">{safetyTitle}</h3>

          <div className="mt-3 space-y-2">
            {safetyPreview.map((tip) => (
              <SafetyTip key={tip}>{tip}</SafetyTip>
            ))}
          </div>

          <div className="mt-4 bg-white/80 border border-blue-100 rounded-xl p-3 flex items-start gap-3">
            <Backpack className="w-5 h-5 text-blue-600 shrink-0" />

            <div>
              <p className="text-xs font-semibold text-slate-800">Emergency Go-Bag</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Prepare water, ready-to-eat food, medicines, first-aid supplies,
                important documents, flashlight, power bank, clothing, and other essentials.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/safety-tips')}
            className="w-full mt-4 py-2.5 rounded-xl bg-white/80 border border-blue-200 text-xs font-semibold text-blue-600 flex items-center justify-center gap-1 hover:bg-white transition-colors"
          >
            View Complete Safety Guide
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

// ============ SMALL COMPONENTS ============
function StatCard({ icon: Icon, value, label, iconColor, borderColor, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-white border ${borderColor} rounded-2xl p-3 text-center hover:bg-slate-50 transition-colors`}
    >
      <Icon className={`w-5 h-5 mx-auto ${iconColor}`} />
      <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </button>
  );
}

function SafetyTip({ children }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-1.5 shrink-0" />
      <p className="text-[11px] text-slate-600 leading-relaxed">{children}</p>
    </div>
  );
}