import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const defaultReportDetails = {
  id: "RPT-2026-001",
  type: "Flooding",
  category: "Hazard-Related",
  priority: "Critical",
  status: "Responding",
  verification: "Verified",

  reporter: "Juan Dela Cruz",
  contact: "0917 123 4567",
  location: "Purok 3, Camunatan",
  submitted: "Sep 4, 2026 • 09:42 AM",

  description:
    "Flood water has entered several residential areas following continuous rainfall. Residents are requesting immediate assistance and monitoring of the water level.",

  triage: {
    threatToLife: "Present",
    assistanceNeed: "Immediate",
    peopleAffected: "Approximately 35 people",
    vulnerablePersons: "Children and senior citizens",
    accessImpact: "Partially affected",
    locationRisk: "Flood-prone area",
    hazardSeverity: "Severe",
    rateOfWorsening: "Increasing",
    waterLevel: "Waist level",
    roadPassability: "Passable with caution",
    evacuationNeed: "Recommended",
  },

  evidence: [
    { id: 1, label: "Flooded residential area" },
    { id: 2, label: "Road condition" },
    { id: 3, label: "Water level" },
  ],

  assignment: {
    team: "Emergency Response Team A",
    personnel: "Carlos Mendoza",
    assignedAt: "Sep 4, 2026 • 09:55 AM",
  },

  history: [
    {
      status: "Report Submitted",
      detail: "Submitted through Resident Mobile App",
      time: "09:42 AM",
    },
    {
      status: "Verified",
      detail: "Verified by Barangay Personnel",
      time: "09:49 AM",
    },
    {
      status: "Prioritized",
      detail: "Classified as Critical Priority",
      time: "09:51 AM",
    },
    {
      status: "Team Assigned",
      detail: "Emergency Response Team A assigned",
      time: "09:55 AM",
    },
    {
      status: "Responding",
      detail: "Response team dispatched",
      time: "10:02 AM",
    },
  ],
};

const reportDetails = {
  "RPT-2026-001": defaultReportDetails,

  "RPT-2026-002": {
    id: "RPT-2026-002",
    type: "Road Obstruction",
    category: "Incident-Related",
    priority: "High",
    status: "For Verification",
    verification: "Pending",

    reporter: "Maria Santos",
    contact: "0917 234 5678",
    location: "National Highway",
    submitted: "Sep 4, 2026 • 09:18 AM",

    description:
      "A large obstruction is blocking part of the roadway and may affect vehicle access.",

    triage: {
      threatToLife: "Potential",
      assistanceNeed: "Standard",
      peopleAffected: "Estimated 15–20 people",
      vulnerablePersons: "None reported",
      accessImpact: "Partially affected",
      locationRisk: "High-traffic area",
      hazardSeverity: "Moderate",
      rateOfWorsening: "Stable",
      waterLevel: "Not applicable",
      roadPassability: "Partially blocked",
      evacuationNeed: "Not required",
    },

    evidence: [
      { id: 1, label: "Road obstruction" },
      { id: 2, label: "Blocked roadway" },
    ],

    assignment: {
      team: "Unassigned",
      personnel: "Unassigned",
      assignedAt: "Not yet assigned",
    },

    history: [
      {
        status: "Report Submitted",
        detail: "Submitted through Resident Mobile App",
        time: "09:18 AM",
      },
    ],
  },

  "RPT-2026-005": {
    id: "RPT-2026-005",
    type: "Fallen Tree",
    category: "Incident-Related",
    priority: "Medium",
    status: "For Verification",
    verification: "Pending",

    reporter: "Carlos Mendoza",
    contact: "0917 567 8901",
    location: "Camunatan Main Road",
    submitted: "Sep 4, 2026 • 07:46 AM",

    description:
      "A fallen tree was reported along the main road and may obstruct local traffic.",

    triage: {
      threatToLife: "Potential",
      assistanceNeed: "Standard",
      peopleAffected: "Estimated 8–10 people",
      vulnerablePersons: "None reported",
      accessImpact: "Partially affected",
      locationRisk: "Main road",
      hazardSeverity: "Moderate",
      rateOfWorsening: "Stable",
      waterLevel: "Not applicable",
      roadPassability: "Partially blocked",
      evacuationNeed: "Not required",
    },

    evidence: [{ id: 1, label: "Fallen tree" }],

    assignment: {
      team: "Unassigned",
      personnel: "Unassigned",
      assignedAt: "Not yet assigned",
    },

    history: [
      {
        status: "Report Submitted",
        detail: "Submitted through Resident Mobile App",
        time: "07:46 AM",
      },
    ],
  },

  "RPT-2026-010": {
    id: "RPT-2026-010",
    type: "Medical Assistance",
    category: "Assistance-Related",
    priority: "Critical",
    status: "For Verification",
    verification: "Pending",

    reporter: "Liza Bautista",
    contact: "0917 012 3456",
    location: "Purok 2, Camunatan",
    submitted: "Sep 4, 2026 • 06:34 AM",

    description:
      "A resident is requesting immediate medical assistance due to an emergency condition.",

    triage: {
      threatToLife: "Present",
      assistanceNeed: "Immediate",
      peopleAffected: "1 person",
      vulnerablePersons: "Senior citizen",
      accessImpact: "No access impact",
      locationRisk: "Residential area",
      hazardSeverity: "Severe",
      rateOfWorsening: "Unknown",
      waterLevel: "Not applicable",
      roadPassability: "Passable",
      evacuationNeed: "Not required",
    },

    evidence: [],

    assignment: {
      team: "Unassigned",
      personnel: "Unassigned",
      assignedAt: "Not yet assigned",
    },

    history: [
      {
        status: "Report Submitted",
        detail: "Submitted through Resident Mobile App",
        time: "06:34 AM",
      },
    ],
  },
};

