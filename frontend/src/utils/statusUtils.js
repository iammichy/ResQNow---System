// src/utils/statusUtils.js

// ============ STATUS STYLES ============
// Returns Tailwind classes for a report's status badge
// Used by Dashboard, TrackReports, and ReportDetail
function getStatusStyle(status) {
  switch (status) {
    case 'Resolved':
      return 'bg-resqnow-safe/20 text-resqnow-safe';
    case 'In Progress':
    case 'Responded':
    case 'Responders En Route':
      return 'bg-resqnow-pending/20 text-resqnow-pending';
    case 'Pending Verification':
      return 'bg-resqnow-info/20 text-resqnow-info';
    case 'Verified':
      return 'bg-resqnow-mint/20 text-resqnow-mint';
    case 'Invalid':
      return 'bg-resqnow-critical/20 text-resqnow-critical';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

// ============ PRIORITY STYLES ============
// Returns Tailwind classes for a report's priority badge
function getPriorityStyle(priority) {
  switch (priority) {
    case 'High':
      return 'bg-resqnow-critical/10 text-resqnow-critical border-resqnow-critical/20';
    case 'Medium':
      return 'bg-resqnow-caution/10 text-resqnow-caution border-resqnow-caution/20';
    case 'Low':
      return 'bg-slate-50 text-slate-500 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-500 border-slate-200';
  }
}

export { getStatusStyle, getPriorityStyle };
