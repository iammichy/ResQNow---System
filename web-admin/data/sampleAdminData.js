export const adminReports = [
  {
    report_id: "RPT-001",
    report_type: "Emergency",
    concern_type: "Flood Rescue Needed",
    status: "In Progress",
    priority: "High",
    reporter_name: "Juan Dela Cruz",
    reporter_contact: "09123456789",
    location: "Purok 2",
    assigned_to: "Responder One"
  }
];

export const residents = [
  {
    user_id: "RES-001",
    full_name: "Juan Dela Cruz",
    contact_number: "09123456789",
    address: "Purok 1",
    household_count: 5,
    account_status: "Verified"
  }
];

export const auditLogs = [
  {
    log_id: "LOG-001",
    report_id: "RPT-001",
    action: "Status changed to In Progress",
    updated_by: "Barangay Admin",
    updated_at: "2026-08-19 10:40 PM",
    remarks: "Emergency report received and being checked."
  }
];