// src/components/resident/UpdateDetail.jsx
import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  ArrowLeft,
  Megaphone,
  AlertTriangle,
  FileText,
  Bell,
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';

import {
  mockAnnouncements,
  mockNotifications,
  mockAllReports,
} from '../../data/mockData';

import {
  getAllUpdates,
  isUpdateExpired,
} from '../../utils/updateUtils';

import {
  formatDate,
} from '../../utils/dateUtils';

// ============ UPDATE STYLE ============
// Style based on update type
function getDetailStyle(update) {
  // Critical barangay alert
  if (
    update.priority ===
    'critical'
  ) {
    return {
      icon: AlertTriangle,

      iconBox:
        'bg-resqnow-critical/15 text-resqnow-critical',

      label:
        'Critical Alert',

      labelColor:
        'text-resqnow-critical',

      border:
        'border-resqnow-critical/20',

      accent:
        'bg-emergency-gradient',
    };
  }

  // Report update
  if (
    update.updateCategory ===
    'report'
  ) {
    return {
      icon: FileText,

      iconBox:
        'bg-resqnow-violet/10 text-resqnow-violet',

      label:
        'Report Update',

      labelColor:
        'text-resqnow-violet',

      border:
        'border-resqnow-violet/20',

      accent:
        'bg-brand-gradient',
    };
  }

  // Barangay announcement
  if (
    update.updateSource ===
    'announcement'
  ) {
    return {
      icon: Megaphone,

      iconBox:
        'bg-resqnow-violet/10 text-resqnow-violet',

      label:
        'Barangay Announcement',

      labelColor:
        'text-resqnow-violet',

      border:
        'border-resqnow-violet/20',

      accent:
        'bg-brand-gradient',
    };
  }

  return {
    icon: Bell,

    iconBox:
      'bg-resqnow-info/10 text-resqnow-info',

    label:
      'Update',

    labelColor:
      'text-resqnow-info',

    border:
      'border-resqnow-info/20',

    accent:
      'bg-resqnow-info',
  };
}

// ============ REPORT STATUS STYLE ============
function getProgressStyle(status) {
  switch (status) {
    case 'Submitted':
      return {
        dot:
          'bg-resqnow-info',

        line:
          'bg-resqnow-info/25',
      };

    case 'Pending Verification':
      return {
        dot:
          'bg-resqnow-pending',

        line:
          'bg-resqnow-pending/25',
      };

    case 'Verified':
      return {
        dot:
          'bg-resqnow-mint',

        line:
          'bg-resqnow-mint/25',
      };

    case 'Assigned':
    case 'In Progress':
      return {
        dot:
          'bg-resqnow-insight',

        line:
          'bg-resqnow-insight/25',
      };

    case 'Responders En Route':
      return {
        dot:
          'bg-resqnow-violet',

        line:
          'bg-resqnow-violet/25',
      };

    case 'Responded':
    case 'Resolved':
      return {
        dot:
          'bg-resqnow-safe',

        line:
          'bg-resqnow-safe/25',
      };

    case 'Invalid':
      return {
        dot:
          'bg-resqnow-crimson',

        line:
          'bg-resqnow-crimson/25',
      };

    default:
      return {
        dot:
          'bg-resqnow-violet',

        line:
          'bg-resqnow-violet/20',
      };
  }
}

