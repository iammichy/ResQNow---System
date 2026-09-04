import { useState } from "react";

export default function ReportDetails({
  admin,
  report,
  onBack,
  onUpdateReport,
  onAddLog,
}) {
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "Not recorded";

    const [date, time] = dateTime.split("T");

    if (!date || !time) return dateTime;

    const [year, month, day] = date.split("-");
    const [hourValue, minute] = time.split(":");

    let hour = Number(hourValue);
    const period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return `${monthNames[Number(month) - 1]} ${Number(day)}, ${year} at ${hour}:${minute} ${period}`;
  };

  const [verificationStatus, setVerificationStatus] = useState(
    report?.verification_status || "Pending Verification",
  );

  const [assignedPersonnel, setAssignedPersonnel] = useState(
    report?.assigned_to || "",
  );

  const [selectedPersonnel, setSelectedPersonnel] = useState(
    report?.assigned_to || "",
  );

  const [invalidReason, setInvalidReason] = useState(
    report?.invalid_reason || "",
  );

  const [invalidRemarks, setInvalidRemarks] = useState(
    report?.invalid_remarks || "",
  );

  const [showInvalidForm, setShowInvalidForm] = useState(false);

  const [resolutionRemarks, setResolutionRemarks] = useState(
    report?.resolution_remarks || "",
  );

  const [resolvedDateTime, setResolvedDateTime] = useState(
    report?.resolved_date_time || "",
  );

  const [assessmentDetails, setAssessmentDetails] = useState(
    report?.assessment_details || "",
  );

  const [assessmentRemarks, setAssessmentRemarks] = useState(
    report?.assessment_remarks || "",
  );

  const [verifiedBy, setVerifiedBy] = useState(report?.verified_by || "");

  const [verifiedAt, setVerifiedAt] = useState(report?.verified_at || "");

  const [resolved, setResolved] = useState(
    report?.status === "Resolved" || report?.resolved === true,
  );

  const [checklist, setChecklist] = useState(
    report?.checklist || {
      dispatched: false,
      assessed: false,
      assistance: false,
      documented: false,
    },
  );

  const [savedChecklist, setSavedChecklist] = useState(
    report?.checklist || {
      dispatched: false,
      assessed: false,
      assistance: false,
      documented: false,
    },
  );

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Report Details</h1>

          <p className="mt-2 text-sm text-slate-500">No report available.</p>

          <button
            type="button"
            onClick={onBack}
            className="mt-5 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
          >
            ← Back to All Reports
          </button>
        </div>
      </div>
    );
  }

  // Update report in the shared App state
  const saveReportUpdate = (changes) => {
    const updatedReport = {
      ...report,
      ...changes,
    };

    onUpdateReport(updatedReport);
  };

  // Add an action to the shared Action Logs state
  const addActionLog = (action, details, status = report.status) => {
    if (!onAddLog) return;

    onAddLog({
      log_id: `LOG-${Date.now()}`,
      report_id: report.report_id,
      action,
      details,
      performed_by: admin?.full_name || "Barangay Admin",
      timestamp: new Date().toLocaleString("en-PH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      status,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              ResQNow
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Barangay Web Admin System
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">
              {admin?.full_name || "Barangay Admin"}
            </p>

            <div className="mt-1 flex items-center justify-end gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>

              <p className="text-xs font-medium text-slate-500">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={onBack}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
          >
            ← Back to All Reports
          </button>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Report Header */}
            <div className="border-b border-slate-200 px-6 py-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
                      {report.report_id}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        report.report_type === "Emergency"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {report.report_type}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        report.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : report.priority === "Medium"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {report.priority} Priority
                    </span>

                    {report.verification_status && (
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          report.verification_status === "Verified"
                            ? "bg-green-100 text-green-700"
                            : report.verification_status === "Invalid"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {report.verification_status}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {report.concern_type}
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Review the submitted report and manage the barangay
                    response.
                  </p>
                </div>

                {/* Current Status */}
                <div className="min-w-[180px] rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Current Status
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        report.status === "Resolved"
                          ? "bg-green-500"
                          : report.status === "Invalid"
                            ? "bg-red-500"
                            : report.status === "In Progress"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                      }`}
                    />

                    <p className="text-base font-bold text-slate-900">
                      {report.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Information */}
            <div className="grid divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              <div className="px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Reporter
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {report.reporter_name || "Not provided"}
                </p>
              </div>

              <div className="px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Location
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {report.location || "Not provided"}
                </p>
              </div>

              <div className="px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Source
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {report.source || "Not provided"}
                </p>
              </div>

              <div className="px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Assigned To
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {assignedPersonnel || "Unassigned"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Original Resident Report */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
            <h3 className="text-base font-bold text-slate-900">
              Original Resident Report
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Information submitted by the resident.
            </p>
          </div>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Report ID
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {report.report_id}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Report Type
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {report.report_type}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Concern
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {report.concern_type}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Reporter
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {report.reporter_name || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Contact
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {report.reporter_contact || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Location
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {report.location || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Source
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {report.source || "Not provided"}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Description
              </p>

              <div className="mt-2 rounded-xl bg-slate-50 px-4 py-4">
                <p className="text-sm leading-6 text-slate-700">
                  {report.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Barangay Assessment */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
            <h3 className="text-base font-bold text-slate-900">
              Barangay Assessment
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Record verified or corrected information based on barangay
              assessment.
            </p>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div>
              <label
                htmlFor="assessmentDetails"
                className="block text-sm font-semibold text-slate-700"
              >
                Verified / Corrected Details
              </label>

              <textarea
                id="assessmentDetails"
                rows="4"
                value={assessmentDetails}
                onChange={(e) => setAssessmentDetails(e.target.value)}
                placeholder="Enter the verified or corrected details..."
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label
                htmlFor="assessmentRemarks"
                className="block text-sm font-semibold text-slate-700"
              >
                Assessment Remarks
              </label>

              <textarea
                id="assessmentRemarks"
                rows="3"
                value={assessmentRemarks}
                onChange={(e) => setAssessmentRemarks(e.target.value)}
                placeholder="Enter assessment remarks..."
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="verifiedBy"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Verified By
                </label>

                <input
                  id="verifiedBy"
                  type="text"
                  value={verifiedBy}
                  onChange={(e) => setVerifiedBy(e.target.value)}
                  placeholder="Enter barangay personnel name..."
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label
                  htmlFor="verifiedAt"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Date and Time Verified
                </label>

                <input
                  id="verifiedAt"
                  type="datetime-local"
                  value={verifiedAt}
                  max={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setVerifiedAt(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => {
                  if (!assessmentDetails.trim()) {
                    alert("Please enter assessment details.");
                    return;
                  }

                  saveReportUpdate({
                    assessment_details: assessmentDetails.trim(),
                    assessment_remarks: assessmentRemarks.trim(),
                    verified_by: verifiedBy.trim(),
                    verified_at: verifiedAt,
                  });

                  addActionLog(
                    "Assessment Updated",
                    `${report.report_id} barangay assessment was updated.`,
                  );

                  alert("Assessment saved successfully.");
                }}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Save Assessment
              </button>
            </div>
          </div>
        </section>

        {/* Verification */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
            <h3 className="text-base font-bold text-slate-900">
              Report Verification
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Verify the report or request additional information.
            </p>
          </div>

          <div className="px-6 py-6">
            <div
              className={`mb-5 rounded-xl border px-5 py-4 ${
                verificationStatus === "Verified"
                  ? "border-green-200 bg-green-50"
                  : verificationStatus === "Invalid"
                    ? "border-red-200 bg-red-50"
                    : "border-blue-200 bg-blue-50"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Verification Status
              </p>

              <p className="mt-1 text-base font-bold text-slate-900">
                {verificationStatus}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  const newStatus = "Verified";

                  setVerificationStatus(newStatus);

                  saveReportUpdate({
                    verification_status: newStatus,
                    verified_by:
                      verifiedBy.trim() ||
                      admin?.full_name ||
                      "Barangay Admin",
                    verified_at:
                      verifiedAt || new Date().toISOString().slice(0, 16),
                  });

                  addActionLog(
                    "Report Verified",
                    `${report.report_id} was verified.`,
                    report.status,
                  );
                }}
                className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
              >
                Verify
              </button>

              <button
                type="button"
                onClick={() => {
                  const newStatus = "More Information Requested";

                  setVerificationStatus(newStatus);

                  saveReportUpdate({
                    verification_status: newStatus,
                  });

                  addActionLog(
                    "More Information Requested",
                    `Additional information was requested for ${report.report_id}.`,
                  );
                }}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Request More Information
              </button>

              <button
                type="button"
                onClick={() => setShowInvalidForm(true)}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                Mark as Invalid
              </button>
            </div>
          </div>
        </section>

        {/* Invalid Report Form */}
        {showInvalidForm && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
            <div className="border-b border-red-100 bg-red-50 px-6 py-5">
              <h3 className="text-base font-bold text-red-900">
                Invalid Report Information
              </h3>

              <p className="mt-1 text-sm text-red-700">
                Provide a reason and remarks before marking this report as
                invalid.
              </p>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div>
                <label
                  htmlFor="invalidReason"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Invalid Reason
                </label>

                <select
                  id="invalidReason"
                  value={invalidReason}
                  onChange={(e) => setInvalidReason(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                >
                  <option value="" disabled>
                    Select a reason
                  </option>

                  <option value="Duplicate Report">Duplicate Report</option>

                  <option value="Wrong Location">Wrong Location</option>

                  <option value="Outside Barangay Scope">
                    Outside Barangay Scope
                  </option>

                  <option value="False Report">False Report</option>

                  <option value="Insufficient Details">
                    Insufficient Details
                  </option>

                  <option value="Already Resolved">Already Resolved</option>

                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="invalidRemarks"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Remarks
                </label>

                <textarea
                  id="invalidRemarks"
                  rows="4"
                  value={invalidRemarks}
                  onChange={(e) => setInvalidRemarks(e.target.value)}
                  placeholder="Enter remarks or additional explanation..."
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowInvalidForm(false);
                    setInvalidReason("");
                    setInvalidRemarks("");
                  }}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!invalidReason || !invalidRemarks.trim()) {
                      alert("Invalid reason and remarks are required.");
                      return;
                    }

                    setVerificationStatus("Invalid");

                    saveReportUpdate({
                      verification_status: "Invalid",
                      status: "Invalid",
                      invalid_reason: invalidReason,
                      invalid_remarks: invalidRemarks.trim(),
                    });

                    addActionLog(
                      "Report Marked Invalid",
                      `${report.report_id} was marked invalid. Reason: ${invalidReason}.`,
                      "Invalid",
                    );

                    setShowInvalidForm(false);
                  }}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                >
                  Confirm Invalid Report
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Assignment */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
            <h3 className="text-base font-bold text-slate-900">
              Assign Personnel / Rescue Team
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Assign the report to the appropriate barangay personnel or rescue
              team.
            </p>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div>
              <label
                htmlFor="assignedPersonnel"
                className="block text-sm font-semibold text-slate-700"
              >
                Personnel / Rescue Team
              </label>

              <select
                id="assignedPersonnel"
                value={selectedPersonnel}
                onChange={(e) => setSelectedPersonnel(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="">Select personnel or rescue team</option>

                <option value="Responder One">Responder One</option>

                <option value="Responder Two">Responder Two</option>

                <option value="Responder Three">Responder Three</option>

                <option value="Rescue Team Alpha">Rescue Team Alpha</option>

                <option value="Barangay Emergency Team">
                  Barangay Emergency Team
                </option>
              </select>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => {
                  if (!selectedPersonnel) {
                    alert("Please select personnel or rescue team.");
                    return;
                  }

                  setAssignedPersonnel(selectedPersonnel);

                  saveReportUpdate({
                    assigned_to: selectedPersonnel,
                  });

                  addActionLog(
                    "Report Assigned",
                    `${report.report_id} was assigned to ${selectedPersonnel}.`,
                  );
                }}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Assign Report
              </button>
            </div>
          </div>
        </section>

        {/* Action Checklist */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
            <h3 className="text-base font-bold text-slate-900">
              Action Checklist
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Track the actions taken by barangay personnel.
            </p>
          </div>

          <div className="space-y-3 px-6 py-6">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50">
              <input
                type="checkbox"
                checked={checklist.dispatched}
                onChange={(e) =>
                  setChecklist({
                    ...checklist,
                    dispatched: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm font-medium text-slate-700">
                Personnel dispatched
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50">
              <input
                type="checkbox"
                checked={checklist.assessed}
                onChange={(e) =>
                  setChecklist({
                    ...checklist,
                    assessed: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm font-medium text-slate-700">
                Situation assessed on-site
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50">
              <input
                type="checkbox"
                checked={checklist.assistance}
                onChange={(e) =>
                  setChecklist({
                    ...checklist,
                    assistance: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm font-medium text-slate-700">
                Assistance provided
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50">
              <input
                type="checkbox"
                checked={checklist.documented}
                onChange={(e) =>
                  setChecklist({
                    ...checklist,
                    documented: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm font-medium text-slate-700">
                Incident documented
              </span>
            </label>

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => {
                  const labels = {
                    dispatched: "Personnel dispatched",
                    assessed: "Situation assessed on-site",
                    assistance: "Assistance provided",
                    documented: "Incident documented",
                  };

                  const changedItems = Object.keys(checklist).filter(
                    (key) => checklist[key] !== savedChecklist[key],
                  );

                  if (changedItems.length === 0) {
                    alert("No checklist changes to save.");
                    return;
                  }

                  const summary = changedItems
                    .map(
                      (key) =>
                        `${labels[key]} ${
                          checklist[key] ? "completed" : "unchecked"
                        }`,
                    )
                    .join("; ");

                  saveReportUpdate({ checklist });

                  addActionLog(
                    "Checklist Updated",
                    `${report.report_id}: ${summary}.`,
                  );

                  setSavedChecklist(checklist);
                }}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Save Checklist
              </button>
            </div>
          </div>
        </section>

        {/* Status History */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
            <h3 className="text-base font-bold text-slate-900">
              Status History
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Track the progress of this report.
            </p>
          </div>

          <div className="divide-y divide-slate-100 px-6">
            {/* Submitted */}
            <div className="relative py-5 pl-8">
              <span className="absolute left-0 top-6 h-3 w-3 rounded-full bg-blue-500"></span>

              <p className="text-sm font-semibold text-slate-900">
                Report Submitted
              </p>

              <p className="mt-1 text-sm text-slate-500">
                The report was submitted to the barangay.
              </p>
            </div>

            {/* Verification */}
            <div className="relative py-5 pl-8">
              <span
                className={`absolute left-0 top-6 h-3 w-3 rounded-full ${
                  verificationStatus === "Verified"
                    ? "bg-green-500"
                    : verificationStatus === "Invalid"
                      ? "bg-red-500"
                      : "bg-blue-500"
                }`}
              ></span>

              <p className="text-sm font-semibold text-slate-900">
                Verification: {verificationStatus}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                The report verification status was updated by barangay
                personnel.
              </p>
            </div>

            {/* Assignment */}
            <div className="relative py-5 pl-8">
              <span className="absolute left-0 top-6 h-3 w-3 rounded-full bg-blue-500"></span>

              <p className="text-sm font-semibold text-slate-900">
                Assigned to {assignedPersonnel || "Unassigned"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                The report has been assigned for response.
              </p>
            </div>

            {/* Current Status */}
            <div className="relative py-5 pl-8">
              <span
                className={`absolute left-0 top-6 h-3 w-3 rounded-full ${
                  resolved
                    ? "bg-green-500"
                    : report.status === "Invalid"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }`}
              ></span>

              <p className="text-sm font-semibold text-slate-900">
                {resolved ? "Report Resolved" : `Currently ${report.status}`}
              </p>

              {resolved ? (
                <>
                  <p className="mt-1 text-sm text-slate-500">
                    Resolved on: {formatDateTime(resolvedDateTime)}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Remarks: {resolutionRemarks}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-slate-500">
                  The report is currently being handled by barangay personnel.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Resolve Report */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
          <div className="border-b border-green-100 bg-green-50 px-6 py-5">
            <h3 className="text-base font-bold text-green-900">
              Resolve Report
            </h3>

            <p className="mt-1 text-sm text-green-700">
              Mark this report as resolved and record the resolution details.
            </p>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div>
              <label
                htmlFor="resolvedDateTime"
                className="block text-sm font-semibold text-slate-700"
              >
                Resolved Date and Time
              </label>

              <input
                id="resolvedDateTime"
                type="datetime-local"
                value={resolvedDateTime}
                max={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setResolvedDateTime(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-50"
              />
            </div>

            <div>
              <label
                htmlFor="resolutionRemarks"
                className="block text-sm font-semibold text-slate-700"
              >
                Resolution Remarks
              </label>

              <textarea
                id="resolutionRemarks"
                rows="4"
                placeholder="Enter the action taken or resolution details..."
                value={resolutionRemarks}
                onChange={(e) => setResolutionRemarks(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 transition focus:border-green-500 focus:ring-4 focus:ring-green-50"
              ></textarea>
            </div>

            <div className="flex justify-end border-t border-green-100 pt-5">
              <button
                type="button"
                onClick={() => {
                  if (!resolutionRemarks.trim()) {
                    alert("Resolution remarks are required.");
                    return;
                  }

                  if (!resolvedDateTime) {
                    alert("Resolved date and time are required.");
                    return;
                  }

                  setResolved(true);

                  saveReportUpdate({
                    status: "Resolved",
                    resolved: true,
                    resolved_date_time: resolvedDateTime,
                    resolution_remarks: resolutionRemarks.trim(),
                  });

                  addActionLog(
                    "Report Resolved",
                    `${report.report_id} was marked as resolved.`,
                    "Resolved",
                  );
                }}
                className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
