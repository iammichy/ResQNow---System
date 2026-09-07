import { useMemo, useState } from "react";

const initialReports = [
  {
    id: "RPT-2026-002",
    type: "Road Obstruction",
    category: "Incident-Related",
    location: "National Highway",
    submitted: "Sep 4, 2026 • 09:18 AM",
    currentPriority: "High",
    recommendedPriority: "High",
    priorityStatus: "Pending",
    peopleAffected: "Estimated 15–20 people",
    vulnerablePersons: "None reported",
    threatToLife: "Potential",
    assistanceNeed: "Standard",
    accessImpact: "Partially affected",
    locationRisk: "High-traffic area",
    hazardSeverity: "Moderate",
    rateOfWorsening: "Stable",
    waterLevel: "Not applicable",
    roadPassability: "Partially blocked",
    evacuationNeed: "Not required",
  },
  {
    id: "RPT-2026-009",
    type: "Rising Water Level",
    category: "Hazard-Related",
    location: "Purok 6, Camunatan",
    submitted: "Sep 4, 2026 • 06:58 AM",
    currentPriority: "High",
    recommendedPriority: "Critical",
    priorityStatus: "Pending",
    peopleAffected: "Estimated 35 people",
    vulnerablePersons: "Children and senior citizens",
    threatToLife: "Potential",
    assistanceNeed: "Immediate",
    accessImpact: "Partially affected",
    locationRisk: "Flood-prone area",
    hazardSeverity: "Severe",
    rateOfWorsening: "Increasing",
    waterLevel: "Knee level",
    roadPassability: "Passable with caution",
    evacuationNeed: "Recommended",
  },
  {
    id: "RPT-2026-010",
    type: "Medical Assistance",
    category: "Assistance-Related",
    location: "Purok 2, Camunatan",
    submitted: "Sep 4, 2026 • 06:34 AM",
    currentPriority: "Critical",
    recommendedPriority: "Critical",
    priorityStatus: "Pending",
    peopleAffected: "1 person",
    vulnerablePersons: "Senior citizen",
    threatToLife: "Present",
    assistanceNeed: "Immediate",
    accessImpact: "No access impact",
    locationRisk: "Residential area",
    hazardSeverity: "Severe",
    rateOfWorsening: "Unknown",
    waterLevel: "Not applicable",
    roadPassability: "Passable",
    evacuationNeed: "Not required",
  },
];

const priorityStyles = {
  Critical: "border-[#FECDCA] bg-[#FEF3F2] text-[#D92D20]",
  High: "border-[#FEDF89] bg-[#FFF4E5] text-[#B54708]",
  Medium: "border-[#FDE68A] bg-[#FFFAEB] text-[#A15C00]",
  Low: "border-[#E4E7EC] bg-[#F2F4F7] text-[#667085]",
};

