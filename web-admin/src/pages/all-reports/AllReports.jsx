import { useMemo, useState } from "react";

const reports = [
  {
    id: "RPT-2026-001",
    type: "Flooding",
    category: "Hazard-Related",
    location: "Purok 3, Camunatan",
    submitted: "Sep 4, 2026 • 09:42 AM",
    priority: "Critical",
    verification: "Verified",
    status: "Responding",
    reporter: "Juan Dela Cruz",
  },
  {
    id: "RPT-2026-002",
    type: "Road Obstruction",
    category: "Incident-Related",
    location: "National Highway",
    submitted: "Sep 4, 2026 • 09:18 AM",
    priority: "High",
    verification: "Pending",
    status: "For Verification",
    reporter: "Maria Santos",
  },
  {
    id: "RPT-2026-003",
    type: "Medical Assistance",
    category: "Assistance-Related",
    location: "Purok 1, Camunatan",
    submitted: "Sep 4, 2026 • 08:55 AM",
    priority: "High",
    verification: "Verified",
    status: "Assigned",
    reporter: "Pedro Reyes",
  },
  {
    id: "RPT-2026-004",
    type: "Rising Water Level",
    category: "Hazard-Related",
    location: "Purok 5, Riverside",
    submitted: "Sep 4, 2026 • 08:21 AM",
    priority: "Medium",
    verification: "Verified",
    status: "Monitoring",
    reporter: "Ana Garcia",
  },
  {
    id: "RPT-2026-005",
    type: "Fallen Tree",
    category: "Incident-Related",
    location: "Camunatan Main Road",
    submitted: "Sep 4, 2026 • 07:46 AM",
    priority: "Medium",
    verification: "Pending",
    status: "For Verification",
    reporter: "Carlos Mendoza",
  },
  {
    id: "RPT-2026-006",
    type: "Evacuation Assistance",
    category: "Assistance-Related",
    location: "Purok 4, Camunatan",
    submitted: "Sep 4, 2026 • 07:15 AM",
    priority: "Critical",
    verification: "Verified",
    status: "Responding",
    reporter: "Rosa Fernandez",
  },
  {
    id: "RPT-2026-007",
    type: "Power Outage",
    category: "Incident-Related",
    location: "Purok 2, Camunatan",
    submitted: "Sep 3, 2026 • 06:38 PM",
    priority: "Low",
    verification: "Verified",
    status: "Resolved",
    reporter: "Mark Villanueva",
  },
  {
    id: "RPT-2026-008",
    type: "Flooding",
    category: "Hazard-Related",
    location: "Purok 6, Camunatan",
    submitted: "Sep 3, 2026 • 05:52 PM",
    priority: "High",
    verification: "Verified",
    status: "Resolved",
    reporter: "Elena Cruz",
  },
];

const priorityStyles = {
  Critical: "bg-[#FEF3F2] text-[#D92D20] border-[#FECDCA]",
  High: "bg-[#FFF4E5] text-[#B54708] border-[#FEDF89]",
  Medium: "bg-[#FFFAEB] text-[#A15C00] border-[#FDE68A]",
  Low: "bg-[#F2F4F7] text-[#667085] border-[#E4E7EC]",
};

const verificationStyles = {
  Verified: "bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]",
  Pending: "bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]",
};

const statusStyles = {
  Responding: "bg-[#EEF4FF] text-[#3538CD]",
  Assigned: "bg-[#F4F3FF] text-[#6941C6]",
  "For Verification": "bg-[#FFF7ED] text-[#C2410C]",
  Monitoring: "bg-[#ECFDF3] text-[#027A48]",
  Resolved: "bg-[#F2F4F7] text-[#475467]",
};

