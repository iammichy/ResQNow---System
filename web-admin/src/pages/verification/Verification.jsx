import { useMemo, useState } from "react";

const initialReports = [
  {
    id: "RPT-2026-002",
    type: "Road Obstruction",
    category: "Incident-Related",
    location: "National Highway",
    submitted: "Sep 4, 2026 • 09:18 AM",
    reporter: "Maria Santos",
    priority: "High",
    verification: "Pending",
    description:
      "A large obstruction is blocking part of the roadway and may affect vehicle access.",
    affected: "Estimated 15–20 people",
    vulnerable: "None reported",
    evidence: "2 photos attached",
    waterLevel: "Not applicable",
    roadPassability: "Partially blocked",
  },
  {
    id: "RPT-2026-005",
    type: "Fallen Tree",
    category: "Incident-Related",
    location: "Camunatan Main Road",
    submitted: "Sep 4, 2026 • 07:46 AM",
    reporter: "Carlos Mendoza",
    priority: "Medium",
    verification: "Pending",
    description:
      "A fallen tree was reported along the main road and may obstruct local traffic.",
    affected: "Estimated 8–10 people",
    vulnerable: "None reported",
    evidence: "1 photo attached",
    waterLevel: "Not applicable",
    roadPassability: "Partially blocked",
  },
  {
    id: "RPT-2026-009",
    type: "Rising Water Level",
    category: "Hazard-Related",
    location: "Purok 6, Camunatan",
    submitted: "Sep 4, 2026 • 06:58 AM",
    reporter: "Daniel Ramos",
    priority: "High",
    verification: "Pending",
    description:
      "Water level is rising near residential areas following continuous rainfall.",
    affected: "Estimated 35 people",
    vulnerable: "Children and senior citizens",
    evidence: "3 photos attached",
    waterLevel: "Knee level",
    roadPassability: "Passable with caution",
  },
  {
    id: "RPT-2026-010",
    type: "Medical Assistance",
    category: "Assistance-Related",
    location: "Purok 2, Camunatan",
    submitted: "Sep 4, 2026 • 06:34 AM",
    reporter: "Liza Bautista",
    priority: "Critical",
    verification: "Pending",
    description:
      "A resident is requesting immediate medical assistance due to an emergency condition.",
    affected: "1 person",
    vulnerable: "Senior citizen",
    evidence: "No photo attached",
    waterLevel: "Not applicable",
    roadPassability: "Passable",
  },
];

