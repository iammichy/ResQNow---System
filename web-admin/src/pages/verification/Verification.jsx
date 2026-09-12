import { useEffect, useMemo, useState } from "react";
import { FileText, Users } from "lucide-react";

import {
  getReportsForVerification,
  verifyReport,
} from "../../services/reportsService";

/* =========================
   RESIDENT MOCK DATA
========================= */

const initialResidentAccounts = [
  {
    id: "RES-2026-001",
    name: "Ryan Santos",
    email: "ryansantos@gmail.com",
    mobile: "0917 123 4567",
    address: "Purok 1, Barangay Camunatan, City of Ilagan",
    purok: "Purok 1",
    registeredAt: "Sep 10, 2026 • 08:45 AM",
    status: "Pending",
    remarks: "",
  },
  {
    id: "RES-2026-002",
    name: "Angela Reyes",
    email: "angela.reyes@gmail.com",
    mobile: "0918 456 7890",
    address: "Purok 3, Barangay Camunatan, City of Ilagan",
    purok: "Purok 3",
    registeredAt: "Sep 10, 2026 • 09:10 AM",
    status: "Pending",
    remarks: "",
  },
  {
    id: "RES-2026-003",
    name: "Michael Cruz",
    email: "michael.cruz@gmail.com",
    mobile: "0919 234 5678",
    address: "Purok 5, Barangay Camunatan, City of Ilagan",
    purok: "Purok 5",
    registeredAt: "Sep 10, 2026 • 09:35 AM",
    status: "Pending",
    remarks: "",
  },
];

const priorityStyles = {
  Critical: "border-[#FECDCA] bg-[#FEF3F2] text-[#D92D20]",
  High: "border-[#FEDF89] bg-[#FFF4E5] text-[#B54708]",
  Medium: "border-[#FDE68A] bg-[#FFFAEB] text-[#A15C00]",
  Low: "border-[#E4E7EC] bg-[#F2F4F7] text-[#667085]",
  "Not Prioritized": "border-[#E4E7EC] bg-[#F9FAFB] text-[#667085]",
};

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#344054]">
        {value || "Not specified"}
      </p>
    </div>
  );
}

