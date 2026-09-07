import { useMemo, useState } from "react";

const initialLogs = [
  {
    id: "LOG-2026-001",
    timestamp: "Sep 5, 2026 • 09:42 PM",
    user: "Administrator",
    role: "Barangay Personnel",
    action: "Report Verified",
    category: "Report Action",
    target: "RPT-2026-001",
    details:
      "Flooding report was verified and marked as valid for further response coordination.",
    status: "Success",
  },
  {
    id: "LOG-2026-002",
    timestamp: "Sep 5, 2026 • 09:35 PM",
    user: "Carlos Mendoza",
    role: "Response Team Leader",
    action: "Personnel Assigned",
    category: "Report Action",
    target: "RPT-2026-003",
    details:
      "Emergency Response Team A was assigned to handle the reported medical assistance request.",
    status: "Success",
  },
  {
    id: "LOG-2026-003",
    timestamp: "Sep 5, 2026 • 09:18 PM",
    user: "Administrator",
    role: "Barangay Personnel",
    action: "Priority Confirmed",
    category: "Report Action",
    target: "RPT-2026-002",
    details:
      "Road obstruction report was reviewed and confirmed as High Priority.",
    status: "Success",
  },
  {
    id: "LOG-2026-004",
    timestamp: "Sep 5, 2026 • 08:55 PM",
    user: "Administrator",
    role: "Barangay Personnel",
    action: "Announcement Published",
    category: "System Action",
    target: "ANN-2026-001",
    details:
      "Flood Warning Advisory was published and made visible to all residents.",
    status: "Success",
  },
  {
    id: "LOG-2026-005",
    timestamp: "Sep 5, 2026 • 08:41 PM",
    user: "Mark Reyes",
    role: "Emergency Responder",
    action: "Report Status Updated",
    category: "Report Action",
    target: "RPT-2026-004",
    details: "Incident status was updated from Assigned to Monitoring.",
    status: "Success",
  },
  {
    id: "LOG-2026-006",
    timestamp: "Sep 5, 2026 • 07:32 PM",
    user: "Administrator",
    role: "Barangay Personnel",
    action: "Resident Account Viewed",
    category: "Account Action",
    target: "RES-2026-001",
    details:
      "Resident profile and account information were accessed for administrative review.",
    status: "Success",
  },
  {
    id: "LOG-2026-007",
    timestamp: "Sep 5, 2026 • 06:48 PM",
    user: "Administrator",
    role: "Barangay Personnel",
    action: "Announcement Drafted",
    category: "System Action",
    target: "ANN-2026-005",
    details: "A new community announcement was created and saved as draft.",
    status: "Success",
  },
  {
    id: "LOG-2026-008",
    timestamp: "Sep 5, 2026 • 05:26 PM",
    user: "Ramon Cruz",
    role: "Barangay Personnel",
    action: "Account Status Updated",
    category: "Account Action",
    target: "PER-2026-006",
    details: "Personnel account status was changed to Inactive.",
    status: "Success",
  },
  {
    id: "LOG-2026-009",
    timestamp: "Sep 5, 2026 • 04:17 PM",
    user: "Administrator",
    role: "Barangay Personnel",
    action: "Manual Report Added",
    category: "Report Action",
    target: "RPT-2026-011",
    details: "A report was manually encoded by authorized barangay personnel.",
    status: "Success",
  },
  {
    id: "LOG-2026-010",
    timestamp: "Sep 5, 2026 • 03:52 PM",
    user: "Administrator",
    role: "Barangay Personnel",
    action: "Settings Viewed",
    category: "System Action",
    target: "SYS-SETTINGS",
    details: "System settings and administrative configuration were accessed.",
    status: "Success",
  },
];

const categoryOptions = [
  "All Categories",
  "Report Action",
  "Account Action",
  "System Action",
];

