/**
 * Utility functions for ResQNow Web Admin
 */

/**
 * Format a date/time string to a human-readable format.
 * Accepts ISO format (YYYY-MM-DDTHH:mm:ss) or localized strings.
 * Returns a professional format suitable for display.
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return "Not recorded";

  let date, time;

  // Try to parse ISO format (YYYY-MM-DDTHH:mm:ss or similar)
  if (dateTime.includes("T")) {
    [date, time] = dateTime.split("T");
  } else if (dateTime.includes(" ")) {
    // Already formatted, return as-is
    return dateTime;
  } else {
    return dateTime;
  }

  if (!date || !time) return dateTime;

  const [year, month, day] = date.split("-");
  const [hourValue, minute] = time.split(":");

  if (!year || !month || !day || !hourValue || !minute) return dateTime;

  let hour = Number(hourValue);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthIndex = Number(month) - 1;
  if (monthIndex < 0 || monthIndex > 11) return dateTime;

  return `${monthNames[monthIndex]} ${Number(day)}, ${year} at ${hour}:${minute} ${period}`;
};

/**
 * Generate a unique log ID based on timestamp and counter.
 * Uses Date.now() for uniqueness across application lifecycle.
 */
export const generateLogId = () => {
  return `LOG-${Date.now()}`;
};

/**
 * Get safe admin name display.
 * Uses full_name as canonical field with fallback.
 */
export const getAdminDisplayName = (admin) => {
  return admin?.full_name || "Barangay Admin";
};
