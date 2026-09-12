const API_BASE_URL = "http://127.0.0.1:8000/api";

/**
 * Convert backend report data into frontend-friendly format.
 */
function formatReport(report) {
  return {
    id: `RPT-${String(report.id).padStart(4, "0")}`,

    // Actual database ID
    databaseId: report.id,

    type: report.report_type || "Unknown Report",

    category: report.category || "Uncategorized",

    location: report.location || "No location provided",

    submitted: report.created_at
      ? new Date(report.created_at).toLocaleString()
      : "Unknown",

    reporter: report.user?.name || "Unknown Resident",

    priority: report.priority || "Not Prioritized",

    currentPriority: report.priority || null,

    verification: report.verification_status || "Pending",

    status: report.status || "For Verification",

    description:
      report.description || "No description provided.",

    latitude: report.latitude,

    longitude: report.longitude,

    userId: report.user_id,

    affected:
      report.affected_people || "Not specified",

    vulnerable:
      report.vulnerable_persons || "Not specified",

    waterLevel:
      report.water_level || "Not specified",

    roadPassability:
      report.road_passability || "Not specified",

    evidence: "No evidence information",
  };
}


/**
 * Get reports waiting for verification.
 */
export async function getReportsForVerification() {
  const response = await fetch(
    `${API_BASE_URL}/reports/for-verification`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch reports for verification.");
  }

  const result = await response.json();

  return result.data.map(formatReport);
}


/**
 * Verify a report.
 */
export async function verifyReport(reportId) {
  const response = await fetch(
    `${API_BASE_URL}/reports/${reportId}/verify`,
    {
      method: "PATCH",

      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to verify report.");
  }

  return response.json();
}


/**
 * Get verified reports waiting for prioritization.
 */
export async function getReportsForPrioritization() {
  const response = await fetch(
    `${API_BASE_URL}/reports/for-prioritization`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch reports for prioritization."
    );
  }

  const result = await response.json();

  return result.data.map(formatReport);
}


/**
 * Assign priority to a report.
 */
export async function assignReportPriority(
  reportId,
  priority
) {
  const response = await fetch(
    `${API_BASE_URL}/reports/${reportId}/priority`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        priority,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
      "Failed to assign report priority."
    );
  }

  return response.json();
}


/**
 * Get all reports.
 */
export async function getAllReports() {
  const response = await fetch(
    `${API_BASE_URL}/reports`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch reports.");
  }

  const result = await response.json();

  return result.data.map(formatReport);
}