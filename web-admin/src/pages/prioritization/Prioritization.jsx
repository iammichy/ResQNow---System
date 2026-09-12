import { useEffect, useMemo, useState } from "react";
import {
  getReportsForPrioritization,
  assignReportPriority,
} from "../../services/reportsService";

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
        {value || "Not specified"}
      </p>
    </div>
  );
}

function Prioritization({
  onPriorityUpdate,
  onAddAuditLog,
}) {
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState("All");

  const [selectedPriority, setSelectedPriority] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  /* =========================================
     LOAD REPORTS FROM LARAVEL API
  ========================================= */

  const loadReports = async () => {
    try {
      setLoadingReports(true);
      setReportsError("");

      const data = await getReportsForPrioritization();

      const formattedReports = data.map((report) => ({
        ...report,

        currentPriority: report.priority || "Not Prioritized",

        recommendedPriority: report.priority || "Medium",

        priorityStatus:
          report.status === "Prioritized"
            ? "Confirmed"
            : "Pending",

        peopleAffected:
          report.affected || "Not specified",

        vulnerablePersons:
          report.vulnerable || "Not specified",

        threatToLife:
          report.threatToLife || "Not specified",

        assistanceNeed:
          report.assistanceNeed || "Not specified",

        accessImpact:
          report.accessImpact || "Not specified",

        locationRisk:
          report.locationRisk || "Not specified",

        hazardSeverity:
          report.hazardSeverity || "Not specified",

        rateOfWorsening:
          report.rateOfWorsening || "Not specified",

        evacuationNeed:
          report.evacuationNeed || "Not specified",

        verification:
          report.verification || "Verified",
      }));

      setReports(formattedReports);

      setSelectedId((currentSelectedId) => {
        const stillExists = formattedReports.some(
          (report) => report.id === currentSelectedId
        );

        if (stillExists) {
          return currentSelectedId;
        }

        return formattedReports[0]?.id || "";
      });
    } catch (error) {
      console.error("Failed to load prioritization reports:", error);

      setReportsError(
        error.message ||
          "Failed to load reports for prioritization."
      );
    } finally {
      setLoadingReports(false);
    }
  };

  /* =========================================
     LOAD ON PAGE OPEN
  ========================================= */

  useEffect(() => {
    loadReports();
  }, []);

  /* =========================================
     PENDING REPORTS
  ========================================= */

  const pendingReports = useMemo(() => {
    return reports.filter(
      (report) =>
        report.verification === "Verified" &&
        report.status === "For Prioritization"
    );
  }, [reports]);

  /* =========================================
     FILTER REPORTS
  ========================================= */

  const filteredReports = useMemo(() => {
    if (filter === "All") {
      return pendingReports;
    }

    return pendingReports.filter(
      (report) => report.currentPriority === filter
    );
  }, [pendingReports, filter]);

  /* =========================================
     SELECTED REPORT
  ========================================= */

  const selectedReport =
    filteredReports.find(
      (report) => report.id === selectedId
    ) ||
    filteredReports[0] ||
    null;

  /* =========================================
     UPDATE SELECTED PRIORITY
  ========================================= */

  useEffect(() => {
    if (!selectedReport) {
      setSelectedPriority("");
      return;
    }

    if (
      selectedReport.currentPriority &&
      selectedReport.currentPriority !== "Not Prioritized"
    ) {
      setSelectedPriority(
        selectedReport.currentPriority
      );
    } else {
      setSelectedPriority(
        selectedReport.recommendedPriority || "Medium"
      );
    }
  }, [selectedReport?.id]);

  /* =========================================
     PRIORITY SELECTION
  ========================================= */

  const handlePriorityChange = (priority) => {
    if (!selectedReport) return;

    setSelectedPriority(priority);
  };

  /* =========================================
     CONFIRM PRIORITY
  ========================================= */

  const handleConfirmPriority = async () => {
    if (!selectedReport || !selectedPriority) {
      return;
    }

    try {
      setIsSaving(true);

      const oldPriority =
        selectedReport.currentPriority || "Not Prioritized";

      await assignReportPriority(
        selectedReport.databaseId,
        selectedPriority
      );

      onPriorityUpdate?.({
        id: selectedReport.id,
        currentPriority: selectedPriority,
        priority: selectedPriority,
        priorityStatus: "Confirmed",
        status: "Prioritized",
      });

      onAddAuditLog?.({
        action: "Priority Confirmed",
        category: "Report Action",
        target: selectedReport.id,
        field: "Priority",
        oldValue: oldPriority,
        newValue: selectedPriority,
        remarks: `Priority "${selectedPriority}" was assigned to the report.`,
        status: "Success",
      });

      /*
       * Reload the queue.
       *
       * The prioritized report will disappear here because
       * its backend status is now "Prioritized".
       */

      await loadReports();
    } catch (error) {
      console.error(
        "Failed to assign priority:",
        error
      );

      alert(
        error.message ||
          "Failed to assign report priority."
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =========================================
     COUNTS
  ========================================= */

  const pendingCount = pendingReports.length;

  const criticalCount = reports.filter(
    (report) =>
      report.currentPriority === "Critical"
  ).length;

  const highCount = reports.filter(
    (report) =>
      report.currentPriority === "High"
  ).length;

  const mediumCount = reports.filter(
    (report) =>
      report.currentPriority === "Medium"
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
            Review triage indicators and determine the
            response priority of verified reports.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-[#ABEFC6] bg-[#ECFDF3] px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-[#12B76A]" />

          <span className="text-sm font-semibold text-[#027A48]">
            Prioritization Queue Active
          </span>
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid shrink-0 grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-[#E4E7EC] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#667085]">
            Pending Review
          </p>

          <p className="mt-2 text-2xl font-extrabold text-[#1F1D47]">
            {pendingCount}
          </p>

          <p className="mt-1 text-sm text-[#667085]">
            Reports awaiting prioritization
          </p>
        </div>

        <div className="rounded-2xl border border-[#FECDCA] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#667085]">
            Critical
          </p>

          <p className="mt-2 text-2xl font-extrabold text-[#D92D20]">
            {criticalCount}
          </p>

          <p className="mt-1 text-sm text-[#667085]">
            Immediate attention
          </p>
        </div>

        <div className="rounded-2xl border border-[#FEDF89] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#667085]">
            High
          </p>

          <p className="mt-2 text-2xl font-extrabold text-[#B54708]">
            {highCount}
          </p>

          <p className="mt-1 text-sm text-[#667085]">
            Priority response
          </p>
        </div>

        <div className="rounded-2xl border border-[#FDE68A] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#667085]">
            Medium
          </p>

          <p className="mt-2 text-2xl font-extrabold text-[#A15C00]">
            {mediumCount}
          </p>

          <p className="mt-1 text-sm text-[#667085]">
            Routine response
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">

        {/* LEFT QUEUE */}

        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">

          <div className="border-b border-[#E4E7EC] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#1F1D47]">
                  Prioritization Queue
                </h2>

                <p className="mt-1 text-sm text-[#667085]">
                  Reports ready for priority review
                </p>
              </div>

              <span className="rounded-full bg-[#F4F3FF] px-3 py-1 text-xs font-bold text-[#6941C6]">
                {filteredReports.length} report
                {filteredReports.length !== 1 ? "s" : ""}
              </span>
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              className="mt-4 w-full rounded-xl border border-[#D0D5DD] bg-white px-4 py-3 text-sm font-medium text-[#344054] outline-none"
            >
              <option value="All">
                All Priorities
              </option>

              <option value="Critical">
                Critical
              </option>

              <option value="High">
                High
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Low">
                Low
              </option>
            </select>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingReports && (
              <div className="p-6 text-center text-sm text-[#667085]">
                Loading reports...
              </div>
            )}

            {!loadingReports && reportsError && (
              <div className="p-6 text-center">
                <p className="text-sm font-medium text-[#D92D20]">
                  {reportsError}
                </p>

                <button
                  type="button"
                  onClick={loadReports}
                  className="mt-3 rounded-lg bg-[#8346F2] px-4 py-2 text-sm font-semibold text-white"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loadingReports &&
              !reportsError &&
              filteredReports.length === 0 && (
                <div className="flex h-full min-h-[250px] items-center justify-center p-6">
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F3FF] text-xl">
                      ✓
                    </div>

                    <h3 className="mt-4 font-bold text-[#1F1D47]">
                      No reports awaiting prioritization
                    </h3>

                    <p className="mt-1 text-sm text-[#667085]">
                      Verified reports will appear here.
                    </p>
                  </div>
                </div>
              )}

            {!loadingReports &&
              !reportsError &&
              filteredReports.map((report) => {
                const isSelected =
                  selectedReport?.id === report.id;

                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() =>
                      setSelectedId(report.id)
                    }
                    className={`w-full border-b border-[#E4E7EC] p-5 text-left transition ${
                      isSelected
                        ? "bg-[#F9F8FF] ring-1 ring-inset ring-[#8346F2]"
                        : "hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#6941C6]">
                          {report.id}
                        </p>

                        <h3 className="mt-1 font-bold text-[#1F1D47]">
                          {report.type}
                        </h3>
                      </div>

                      <span className="rounded-full border border-[#D0D5DD] bg-white px-3 py-1 text-xs font-bold text-[#344054]">
                        {report.currentPriority}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-[#667085]">
                      {report.location}
                    </p>

                    <p className="mt-2 text-xs text-[#98A2B3]">
                      {report.submitted}
                    </p>
                  </button>
                );
              })}
          </div>
        </section>

        {/* RIGHT DETAILS */}

        {selectedReport ? (
          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">

            <div className="border-b border-[#E4E7EC] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-[#6941C6]">
                      {selectedReport.id}
                    </span>

                    <span className="text-[#98A2B3]">
                      •
                    </span>

                    <span className="text-[#667085]">
                      {selectedReport.category}
                    </span>
                  </div>

                  <h2 className="mt-2 text-2xl font-extrabold text-[#1F1D47]">
                    {selectedReport.type}
                  </h2>

                  <p className="mt-2 text-sm text-[#667085]">
                    {selectedReport.location} •{" "}
                    {selectedReport.submitted}
                  </p>
                </div>

                <span className="rounded-full border border-[#D0D5DD] bg-white px-4 py-2 text-xs font-bold text-[#344054]">
                  Current: {selectedReport.currentPriority}
                </span>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">

              {/* TRIAGE */}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <TriageItem
                  label="Affected People"
                  value={selectedReport.peopleAffected}
                />

                <TriageItem
                  label="Vulnerable Persons"
                  value={selectedReport.vulnerablePersons}
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
                />

                <TriageItem
                  label="Threat to Life"
                  value={selectedReport.threatToLife}
                  critical={
                    selectedReport.threatToLife ===
                    "Present"
                  }
                />
              </div>

              {/* DESCRIPTION */}

              <div className="mt-4 rounded-xl border border-[#E4E7EC] bg-[#F9FAFB] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.07em] text-[#98A2B3]">
                  Report Description
                </p>

                <p className="mt-2 text-sm leading-6 text-[#475467]">
                  {selectedReport.description ||
                    "No description provided."}
                </p>
              </div>

              {/* PRIORITY DECISION */}

              <div className="mt-4 rounded-2xl border border-[#E4E7EC] bg-[#FCFCFD] p-5">
                <h3 className="font-bold text-[#1F1D47]">
                  Priority Decision
                </h3>

                <p className="mt-1 text-sm text-[#667085]">
                  Confirm the recommended priority or adjust
                  it based on personnel assessment.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    "Critical",
                    "High",
                    "Medium",
                    "Low",
                  ].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() =>
                        handlePriorityChange(priority)
                      }
                      className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                        selectedPriority === priority
                          ? priorityStyles[priority]
                          : "border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#E4E7EC] pt-4">
                  <div>
                    <p className="text-sm font-semibold text-[#344054]">
                      Selected Priority
                    </p>

                    <p className="mt-1 text-sm text-[#667085]">
                      This decision will be used by the
                      response workflow.
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-4 py-2 text-sm font-bold ${
                      priorityStyles[selectedPriority] ||
                      "border-[#E4E7EC] bg-white text-[#667085]"
                    }`}
                  >
                    {selectedPriority || "Not selected"}
                  </span>
                </div>
              </div>
            </div>

            {/* CONFIRM BUTTON */}

            <div className="border-t border-[#E4E7EC] p-5">
              <button
                type="button"
                onClick={handleConfirmPriority}
                disabled={
                  !selectedPriority || isSaving
                }
                className="w-full rounded-xl bg-[#8346F2] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#6938D3] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Saving Priority..."
                  : "Confirm Priority"}
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