const actionStyles = {
  "Report Verified": {
    badge: "bg-[#E8F8F4] text-[#008F78]",
    dot: "bg-[#00C9A7]",
  },
  "Personnel Assigned": {
    badge: "bg-[#EEF2FF] text-[#4F46E5]",
    dot: "bg-[#6366F1]",
  },
  "Priority Confirmed": {
    badge: "bg-[#FFF4D6] text-[#A16207]",
    dot: "bg-[#EAB308]",
  },
  "Announcement Published": {
    badge: "bg-[#E8F8F4] text-[#008F78]",
    dot: "bg-[#00C9A7]",
  },
  "Report Status Updated": {
    badge: "bg-[#EEF2FF] text-[#4F46E5]",
    dot: "bg-[#6366F1]",
  },
  "Resident Account Viewed": {
    badge: "bg-[#F2F4F7] text-[#475467]",
    dot: "bg-[#667085]",
  },
  "Announcement Drafted": {
    badge: "bg-[#F2F4F7] text-[#475467]",
    dot: "bg-[#667085]",
  },
  "Account Status Updated": {
    badge: "bg-[#FEF0F0] text-[#C53030]",
    dot: "bg-[#EF4444]",
  },
  "Manual Report Added": {
    badge: "bg-[#E8F8F4] text-[#008F78]",
    dot: "bg-[#00C9A7]",
  },
  "Settings Viewed": {
    badge: "bg-[#F2F4F7] text-[#475467]",
    dot: "bg-[#667085]",
  },
};

