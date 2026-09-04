import { useMemo, useState } from "react";

export default function AllReports({ reports = [], onViewReport }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [reportType, setReportType] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [purok, setPurok] = useState("");
  const [concernType, setConcernType] = useState("");
  const [source, setSource] = useState("");

  const filterOptions = useMemo(() => {
    const getUniqueValues = (field) => {
      return [
        ...new Set(reports.map((report) => report[field]).filter(Boolean)),
      ].sort();
    };

    return {
      reportTypes: getUniqueValues("report_type"),
      statuses: getUniqueValues("status"),
      priorities: getUniqueValues("priority"),
      puroks: getUniqueValues("purok"),
      concernTypes: getUniqueValues("concern_type"),
      sources: getUniqueValues("source"),
    };
  }, [reports]);

  const filteredReports = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !search ||
        [
          report.report_id,
          report.report_type,
          report.concern_type,
          report.status,
          report.priority,
          report.purok,
          report.location,
          report.reporter_name,
          report.reporter_contact,
          report.source,
          report.assigned_to,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));

      const matchesReportType =
        !reportType || report.report_type === reportType;

      const matchesStatus = !status || report.status === status;

      const matchesPriority = !priority || report.priority === priority;

      const matchesPurok = !purok || report.purok === purok;

      const matchesConcernType =
        !concernType || report.concern_type === concernType;

      const matchesSource = !source || report.source === source;

      return (
        matchesSearch &&
        matchesReportType &&
        matchesStatus &&
        matchesPriority &&
        matchesPurok &&
        matchesConcernType &&
        matchesSource
      );
    });
  }, [
    reports,
    searchTerm,
    reportType,
    status,
    priority,
    purok,
    concernType,
    source,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setReportType("");
    setStatus("");
    setPriority("");
    setPurok("");
    setConcernType("");
    setSource("");
  };

  const hasActiveFilters = Boolean(
    searchTerm ||
    reportType ||
    status ||
    priority ||
    purok ||
    concernType ||
    source,
  );

  const emergencyCount = reports.filter(
    (report) => report.report_type === "Emergency",
  ).length;

  const highPriorityCount = reports.filter(
    (report) => report.priority === "High",
  ).length;

  const unresolvedCount = reports.filter(
    (report) => report.status !== "Resolved" && report.status !== "Invalid",
  ).length;

  const getStatusClass = (reportStatus) => {
    switch (reportStatus) {
      case "Resolved":
        return "bg-green-50 text-green-700 ring-green-200";
      case "Invalid":
        return "bg-red-50 text-red-700 ring-red-200";
      case "In Progress":
        return "bg-amber-50 text-amber-700 ring-amber-200";
      default:
        return "bg-blue-50 text-blue-700 ring-blue-200";
    }
  };

  const getPriorityClass = (reportPriority) => {
    switch (reportPriority) {
      case "High":
        return "bg-red-50 text-red-700 ring-red-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 ring-amber-200";
      default:
        return "bg-slate-50 text-slate-600 ring-slate-200";
    }
  };

  const getVerificationClass = (verificationStatus) => {
    switch (verificationStatus) {
      case "Verified":
        return "bg-green-50 text-green-700 ring-green-200";
      case "Invalid":
        return "bg-red-50 text-red-700 ring-red-200";
      case "More Information Requested":
        return "bg-amber-50 text-amber-700 ring-amber-200";
      default:
        return "bg-blue-50 text-blue-700 ring-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">
            All Reports
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Monitor, review, and manage all emergency and incident reports
            submitted to the barangay.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Reports */}
          <div className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Total Reports
              </p>

              <span className="h-2 w-2 rounded-full bg-slate-400" />
            </div>

            <div>
              <p className="mt-4 text-3xl font-bold leading-none text-slate-900">
                {reports.length}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                All recorded reports
              </p>
            </div>
          </div>

          {/* Emergency */}
          <div className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-red-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-red-500">
                Emergency
              </p>

              <span className="h-2 w-2 rounded-full bg-red-500" />
            </div>

            <div>
              <p className="mt-4 text-3xl font-bold leading-none text-slate-900">
                {emergencyCount}
              </p>

              <p className="mt-2 text-xs text-slate-500">Emergency reports</p>
            </div>
          </div>

          {/* High Priority */}
          <div className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                High Priority
              </p>

              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </div>

            <div>
              <p className="mt-4 text-3xl font-bold leading-none text-slate-900">
                {highPriorityCount}
              </p>

              <p className="mt-2 text-xs text-slate-500">Requires attention</p>
            </div>
          </div>

          {/* Active Reports */}
          <div className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                Active Reports
              </p>

              <span className="h-2 w-2 rounded-full bg-blue-500" />
            </div>

            <div>
              <p className="mt-4 text-3xl font-bold leading-none text-slate-900">
                {unresolvedCount}
              </p>

              <p className="mt-2 text-xs text-slate-500">Not yet resolved</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Search and Filters
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Find a report using keywords or specific criteria.
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-semibold text-blue-600 transition hover:text-blue-800"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          <div className="px-6 py-6">
            {/* Search */}
            <div>
              <label
                htmlFor="reportSearch"
                className="block text-sm font-semibold text-slate-700"
              >
                Search Reports
              </label>

              <div className="relative mt-2">
                <input
                  id="reportSearch"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search report ID, reporter, concern, location..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="reportType"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Report Type
                </label>

                <select
                  id="reportType"
                  value={reportType}
                  onChange={(event) => setReportType(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="">All Report Types</option>

                  {filterOptions.reportTypes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="">All Statuses</option>

                  {filterOptions.statuses.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Priority
                </label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="">All Priorities</option>

                  {filterOptions.priorities.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="purok"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Purok / Location
                </label>

                <select
                  id="purok"
                  value={purok}
                  onChange={(event) => setPurok(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="">All Puroks</option>

                  {filterOptions.puroks.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="concernType"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Concern Type
                </label>

                <select
                  id="concernType"
                  value={concernType}
                  onChange={(event) => setConcernType(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="">All Concern Types</option>

                  {filterOptions.concernTypes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="source"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Source
                </label>

                <select
                  id="source"
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="">All Sources</option>

                  {filterOptions.sources.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results indicator */}
            <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-900">
                  {filteredReports.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-900">
                  {reports.length}
                </span>{" "}
                reports
              </p>

              {hasActiveFilters && (
                <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Filters applied
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Reports List */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-white px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Report List
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Review submitted reports and open their full details.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {filteredReports.length} result
                {filteredReports.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredReports.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                  !
                </div>

                <p className="mt-4 text-base font-bold text-slate-800">
                  No reports found
                </p>

                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  No reports match your current search or filter selections.
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              filteredReports.map((report) => (
                <article
                  key={report.report_id}
                  className="group px-6 py-6 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    {/* Report Information */}
                    <div className="min-w-0 flex-1">
                      {/* Top row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {report.report_id}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                            report.report_type === "Emergency"
                              ? "bg-red-50 text-red-700 ring-red-200"
                              : "bg-blue-50 text-blue-700 ring-blue-200"
                          }`}
                        >
                          {report.report_type}
                        </span>

                        {report.priority && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getPriorityClass(
                              report.priority,
                            )}`}
                          >
                            {report.priority} Priority
                          </span>
                        )}

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusClass(
                            report.status,
                          )}`}
                        >
                          {report.status}
                        </span>

                        {report.verification_status && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getVerificationClass(
                              report.verification_status,
                            )}`}
                          >
                            {report.verification_status}
                          </span>
                        )}
                      </div>

                      {/* Concern */}
                      <h4 className="mt-4 text-lg font-bold text-slate-900">
                        {report.concern_type}
                      </h4>

                      {/* Description */}
                      {report.description && (
                        <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">
                          {report.description}
                        </p>
                      )}

                      {/* Details */}
                      <div className="mt-4 grid gap-x-8 gap-y-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                        <p>
                          <span className="font-semibold text-slate-500">
                            Reporter:
                          </span>{" "}
                          {report.reporter_name || "Not provided"}
                        </p>

                        <p>
                          <span className="font-semibold text-slate-500">
                            Contact:
                          </span>{" "}
                          {report.reporter_contact || "Not provided"}
                        </p>

                        <p>
                          <span className="font-semibold text-slate-500">
                            Location:
                          </span>{" "}
                          {report.location || "Not provided"}
                        </p>

                        <p>
                          <span className="font-semibold text-slate-500">
                            Source:
                          </span>{" "}
                          {report.source || "Not provided"}
                        </p>

                        <p>
                          <span className="font-semibold text-slate-500">
                            Assigned:
                          </span>{" "}
                          {report.assigned_to || "Unassigned"}
                        </p>

                        {report.date_submitted && (
                          <p>
                            <span className="font-semibold text-slate-500">
                              Submitted:
                            </span>{" "}
                            {report.date_submitted}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0 border-t border-slate-100 pt-4 xl:border-0 xl:pt-0">
                      <button
                        type="button"
                        onClick={() => onViewReport(report)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 xl:w-auto"
                      >
                        View Report
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