const priorityStyles = {
  Critical: "border-[#FECDCA] bg-[#FEF3F2] text-[#D92D20]",
  High: "border-[#FEDF89] bg-[#FFF4E5] text-[#B54708]",
  Medium: "border-[#FDE68A] bg-[#FFFAEB] text-[#A15C00]",
  Low: "border-[#E4E7EC] bg-[#F2F4F7] text-[#667085]",
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

function Verification() {
  const [reports, setReports] = useState(initialReports);
  const [selectedId, setSelectedId] = useState(initialReports[0]?.id ?? "");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [actionMessage, setActionMessage] = useState("");

  const pendingReports = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        normalizedSearch === "" ||
        report.id.toLowerCase().includes(normalizedSearch) ||
        report.type.toLowerCase().includes(normalizedSearch) ||
        report.location.toLowerCase().includes(normalizedSearch) ||
        report.reporter.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "All" || report.category === categoryFilter;

      return (
        report.verification === "Pending" && matchesSearch && matchesCategory
      );
    });
  }, [reports, searchTerm, categoryFilter]);

  const selectedReport =
    reports.find((report) => report.id === selectedId) ?? null;

  const pendingCount = reports.filter(
    (report) => report.verification === "Pending",
  ).length;

  const verifiedCount = reports.filter(
    (report) => report.verification === "Verified",
  ).length;

  const returnedCount = reports.filter(
    (report) => report.verification === "Returned",
  ).length;

  const handleSelectReport = (reportId) => {
    setSelectedId(reportId);
    setActionMessage("");
  };

  const handleVerification = (result) => {
    if (!selectedReport) {
      return;
    }

    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === selectedReport.id
          ? { ...report, verification: result }
          : report,
      ),
    );

    setActionMessage(
      result === "Verified"
        ? `${selectedReport.id} has been verified.`
        : `${selectedReport.id} has been returned for review.`,
    );

    const nextReport = pendingReports.find(
      (report) => report.id !== selectedReport.id,
    );

    setSelectedId(nextReport?.id ?? "");
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* PAGE HEADER */}
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8346F2]">
            Operations
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1F1D47]">
            Verification
          </h1>

          <p className="mt-1 text-sm text-[#667085]">
            Review submitted reports before they enter the response workflow.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-[#E4E7EC] bg-white px-3 py-2 sm:flex">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2ED47A]" />
          <span className="text-xs font-semibold text-[#475467]">
            Verification Queue Active
          </span>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#FEDF89] bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">
            Pending Review
          </p>
          <p className="mt-2 text-2xl font-extrabold text-[#B54708]">
            {pendingCount}
          </p>
          <p className="mt-1 text-xs font-medium text-[#667085]">
            Requires action
          </p>
        </div>

        <div className="rounded-2xl border border-[#ABEFC6] bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">
            Verified
          </p>
          <p className="mt-2 text-2xl font-extrabold text-[#027A48]">
            {verifiedCount}
          </p>
          <p className="mt-1 text-xs font-medium text-[#667085]">
            Cleared reports
          </p>
        </div>

        <div className="rounded-2xl border border-[#E4E7EC] bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">
            Returned
          </p>
          <p className="mt-2 text-2xl font-extrabold text-[#667085]">
            {returnedCount}
          </p>
          <p className="mt-1 text-xs font-medium text-[#667085]">
            Needs correction
          </p>
        </div>

        <div className="rounded-2xl border border-[#FECDCA] bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">
            Critical Queue
          </p>
          <p className="mt-2 text-2xl font-extrabold text-[#D92D20]">
            {
              reports.filter(
                (report) =>
                  report.verification === "Pending" &&
                  report.priority === "Critical",
              ).length
            }
          </p>
          <p className="mt-1 text-xs font-medium text-[#667085]">
            Review immediately
          </p>
        </div>
      </div>

      {/* VERIFICATION WORKSPACE */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.6fr)]">
        {/* QUEUE */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
          <div className="shrink-0 border-b border-[#E4E7EC] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#1F1D47]">
                  Verification Queue
                </h2>
                <p className="mt-0.5 text-xs text-[#667085]">
                  Reports awaiting review
                </p>
              </div>

              <span className="rounded-full bg-[#FFF4E5] px-2.5 py-1 text-[11px] font-bold text-[#B54708]">
                {pendingCount} pending
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] px-3 focus-within:border-[#8346F2] focus-within:bg-white">
                <span className="text-sm text-[#667085]">⌕</span>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search queue..."
                  className="min-w-0 flex-1 bg-transparent text-xs text-[#1F1D47] outline-none placeholder:text-[#98A2B3]"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="h-9 rounded-lg border border-[#E4E7EC] bg-white px-2 text-xs font-medium text-[#475467] outline-none focus:border-[#8346F2]"
                aria-label="Filter verification category"
              >
                <option value="All">All</option>
                <option value="Hazard-Related">Hazard</option>
                <option value="Incident-Related">Incident</option>
                <option value="Assistance-Related">Assistance</option>
              </select>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {pendingReports.length > 0 ? (
              <div className="divide-y divide-[#E4E7EC]">
                {pendingReports.map((report) => {
                  const isSelected = selectedId === report.id;

                  return (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => handleSelectReport(report.id)}
                      className={`w-full px-4 py-3 text-left transition ${
                        isSelected ? "bg-[#F5F3FF]" : "hover:bg-[#FAF9FF]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                            report.priority === "Critical"
                              ? "bg-[#FEF3F2] text-[#D92D20]"
                              : report.priority === "High"
                                ? "bg-[#FFF4E5] text-[#B54708]"
                                : "bg-[#FFFAEB] text-[#A15C00]"
                          }`}
                        >
                          {report.type.charAt(0)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-xs font-bold text-[#1F1D47]">
                              {report.id}
                            </p>

                            <span
                              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                                priorityStyles[report.priority]
                              }`}
                            >
                              {report.priority}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-sm font-semibold text-[#344054]">
                            {report.type}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-[#667085]">
                            {report.location}
                          </p>

                          <p className="mt-1.5 text-[10px] font-medium text-[#98A2B3]">
                            {report.submitted}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF3] text-xl text-[#027A48]">
                    ✓
                  </div>

                  <p className="mt-3 text-sm font-bold text-[#1F1D47]">
                    Queue is clear
                  </p>

                  <p className="mt-1 text-xs text-[#667085]">
                    No pending reports match the current filters.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SELECTED REPORT */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
          {selectedReport ? (
            <>
              <div className="shrink-0 border-b border-[#E4E7EC] px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#8346F2]">
                        {selectedReport.id}
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                          priorityStyles[selectedReport.priority]
                        }`}
                      >
                        {selectedReport.priority} Priority
                      </span>
                    </div>

                    <h2 className="mt-2 text-xl font-extrabold text-[#1F1D47]">
                      {selectedReport.type}
                    </h2>

                    <p className="mt-1 text-xs text-[#667085]">
                      Submitted {selectedReport.submitted}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full border border-[#FEDF89] bg-[#FFFAEB] px-3 py-1.5 text-[11px] font-bold text-[#B54708]">
                    Pending Verification
                  </span>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto">
                <div className="space-y-5 p-5">
                  {/* REPORT DETAILS */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8346F2]">
                      Report Information
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-4 lg:grid-cols-3">
                      <InfoItem
                        label="Reporter"
                        value={selectedReport.reporter}
                      />

                      <InfoItem
                        label="Category"
                        value={selectedReport.category}
                      />

                      <InfoItem
                        label="Location"
                        value={selectedReport.location}
                      />

                      <InfoItem
                        label="People Affected"
                        value={selectedReport.affected}
                      />

                      <InfoItem
                        label="Vulnerable Persons"
                        value={selectedReport.vulnerable}
                      />

                      <InfoItem
                        label="Evidence"
                        value={selectedReport.evidence}
                      />
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
                      Report Description
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#475467]">
                      {selectedReport.description}
                    </p>
                  </div>

                  {/* RISK CHECK */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8346F2]">
                      Triage Indicators
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-[#E4E7EC] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#98A2B3]">
                          Water Level
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#344054]">
                          {selectedReport.waterLevel}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#E4E7EC] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#98A2B3]">
                          Road Passability
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#344054]">
                          {selectedReport.roadPassability}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#E4E7EC] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#98A2B3]">
                          Assistance Need
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#344054]">
                          {selectedReport.priority === "Critical"
                            ? "Immediate"
                            : "Standard"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#E4E7EC] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#98A2B3]">
                          Evidence
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#344054]">
                          {selectedReport.evidence}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* EVIDENCE PLACEHOLDER */}
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8346F2]">
                        Submitted Evidence
                      </p>

                      <span className="text-[10px] font-semibold text-[#98A2B3]">
                        Preview
                      </span>
                    </div>

                    <div className="mt-3 flex h-24 items-center justify-center rounded-xl border border-dashed border-[#D0D5DD] bg-[#F8FAFC]">
                      <div className="text-center">
                        <div className="text-xl text-[#98A2B3]">▧</div>
                        <p className="mt-1 text-xs font-semibold text-[#667085]">
                          {selectedReport.evidence}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BAR */}
              <div className="shrink-0 border-t border-[#E4E7EC] bg-[#FCFCFD] p-4">
                {actionMessage && (
                  <div className="mb-3 rounded-lg border border-[#ABEFC6] bg-[#ECFDF3] px-3 py-2 text-xs font-semibold text-[#027A48]">
                    {actionMessage}
                  </div>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => handleVerification("Returned")}
                    className="rounded-xl border border-[#E4E7EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#667085] transition hover:border-[#D92D20] hover:bg-[#FEF3F2] hover:text-[#D92D20]"
                  >
                    Return for Review
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerification("Verified")}
                    className="rounded-xl bg-[#2ED47A] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#24BE69] active:scale-[0.98]"
                  >
                    ✓ Verify Report
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F3FF] text-2xl text-[#8346F2]">
                  ✓
                </div>

                <h2 className="mt-4 text-lg font-bold text-[#1F1D47]">
                  No report selected
                </h2>

                <p className="mt-1 max-w-sm text-sm text-[#667085]">
                  Select a pending report from the verification queue to review
                  its information.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Verification;