function StatCard({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-[#E4E7EC] bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">
        {label}
      </p>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-2xl font-extrabold leading-none text-[#1F1D47]">
          {value}
        </p>

        <span className="text-xs font-medium text-[#667085]">{detail}</span>
      </div>
    </div>
  );
}

function AllReports({ onOpenReport, selectedResident }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const filteredReports = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesResident =
        !selectedResident || report.reporter === selectedResident.name;

      const matchesSearch =
        normalizedSearch === "" ||
        report.id.toLowerCase().includes(normalizedSearch) ||
        report.type.toLowerCase().includes(normalizedSearch) ||
        report.location.toLowerCase().includes(normalizedSearch) ||
        report.reporter.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" || report.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || report.priority === priorityFilter;

      return (
        matchesResident && matchesSearch && matchesStatus && matchesPriority
      );
    });
  }, [searchTerm, statusFilter, priorityFilter, selectedResident]);

  const pendingCount = reports.filter(
    (report) => report.verification === "Pending",
  ).length;

  const criticalCount = reports.filter(
    (report) => report.priority === "Critical",
  ).length;

  const activeCount = reports.filter(
    (report) => report.status !== "Resolved",
  ).length;

  const resolvedCount = reports.filter(
    (report) => report.status === "Resolved",
  ).length;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* PAGE HEADER */}
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8346F2]">
            Operations
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1F1D47]">
            All Reports
          </h1>

          <p className="mt-1 text-sm text-[#667085]">
            Monitor and manage all submitted barangay reports.
          </p>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Total Reports"
          value={reports.length}
          detail="All submissions"
        />

        <StatCard
          label="Active Reports"
          value={activeCount}
          detail="Needs action"
        />

        <StatCard
          label="Pending Verification"
          value={pendingCount}
          detail="Needs review"
        />

        <StatCard
          label="Critical Reports"
          value={criticalCount}
          detail={`${resolvedCount} resolved`}
        />
      </div>

      {/* TABLE CARD */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
        {/* FILTER BAR */}
        <div className="flex shrink-0 flex-col gap-3 border-b border-[#E4E7EC] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 min-w-0 max-w-105 flex-1 items-center gap-2 rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] px-3 transition focus-within:border-[#8346F2] focus-within:bg-white">
              <span className="shrink-0 text-base text-[#667085]">⌕</span>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search reports, locations, or reporters..."
                className="min-w-0 flex-1 bg-transparent text-sm text-[#1F1D47] outline-none placeholder:text-[#98A2B3]"
              />
            </div>

            <span className="hidden shrink-0 text-xs font-medium text-[#98A2B3] xl:block">
              {filteredReports.length} of {reports.length} reports
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-xl border border-[#E4E7EC] bg-white px-3 text-sm font-medium text-[#475467] outline-none transition focus:border-[#8346F2]"
              aria-label="Filter by status"
            >
              <option value="All">All Status</option>
              <option value="For Verification">For Verification</option>
              <option value="Responding">Responding</option>
              <option value="Assigned">Assigned</option>
              <option value="Monitoring">Monitoring</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="h-10 rounded-xl border border-[#E4E7EC] bg-white px-3 text-sm font-medium text-[#475467] outline-none transition focus:border-[#8346F2]"
              aria-label="Filter by priority"
            >
              <option value="All">All Priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-245 border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC]">
              <tr className="border-b border-[#E4E7EC]">
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#667085]">
                  Report
                </th>

                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#667085]">
                  Location
                </th>

                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#667085]">
                  Submitted
                </th>

                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#667085]">
                  Priority
                </th>

                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#667085]">
                  Verification
                </th>

                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#667085]">
                  Status
                </th>

                <th className="w-12 px-3 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E4E7EC]">
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className="group cursor-pointer transition hover:bg-[#FAF9FF]"
                  onClick={() => onOpenReport?.(report)}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex min-w-55 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F4F3FF] text-sm font-bold text-[#6941C6]">
                        {report.type.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#1F1D47]">
                          {report.id}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-[#667085]">
                          {report.type} • {report.category}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="max-w-55 px-4 py-3.5">
                    <p className="truncate text-sm font-medium text-[#344054]">
                      {report.location}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5">
                    <p className="text-xs font-medium text-[#667085]">
                      {report.submitted}
                    </p>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                        priorityStyles[report.priority]
                      }`}
                    >
                      {report.priority}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                        verificationStyles[report.verification]
                      }`}
                    >
                      {report.verification}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        statusStyles[report.status]
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>

                  <td className="px-3 py-3.5 text-right">
                    <span className="text-lg font-bold text-[#98A2B3] transition group-hover:text-[#8346F2]">
                      ›
                    </span>
                  </td>
                </tr>
              ))}

              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F3FF] text-xl text-[#8346F2]">
                        ⌕
                      </div>

                      <p className="mt-3 text-sm font-bold text-[#1F1D47]">
                        No reports found
                      </p>

                      <p className="mt-1 text-xs text-[#667085]">
                        Try changing your search term or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}
        <div className="flex shrink-0 items-center justify-between border-t border-[#E4E7EC] bg-[#FCFCFD] px-4 py-3">
          <p className="text-xs font-medium text-[#667085]">
            Showing{" "}
            <span className="font-bold text-[#344054]">
              {filteredReports.length}
            </span>{" "}
            reports
          </p>

          <p className="hidden text-xs text-[#98A2B3] sm:block">
            Select a report to view its details
          </p>
        </div>
      </div>
    </div>
  );
}
export default AllReports;