function Verification({
  onVerificationUpdate,
  onAddAuditLog,
}) {
  const [activeVerificationTab, setActiveVerificationTab] =
    useState("reports");

  /* =========================
     REPORT VERIFICATION
  ========================= */

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [actionMessage, setActionMessage] = useState("");

  const loadReports = async () => {
    try {
      setLoadingReports(true);
      setReportsError("");

      const data = await getReportsForVerification();

      setReports(data);

      setSelectedId((currentSelectedId) => {
        const stillExists = data.some(
          (report) => report.id === currentSelectedId,
        );

        if (stillExists) {
          return currentSelectedId;
        }

        return data[0]?.id ?? "";
      });
    } catch (error) {
      console.error(
        "Failed to load reports for verification:",
        error,
      );

      setReportsError(
        "Unable to load reports for verification from the server.",
      );
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

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
        categoryFilter === "All" ||
        report.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [reports, searchTerm, categoryFilter]);

  const selectedReport =
    reports.find((report) => report.id === selectedId) ?? null;

  const pendingCount = reports.length;

  // These will later come from a backend statistics endpoint.
  const verifiedCount = 0;
  const returnedCount = 0;

  const handleSelectReport = (reportId) => {
    setSelectedId(reportId);
    setActionMessage("");
  };

  const handleVerification = async (result) => {
    if (!selectedReport) return;

    if (result !== "Verified") {
      setActionMessage(
        "Return for Review will be connected to the backend next.",
      );
      return;
    }

    try {
      await verifyReport(selectedReport.databaseId);

      const oldVerification = selectedReport.verification;
      const oldStatus = selectedReport.status;

      onVerificationUpdate?.({
        ...selectedReport,
        verification: "Verified",
        status: "For Prioritization",
      });

      onAddAuditLog?.({
        action: "Report Verified",
        category: "Report Action",
        target: selectedReport.id,
        field: "Verification Status",
        oldValue: oldVerification,
        newValue: "Verified",
        remarks: `Report verified and forwarded for prioritization. Status changed from "${oldStatus}" to "For Prioritization".`,
        status: "Success",
      });

      setActionMessage(
        `${selectedReport.id} has been verified and forwarded for prioritization.`,
      );

      await loadReports();
    } catch (error) {
      console.error("Failed to verify report:", error);

      setActionMessage(
        "Unable to verify the report. Please check the Laravel server.",
      );
    }
  };

  /* =========================
     RESIDENT ACCOUNT
     VERIFICATION
  ========================= */

  const [residentAccounts, setResidentAccounts] = useState(
    initialResidentAccounts,
  );

  const [selectedResidentId, setSelectedResidentId] = useState(
    initialResidentAccounts[0]?.id ?? "",
  );

  const [residentSearch, setResidentSearch] = useState("");
  const [residentRemarks, setResidentRemarks] = useState("");
  const [residentActionMessage, setResidentActionMessage] =
    useState("");

  const pendingResidentAccounts = useMemo(() => {
    const query = residentSearch.trim().toLowerCase();

    return residentAccounts.filter((resident) => {
      const searchableText = [
        resident.id,
        resident.name,
        resident.email,
        resident.mobile,
        resident.address,
        resident.purok,
      ]
        .join(" ")
        .toLowerCase();

      return (
        resident.status === "Pending" &&
        (query === "" || searchableText.includes(query))
      );
    });
  }, [residentAccounts, residentSearch]);

  const selectedResident =
    residentAccounts.find(
      (resident) => resident.id === selectedResidentId,
    ) ??
    pendingResidentAccounts[0] ??
    null;

  const handleSelectResident = (resident) => {
    setSelectedResidentId(resident.id);
    setResidentRemarks(resident.remarks || "");
    setResidentActionMessage("");
  };

  const handleResidentVerification = (decision) => {
    if (!selectedResident) return;

    if (
      decision === "Rejected" &&
      residentRemarks.trim() === ""
    ) {
      setResidentActionMessage(
        "Please provide verification remarks before rejecting this account.",
      );

      return;
    }

    const oldStatus = selectedResident.status;

    const newStatus =
      decision === "Approved" ? "Verified" : "Rejected";

    const remarks =
      residentRemarks.trim() ||
      "Resident account was verified as a Barangay Camunatan resident.";

    setResidentAccounts((currentResidents) =>
      currentResidents.map((resident) =>
        resident.id === selectedResident.id
          ? {
              ...resident,
              status: newStatus,
              remarks,
              verifiedAt: new Date().toISOString(),
            }
          : resident,
      ),
    );

    onAddAuditLog?.({
      action:
        decision === "Approved"
          ? "Resident Account Approved"
          : "Resident Account Rejected",

      category: "Account Action",

      target: `${selectedResident.name} (${selectedResident.id})`,

      field: "Account Verification Status",

      oldValue: oldStatus,

      newValue: newStatus,

      remarks,

      status: "Success",
    });

    const remainingResidents = residentAccounts.filter(
      (resident) =>
        resident.id !== selectedResident.id &&
        resident.status === "Pending",
    );

    setSelectedResidentId(
      remainingResidents[0]?.id ?? "",
    );

    setResidentRemarks("");

    setResidentActionMessage(
      decision === "Approved"
        ? `${selectedResident.name}'s account has been approved.`
        : `${selectedResident.name}'s account has been rejected.`,
    );
  };

  return (
    <div className="space-y-6">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div>
        <h1 className="text-2xl font-extrabold text-[#1F1D47]">
          Verification Center
        </h1>

        <p className="mt-1 text-sm text-[#667085]">
          Review emergency reports and resident account registrations.
        </p>
      </div>

      {/* =========================
          TABS
      ========================= */}

      <div className="flex gap-3 border-b border-[#E4E7EC]">
        <button
          type="button"
          onClick={() =>
            setActiveVerificationTab("reports")
          }
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold ${
            activeVerificationTab === "reports"
              ? "border-[#8346F2] text-[#8346F2]"
              : "border-transparent text-[#667085]"
          }`}
        >
          <FileText size={18} />
          Report Verification
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveVerificationTab("residents")
          }
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold ${
            activeVerificationTab === "residents"
              ? "border-[#8346F2] text-[#8346F2]"
              : "border-transparent text-[#667085]"
          }`}
        >
          <Users size={18} />
          Resident Account Verification
        </button>
      </div>

      {/* =========================
          REPORT VERIFICATION TAB
      ========================= */}

      {activeVerificationTab === "reports" && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#E4E7EC] bg-white p-5">
              <p className="text-sm font-semibold text-[#667085]">
                Pending Reports
              </p>

              <p className="mt-2 text-3xl font-extrabold text-[#1F1D47]">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E4E7EC] bg-white p-5">
              <p className="text-sm font-semibold text-[#667085]">
                Verified Today
              </p>

              <p className="mt-2 text-3xl font-extrabold text-[#00C9A7]">
                {verifiedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E4E7EC] bg-white p-5">
              <p className="text-sm font-semibold text-[#667085]">
                Returned
              </p>

              <p className="mt-2 text-3xl font-extrabold text-[#D92D20]">
                {returnedCount}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">

            {/* REPORT LIST */}

            <div className="rounded-2xl border border-[#E4E7EC] bg-white p-5">
              <div className="mb-4">
                <h2 className="text-lg font-extrabold text-[#1F1D47]">
                  Pending Reports
                </h2>

                <p className="text-sm text-[#667085]">
                  Select a report to review.
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search reports..."
                  className="w-full rounded-xl border border-[#D0D5DD] px-4 py-3 text-sm outline-none focus:border-[#8346F2]"
                />

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#D0D5DD] px-4 py-3 text-sm outline-none focus:border-[#8346F2]"
                >
                  <option value="All">All Categories</option>

                  <option value="Flooding">Flooding</option>

                  <option value="Rescue">Rescue</option>

                  <option value="Medical Emergency">
                    Medical Emergency
                  </option>
                </select>
              </div>

              {loadingReports && (
                <p className="py-10 text-center text-sm text-[#667085]">
                  Loading reports...
                </p>
              )}

              {reportsError && (
                <p className="py-10 text-center text-sm text-[#D92D20]">
                  {reportsError}
                </p>
              )}

              {!loadingReports &&
                !reportsError &&
                pendingReports.length === 0 && (
                  <p className="py-10 text-center text-sm text-[#667085]">
                    No pending reports for verification.
                  </p>
                )}

              <div className="mt-4 space-y-3">
                {pendingReports.map((report) => (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() =>
                      handleSelectReport(report.id)
                    }
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selectedId === report.id
                        ? "border-[#8346F2] bg-[#F5F3FF]"
                        : "border-[#E4E7EC] bg-white hover:border-[#C7B9FF]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-extrabold text-[#1F1D47]">
                          {report.id}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#344054]">
                          {report.type}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-2 py-1 text-xs font-bold ${
                          priorityStyles[
                            report.priority || "Not Prioritized"
                          ]
                        }`}
                      >
                        {report.priority || "Not Prioritized"}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-[#667085]">
                      {report.location}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* REPORT DETAILS */}

            <div className="rounded-2xl border border-[#E4E7EC] bg-white p-6">

              {selectedReport ? (
                <>
                  <div className="flex flex-col gap-4 border-b border-[#E4E7EC] pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#8346F2]">
                        {selectedReport.id}
                      </p>

                      <h2 className="mt-1 text-2xl font-extrabold text-[#1F1D47]">
                        {selectedReport.type}
                      </h2>

                      <p className="mt-2 text-sm text-[#667085]">
                        {selectedReport.category}
                      </p>
                    </div>

                    <span className="rounded-full bg-[#FFF4E5] px-3 py-1 text-sm font-bold text-[#B54708]">
                      Pending Verification
                    </span>
                  </div>

                  {actionMessage && (
                    <div className="mt-5 rounded-xl bg-[#F5F3FF] p-4 text-sm font-semibold text-[#5B21B6]">
                      {actionMessage}
                    </div>
                  )}

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      label="Reporter"
                      value={selectedReport.reporter}
                    />

                    <InfoItem
                      label="Location"
                      value={selectedReport.location}
                    />

                    <InfoItem
                      label="Submitted"
                      value={selectedReport.submitted}
                    />

                    <InfoItem
                      label="Priority"
                      value={
                        selectedReport.priority ||
                        "Not Prioritized"
                      }
                    />

                    <InfoItem
                      label="Affected People"
                      value={selectedReport.affected}
                    />

                    <InfoItem
                      label="Vulnerable Persons"
                      value={selectedReport.vulnerable}
                    />

                    <InfoItem
                      label="Water Level"
                      value={selectedReport.waterLevel}
                    />

                    <InfoItem
                      label="Road Passability"
                      value={selectedReport.roadPassability}
                    />
                  </div>

                  <div className="mt-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
                      Description
                    </p>

                    <p className="mt-2 rounded-xl bg-[#F9FAFB] p-4 text-sm leading-6 text-[#475467]">
                      {selectedReport.description ||
                        "No description provided."}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#E4E7EC] pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        handleVerification("Returned")
                      }
                      className="rounded-xl border border-[#FECDCA] px-5 py-3 text-sm font-bold text-[#D92D20] hover:bg-[#FEF3F2]"
                    >
                      Return for Review
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleVerification("Verified")
                      }
                      className="rounded-xl bg-[#8346F2] px-5 py-3 text-sm font-bold text-white hover:bg-[#7035DB]"
                    >
                      Verify Report
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex min-h-[500px] items-center justify-center text-center">
                  <p className="text-sm text-[#667085]">
                    Select a pending report to review.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* =========================
          RESIDENT ACCOUNT TAB
      ========================= */}

      {activeVerificationTab === "residents" && (
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">

          {/* RESIDENT LIST */}

          <div className="rounded-2xl border border-[#E4E7EC] bg-white p-5">
            <h2 className="text-lg font-extrabold text-[#1F1D47]">
              Pending Resident Accounts
            </h2>

            <input
              type="text"
              value={residentSearch}
              onChange={(event) =>
                setResidentSearch(event.target.value)
              }
              placeholder="Search residents..."
              className="mt-4 w-full rounded-xl border border-[#D0D5DD] px-4 py-3 text-sm outline-none focus:border-[#8346F2]"
            />

            <div className="mt-4 space-y-3">
              {pendingResidentAccounts.map((resident) => (
                <button
                  key={resident.id}
                  type="button"
                  onClick={() =>
                    handleSelectResident(resident)
                  }
                  className={`w-full rounded-xl border p-4 text-left ${
                    selectedResidentId === resident.id
                      ? "border-[#8346F2] bg-[#F5F3FF]"
                      : "border-[#E4E7EC]"
                  }`}
                >
                  <p className="font-bold text-[#1F1D47]">
                    {resident.name}
                  </p>

                  <p className="mt-1 text-xs text-[#667085]">
                    {resident.id}
                  </p>
                </button>
              ))}

              {pendingResidentAccounts.length === 0 && (
                <p className="py-10 text-center text-sm text-[#667085]">
                  No pending resident accounts.
                </p>
              )}
            </div>
          </div>

          {/* RESIDENT DETAILS */}

          <div className="rounded-2xl border border-[#E4E7EC] bg-white p-6">
            {selectedResident ? (
              <>
                <h2 className="text-2xl font-extrabold text-[#1F1D47]">
                  {selectedResident.name}
                </h2>

                <p className="mt-1 text-sm text-[#667085]">
                  {selectedResident.id}
                </p>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    label="Email"
                    value={selectedResident.email}
                  />

                  <InfoItem
                    label="Mobile"
                    value={selectedResident.mobile}
                  />

                  <InfoItem
                    label="Address"
                    value={selectedResident.address}
                  />

                  <InfoItem
                    label="Purok"
                    value={selectedResident.purok}
                  />

                  <InfoItem
                    label="Registered"
                    value={selectedResident.registeredAt}
                  />

                  <InfoItem
                    label="Status"
                    value={selectedResident.status}
                  />
                </div>

                <div className="mt-6">
                  <label className="text-sm font-bold text-[#344054]">
                    Verification Remarks
                  </label>

                  <textarea
                    value={residentRemarks}
                    onChange={(event) =>
                      setResidentRemarks(event.target.value)
                    }
                    placeholder="Add remarks if necessary..."
                    className="mt-2 min-h-[120px] w-full rounded-xl border border-[#D0D5DD] p-4 text-sm outline-none focus:border-[#8346F2]"
                  />
                </div>

                {residentActionMessage && (
                  <div className="mt-4 rounded-xl bg-[#F5F3FF] p-4 text-sm font-semibold text-[#5B21B6]">
                    {residentActionMessage}
                  </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#E4E7EC] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      handleResidentVerification("Rejected")
                    }
                    className="rounded-xl border border-[#FECDCA] px-5 py-3 text-sm font-bold text-[#D92D20]"
                  >
                    Reject Account
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleResidentVerification("Approved")
                    }
                    className="rounded-xl bg-[#8346F2] px-5 py-3 text-sm font-bold text-white"
                  >
                    Approve Account
                  </button>
                </div>
              </>
            ) : (
              <div className="flex min-h-[500px] items-center justify-center">
                <p className="text-sm text-[#667085]">
                  Select a resident account to review.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Verification;