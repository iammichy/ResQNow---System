import { useState } from "react";

export default function SettingsRoles({ admin, onUpdateAdmin, onAddLog }) {
  const [fullName, setFullName] = useState(
    admin?.full_name || "Barangay Admin",
  );

  const [role, setRole] = useState(admin?.role || "super_admin");

  const [saved, setSaved] = useState(false);
  const roleLabels = {
    super_admin: "Super Admin",
    personnel: "Barangay Personnel",
    investigator: "Investigator / Authorized Verifier",
    responder: "Responder",
  };
  const roleDescriptions = {
    super_admin:
      "Full access to reports, residents, assignments, settings, roles, exports, and audit records.",

    personnel:
      "Manage reports, perform verification, add remarks, and update report status.",

    investigator:
      "Assess and update report priority with supporting remarks and proof.",

    responder:
      "View assigned reports, update field progress, and record response actions.",
  };

  const handleSave = (event) => {
    event.preventDefault();

    const trimmedName = fullName.trim() || "Barangay Admin";

    onUpdateAdmin?.({
      ...admin,
      full_name: trimmedName,
      role,
    });

    onAddLog?.({
      log_id: `LOG-${Date.now()}`,
      report_id: null,
      action: "Settings Updated",
      details: `Account settings updated. Name: ${trimmedName}, Role: ${
        roleLabels[role] || role
      }.`,
      performed_by: admin?.full_name || "Barangay Admin",
      timestamp: new Date().toLocaleString("en-PH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    });

    setSaved(true);

    // Keep the success message visible briefly.
    setTimeout(() => {
      setSaved(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main */}
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">
                Settings & Roles
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Manage administrator account information and review system role
                permissions.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Current Role
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {roleLabels[role] || role}
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
              ✓
            </div>

            <div>
              <p className="text-sm font-bold text-green-800">
                Settings saved successfully.
              </p>

              <p className="mt-1 text-sm text-green-700">
                Your changes are now active for this session.
              </p>
            </div>
          </div>
        )}

        {/* Account Settings */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
            <h3 className="text-base font-bold text-slate-900">
              Account Settings
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Update the administrator account information.
            </p>
          </div>

          <form onSubmit={handleSave}>
            <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="adminName"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Full Name
                </label>

                <input
                  id="adminName"
                  type="text"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setSaved(false);
                  }}
                  placeholder="Enter administrator name"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {/* User ID */}
              <div>
                <label
                  htmlFor="adminUserId"
                  className="block text-sm font-semibold text-slate-700"
                >
                  User ID
                </label>

                <input
                  id="adminUserId"
                  type="text"
                  value={admin?.user_id || "ADM-001"}
                  disabled
                  readOnly
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  User ID cannot be changed.
                </p>
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="adminRole"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Current Role
                </label>

                <select
                  id="adminRole"
                  value={role}
                  onChange={(event) => {
                    setRole(event.target.value);
                    setSaved(false);
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="super_admin">Super Admin</option>

                  <option value="personnel">Barangay Personnel</option>

                  <option value="investigator">
                    Investigator / Authorized Verifier
                  </option>

                  <option value="responder">Responder</option>
                </select>
              </div>

              {/* Account Status */}
              <div>
                <label
                  htmlFor="accountStatus"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Account Status
                </label>

                <div className="mt-2 flex h-11.5 items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

                  <span className="text-sm font-semibold text-green-700">
                    Active
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Current administrator account status.
                </p>
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end border-t border-slate-200 bg-slate-50/50 px-6 py-5">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                Save Settings
              </button>
            </div>
          </form>
        </section>

        {/* Selected Role */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
          <div className="border-b border-blue-100 bg-blue-50/50 px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
              Selected Role
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              {roleLabels[role] || role}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {roleDescriptions[role] ||
                "Role permissions are defined by the system administrator."}
            </p>
          </div>
        </section>

        {/* Role Permissions */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Role Permissions
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Overview of permissions available to each system role.
                </p>
              </div>

              <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">
                4 Roles
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Super Admin */}
            <div className="px-6 py-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-slate-900">Super Admin</h4>

                    {role === "super_admin" && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                        Current Role
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Full access to reports, residents, assignments, settings,
                    roles, exports, and audit records.
                  </p>
                </div>
              </div>
            </div>

            {/* Barangay Personnel */}
            <div className="px-6 py-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-slate-900">
                      Barangay Personnel
                    </h4>

                    {role === "personnel" && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                        Current Role
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Manage reports, perform verification, add remarks, and
                    update report status.
                  </p>
                </div>
              </div>
            </div>

            {/* Investigator / Authorized Verifier */}
            <div className="px-6 py-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-slate-900">
                      Investigator / Authorized Verifier
                    </h4>

                    {role === "investigator" && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                        Current Role
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Assess and update report priority with supporting remarks
                    and proof.
                  </p>
                </div>
              </div>
            </div>

            {/* Responder */}
            <div className="px-6 py-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-slate-900">Responder</h4>

                    {role === "responder" && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                        Current Role
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    View assigned reports, update field progress, and record
                    response actions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Information Notice */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4">
          <p className="text-sm font-semibold text-slate-700">
            Role Management
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Role permissions shown above represent the current system
            configuration. Backend-based role enforcement can be integrated
            later.
          </p>
        </div>
      </main>
    </div>
  );
}
