// src/components/resident/Updates.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Megaphone,
  AlertTriangle,
  FileText,
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

import { formatDate } from '../../utils/dateUtils';

// ============ FILTER TABS ============
const filters = [
  {
    id: 'all',
    label: 'All',
  },
  {
    id: 'alerts',
    label: 'Alerts',
  },
  {
    id: 'announcements',
    label: 'Announcements',
  },
  {
    id: 'reports',
    label: 'My Reports',
  },
];

// ============ REPORT UPDATE STATUS ============
// Get the report status from the update
function getReportUpdateStatus(update) {
  // Use progressStatus first when available
  if (update.progressStatus) {
    return update.progressStatus;
  }

  const text = `
    ${update.status || ''}
    ${update.title || ''}
    ${update.message || ''}
  `.toLowerCase();

  if (
    text.includes(
      'pending verification'
    )
  ) {
    return 'Pending Verification';
  }

  if (
    text.includes(
      'responders en route'
    )
  ) {
    return 'Responders En Route';
  }

  if (
    text.includes(
      'in progress'
    )
  ) {
    return 'In Progress';
  }

  if (
    text.includes(
      'assigned'
    )
  ) {
    return 'Assigned';
  }

  if (
    text.includes(
      'responded'
    )
  ) {
    return 'Responded';
  }

  if (
    text.includes(
      'resolved'
    )
  ) {
    return 'Resolved';
  }

  if (
    text.includes(
      'invalid'
    )
  ) {
    return 'Invalid';
  }

  if (
    text.includes(
      'verified'
    )
  ) {
    return 'Verified';
  }

  if (
    text.includes(
      'submitted'
    )
  ) {
    return 'Submitted';
  }

  return '';
}

// ============ REPORT UPDATE STYLE ============
// Returns semantic colors for report updates
function getReportUpdateStyle(update) {
  // Assigned personnel update
  if (
    update.detailType ===
    'assigned_personnel'
  ) {
    return {
      iconBox:
        'bg-resqnow-insight/15 text-resqnow-insight',

      labelColor:
        'text-resqnow-insight',

      label:
        'Personnel Assigned',
    };
  }

  // Resolution update
  if (
    update.detailType ===
    'resolution'
  ) {
    return {
      iconBox:
        'bg-resqnow-safe/15 text-resqnow-safe',

      labelColor:
        'text-resqnow-safe',

      label:
        'Resolved',
    };
  }

  const status =
    getReportUpdateStatus(update);

  switch (status) {
    case 'Submitted':
      return {
        iconBox:
          'bg-resqnow-info/15 text-resqnow-info',

        labelColor:
          'text-resqnow-info',

        label:
          'Submitted',
      };

    case 'Pending Verification':
      return {
        iconBox:
          'bg-resqnow-pending/15 text-resqnow-pending',

        labelColor:
          'text-resqnow-pending',

        label:
          'Pending Verification',
      };

    case 'Verified':
      return {
        iconBox:
          'bg-resqnow-mint/15 text-resqnow-mint',

        labelColor:
          'text-resqnow-mint',

        label:
          'Verified',
      };

    case 'Assigned':
      return {
        iconBox:
          'bg-resqnow-insight/15 text-resqnow-insight',

        labelColor:
          'text-resqnow-insight',

        label:
          'Assigned',
      };

    case 'In Progress':
      return {
        iconBox:
          'bg-resqnow-insight/15 text-resqnow-insight',

        labelColor:
          'text-resqnow-insight',

        label:
          'In Progress',
      };

    case 'Responders En Route':
      return {
        iconBox:
          'bg-resqnow-violet/15 text-resqnow-violet',

        labelColor:
          'text-resqnow-violet',

        label:
          'Responders En Route',
      };

    case 'Responded':
      return {
        iconBox:
          'bg-resqnow-mint/15 text-resqnow-mint',

        labelColor:
          'text-resqnow-mint',

        label:
          'Responded',
      };

    case 'Resolved':
      return {
        iconBox:
          'bg-resqnow-safe/15 text-resqnow-safe',

        labelColor:
          'text-resqnow-safe',

        label:
          'Resolved',
      };

    case 'Invalid':
      return {
        iconBox:
          'bg-resqnow-crimson/15 text-resqnow-crimson',

        labelColor:
          'text-resqnow-crimson',

        label:
          'Invalid',
      };

    default:
      return {
        iconBox:
          'bg-resqnow-info/10 text-resqnow-info',

        labelColor:
          'text-resqnow-info',

        label:
          'Report Update',
      };
  }
}