function TriageItem({ label, value, critical = false }) {
  return (
    <div className="rounded-xl border border-[#E4E7EC] bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#98A2B3]">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-bold ${
          critical ? "text-[#D92D20]" : "text-[#344054]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Prioritization() {
  const [reports, setReports] = useState(initialReports);
  const [selectedId, setSelectedId] = useState(initialReports[0].id);
  const [filter, setFilter] = useState("All");

  /*
   * Only reports that are still pending prioritization
   * should appear in the queue.
   */
  const pendingReports = useMemo(() => {
    return reports.filter((report) => report.priorityStatus === "Pending");
  }, [reports]);

  /*
   * Apply the priority filter only to pending reports.
   */
  const filteredReports = useMemo(() => {
    if (filter === "All") {
      return pendingReports;
    }

    return pendingReports.filter((report) => report.currentPriority === filter);
  }, [pendingReports, filter]);

  /*
   * Keep the selected report tied to the currently visible queue.
   * If the selected report is confirmed and removed from the queue,
   * automatically select the next available pending report.
   */
  const selectedReport =
    filteredReports.find((report) => report.id === selectedId) ??
    filteredReports[0] ??
    null;

  const handlePriorityChange = (priority) => {
    if (!selectedReport) {
      return;
    }

    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === selectedReport.id
          ? {
              ...report,
              currentPriority: priority,
            }
          : report,
      ),
    );
  };

  /*
   * Confirm the selected priority.
   * The report leaves the pending queue after confirmation.
   */
  const handleConfirmPriority = () => {
    if (!selectedReport) {
      return;
    }

    const currentIndex = filteredReports.findIndex(
      (report) => report.id === selectedReport.id,
    );

    const nextReport =
      filteredReports[currentIndex + 1] ??
      filteredReports[currentIndex - 1] ??
      null;

    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === selectedReport.id
          ? {
              ...report,
              priorityStatus: "Confirmed",
            }
          : report,
      ),
    );

    setSelectedId(nextReport?.id ?? "");
  };

  /*
   * Overall priority distribution.
   * These counts include both pending and confirmed reports.
   */
  const pendingCount = reports.filter(
    (report) => report.priorityStatus === "Pending",
  ).length;

  const criticalCount = reports.filter(
    (report) => report.currentPriority === "Critical",
  ).length;

  const highCount = reports.filter(
    (report) => report.currentPriority === "High",
  ).length;

  const mediumCount = reports.filter(
    (report) => report.currentPriority === "Medium",
  ).length;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* PAGE HEADER */}
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8346F2]">
            OPERATIONS
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1F1D47]">
            Prioritization
          </h1>

          <p className="mt-1 text-sm text-[#667085]">
            Review triage indicators and determine the response priority of
            verified reports.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-[#ABEFC6] bg-[#ECFDF3] px-3 py-2 sm:flex">
          <span className="h-2 w-2 rounded-full bg-[#2ED47A]" />

          <span className="text-xs font-semibold text-[#027A48]">
            Prioritization Queue Active
          </span>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
        {/* PENDING REVIEW */}
        <div className="rounded-2xl border border-[#E4E7EC] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Pending Review
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#1F1D47]">
            {pendingCount}
          </p>

          <p className="mt-1 text-xs text-[#667085]">
            Reports awaiting prioritization
          </p>
        </div>

        {/* CRITICAL */}
        <div className="rounded-2xl border border-[#FECDCA] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Critical
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#D92D20]">
            {criticalCount}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Immediate attention</p>
        </div>

        {/* HIGH */}
        <div className="rounded-2xl border border-[#FEDF89] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            High
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#B54708]">
            {highCount}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Priority response</p>
        </div>

        {/* MEDIUM */}
        <div className="rounded-2xl border border-[#FDE68A] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Medium
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#A15C00]">
            {mediumCount}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Routine response</p>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.6fr)]">
        {/* QUEUE */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
          <div className="shrink-0 border-b border-[#E4E7EC] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#1F1D47]">
                  Prioritization Queue
                </h2>

                <p className="mt-0.5 text-xs text-[#667085]">
                  Reports ready for priority review
                </p>
              </div>

              <span className="rounded-full bg-[#F4F3FF] px-2.5 py-1 text-[10px] font-bold text-[#6941C6]">
                {filteredReports.length} reports
              </span>
            </div>

            <div className="mt-3">
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="h-9 w-full rounded-xl border border-[#E4E7EC] bg-white px-3 text-xs font-medium text-[#344054] outline-none focus:border-[#8346F2]"
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => {
                const isSelected = report.id === selectedReport?.id;

                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedId(report.id)}
                    className={`w-full border-b border-[#E4E7EC] p-4 text-left transition ${
                      isSelected ? "bg-[#F5F3FF]" : "hover:bg-[#FAF9FF]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#8346F2]">
                          {report.id}
                        </p>

                        <p className="mt-1 truncate text-sm font-bold text-[#1F1D47]">
                          {report.type}
                        </p>

                        <p className="mt-1 truncate text-xs text-[#667085]">
                          {report.location}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${
                          priorityStyles[report.currentPriority]
                        }`}
                      >
                        {report.currentPriority}
                      </span>
                    </div>

                    <p className="mt-2 text-[10px] text-[#98A2B3]">
                      {report.submitted}
                    </p>
                  </button>
                );
              })
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF3] text-lg text-[#027A48]">
                    ✓
                  </div>

                  <p className="mt-3 text-sm font-bold text-[#1F1D47]">
                    Queue is clear
                  </p>

                  <p className="mt-1 text-xs text-[#667085]">
                    No reports are awaiting prioritization.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* REVIEW PANEL */}
        {selectedReport ? (
          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
            {/* PANEL HEADER */}
            <div className="shrink-0 border-b border-[#E4E7EC] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#8346F2]">
                      {selectedReport.id}
                    </span>

                    <span className="text-[#D0D5DD]">•</span>

                    <span className="text-xs text-[#667085]">
                      {selectedReport.category}
                    </span>
                  </div>

                  <h2 className="mt-1 text-xl font-extrabold text-[#1F1D47]">
                    {selectedReport.type}
                  </h2>

                  <p className="mt-1 text-xs text-[#667085]">
                    {selectedReport.location} • {selectedReport.submitted}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                    priorityStyles[selectedReport.currentPriority]
                  }`}
                >
                  Current: {selectedReport.currentPriority}
                </span>
              </div>
            </div>

            {/* PANEL CONTENT */}
            <div className="min-h-0 flex-1 overflow-auto p-5">
              <div className="space-y-5">
                {/* RECOMMENDATION */}
                <div className="rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#6941C6]">
                        Recommended Priority
                      </p>

                      <p className="mt-1 text-lg font-extrabold text-[#1F1D47]">
                        {selectedReport.recommendedPriority}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#667085]">
                        Recommendation is based on the submitted triage
                        indicators.
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                        priorityStyles[selectedReport.recommendedPriority]
                      }`}
                    >
                      {selectedReport.recommendedPriority}
                    </span>
                  </div>
                </div>

                {/* TRIAGE INDICATORS */}
                <div>
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-[#1F1D47]">
                      Triage Indicators
                    </h3>

                    <p className="mt-0.5 text-xs text-[#667085]">
                      Review the factors used to determine response priority.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                    <TriageItem
                      label="Threat to Life"
                      value={selectedReport.threatToLife}
                      critical={selectedReport.threatToLife === "Present"}
                    />

                    <TriageItem
                      label="Assistance Need"
                      value={selectedReport.assistanceNeed}
                      critical={selectedReport.assistanceNeed === "Immediate"}
                    />

                    <TriageItem
                      label="People Affected"
                      value={selectedReport.peopleAffected}
                    />

                    <TriageItem
                      label="Vulnerable Persons"
                      value={selectedReport.vulnerablePersons}
                    />

                    <TriageItem
                      label="Access Impact"
                      value={selectedReport.accessImpact}
                    />

                    <TriageItem
                      label="Location Risk"
                      value={selectedReport.locationRisk}
                    />

                    <TriageItem
                      label="Hazard Severity"
                      value={selectedReport.hazardSeverity}
                      critical={selectedReport.hazardSeverity === "Severe"}
                    />

                    <TriageItem
                      label="Rate of Worsening"
                      value={selectedReport.rateOfWorsening}
                      critical={selectedReport.rateOfWorsening === "Increasing"}
                    />

                    <TriageItem
                      label="Water Level"
                      value={selectedReport.waterLevel}
                    />

                    <TriageItem
                      label="Road Passability"
                      value={selectedReport.roadPassability}
                    />

                    <TriageItem
                      label="Evacuation Need"
                      value={selectedReport.evacuationNeed}
                      critical={selectedReport.evacuationNeed === "Recommended"}
                    />
                  </div>
                </div>

                {/* PRIORITY DECISION */}
                <div className="rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] p-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#1F1D47]">
                      Priority Decision
                    </h3>

                    <p className="mt-0.5 text-xs text-[#667085]">
                      Confirm the recommended priority or adjust it based on
                      personnel assessment.
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
                    {["Critical", "High", "Medium", "Low"].map((priority) => {
                      const isActive =
                        selectedReport.currentPriority === priority;

                      return (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => handlePriorityChange(priority)}
                          className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                            isActive
                              ? priorityStyles[priority]
                              : "border-[#E4E7EC] bg-white text-[#667085] hover:border-[#8346F2] hover:text-[#8346F2]"
                          }`}
                        >
                          {priority}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E4E7EC] pt-4">
                    <div>
                      <p className="text-xs font-semibold text-[#344054]">
                        Selected Priority
                      </p>

                      <p className="mt-0.5 text-xs text-[#667085]">
                        This decision will be used by the response workflow.
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                        priorityStyles[selectedReport.currentPriority]
                      }`}
                    >
                      {selectedReport.currentPriority}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="shrink-0 border-t border-[#E4E7EC] bg-white p-4">
              <button
                type="button"
                onClick={handleConfirmPriority}
                className="w-full rounded-xl bg-[#8346F2] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#7335E6] active:scale-[0.99]"
              >
                Confirm Priority
              </button>
            </div>
          </section>
        ) : (
          <section className="flex min-h-0 items-center justify-center rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F3FF] text-xl text-[#8346F2]">
                ⚡
              </div>

              <h2 className="mt-3 text-sm font-bold text-[#1F1D47]">
                No report selected
              </h2>

              <p className="mt-1 text-xs text-[#667085]">
                Select a report from the prioritization queue.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Prioritization;
