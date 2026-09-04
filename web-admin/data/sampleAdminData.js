export const adminReports = [
  {
    report_id: "RPT-001",
    report_type: "Emergency",
    concern_type: "Flood Rescue Needed",
    status: "In Progress",
    priority: "High",
    verification_status: "Verified",

    reporter_name: "Juan Dela Cruz",
    reporter_contact: "09123456789",

    location: "Purok 2",
    purok: "Purok 2",

    assigned_to: "Responder One",

    source: "Phone Call",

    date_submitted: "2026-08-19 10:30 PM",

    description:
      "Resident reported flooding in Purok 2 and requested rescue assistance.",
  },

  {
    report_id: "RPT-002",
    report_type: "Emergency",
    concern_type: "Medical Emergency",
    status: "Submitted",
    priority: "Medium",
    verification_status: "Pending Verification",

    reporter_name: "Maria Santos",
    reporter_contact: "09221234567",

    location: "Purok 1",
    purok: "Purok 1",

    assigned_to: "",

    source: "Walk-in",

    date_submitted: "2026-08-20 08:15 AM",

    description:
      "Resident reported a medical emergency involving an elderly household member.",
  },

  {
    report_id: "RPT-003",
    report_type: "Emergency",
    concern_type: "Fire Incident",
    status: "Resolved",
    priority: "High",
    verification_status: "Verified",

    reporter_name: "Pedro Reyes",
    reporter_contact: "09331234567",

    location: "Purok 3",
    purok: "Purok 3",

    assigned_to: "Responder Two",

    source: "Phone Call",

    date_submitted: "2026-08-20 02:40 PM",

    description:
      "Resident reported a small fire incident in a residential area.",
  },

  {
    report_id: "RPT-004",
    report_type: "Non-Emergency",
    concern_type: "Road Obstruction",
    status: "Submitted",
    priority: "Low",
    verification_status: "Verified",

    reporter_name: "Ana Garcia",
    reporter_contact: "09441234567",

    location: "Purok 4",
    purok: "Purok 4",

    assigned_to: "",

    source: "Mobile App",

    date_submitted: "2026-08-21 09:20 AM",

    description:
      "Resident reported an obstruction affecting access along a barangay road.",
  },

  {
    report_id: "RPT-005",
    report_type: "Emergency",
    concern_type: "Missing Person",
    status: "In Progress",
    priority: "High",
    verification_status: "Verified",

    reporter_name: "Carlos Mendoza",
    reporter_contact: "09551234567",

    location: "Purok 5",
    purok: "Purok 5",

    assigned_to: "Responder Three",

    source: "Walk-in",

    date_submitted: "2026-08-21 04:10 PM",

    description:
      "Resident reported a missing family member last seen within the barangay.",
  },

  {
    report_id: "RPT-006",
    report_type: "Non-Emergency",
    concern_type: "Streetlight Problem",
    status: "Resolved",
    priority: "Low",
    verification_status: "Verified",

    reporter_name: "Sofia Cruz",
    reporter_contact: "09661234567",

    location: "Purok 2",
    purok: "Purok 2",

    assigned_to: "Barangay Personnel",

    source: "Mobile App",

    date_submitted: "2026-08-22 07:45 PM",

    description:
      "Resident reported a defective streetlight along a residential street.",
  },

  {
    report_id: "RPT-007",
    report_type: "Emergency",
    concern_type: "Flooding",
    status: "Submitted",
    priority: "Medium",
    verification_status: "Pending Verification",

    reporter_name: "Roberto Aquino",
    reporter_contact: "09771234567",

    location: "Purok 6",
    purok: "Purok 6",

    assigned_to: "",

    source: "Phone Call",

    date_submitted: "2026-08-23 06:25 AM",

    description:
      "Resident reported rising flood water affecting several households.",
  },

  {
    report_id: "RPT-008",
    report_type: "Non-Emergency",
    concern_type: "Garbage Collection",
    status: "In Progress",
    priority: "Low",
    verification_status: "Verified",

    reporter_name: "Elena Ramos",
    reporter_contact: "09881234567",

    location: "Purok 1",
    purok: "Purok 1",

    assigned_to: "Barangay Personnel",

    source: "Mobile App",

    date_submitted: "2026-08-23 01:15 PM",

    description:
      "Resident reported a missed garbage collection schedule in the area.",
  },
];

export const residents = [
  {
    resident_id: "RES-001",
    full_name: "Juan Dela Cruz",
    email: "juan.delacruz@email.com",
    mobile_number: "09123456789",
    address: "Purok 1",
    household_count: 5,
    registered_date: "2026-08-10",
    last_active: "2026-08-23 10:30 PM",
    account_status: "Verified",
  },
  {
    resident_id: "RES-002",
    full_name: "Maria Santos",
    email: "maria.santos@email.com",
    mobile_number: "09221234567",
    address: "Purok 2",
    household_count: 4,
    registered_date: "2026-08-11",
    last_active: "2026-08-22 08:15 AM",
    account_status: "Verified",
  },
  {
    resident_id: "RES-003",
    full_name: "Pedro Reyes",
    email: "pedro.reyes@email.com",
    mobile_number: "09331234567",
    address: "Purok 3",
    household_count: 6,
    registered_date: "2026-08-12",
    last_active: "2026-08-20 04:30 PM",
    account_status: "Pending Verification",
  },
  {
    resident_id: "RES-004",
    full_name: "Ana Garcia",
    email: "ana.garcia@email.com",
    mobile_number: "09441234567",
    address: "Purok 4",
    household_count: 3,
    registered_date: "2026-08-13",
    last_active: "2026-08-21 09:20 AM",
    account_status: "Verified",
  },
  {
    resident_id: "RES-005",
    full_name: "Carlos Mendoza",
    email: "carlos.mendoza@email.com",
    mobile_number: "09551234567",
    address: "Purok 5",
    household_count: 5,
    registered_date: "2026-08-14",
    last_active: "2026-08-21 04:10 PM",
    account_status: "Verified",
  },
];
export const actionLogs = [
  {
    log_id: "LOG-001",
    report_id: "RPT-001",
    action: "Report Verified",
    details: "Emergency report was verified by the barangay admin.",
    performed_by: "Barangay Admin",
    timestamp: "2026-08-19 10:40 PM",
    status: "Verified",
  },
  {
    log_id: "LOG-002",
    report_id: "RPT-001",
    action: "Report Assigned",
    details: "Report assigned to Responder One.",
    performed_by: "Barangay Admin",
    timestamp: "2026-08-19 10:45 PM",
    status: "In Progress",
  },
  {
    log_id: "LOG-003",
    report_id: "RPT-003",
    action: "Report Resolved",
    details: "Fire incident response was completed.",
    performed_by: "Barangay Admin",
    timestamp: "2026-08-20 04:30 PM",
    status: "Resolved",
  },
];