// ============ CARD STYLING ============
// Returns icon, colors, and label
function getCardStyle(update) {
  // Critical alert
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
    };
  }

  // Personal report update
  if (
    update.updateCategory ===
    'report'
  ) {
    const reportStyle =
      getReportUpdateStyle(
        update
      );

    return {
      icon: FileText,

      iconBox:
        reportStyle.iconBox,

      label:
        reportStyle.label,

      labelColor:
        reportStyle.labelColor,
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
        'Announcement',

      labelColor:
        'text-resqnow-violet',
    };
  }

  // Other update
  return {
    icon: Bell,

    iconBox:
      'bg-resqnow-info/10 text-resqnow-info',

    label:
      'Update',

    labelColor:
      'text-resqnow-info',
  };
}

// ============ UPDATE CARD ============
// Shared card for active and expired updates
function UpdateCard({
  update,
  onOpen,
}) {
  const style =
    getCardStyle(update);

  const Icon =
    style.icon;

  const expired =
    isUpdateExpired(update);

  return (
    <div
      onClick={() =>
        onOpen(update)
      }
      onKeyDown={(e) => {
        if (
          e.key === 'Enter' ||
          e.key === ' '
        ) {
          e.preventDefault();

          onOpen(update);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${update.title}`}
      className={`rounded-2xl border p-4 cursor-pointer transition-all hover:border-resqnow-violet/30 hover:shadow-[0_4px_14px_rgba(31,29,71,0.06)] active:scale-[0.99] ${
        expired
          ? 'border-resqnow-border-soft bg-resqnow-canvas opacity-70'
          : update.priority ===
            'critical'
          ? 'border-resqnow-critical/20 bg-resqnow-critical/5'
          : 'border-resqnow-border-soft bg-white'
      }`}
    >
      <div className="flex items-start gap-3">

        {/* Update icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.iconBox}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Update details */}
        <div className="flex-1 min-w-0">

          {/* Type + unread + expired */}
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">

            {/* Semantic label */}
            <span
              className={`text-[9px] font-bold uppercase tracking-wide ${style.labelColor}`}
            >
              {style.label}
            </span>

            {/* Unread indicator */}
            {!update.isRead && (
              <span
                className="w-1.5 h-1.5 bg-resqnow-critical rounded-full"
                aria-label="Unread"
              />
            )}

            {/* Expired indicator */}
            {expired && (
              <span className="text-[9px] font-semibold text-resqnow-muted uppercase tracking-wide">
                Expired
              </span>
            )}
          </div>

          {/* Title */}
          <p className="text-[13px] font-semibold text-resqnow-primary leading-snug">
            {update.title}
          </p>

          {/* Message */}
          <p className="text-[12px] text-resqnow-muted mt-1 leading-relaxed">
            {update.message}
          </p>

          {/* Dates */}
          <div className="flex items-center gap-x-3 gap-y-1 mt-2 flex-wrap">

            <span className="text-[10px] text-resqnow-muted">
              {formatDate(
                update.createdAt
              )}
            </span>

            {update.expiresAt && (
              <span className="text-[10px] text-resqnow-muted">
                Until{' '}
                {formatDate(
                  update.expiresAt
                )}
              </span>
            )}
          </div>
        </div>

        {/* Every update can be opened */}
        <ChevronRight className="w-4 h-4 text-resqnow-placeholder shrink-0 mt-1" />
      </div>
    </div>
  );
}

// ============ UPDATES PAGE ============
export default function Updates() {
  const navigate =
    useNavigate();

  const [filter, setFilter] =
    useState('all');

  // Combine announcements and notifications
  const updates =
    getAllUpdates(
      mockAnnouncements,
      mockNotifications
    );

  // ============ FILTER UPDATES ============
  const filteredUpdates =
    updates.filter((update) => {
      if (
        filter === 'all'
      ) {
        return true;
      }

      if (
        filter === 'alerts'
      ) {
        return (
          update.priority ===
            'critical' ||
          update.updateCategory ===
            'alert'
        );
      }

      if (
        filter ===
        'announcements'
      ) {
        return (
          update.updateSource ===
          'announcement'
        );
      }

      if (
        filter === 'reports'
      ) {
        return (
          update.updateCategory ===
          'report'
        );
      }

      return true;
    });

  // ============ ACTIVE / PAST ============
  // Active updates always appear first
  const activeUpdates =
    filteredUpdates.filter(
      (update) =>
        !isUpdateExpired(update)
    );

  // Expired announcements go below
  const pastUpdates =
    filteredUpdates.filter(
      (update) =>
        isUpdateExpired(update)
    );

  // Count unread updates
  const unreadCount =
    updates.filter(
      (update) =>
        !update.isRead
    ).length;

  // ============ OPEN UPDATE ============
  // All updates open their own detail page
  const handleUpdateClick = (
    update
  ) => {
    navigate(
      `/updates/${update.id}`
    );
  };

  const hasUpdates =
    activeUpdates.length > 0 ||
    pastUpdates.length > 0;

  return (
    <div className="px-4 pt-5 pb-28 min-h-screen">

      {/* ============ PAGE HEADER ============ */}
      <div className="mb-4">

        <h1 className="text-xl font-bold text-resqnow-primary">
          Updates
        </h1>

        <p className="text-xs text-resqnow-muted mt-1">
          Barangay announcements, emergency alerts, and your report updates.
        </p>
      </div>

      {/* ============ FILTER PILLS ============ */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {filters.map(
          (item) => {
            const selected =
              filter === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setFilter(
                    item.id
                  )
                }
                className={`shrink-0 min-h-[44px] px-4 py-2 rounded-full text-[12px] font-semibold border active:scale-95 transition-all ${
                  selected
                    ? 'bg-resqnow-violet text-white border-resqnow-violet shadow-[0_4px_12px_rgba(131,70,242,0.18)]'
                    : 'bg-white text-resqnow-muted border-resqnow-border-soft hover:border-resqnow-violet/30 hover:text-resqnow-violet'
                }`}
              >
                {item.label}

                {/* Unread count */}
                {item.id ===
                  'all' &&
                  unreadCount >
                    0 && (
                    <span
                      className={`ml-1.5 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        selected
                          ? 'bg-white/20 text-white'
                          : 'bg-resqnow-critical/10 text-resqnow-critical'
                      }`}
                    >
                      {
                        unreadCount
                      }
                    </span>
                  )}
              </button>
            );
          }
        )}
      </div>

      {/* ============ UPDATES LIST ============ */}
      {hasUpdates ? (
        <div>

          {/* ============ ACTIVE UPDATES ============ */}
          {activeUpdates.length >
            0 && (
            <section>

              <div className="flex items-center gap-3 mb-3">

                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-resqnow-muted">
                  Active Updates
                </p>

                <div className="flex-1 h-px bg-resqnow-border-soft" />

                <span className="text-[10px] font-semibold text-resqnow-violet">
                  {
                    activeUpdates.length
                  }
                </span>
              </div>

              <div className="space-y-2.5">

                {activeUpdates.map(
                  (update) => (
                    <UpdateCard
                      key={
                        update.id
                      }
                      update={
                        update
                      }
                      onOpen={
                        handleUpdateClick
                      }
                    />
                  )
                )}
              </div>
            </section>
          )}

          {/* ============ PAST UPDATES ============ */}
          {pastUpdates.length >
            0 && (
            <section
              className={
                activeUpdates.length >
                0
                  ? 'mt-8'
                  : ''
              }
            >

              <div className="flex items-center gap-3 mb-3">

                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-resqnow-muted">
                  Past Updates
                </p>

                <div className="flex-1 h-px bg-resqnow-border-soft" />

                <span className="text-[10px] font-semibold text-resqnow-muted">
                  {
                    pastUpdates.length
                  }
                </span>
              </div>

              <p className="text-[11px] text-resqnow-muted mb-3 leading-relaxed">
                Expired barangay advisories and announcements are kept here for reference.
              </p>

              <div className="space-y-2.5">

                {pastUpdates.map(
                  (update) => (
                    <UpdateCard
                      key={
                        update.id
                      }
                      update={
                        update
                      }
                      onOpen={
                        handleUpdateClick
                      }
                    />
                  )
                )}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* ============ EMPTY STATE ============ */
        <div className="text-center py-16">

          <div className="w-12 h-12 rounded-full bg-resqnow-canvas flex items-center justify-center mx-auto mb-3">

            <Bell className="w-6 h-6 text-resqnow-placeholder" />
          </div>

          <p className="text-sm font-medium text-resqnow-primary">
            Nothing here yet
          </p>

          <p className="text-[12px] text-resqnow-muted mt-1">
            No{' '}
            {filter === 'all'
              ? 'updates'
              : filter}{' '}
            to show.
          </p>
        </div>
      )}
    </div>
  );
}