import { residents } from "../data/sampleAdminData";

export default function AdminDashboard({
  reports,
  onViewAllReports,
  onViewReport,
}) {
  const emergencyReports = reports.filter(
    (report) => report.report_type === "Emergency",
  );

  const nonEmergencyReports = reports.filter(
    (report) => report.report_type !== "Emergency",
  );

  const pendingVerificationReports = reports.filter(
    (report) =>
      !report.verification_status ||
      report.verification_status === "Pending Verification",
  );

  const inProgressReports = reports.filter(
    (report) => report.status === "In Progress",
  );

  const resolvedReports = reports.filter(
    (report) => report.status === "Resolved" || report.resolved === true,
  );

  const highPriorityReports = reports.filter(
    (report) => report.priority === "High",
  );

  const mediumPriorityReports = reports.filter(
    (report) => report.priority === "Medium",
  );

  const lowPriorityReports = reports.filter(
    (report) => report.priority === "Low",
  );

  // Only active high-priority emergency reports should appear here.
  const urgentReports = emergencyReports.filter(
    (report) =>
      report.priority === "High" &&
      report.status !== "Resolved" &&
      report.status !== "Invalid" &&
      report.resolved !== true,
  );

  const verifiedResidents = residents.filter(
    (resident) => resident.account_status === "Verified",
  );

  const getStatusClasses = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-50 text-green-700 ring-green-100";

      case "Invalid":
        return "bg-red-50 text-red-700 ring-red-100";

      case "In Progress":
        return "bg-blue-50 text-blue-700 ring-blue-100";

      case "Pending Verification":
        return "bg-amber-50 text-amber-700 ring-amber-100";

      default:
        return "bg-slate-50 text-slate-600 ring-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* Page Heading */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Admin Dashboard
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Monitor and manage barangay reports and emergency incidents.
            </p>
          </div>

          <button
            type="button"
            onClick={onViewAllReports}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            View All Reports
          </button>
        </div>

        {/* Emergency Alert */}
        {urgentReports.length > 0 && (
          <div className="mb-8 flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 shrink-0 rounded-full bg-red-600" />

              <p className="text-sm font-semibold text-red-800">
                {urgentReports.length} high-priority emergency report
                {urgentReports.length > 1 ? "s" : ""} need
                {urgentReports.length > 1 ? "" : "s"} immediate attention.
              </p>
            </div>

            <button
              type="button"
              onClick={onViewAllReports}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              Review Now
            </button>
          </div>
        )}

        {/* Urgent Emergency Reports */}
        {urgentReports.length > 0 && (
          <section className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Urgent Emergency Reports
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Active high-priority incidents requiring immediate attention.
                </p>
              </div>

              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 ring-1 ring-red-100">
                {urgentReports.length} Active
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {urgentReports.map((report) => (
                <div
                  key={report.report_id}
                  className="px-6 py-5 transition hover:bg-slate-50/70"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {report.report_id}
                        </span>

                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 ring-1 ring-red-100">
                          {report.priority}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${getStatusClasses(
                            report.status,
                          )}`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <h4 className="mt-3 text-base font-bold text-slate-900">
                        {report.concern_type}
                      </h4>

                      <div className="mt-2 grid gap-x-8 gap-y-1 text-sm text-slate-600 sm:grid-cols-2">
                        <p>
                          <span className="font-medium text-slate-700">
                            Reporter:
                          </span>{" "}
                          {report.reporter_name}
                        </p>

                        <p>
                          <span className="font-medium text-slate-700">
                            Contact:
                          </span>{" "}
                          {report.reporter_contact}
                        </p>

                        <p>
                          <span className="font-medium text-slate-700">
                            Location:
                          </span>{" "}
                          {report.location}
                        </p>

                        <p>
                          <span className="font-medium text-slate-700">
                            Assigned:
                          </span>{" "}
                          {report.assigned_to || "Unassigned"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onViewReport(report)}
                      className="shrink-0 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Report Overview */}
        <section className="mb-10">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Report Overview
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Quick summary of all reported incidents
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Reports */}
            <div className="flex min-h-[128px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <span className="text-xl font-bold">▣</span>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Reports
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {reports.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  All submitted reports
                </p>
              </div>
            </div>

            {/* Emergency Reports */}
            <div className="flex min-h-[128px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <span className="text-xl font-bold">!</span>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Emergency Reports
                </p>

                <p className="mt-1 text-3xl font-bold text-red-600">
                  {emergencyReports.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Require immediate attention
                </p>
              </div>
            </div>

            {/* Non-Emergency Reports */}
            <div className="flex min-h-[128px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <span className="text-xl font-bold">○</span>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Non-Emergency Reports
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {nonEmergencyReports.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">General reports</p>
              </div>
            </div>

            {/* Verified Residents */}
            <div className="flex min-h-[128px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <span className="text-xl font-bold">✓</span>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Verified Residents
                </p>

                <p className="mt-1 text-3xl font-bold text-green-600">
                  {verifiedResidents.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">Approved accounts</p>
              </div>
            </div>
          </div>
        </section>

        {/* Status & Verification */}
        <section className="mb-10">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Status & Verification
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Track report progress and verification status
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Pending Verification */}
            <div className="flex min-h-[128px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <span className="text-xl font-bold">◷</span>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending Verification
                </p>

                <p className="mt-1 text-3xl font-bold text-amber-600">
                  {pendingVerificationReports.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">Awaiting review</p>
              </div>
            </div>

            {/* In Progress */}
            <div className="flex min-h-[128px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <span className="text-xl font-bold">↻</span>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  In Progress
                </p>

                <p className="mt-1 text-3xl font-bold text-blue-600">
                  {inProgressReports.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Currently being handled
                </p>
              </div>
            </div>

            {/* Resolved */}
            <div className="flex min-h-[128px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <span className="text-xl font-bold">✓</span>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">Resolved</p>

                <p className="mt-1 text-3xl font-bold text-green-600">
                  {resolvedReports.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Successfully resolved
                </p>
              </div>
            </div>

            {/* System Status */}
            <div className="flex min-h-[128px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50">
                <span className="h-3.5 w-3.5 rounded-full bg-green-500" />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  System Status
                </p>

                <p className="mt-1 text-xl font-bold text-green-700">
                  Operational
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  All systems normal
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Priority Distribution */}
        <section className="mb-8">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Priority Distribution
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Reports grouped by priority level
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* High */}
            <div className="flex min-h-[118px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <span className="text-lg font-bold">⚑</span>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  High Priority
                </p>

                <p className="mt-1 text-3xl font-bold text-red-600">
                  {highPriorityReports.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Urgent attention needed
                </p>
              </div>
            </div>

            {/* Medium */}
            <div className="flex min-h-[118px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <span className="text-lg font-bold">⚑</span>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Medium Priority
                </p>

                <p className="mt-1 text-3xl font-bold text-orange-500">
                  {mediumPriorityReports.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">Moderate priority</p>
              </div>
            </div>

            {/* Low */}
            <div className="flex min-h-[118px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <span className="text-lg font-bold">⚑</span>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Low Priority
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-600">
                  {lowPriorityReports.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">Standard priority</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mock Data Notice */}
        <p className="mt-8 text-center text-xs text-slate-400">
          Mock data mode — real API/database integration will be added later.
        </p>
      </main>
    </div>
  );
}
