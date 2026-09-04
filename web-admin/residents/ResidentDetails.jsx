import { adminReports } from "../data/sampleAdminData";
export default function ResidentDetails({
  admin,
  resident,
  onBack,
  onUpdateResident,
  onAddLog,
  onViewReport,
}) {
  if (!resident) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Resident Details</h1>

          <p className="mt-2 text-sm text-slate-500">No resident selected.</p>

          <button
            type="button"
            onClick={onBack}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
          >
            ← Back to Residents
          </button>
        </div>
      </div>
    );
  }

  const isVerified = resident.account_status === "Verified";
  const submittedReports = adminReports.filter(
    (report) =>
      report.reporter_name === resident.full_name ||
      report.reporter_contact === resident.mobile_number,
  );

  const handleVerify = () => {
    const updatedResident = {
      ...resident,
      account_status: "Verified",
    };

    onUpdateResident(updatedResident);

    onAddLog({
      log_id: `LOG-${Date.now()}`,
      report_id: null,
      action: "Resident Verified",
      details: `Resident ${resident.full_name} was verified.`,
      performed_by: admin?.full_name || "Barangay Admin",
      timestamp: new Date().toLocaleString(),
      status: "Completed",
    });
  };

  const handleDeactivate = () => {
    const updatedResident = {
      ...resident,
      account_status: "Deactivated",
    };

    onUpdateResident(updatedResident);

    onAddLog({
      log_id: `LOG-${Date.now()}`,
      report_id: null,
      action: "Resident Deactivated",
      details: `Resident ${resident.full_name} account was deactivated.`,
      performed_by: admin?.full_name || "Barangay Admin",
      timestamp: new Date().toLocaleString(),
      status: "Completed",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main */}
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
        >
          ← Back to Residents
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-blue-600">
                {resident.resident_id}
              </p>

              <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Resident Details
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                View the registered resident's information and account status.
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold ring-1 ${
                isVerified
                  ? "bg-green-50 text-green-700 ring-green-200"
                  : "bg-orange-50 text-orange-700 ring-orange-200"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isVerified ? "bg-green-500" : "bg-orange-500"
                }`}
              />

              {resident.account_status || "Unknown Status"}
            </span>
          </div>
        </div>
        {/* Resident Actions */}
        <section className="mb-6 flex flex-wrap gap-3">
          {!isVerified && (
            <button
              type="button"
              onClick={handleVerify}
              className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              Verify Resident
            </button>
          )}

          {isVerified && (
            <button
              type="button"
              onClick={handleDeactivate}
              className="rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
            >
              Deactivate Account
            </button>
          )}
        </section>
        {/* Resident Profile Card */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Profile Header */}
          <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold text-blue-700">
                {resident.full_name
                  ? resident.full_name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((name) => name[0])
                      .join("")
                      .toUpperCase()
                  : "R"}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Registered Resident
                </p>

                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                  {resident.full_name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Resident ID:{" "}
                  <span className="font-semibold text-slate-700">
                    {resident.resident_id}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="grid gap-0 sm:grid-cols-2">
            {/* Full Name */}
            <div className="border-b border-slate-100 px-6 py-5 sm:border-r">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Full Name
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {resident.full_name || "Not provided"}
              </p>
            </div>

            {/* Contact */}
            <div className="border-b border-slate-100 px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Contact Number
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {resident.mobile_number || "Not provided"}
              </p>
            </div>

            {/* Address */}
            <div className="border-b border-slate-100 px-6 py-5 sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Address
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {resident.address || "Not provided"}
              </p>
            </div>

            {/* Household */}
            <div className="border-b border-slate-100 px-6 py-5 sm:border-r">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Household Count
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {resident.household_count ?? "Not provided"}

                {resident.household_count != null && " member(s)"}
              </p>
            </div>

            {/* Account Status */}
            <div className="border-b border-slate-100 px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Account Status
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isVerified ? "bg-green-500" : "bg-orange-500"
                  }`}
                />

                <p
                  className={`text-sm font-bold ${
                    isVerified ? "text-green-700" : "text-orange-700"
                  }`}
                >
                  {resident.account_status || "Unknown Status"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Account Summary */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {/* Registered Date */}
          <div className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Registered
              </p>

              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            </div>

            <div>
              <p className="mt-4 text-lg font-bold text-slate-900">
                {resident.registered_date || "Not recorded"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Resident account registration
              </p>
            </div>
          </div>

          {/* Last Active */}
          <div className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Last Active
              </p>

              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            </div>

            <div>
              <p className="mt-4 text-lg font-bold text-slate-900">
                {resident.last_active || "Not recorded"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Most recent account activity
              </p>
            </div>
          </div>

          {/* Total Reports */}
          <div className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Total Reports
              </p>

              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            </div>

            <div>
              <p className="mt-4 text-3xl font-bold leading-none text-slate-900">
                {submittedReports.length}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Reports submitted by this resident
              </p>
            </div>
          </div>
        </section>
        {/* Submitted Reports */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Submitted Reports
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Reports submitted by this resident.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 ring-1 ring-blue-200">
                {submittedReports.length}
              </span>
            </div>
          </div>

          {submittedReports.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No reports submitted
              </p>

              <p className="mt-1 text-sm text-slate-500">
                This resident has not submitted any reports.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {submittedReports.map((report) => (
                <div
                  key={report.report_id}
                  className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">
                        {report.report_id}
                      </p>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {report.report_type}
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {report.concern_type}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {report.location} · {report.date_submitted}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onViewReport(report)}
                    className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
