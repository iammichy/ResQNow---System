// src/components/resident/UpdateDetail.jsx
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Megaphone,
  AlertTriangle,
  FileText,
  Bell,
  CalendarDays,
  Clock3,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

import {
  mockAnnouncements,
  mockNotifications,
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
  if (
    update.priority ===
    'critical'
  ) {
    return {
      icon:
        AlertTriangle,

      iconBox:
        'bg-resqnow-critical/15 text-resqnow-critical',

      label:
        'Critical Alert',

      labelColor:
        'text-resqnow-critical',

      border:
        'border-resqnow-critical/20',
    };
  }

  if (
    update.updateCategory ===
    'report'
  ) {
    return {
      icon:
        FileText,

      iconBox:
        'bg-resqnow-violet/10 text-resqnow-violet',

      label:
        'Report Update',

      labelColor:
        'text-resqnow-violet',

      border:
        'border-resqnow-violet/20',
    };
  }

  if (
    update.updateSource ===
    'announcement'
  ) {
    return {
      icon:
        Megaphone,

      iconBox:
        'bg-resqnow-violet/10 text-resqnow-violet',

      label:
        'Barangay Announcement',

      labelColor:
        'text-resqnow-violet',

      border:
        'border-resqnow-violet/20',
    };
  }

  return {
    icon:
      Bell,

    iconBox:
      'bg-resqnow-info/10 text-resqnow-info',

    label:
      'Update',

    labelColor:
      'text-resqnow-info',

    border:
      'border-resqnow-info/20',
  };
}

// ============ UPDATE DETAIL ============
// Full announcement or update information
export default function UpdateDetail() {
  const navigate =
    useNavigate();

  const {
    updateId,
  } = useParams();

  // Find selected update
  const update =
    getAllUpdates(
      mockAnnouncements,
      mockNotifications
    ).find(
      (item) =>
        item.id ===
        updateId
    );

  // Not found
  if (!update) {
    return (
      <div className="px-4 pt-5 pb-28 min-h-screen">

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

        <div className="mt-10 bg-white border border-resqnow-border-soft rounded-2xl p-6 text-center">

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
    getDetailStyle(
      update
    );

  const Icon =
    style.icon;

  const expired =
    isUpdateExpired(
      update
    );

  return (
    <div className="px-4 pt-4 pb-28 min-h-screen">

      {/* ============ BACK ============ */}
      <button
        type="button"
        onClick={() =>
          navigate(-1)
        }
        className="min-h-[40px] flex items-center gap-1.5 text-[11px] font-semibold text-resqnow-violet mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* ============ DETAIL CARD ============ */}
      <article
        className={`bg-white border ${style.border} rounded-2xl overflow-hidden`}
      >
        {/* Top accent */}
        <div
          className={`h-1 ${
            update.priority ===
            'critical'
              ? 'bg-emergency-gradient'
              : 'bg-brand-gradient'
          }`}
        />

        <div className="p-4">

          {/* Type */}
          <div className="flex items-start gap-3">

            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${style.iconBox}`}
            >
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">

              <div className="flex items-center gap-2 flex-wrap">

                <span
                  className={`text-[9px] font-bold uppercase tracking-wide ${style.labelColor}`}
                >
                  {style.label}
                </span>

                {!update.isRead &&
                  !expired && (
                    <span className="w-1.5 h-1.5 bg-resqnow-critical rounded-full" />
                  )}

                {expired && (
                  <span className="text-[9px] font-bold uppercase tracking-wide text-resqnow-muted bg-resqnow-canvas px-2 py-0.5 rounded-full">
                    Past Update
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-[18px] font-bold text-resqnow-primary mt-1.5 leading-snug">
                {update.title}
              </h1>
            </div>
          </div>

          {/* ============ FULL MESSAGE ============ */}
          <div className="mt-5">

            <p className="text-[10px] font-bold uppercase tracking-wide text-resqnow-muted mb-2">
              Details
            </p>

            <p className="text-[13px] text-resqnow-secondary leading-6 whitespace-pre-line">
              {update.details ||
                update.message}
            </p>
          </div>

          {/* ============ DATE INFORMATION ============ */}
          <div className="mt-5 pt-4 border-t border-resqnow-border-soft space-y-3">

            {/* Posted */}
            <div className="flex items-start gap-3">

              <div className="w-8 h-8 rounded-lg bg-resqnow-info/10 text-resqnow-info flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4" />
              </div>

              <div>
                <p className="text-[9px] font-bold text-resqnow-muted uppercase tracking-wide">
                  Posted
                </p>

                <p className="text-[11px] font-semibold text-resqnow-primary mt-0.5">
                  {formatDate(
                    update.createdAt
                  )}
                </p>
              </div>
            </div>

            {/* Expiration */}
            {update.expiresAt && (
              <div className="flex items-start gap-3">

                <div className="w-8 h-8 rounded-lg bg-resqnow-pending/10 text-resqnow-pending flex items-center justify-center shrink-0">
                  <Clock3 className="w-4 h-4" />
                </div>

                <div>
                  <p className="text-[9px] font-bold text-resqnow-muted uppercase tracking-wide">
                    {expired
                      ? 'Expired'
                      : 'Valid Until'}
                  </p>

                  <p className="text-[11px] font-semibold text-resqnow-primary mt-0.5">
                    {formatDate(
                      update.expiresAt
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* ============ RELATED REPORT ============ */}
      {update.relatedReportId && (
        <button
          type="button"
          onClick={() =>
            navigate(
              `/track/${update.relatedReportId}`
            )
          }
          className="w-full mt-3 min-h-[48px] rounded-xl bg-resqnow-violet text-white flex items-center justify-center gap-2 text-[11px] font-bold active:scale-[0.98] transition-all"
        >
          <FileText className="w-4 h-4" />
          View Related Report
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

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
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}