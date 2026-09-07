// src/utils/dateUtils.js

// ============ DATE FORMATTER ============
// Formats a date string for Philippine locale display
// Used by Dashboard, Updates, and anywhere dates appear
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

export { formatDate };
