import { useMemo, useState } from "react";
import {
  adminReports as initialReports,
  residents as initialResidents,
} from "../data/sampleAdminData";

export default function Residents({
  onViewResident,
  residents: residentList,
  reports: reportList,
}) {
  const residents = residentList ?? initialResidents;
  const adminReports = reportList ?? initialReports;

  const getReportCount = (resident) => {
    return adminReports.filter(
      (report) =>
        report.reporter_name === resident.full_name ||
        report.reporter_contact === resident.mobile_number,
    ).length;
  };

  const handleExport = () => {
    const headers = [
      "Resident ID",
      "Full Name",
      "Contact",
      "Address",
      "Household Count",
      "Registered Date",
      "Last Active",
      "Account Status",
      "Total Reports",
    ];

    const rows = residents.map((resident) => [
      resident.resident_id,
      resident.full_name,
      resident.mobile_number,
      resident.address,
      resident.household_count,
      resident.registered_date,
      resident.last_active,
      resident.account_status,
      getReportCount(resident),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "resqnow-residents.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [accountStatus, setAccountStatus] = useState("");

  const verifiedResidents = residents.filter(
    (resident) => resident.account_status === "Verified",
  );

  const pendingResidents = residents.filter(
    (resident) => resident.account_status === "Pending Verification",
  );

  const filteredResidents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return residents.filter((resident) => {
      const matchesSearch =
        !search ||
        [
          resident.resident_id,
          resident.full_name,
          resident.mobile_number,
          resident.address,
          resident.account_status,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));

      const matchesStatus =
        !accountStatus || resident.account_status === accountStatus;

      return matchesSearch && matchesStatus;
    });
  }, [residents, searchTerm, accountStatus]);

  const clearFilters = () => {
    setSearchTerm("");
    setAccountStatus("");
  };

  const hasActiveFilters = Boolean(searchTerm) || Boolean(accountStatus);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main */}
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">
            Residents
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            View and manage registered residents in the barangay system.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Total Residents */}
          <div className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Total Residents
              </p>

              <span className="h-2 w-2 rounded-full bg-slate-400" />
            </div>

            <div>
              <p className="mt-4 text-3xl font-bold leading-none text-slate-900">
                {residents.length}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Registered resident accounts
              </p>
            </div>
          </div>

          {/* Verified */}
          <div className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-green-600">
                Verified
              </p>

              <span className="h-2 w-2 rounded-full bg-green-500" />
            </div>

            <div>
              <p className="mt-4 text-3xl font-bold leading-none text-slate-900">
                {verifiedResidents.length}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Verified resident accounts
              </p>
            </div>
          </div>

          {/* Pending Verification */}
          <div className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                Pending Verification
              </p>

              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </div>

            <div>
              <p className="mt-4 text-3xl font-bold leading-none text-slate-900">
                {pendingResidents.length}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Accounts requiring verification
              </p>
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
                  Find a resident using their name, ID, contact number, or
                  address.
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
            <div className="grid gap-4 md:grid-cols-[1fr_240px]">
              {/* Search */}
              <div>
                <label
                  htmlFor="residentSearch"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Search Residents
                </label>

                <div className="relative mt-2">
                  <input
                    id="residentSearch"
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search resident ID, name, contact, address..."
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

              {/* Status */}
              <div>
                <label
                  htmlFor="accountStatus"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Account Status
                </label>

                <select
                  id="accountStatus"
                  value={accountStatus}
                  onChange={(event) => setAccountStatus(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="">All Account Statuses</option>

                  <option value="Verified">Verified</option>

                  <option value="Pending Verification">
                    Pending Verification
                  </option>

                  <option value="Deactivated">Deactivated</option>
                </select>
              </div>
            </div>

            {/* Result Count */}
            <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-900">
                  {filteredResidents.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-900">
                  {residents.length}
                </span>{" "}
                residents
              </p>

              {hasActiveFilters && (
                <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Filters applied
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Resident List */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Resident List Header */}
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Resident List
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Registered residents and their account information.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Export List
                </button>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {filteredResidents.length} resident
                  {filteredResidents.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Resident List */}
          <div className="divide-y divide-slate-100">
            {filteredResidents.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                  !
                </div>

                <p className="mt-4 text-base font-bold text-slate-800">
                  No residents found
                </p>

                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  No residents match your current search or filter selections.
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
              filteredResidents.map((resident) => {
                const isVerified = resident.account_status === "Verified";

                const initials = resident.full_name
                  ? resident.full_name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((name) => name[0])
                      .join("")
                      .toUpperCase()
                  : "R";

                return (
                  <article
                    key={resident.resident_id}
                    className="group px-6 py-6 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      {/* Resident Information */}
                      <div className="flex min-w-0 flex-1 gap-4">
                        {/* Avatar */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
                          {initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* ID + Status */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                              {resident.resident_id}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                                isVerified
                                  ? "bg-green-50 text-green-700 ring-green-200"
                                  : resident.account_status === "Deactivated"
                                    ? "bg-red-50 text-red-700 ring-red-200"
                                    : "bg-orange-50 text-orange-700 ring-orange-200"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isVerified
                                    ? "bg-green-500"
                                    : resident.account_status === "Deactivated"
                                      ? "bg-red-500"
                                      : "bg-orange-500"
                                }`}
                              />

                              {resident.account_status || "Unknown Status"}
                            </span>
                          </div>

                          {/* Name */}
                          <h4 className="mt-3 text-lg font-bold text-slate-900">
                            {resident.full_name}
                          </h4>

                          {/* Details */}
                          <div className="mt-3 grid gap-x-8 gap-y-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                            <p>
                              <span className="font-semibold text-slate-500">
                                Contact:
                              </span>{" "}
                              {resident.mobile_number || "Not provided"}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-500">
                                Address:
                              </span>{" "}
                              {resident.address || "Not provided"}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-500">
                                Household:
                              </span>{" "}
                              {resident.household_count ?? "Not provided"}
                              {resident.household_count != null && " member(s)"}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-500">
                                Registered:
                              </span>{" "}
                              {resident.registered_date || "Not recorded"}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-500">
                                Last Active:
                              </span>{" "}
                              {resident.last_active || "Not recorded"}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-500">
                                Total Reports:
                              </span>{" "}
                              {getReportCount(resident)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="border-t border-slate-100 pt-4 lg:border-0 lg:pt-0">
                        <button
                          type="button"
                          onClick={() => onViewResident(resident)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 lg:w-auto"
                        >
                          View Resident
                          <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
