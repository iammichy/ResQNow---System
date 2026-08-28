// src/utils/updateUtils.js
// Combines announcements + notifications for display while
// keeping them separate in the data layer (for the future backend).

const priorityScore = {
  critical: 3,
  important: 2,
  normal: 1,
};

function normalizeAnnouncement(announcement) {
  return {
    ...announcement,
    updateSource: 'announcement',
    updateCategory:
      announcement.priority === 'critical' ? 'alert' : 'announcement',
    relatedReportId: null,
  };
}

function normalizeNotification(notification) {
  return {
    ...notification,
    updateSource: 'notification',
    updateCategory:
      notification.type === 'report_update'
        ? 'report'
        : notification.type === 'emergency_alert'
        ? 'alert'
        : 'notification',
  };
}

function sortUpdates(a, b) {
  const priorityDifference =
    priorityScore[b.priority] - priorityScore[a.priority];

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  return new Date(b.createdAt) - new Date(a.createdAt);
}

/* ============================================================
   FULL UPDATES PAGE
   - Keeps announcements, notifications, and report history
   - Nothing is deleted, even expired items
============================================================ */
export function getAllUpdates(announcements, notifications) {
  const combined = [
    ...announcements.map(normalizeAnnouncement),
    ...notifications.map(normalizeNotification),
  ];

  return combined.sort(sortUpdates);
}

/* ============================================================
   HOME DASHBOARD
   1. Remove expired content
   2. Highest priority first
   3. Newest first within same priority
   4. Only latest notification per report (dedup)
   5. Maximum of 3 items
============================================================ */
export function getDashboardUpdates(announcements, notifications) {
  const now = new Date();

  let combined = [
    ...announcements.map(normalizeAnnouncement),
    ...notifications.map(normalizeNotification),
  ];

  // Remove expired items from Home
  combined = combined.filter((item) => {
    if (!item.expiresAt) {
      return true;
    }
    return new Date(item.expiresAt) > now;
  });

  // Sort first
  combined.sort(sortUpdates);

  // Only latest notification per report
  const seenReports = new Set();

  combined = combined.filter((item) => {
    if (!item.relatedReportId) {
      return true;
    }
    if (seenReports.has(item.relatedReportId)) {
      return false;
    }
    seenReports.add(item.relatedReportId);
    return true;
  });

  // Home maximum
  return combined.slice(0, 3);
}

/* ============================================================
   EXPIRED CHECK
============================================================ */
export function isUpdateExpired(update) {
  if (!update.expiresAt) {
    return false;
  }
  return new Date(update.expiresAt) <= new Date();
}