const priorityStyles = {
  Critical: "border-[#FECDCA] bg-[#FEF3F2] text-[#D92D20]",
  High: "border-[#FEDF89] bg-[#FFF4E5] text-[#B54708]",
  Medium: "border-[#FDE68A] bg-[#FFFAEB] text-[#A15C00]",
  Low: "border-[#E4E7EC] bg-[#F2F4F7] text-[#667085]",
};

const statusStyles = {
  "For Verification": "bg-[#FFF7ED] text-[#B54708]",
  Assigned: "bg-[#F4F3FF] text-[#6941C6]",
  Responding: "bg-[#EEF4FF] text-[#3538CD]",
  Monitoring: "bg-[#ECFDF3] text-[#027A48]",
  Resolved: "bg-[#F2F4F7] text-[#475467]",
};

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#344054]">{value}</p>
    </div>
  );
}

function TriageItem({ label, value, critical = false }) {
  return (
    <div className="rounded-xl border border-[#E4E7EC] bg-white p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#98A2B3]">
        {label}
      </p>

      <p
        className={`mt-1.5 text-sm font-bold ${
          critical ? "text-[#D92D20]" : "text-[#344054]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ReportDetails({ report: selectedReport, onBack }) {
  const report = reportDetails[selectedReport?.id] ?? defaultReportDetails;

  const [status, setStatus] = useState(() => report.status);

  const [assignment, setAssignment] = useState(() => ({
    ...report.assignment,
  }));

  const [history, setHistory] = useState(() => [...report.history]);

  const [showMoreHistory, setShowMoreHistory] = useState(false);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState(
    () => report.assignment.team,
  );

  const [selectedPersonnel, setSelectedPersonnel] = useState(
    () => report.assignment.personnel,
  );

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const addHistory = (newStatus, detail) => {
    setHistory((currentHistory) => [
      ...currentHistory,
      {
        status: newStatus,
        detail,
        time: getCurrentTime(),
      },
    ]);
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === status) return;

    setStatus(newStatus);

    addHistory(
      newStatus,
      `Report status updated to ${newStatus} by Barangay Personnel`,
    );
  };

  const handleSaveAssignment = () => {
    if (selectedTeam === "Unassigned" || selectedPersonnel === "Unassigned") {
      return;
    }

    const assignedAt = new Date().toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newAssignment = {
      team: selectedTeam,
      personnel: selectedPersonnel,
      assignedAt,
    };

    setAssignment(newAssignment);

    if (status === "For Verification") {
      setStatus("Assigned");

      addHistory(
        "Assigned",
        "Report moved to Assigned status after team assignment",
      );
    }

    addHistory(
      "Team Assigned",
      `${selectedTeam} assigned with ${selectedPersonnel}`,
    );

    setShowAssignmentModal(false);
  };

  const handleMarkResolved = () => {
    if (status === "Resolved") return;

    setStatus("Resolved");

    addHistory("Resolved", "Incident marked as resolved by Barangay Personnel");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();

    // HEADER
    doc.setFillColor(31, 29, 71);
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ResQNow", 14, 13);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Barangay Hazard Report", 14, 20);

    // RESET TEXT COLOR
    doc.setTextColor(31, 29, 71);

    // TITLE
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Report Details", 14, 42);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(102, 112, 133);
    doc.text(`Report ID: ${report.id}`, 14, 50);

    // REPORT INFORMATION
    autoTable(doc, {
      startY: 58,
      head: [["Report Information", "Details"]],
      body: [
        ["Report ID", report.id],
        ["Report Type", report.type],
        ["Category", report.category],
        ["Priority", report.priority],
        ["Current Status", status],
        ["Verification", report.verification],
        ["Reporter", report.reporter],
        ["Contact Number", report.contact],
        ["Location", report.location],
        ["Submitted", report.submitted],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [131, 70, 242],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
    });

    // DESCRIPTION
    let currentY = doc.lastAutoTable.finalY + 12;

    doc.setTextColor(31, 29, 71);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Report Description", 14, currentY);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 84, 103);

    const descriptionLines = doc.splitTextToSize(
      report.description,
      pageWidth - 28,
    );

    doc.text(descriptionLines, 14, currentY + 7);

    currentY += descriptionLines.length * 5 + 16;

    // TRIAGE ASSESSMENT
    doc.setTextColor(31, 29, 71);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Triage Assessment", 14, currentY);

    autoTable(doc, {
      startY: currentY + 6,
      head: [["Assessment", "Result"]],
      body: [
        ["Threat to Life", report.triage.threatToLife],
        ["Assistance Need", report.triage.assistanceNeed],
        ["People Affected", report.triage.peopleAffected],
        ["Vulnerable Persons", report.triage.vulnerablePersons],
        ["Access Impact", report.triage.accessImpact],
        ["Location Risk", report.triage.locationRisk],
        ["Hazard Severity", report.triage.hazardSeverity],
        ["Rate of Worsening", report.triage.rateOfWorsening],
        ["Water Level", report.triage.waterLevel],
        ["Road Passability", report.triage.roadPassability],
        ["Evacuation Need", report.triage.evacuationNeed],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [31, 29, 71],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
    });

    // ASSIGNMENT
    currentY = doc.lastAutoTable.finalY + 12;

    // Check if we need another page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setTextColor(31, 29, 71);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Response Assignment", 14, currentY);

    autoTable(doc, {
      startY: currentY + 6,
      head: [["Assignment", "Details"]],
      body: [
        ["Response Team", assignment.team],
        ["Assigned Personnel", assignment.personnel],
        ["Assigned At", assignment.assignedAt],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [131, 70, 242],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
    });

    // STATUS HISTORY
    currentY = doc.lastAutoTable.finalY + 12;

    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setTextColor(31, 29, 71);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Status History", 14, currentY);

    autoTable(doc, {
      startY: currentY + 6,
      head: [["Status", "Details", "Time"]],
      body: history.map((item) => [item.status, item.detail, item.time]),
      theme: "grid",
      headStyles: {
        fillColor: [31, 29, 71],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
    });

    // FOOTER
    const totalPages = doc.getNumberOfPages();

    for (let page = 1; page <= totalPages; page++) {
      doc.setPage(page);

      const height = doc.internal.pageSize.getHeight();

      doc.setFontSize(8);
      doc.setTextColor(152, 162, 179);

      doc.text(
        `Generated by ResQNow • Page ${page} of ${totalPages}`,
        pageWidth / 2,
        height - 10,
        { align: "center" },
      );
    }

    // DOWNLOAD PDF
    doc.save(`${report.id}-Report-Details.pdf`);
  };

  const visibleHistory = showMoreHistory ? history : history.slice(-4);

  const riskLabel = `${report.priority} Risk`;

  const statusDescription =
    status === "For Verification"
      ? "This report is awaiting verification before entering the response workflow."
      : status === "Assigned"
        ? "A response team has been assigned and is preparing to handle the incident."
        : status === "Monitoring"
          ? "The incident is currently being monitored by barangay personnel."
          : status === "Responding"
            ? "Response personnel are currently handling this incident."
            : status === "Resolved"
              ? "This incident has been resolved."
              : "The current response status is being reviewed.";

  const verificationDescription =
    report.verification === "Pending"
      ? "Report is awaiting verification."
      : "Report has passed initial review.";

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* PAGE HEADER */}
      <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#667085] transition hover:text-[#8346F2]"
          >
            ← Back to All Reports
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8346F2]">
              Report Details
            </p>

            <span className="text-xs text-[#98A2B3]">/</span>

            <span className="text-xs font-bold text-[#667085]">
              {report.id}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1F1D47]">
              {report.type}
            </h1>

            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                priorityStyles[report.priority]
              }`}
            >
              {report.priority} Priority
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                statusStyles[status]
              }`}
            >
              {status}
            </span>
          </div>

          <p className="mt-1 text-sm text-[#667085]">
            Submitted {report.submitted}
          </p>
        </div>

        {/* EXPORT PDF */}
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-2 rounded-xl border border-[#E4E7EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#475467] shadow-sm transition hover:border-[#8346F2] hover:text-[#8346F2]"
          >
            <span>↓</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.75fr)]">
        {/* LEFT */}
        <div className="min-h-0 overflow-auto pr-1">
          <div className="space-y-4">
            {/* REPORT INFORMATION */}
            <section className="rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <h2 className="text-sm font-bold text-[#1F1D47]">
                  Report Information
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-5 p-5 lg:grid-cols-3">
                <InfoItem label="Report ID" value={report.id} />
                <InfoItem label="Reporter" value={report.reporter} />
                <InfoItem label="Contact Number" value={report.contact} />
                <InfoItem label="Category" value={report.category} />
                <InfoItem label="Location" value={report.location} />
                <InfoItem label="Submitted" value={report.submitted} />
              </div>
            </section>

            {/* DESCRIPTION */}
            <section className="rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <h2 className="text-sm font-bold text-[#1F1D47]">
                  Report Description
                </h2>
              </div>

              <div className="p-5">
                <p className="text-sm leading-6 text-[#475467]">
                  {report.description}
                </p>
              </div>
            </section>

            {/* TRIAGE */}
            <section className="rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-[#1F1D47]">
                      Triage Assessment
                    </h2>

                    <p className="mt-0.5 text-xs text-[#667085]">
                      Assessment indicators used for emergency prioritization.
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      priorityStyles[report.priority]
                    }`}
                  >
                    {riskLabel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-5 lg:grid-cols-3">
                <TriageItem
                  label="Threat to Life"
                  value={report.triage.threatToLife}
                  critical={report.priority === "Critical"}
                />

                <TriageItem
                  label="Assistance Need"
                  value={report.triage.assistanceNeed}
                  critical={report.priority === "Critical"}
                />

                <TriageItem
                  label="People Affected"
                  value={report.triage.peopleAffected}
                />

                <TriageItem
                  label="Vulnerable Persons"
                  value={report.triage.vulnerablePersons}
                />

                <TriageItem
                  label="Access Impact"
                  value={report.triage.accessImpact}
                />

                <TriageItem
                  label="Location Risk"
                  value={report.triage.locationRisk}
                />

                <TriageItem
                  label="Hazard Severity"
                  value={report.triage.hazardSeverity}
                  critical={report.priority === "Critical"}
                />

                <TriageItem
                  label="Rate of Worsening"
                  value={report.triage.rateOfWorsening}
                />

                <TriageItem
                  label="Water Level"
                  value={report.triage.waterLevel}
                />

                <TriageItem
                  label="Road Passability"
                  value={report.triage.roadPassability}
                />

                <TriageItem
                  label="Evacuation Need"
                  value={report.triage.evacuationNeed}
                  critical={report.priority === "Critical"}
                />
              </div>
            </section>

            {/* EVIDENCE */}
            <section className="rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <h2 className="text-sm font-bold text-[#1F1D47]">
                  Submitted Evidence
                </h2>

                <p className="mt-0.5 text-xs text-[#667085]">
                  {report.evidence.length} attachments submitted with this
                  report.
                </p>
              </div>

              {report.evidence.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {report.evidence.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="overflow-hidden rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] text-left transition hover:border-[#8346F2]"
                    >
                      <div className="flex h-28 items-center justify-center bg-[#F4F3FF] text-2xl text-[#8346F2]">
                        ▧
                      </div>

                      <div className="px-3 py-2.5">
                        <p className="truncate text-xs font-semibold text-[#344054]">
                          {item.label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-5">
                  <div className="rounded-xl border border-dashed border-[#E4E7EC] bg-[#F8FAFC] px-4 py-8 text-center">
                    <p className="text-sm font-semibold text-[#667085]">
                      No evidence attached
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* RIGHT */}
        <div className="min-h-0 overflow-auto pr-1">
          <div className="space-y-4">
            {/* STATUS */}
            <section className="rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <h2 className="text-sm font-bold text-[#1F1D47]">
                  Current Status
                </h2>
              </div>

              <div className="p-5">
                <div className="rounded-xl bg-[#EEF4FF] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#667085]">
                    Response Status
                  </p>

                  <p className="mt-1 text-lg font-extrabold text-[#3538CD]">
                    {status}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#667085]">
                    {statusDescription}
                  </p>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="report-status"
                    className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]"
                  >
                    Update Status
                  </label>

                  <select
                    id="report-status"
                    value={status}
                    onChange={(event) => handleStatusChange(event.target.value)}
                    className="mt-2 h-10 w-full rounded-xl border border-[#E4E7EC] bg-white px-3 text-sm font-medium text-[#344054] outline-none transition focus:border-[#8346F2]"
                  >
                    <option value="For Verification">For Verification</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Responding">Responding</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </section>

            {/* ASSIGNMENT */}
            <section className="rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <h2 className="text-sm font-bold text-[#1F1D47]">
                  Response Assignment
                </h2>
              </div>

              <div className="space-y-4 p-5">
                <InfoItem label="Response Team" value={assignment.team} />

                <InfoItem
                  label="Assigned Personnel"
                  value={assignment.personnel}
                />

                <InfoItem label="Assigned At" value={assignment.assignedAt} />

                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(true)}
                  className="w-full rounded-xl border border-[#8346F2] bg-white px-4 py-2.5 text-sm font-semibold text-[#8346F2] transition hover:bg-[#F5F3FF]"
                >
                  Change Assignment
                </button>
              </div>
            </section>

            {/* VERIFICATION */}
            <section className="rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <h2 className="text-sm font-bold text-[#1F1D47]">
                  Verification
                </h2>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[#344054]">
                      Verification Status
                    </p>

                    <p className="mt-0.5 text-xs text-[#667085]">
                      {verificationDescription}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      report.verification === "Verified"
                        ? "bg-[#ECFDF3] text-[#027A48]"
                        : "bg-[#FFF7ED] text-[#B54708]"
                    }`}
                  >
                    {report.verification}
                  </span>
                </div>
              </div>
            </section>

            {/* HISTORY */}
            <section className="rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold text-[#1F1D47]">
                    Status History
                  </h2>

                  <button
                    type="button"
                    onClick={() => setShowMoreHistory((current) => !current)}
                    className="text-[11px] font-semibold text-[#8346F2]"
                  >
                    {showMoreHistory ? "Show Less" : "View All"}
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="space-y-4">
                  {visibleHistory.map((item, index) => (
                    <div
                      key={`${item.status}-${item.time}-${index}`}
                      className="flex gap-3"
                    >
                      <div className="flex flex-col items-center">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F4F3FF] text-xs font-bold text-[#8346F2]">
                          ✓
                        </span>

                        {index !== visibleHistory.length - 1 && (
                          <span className="mt-1 h-full w-px bg-[#E4E7EC]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#344054]">
                          {item.status}
                        </p>

                        <p className="mt-0.5 text-[11px] leading-4 text-[#667085]">
                          {item.detail}
                        </p>

                        <p className="mt-1 text-[10px] font-semibold text-[#98A2B3]">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* RESOLVE */}
            {status !== "Resolved" && status !== "For Verification" && (
              <button
                type="button"
                onClick={handleMarkResolved}
                className="w-full rounded-xl bg-[#2ED47A] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#24BE69]"
              >
                ✓ Mark as Resolved
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ASSIGNMENT MODAL */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F1D47]/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#1F1D47]">
                  Assign Response Team
                </h2>

                <p className="mt-1 text-xs text-[#667085]">
                  Assign personnel to this incident.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAssignmentModal(false)}
                className="text-lg font-bold text-[#98A2B3] hover:text-[#344054]"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="text-xs font-bold text-[#475467]">
                  Response Team
                </label>

                <select
                  value={selectedTeam}
                  onChange={(event) => setSelectedTeam(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-[#E4E7EC] px-3 text-sm outline-none focus:border-[#8346F2]"
                >
                  <option value="Unassigned">Select a team</option>

                  <option value="Emergency Response Team A">
                    Emergency Response Team A
                  </option>

                  <option value="Emergency Response Team B">
                    Emergency Response Team B
                  </option>

                  <option value="Barangay Disaster Response Team">
                    Barangay Disaster Response Team
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#475467]">
                  Assigned Personnel
                </label>

                <select
                  value={selectedPersonnel}
                  onChange={(event) => setSelectedPersonnel(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-[#E4E7EC] px-3 text-sm outline-none focus:border-[#8346F2]"
                >
                  <option value="Unassigned">Select personnel</option>

                  <option value="Carlos Mendoza">Carlos Mendoza</option>

                  <option value="Maria Reyes">Maria Reyes</option>

                  <option value="Jose Santos">Jose Santos</option>

                  <option value="Ana Bautista">Ana Bautista</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E4E7EC] px-6 py-4">
              <button
                type="button"
                onClick={() => setShowAssignmentModal(false)}
                className="rounded-xl border border-[#E4E7EC] px-4 py-2.5 text-sm font-semibold text-[#475467]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveAssignment}
                className="rounded-xl bg-[#8346F2] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7335E6]"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportDetails;