// ============ UPDATE DETAIL ============
export default function UpdateDetail() {
  const navigate =
    useNavigate();

  const {
    updateId,
  } = useParams();

  // Get selected update
  const update =
    getAllUpdates(
      mockAnnouncements,
      mockNotifications
    ).find(
      (item) =>
        item.id === updateId
    );

  // ============ NOT FOUND ============
  if (!update) {
    return (
      <div className="px-4 pt-4 pb-28 min-h-screen">

        <button
          type="button"
          onClick={() =>
            navigate('/updates')
          }
          className="min-h-[40px] flex items-center gap-1.5 text-[11px] font-semibold text-resqnow-violet"
        >
          <ArrowLeft className="w-4 h-4" />

          Back to Updates
        </button>

        <div className="mt-8 bg-white border border-resqnow-border-soft rounded-2xl p-6 text-center">

          <Bell className="w-9 h-9 text-resqnow-placeholder mx-auto" />

          <p className="text-sm font-bold text-resqnow-primary mt-3">
            Update not found
          </p>

          <p className="text-[11px] text-resqnow-muted mt-1">
            This announcement or update is no longer available.
          </p>
        </div>
      </div>
    );
  }

  const style =
    getDetailStyle(update);

  const Icon =
    style.icon;

  const expired =
    isUpdateExpired(update);

  // Find report connected to notification
  const report =
    update.relatedReportId
      ? mockAllReports.find(
          (item) =>
            item.id ===
            update.relatedReportId
        )
      : null;

  // Determine what kind of detail page
  const isReportUpdate =
    update.updateCategory ===
    'report';

  const isAnnouncement =
    update.updateSource ===
    'announcement';

  // ============ PROGRESS STEPS ============
  // Only show progress up to the update that
  // the resident actually clicked.
  const getVisibleProgress = () => {
    if (
      !report ||
      !Array.isArray(
        report.timeline
      )
    ) {
      return [];
    }

    const targetStatus =
      update.progressStatus;

    // If no specific target status exists,
    // show completed steps only.
    if (!targetStatus) {
      return report.timeline.filter(
        (step) =>
          step.done
      );
    }

    const targetIndex =
      report.timeline.findIndex(
        (step) =>
          step.status ===
          targetStatus
      );

    if (
      targetIndex === -1
    ) {
      return report.timeline.filter(
        (step) =>
          step.done
      );
    }

    return report.timeline
      .slice(
        0,
        targetIndex + 1
      )
      .filter(
        (step) =>
          step.done ||
          step.status ===
            targetStatus
      );
  };

  const visibleProgress =
    getVisibleProgress();

  return (
    <div className="px-4 pt-4 pb-28 min-h-screen">

      {/* ============ BACK TO UPDATES ============ */}
      <button
        type="button"
        onClick={() =>
          navigate('/updates')
        }
        className="min-h-[40px] flex items-center gap-1.5 text-[11px] font-semibold text-resqnow-violet mb-2"
      >
        <ArrowLeft className="w-4 h-4" />

        Back to Updates
      </button>

      {/* ============ UPDATE HEADER ============ */}
      <article
        className={`bg-white border ${style.border} rounded-2xl overflow-hidden`}
      >

        {/* Top accent */}
        <div
          className={`h-1 ${style.accent}`}
        />

        <div className="p-4">

          <div className="flex items-start gap-3">

            {/* Icon */}
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${style.iconBox}`}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Heading */}
            <div className="flex-1 min-w-0">

              <div className="flex items-center gap-2 flex-wrap">

                <span
                  className={`text-[9px] font-bold uppercase tracking-wide ${style.labelColor}`}
                >
                  {style.label}
                </span>

                {!update.isRead &&
                  !expired && (
                    <span
                      className="w-1.5 h-1.5 bg-resqnow-critical rounded-full"
                      aria-label="Unread"
                    />
                  )}

                {expired && (
                  <span className="text-[9px] font-bold uppercase tracking-wide text-resqnow-muted bg-resqnow-canvas px-2 py-0.5 rounded-full">
                    Past Update
                  </span>
                )}
              </div>

              <h1 className="text-[18px] font-bold text-resqnow-primary mt-1.5 leading-snug">
                {update.title}
              </h1>

              {/* Report reference */}
              {report && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">

                  <span className="text-[10px] font-bold text-resqnow-violet">
                    {report.id}
                  </span>

                  <span className="text-[10px] text-resqnow-border">
                    •
                  </span>

                  <span className="text-[10px] text-resqnow-muted">
                    {
                      report.concernType
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Short notification message */}
          {isReportUpdate && (
            <div className="mt-4 bg-resqnow-canvas rounded-xl p-3">

              <p className="text-[12px] text-resqnow-secondary leading-relaxed">
                {update.message}
              </p>
            </div>
          )}
        </div>
      </article>

      {/* ================================================== */}
      {/* ANNOUNCEMENT DETAIL */}
      {/* ================================================== */}
      {isAnnouncement && (
        <>
          {/* ============ DETAILS ============ */}
          <section className="mt-3 bg-white border border-resqnow-border-soft rounded-2xl p-4">

            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-resqnow-muted mb-2">
              Details
            </p>

            <p className="text-[13px] text-resqnow-secondary leading-6 whitespace-pre-line">
              {update.details ||
                update.message}
            </p>
          </section>

          {/* ============ EVENT INFORMATION ============ */}
          {(update.location ||
            update.eventStartAt ||
            update.eventEndAt ||
            update.postedBy) && (
            <section className="mt-3 bg-white border border-resqnow-border-soft rounded-2xl p-4">

              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-resqnow-muted mb-4">
                Information
              </p>

              <div className="space-y-4">

                {/* Location */}
                {update.location && (
                  <div className="flex items-start gap-3">

                    <div className="w-9 h-9 rounded-xl bg-resqnow-violet/10 text-resqnow-violet flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">

                      <p className="text-[9px] font-bold uppercase tracking-wide text-resqnow-muted">
                        Location
                      </p>

                      <p className="text-[12px] font-semibold text-resqnow-primary mt-0.5 leading-relaxed">
                        {
                          update.location
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Event start */}
                {update.eventStartAt && (
                  <div className="flex items-start gap-3">

                    <div className="w-9 h-9 rounded-xl bg-resqnow-info/10 text-resqnow-info flex items-center justify-center shrink-0">
                      <CalendarDays className="w-4 h-4" />
                    </div>

                    <div>

                      <p className="text-[9px] font-bold uppercase tracking-wide text-resqnow-muted">
                        Event Starts
                      </p>

                      <p className="text-[12px] font-semibold text-resqnow-primary mt-0.5">
                        {formatDate(
                          update.eventStartAt
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Event end */}
                {update.eventEndAt && (
                  <div className="flex items-start gap-3">

                    <div className="w-9 h-9 rounded-xl bg-resqnow-pending/10 text-resqnow-pending flex items-center justify-center shrink-0">
                      <Clock3 className="w-4 h-4" />
                    </div>

                    <div>

                      <p className="text-[9px] font-bold uppercase tracking-wide text-resqnow-muted">
                        Event Ends
                      </p>

                      <p className="text-[12px] font-semibold text-resqnow-primary mt-0.5">
                        {formatDate(
                          update.eventEndAt
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Posted by */}
                {update.postedBy && (
                  <div className="flex items-start gap-3">

                    <div className="w-9 h-9 rounded-xl bg-resqnow-mint/10 text-resqnow-mint flex items-center justify-center shrink-0">
                      <UserRound className="w-4 h-4" />
                    </div>

                    <div>

                      <p className="text-[9px] font-bold uppercase tracking-wide text-resqnow-muted">
                        Posted By
                      </p>

                      <p className="text-[12px] font-semibold text-resqnow-primary mt-0.5">
                        {
                          update.postedBy
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ============ POST INFORMATION ============ */}
          <section className="mt-3 bg-white border border-resqnow-border-soft rounded-2xl p-4">

            <div className="space-y-4">

              {/* Posted date */}
              <div className="flex items-start gap-3">

                <div className="w-9 h-9 rounded-xl bg-resqnow-info/10 text-resqnow-info flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4 h-4" />
                </div>

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-wide text-resqnow-muted">
                    Posted
                  </p>

                  <p className="text-[12px] font-semibold text-resqnow-primary mt-0.5">
                    {formatDate(
                      update.createdAt
                    )}
                  </p>
                </div>
              </div>

              {/* Expiration */}
              {update.expiresAt && (
                <div className="flex items-start gap-3">

                  <div className="w-9 h-9 rounded-xl bg-resqnow-pending/10 text-resqnow-pending flex items-center justify-center shrink-0">
                    <Clock3 className="w-4 h-4" />
                  </div>

                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-wide text-resqnow-muted">
                      {expired
                        ? 'Expired'
                        : 'Valid Until'}
                    </p>

                    <p className="text-[12px] font-semibold text-resqnow-primary mt-0.5">
                      {formatDate(
                        update.expiresAt
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ============ SAFETY GUIDE ============ */}
          {update.safetyGuideId && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  '/safety-tips'
                )
              }
              className="w-full mt-3 min-h-[48px] rounded-xl border border-resqnow-info/20 bg-resqnow-info/5 text-resqnow-info flex items-center justify-center gap-2 text-[11px] font-bold active:scale-[0.98] transition-all"
            >
              <ShieldCheck className="w-4 h-4" />

              Read Related Safety Tips
            </button>
          )}
        </>
      )}

      {/* ================================================== */}
      {/* REPORT PROGRESS UPDATE */}
      {/* ================================================== */}
      {isReportUpdate &&
        update.detailType ===
          'report_progress' && (
          <section className="mt-3 bg-white border border-resqnow-border-soft rounded-2xl p-4">

            <div className="flex items-center gap-2 mb-5">

              <div className="w-9 h-9 rounded-xl bg-resqnow-violet/10 text-resqnow-violet flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-resqnow-muted">
                  Report Progress
                </p>

                <p className="text-[11px] text-resqnow-muted mt-0.5">
                  Progress at the time of this update
                </p>
              </div>
            </div>

            {report &&
            visibleProgress.length >
              0 ? (
              <div>

                {visibleProgress.map(
                  (
                    step,
                    index
                  ) => {
                    const stepStyle =
                      getProgressStyle(
                        step.status
                      );

                    const isLast =
                      index ===
                      visibleProgress.length -
                        1;

                    return (
                      <div
                        key={`${step.status}-${index}`}
                        className="relative flex gap-3"
                      >

                        {/* Progress line */}
                        {!isLast && (
                          <div
                            className={`absolute left-[14px] top-7 bottom-0 w-[2px] ${stepStyle.line}`}
                          />
                        )}

                        {/* Status dot */}
                        <div
                          className={`relative z-10 w-7 h-7 rounded-full ${stepStyle.dot} flex items-center justify-center shrink-0`}
                        >
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>

                        {/* Status information */}
                        <div
                          className={
                            isLast
                              ? 'pb-1'
                              : 'pb-6'
                          }
                        >
                          <p className="text-[12px] font-semibold text-resqnow-primary">
                            {
                              step.status
                            }
                          </p>

                          {step.date && (
                            <p className="text-[10px] text-resqnow-muted mt-1">
                              {
                                step.date
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <p className="text-[12px] text-resqnow-muted">
                Report progress information is not available.
              </p>
            )}
          </section>
        )}

      {/* ================================================== */}
      {/* ASSIGNED PERSONNEL UPDATE */}
      {/* ================================================== */}
      {isReportUpdate &&
        update.detailType ===
          'assigned_personnel' && (
          <section className="mt-3 bg-white border border-resqnow-border-soft rounded-2xl p-4">

            <div className="flex items-center gap-2 mb-4">

              <div className="w-9 h-9 rounded-xl bg-resqnow-insight/10 text-resqnow-insight flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-resqnow-muted">
                  Assigned Personnel
                </p>

                <p className="text-[11px] text-resqnow-muted mt-0.5">
                  Personnel assigned to this report
                </p>
              </div>
            </div>

            {report?.assignedPersonnel ? (
              <div className="rounded-xl bg-resqnow-insight/5 border border-resqnow-insight/15 p-4">

                <p className="text-[13px] font-bold text-resqnow-primary">
                  {
                    report.assignedPersonnel
                  }
                </p>

                <p className="text-[11px] text-resqnow-muted mt-1">
                  Assigned to report{' '}
                  <span className="font-semibold text-resqnow-insight">
                    {report.id}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-[12px] text-resqnow-muted">
                No personnel assignment information is available.
              </p>
            )}
          </section>
        )}

      {/* ================================================== */}
      {/* RESOLUTION UPDATE */}
      {/* ================================================== */}
      {isReportUpdate &&
        update.detailType ===
          'resolution' && (
          <section className="mt-3 bg-white border border-resqnow-safe/20 rounded-2xl p-4">

            <div className="flex items-center gap-2 mb-4">

              <div className="w-9 h-9 rounded-xl bg-resqnow-safe/10 text-resqnow-safe flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-resqnow-safe">
                  Resolution
                </p>

                <p className="text-[11px] text-resqnow-muted mt-0.5">
                  Final outcome of this report
                </p>
              </div>
            </div>

            {/* Resolved status */}
            <div className="flex items-center justify-between gap-3 bg-resqnow-safe/5 border border-resqnow-safe/15 rounded-xl p-3">

              <span className="text-[11px] text-resqnow-muted">
                Status
              </span>

              <span className="text-[10px] font-bold text-resqnow-safe bg-resqnow-safe/10 px-2.5 py-1 rounded-full">
                Resolved
              </span>
            </div>

            {/* Resolution remarks */}
            <div className="mt-4">

              <p className="text-[10px] font-bold uppercase tracking-wide text-resqnow-muted mb-2">
                Resolution Remarks
              </p>

              <p className="text-[13px] text-resqnow-secondary leading-6">
                {report?.resolvedRemarks ||
                  update.message}
              </p>
            </div>

            {report?.updatedAt && (
              <div className="mt-4 pt-3 border-t border-resqnow-border-soft">

                <p className="text-[10px] text-resqnow-muted">
                  Resolved / updated{' '}
                  <span className="font-semibold text-resqnow-primary">
                    {
                      report.updatedAt
                    }
                  </span>
                </p>
              </div>
            )}
          </section>
        )}

      {/* ================================================== */}
      {/* FALLBACK REPORT UPDATE */}
      {/* ================================================== */}
      {isReportUpdate &&
        ![
          'report_progress',
          'assigned_personnel',
          'resolution',
        ].includes(
          update.detailType
        ) && (
          <section className="mt-3 bg-white border border-resqnow-border-soft rounded-2xl p-4">

            <p className="text-[10px] font-bold uppercase tracking-wide text-resqnow-muted mb-2">
              Update Details
            </p>

            <p className="text-[13px] text-resqnow-secondary leading-6">
              {update.message}
            </p>
          </section>
        )}
    </div>
  );
}