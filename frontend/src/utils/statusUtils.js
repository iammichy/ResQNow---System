// src/utils/statusUtils.js

// ============ STATUS STYLES ============
// Returns Tailwind classes for a report's status badge
// Used by Dashboard, TrackReports, and ReportDetail
function getStatusStyle(status) {
  switch (status) {
    case 'Submitted':
      return 'bg-resqnow-info/15 text-resqnow-info';

    case 'Pending Verification':
      return 'bg-resqnow-pending/15 text-resqnow-pending';

    case 'Verified':
      return 'bg-resqnow-mint/15 text-resqnow-mint';

    case 'Assigned':
    case 'In Progress':
      return 'bg-resqnow-insight/15 text-resqnow-insight';

    case 'Responders En Route':
      return 'bg-resqnow-violet/15 text-resqnow-violet';

    case 'Responded':
      return 'bg-resqnow-mint/15 text-resqnow-mint';

    case 'Resolved':
      return 'bg-resqnow-safe/15 text-resqnow-safe';

    case 'Invalid':
      return 'bg-resqnow-crimson/15 text-resqnow-crimson';

    default:
      return 'bg-slate-100 text-slate-600';
  }
}

// ============ PRIORITY STYLES ============
// Returns Tailwind classes for a report's priority badge
function getPriorityStyle(priority) {
  switch (priority) {
    case 'Critical':
      return 'bg-resqnow-crimson/10 text-resqnow-crimson border-resqnow-crimson/20';

    case 'High':
      return 'bg-resqnow-critical/10 text-resqnow-critical border-resqnow-critical/20';

    case 'Medium':
      return 'bg-resqnow-pending/10 text-resqnow-pending border-resqnow-pending/20';

    case 'Low':
      return 'bg-resqnow-info/10 text-resqnow-info border-resqnow-info/20';

    default:
      return 'bg-slate-50 text-slate-500 border-slate-200';
  }
}

export { getStatusStyle, getPriorityStyle };