// src/utils/statusUtils.js

// ============ STATUS STYLES ============
// Returns color classes for report status
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
// Returns color classes for report priority
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

// ============ STATUS LABELS ============
// Backend status stays English
// Only the visible label gets translated
const statusKeys = {
  Submitted:
    'status.submitted',

  'Pending Verification':
    'status.pendingVerification',

  Verified:
    'status.verified',

  Assigned:
    'status.assigned',

  'In Progress':
    'status.inProgress',

  'Responders En Route':
    'status.respondersEnRoute',

  Responded:
    'status.responded',

  Resolved:
    'status.resolved',

  Invalid:
    'status.invalid',
};

// Get translated report status
function getStatusLabel(status, t) {
  const key =
    statusKeys[status];

  if (!key || !t) {
    return status;
  }

  return t(key);
}

// ============ PRIORITY LABELS ============
// Backend priority stays English
const priorityKeys = {
  Critical:
    'priority.critical',

  High:
    'priority.high',

  Medium:
    'priority.medium',

  Low:
    'priority.low',
};

// Get translated priority
function getPriorityLabel(priority, t) {
  const key =
    priorityKeys[priority];

  if (!key || !t) {
    return priority;
  }

  return t(key);
}

export {
  getStatusStyle,
  getPriorityStyle,
  getStatusLabel,
  getPriorityLabel,
};