function AuditLogs() {
  const [logs] = useState(initialLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [selectedLog, setSelectedLog] = useState(initialLogs[0]);

  const filteredLogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesCategory =
        categoryFilter === "All Categories" || log.category === categoryFilter;

      const matchesSearch =
        !query ||
        log.id.toLowerCase().includes(query) ||
        log.user.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.target.toLowerCase().includes(query) ||
        log.details.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [logs, searchTerm, categoryFilter]);

  const todayCount = logs.filter((log) =>
    log.timestamp.startsWith("Sep 5, 2026"),
  ).length;

  const reportActionCount = logs.filter(
    (log) => log.category === "Report Action",
  ).length;

  const systemActionCount = logs.filter(
    (log) => log.category === "System Action",
  ).length;

  const getActionStyle = (action) =>
    actionStyles[action] || {
      badge: "bg-[#F2F4F7] text-[#475467]",
      dot: "bg-[#667085]",
    };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      {/* PAGE HEADER */}
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8346F2]">
            System
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1F1D47]">
            Audit Logs
          </h1>

          <p className="mt-1 text-sm text-[#667085]">
            Track administrative activities and system actions.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-[#E4E7EC] bg-white px-3 py-2 shadow-sm sm:flex">
          <span className="h-2 w-2 rounded-full bg-[#2ED47A]" />
          <span className="text-xs font-semibold text-[#475467]">
            Audit trail active
          </span>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard
          label="Total Logs"
          value={logs.length}
          description="Recorded activities"
          icon={<ListIcon />}
        />

        <SummaryCard
          label="Today"
          value={todayCount}
          description="Activities recorded today"
          icon={<ClockIcon />}
        />

        <SummaryCard
          label="Report Actions"
          value={reportActionCount}
          description="Actions involving reports"
          icon={<ReportIcon />}
        />

        <SummaryCard
          label="System Actions"
          value={systemActionCount}
          description="Administrative activities"
          icon={<SettingsIcon />}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.8fr)]">
        {/* LOG LIST */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
          {/* FILTER BAR */}
          <div className="flex shrink-0 flex-col gap-3 border-b border-[#E4E7EC] p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#1F1D47]">
                Activity History
              </h2>

              <p className="mt-0.5 text-xs text-[#667085]">
                {filteredLogs.length} of {logs.length} logs displayed
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* SEARCH */}
              <div className="relative min-w-0 sm:w-64">
                <SearchIcon />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search logs..."
                  className="h-9 w-full rounded-lg border border-[#E4E7EC] bg-[#FCFCFD] pl-9 pr-3 text-xs text-[#1F1D47] outline-none transition focus:border-[#8346F2] focus:ring-2 focus:ring-[#8346F2]/10"
                />
              </div>

              {/* CATEGORY */}
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="h-9 rounded-lg border border-[#E4E7EC] bg-[#FCFCFD] px-3 text-xs font-medium text-[#475467] outline-none focus:border-[#8346F2] focus:ring-2 focus:ring-[#8346F2]/10"
              >
                {categoryOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#FCFCFD]">
                <tr className="border-b border-[#E4E7EC]">
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#667085]">
                    Date & Time
                  </th>

                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#667085]">
                    User
                  </th>

                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#667085]">
                    Action
                  </th>

                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#667085]">
                    Target
                  </th>

                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#667085]">
                    Category
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => {
                  const style = getActionStyle(log.action);
                  const isSelected = selectedLog?.id === log.id;

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`cursor-pointer border-b border-[#F0F1F3] transition hover:bg-[#F9F7FF] ${
                        isSelected ? "bg-[#F7F3FF]" : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="whitespace-nowrap text-xs font-semibold text-[#344054]">
                          {log.timestamp}
                        </div>

                        <div className="mt-0.5 text-[10px] font-medium text-[#98A2B3]">
                          {log.id}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-[10px] font-extrabold text-[#6D28D9]">
                            {getInitials(log.user)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[#344054]">
                              {log.user}
                            </p>

                            <p className="truncate text-[10px] text-[#98A2B3]">
                              {log.role}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${style.badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                          />
                          {log.action}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-md bg-[#F2F4F7] px-2 py-1 font-mono text-[10px] font-semibold text-[#475467]">
                          {log.target}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-[#667085]">
                          {log.category}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F4F7]">
                        <SearchIcon />
                      </div>

                      <p className="mt-3 text-sm font-bold text-[#344054]">
                        No audit logs found
                      </p>

                      <p className="mt-1 text-xs text-[#98A2B3]">
                        Try adjusting your search or category filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* DETAILS PANEL */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
          <div className="shrink-0 border-b border-[#E4E7EC] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8346F2]">
              Log Details
            </p>

            <h2 className="mt-1 text-lg font-extrabold text-[#1F1D47]">
              Activity Information
            </h2>
          </div>

          {selectedLog ? (
            <div className="min-h-0 flex-1 overflow-auto p-4">
              {/* ACTION */}
              <div className="rounded-xl border border-[#E4E7EC] bg-[#FCFCFD] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#98A2B3]">
                      Action
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-[#1F1D47]">
                      {selectedLog.action}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F8F4] px-2.5 py-1 text-[10px] font-bold text-[#008F78]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2ED47A]" />
                    {selectedLog.status}
                  </span>
                </div>
              </div>

              {/* DETAILS */}
              <div className="mt-4">
                <DetailRow label="Log ID" value={selectedLog.id} mono />
                <DetailRow label="Date & Time" value={selectedLog.timestamp} />
                <DetailRow label="User" value={selectedLog.user} />
                <DetailRow label="Role" value={selectedLog.role} />
                <DetailRow label="Category" value={selectedLog.category} />
                <DetailRow label="Target" value={selectedLog.target} mono />
              </div>

              {/* DESCRIPTION */}
              <div className="mt-4 rounded-xl border border-[#E4E7EC] bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#98A2B3]">
                  Activity Description
                </p>

                <p className="mt-2 text-xs leading-5 text-[#475467]">
                  {selectedLog.details}
                </p>
              </div>

              {/* SECURITY NOTE */}
              <div className="mt-4 rounded-xl border border-[#E4E7EC] bg-[#F9F7FF] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDE9FE] text-[#8346F2]">
                    <ShieldIcon />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#1F1D47]">
                      Audit Trail Record
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-[#667085]">
                      This activity is recorded for administrative
                      accountability and system monitoring.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              <p className="text-sm text-[#98A2B3]">
                Select an audit log to view its details.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, description, icon }) {
  return (
    <div className="rounded-2xl border border-[#E4E7EC] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#667085]">{label}</p>

          <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#1F1D47]">
            {value}
          </p>

          <p className="mt-0.5 text-[10px] font-medium text-[#98A2B3]">
            {description}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0EBFF] text-[#8346F2]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#F0F1F3] py-2.5 last:border-b-0">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-[#98A2B3]">
        {label}
      </span>

      <span
        className={`text-right text-xs font-semibold text-[#344054] ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.46 15a1.7 1.7 0 0 0-1.56-1.03H6.7v-2.4h.2a1.7 1.7 0 0 0 1.56-1.03 1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56V5.5h2.4v.2a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.2v2.4h-.2A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 3 5 6v5c0 4.5 2.9 8.4 7 10 4.1-1.6 7-5.5 7-10V6z" />
      <path d="m9.5 12 1.7 1.7 3.5-3.5" />
    </svg>
  );
}

export default AuditLogs;
