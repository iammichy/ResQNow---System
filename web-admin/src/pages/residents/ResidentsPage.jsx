import { useMemo, useState } from "react";

const initialResidents = [
  {
    id: "RES-2026-001",
    name: "Juan Dela Cruz",
    email: "juan.delacruz@email.com",
    mobile: "0917 123 4567",
    address: "Purok 3, Camunatan",
    status: "Active",
    verification: "Verified",
    reports: 3,
    registered: "Aug 12, 2026",
  },
  {
    id: "RES-2026-002",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    mobile: "0918 234 5678",
    address: "Purok 1, Camunatan",
    status: "Active",
    verification: "Verified",
    reports: 2,
    registered: "Aug 15, 2026",
  },
  {
    id: "RES-2026-003",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@email.com",
    mobile: "0919 345 6789",
    address: "Purok 5, Camunatan",
    status: "Active",
    verification: "Pending",
    reports: 1,
    registered: "Aug 20, 2026",
  },
  {
    id: "RES-2026-004",
    name: "Liza Bautista",
    email: "liza.bautista@email.com",
    mobile: "0920 456 7890",
    address: "Purok 2, Camunatan",
    status: "Active",
    verification: "Verified",
    reports: 1,
    registered: "Aug 24, 2026",
  },
  {
    id: "RES-2026-005",
    name: "Roberto Garcia",
    email: "roberto.garcia@email.com",
    mobile: "0921 567 8901",
    address: "Purok 6, Camunatan",
    status: "Inactive",
    verification: "Verified",
    reports: 0,
    registered: "Jul 18, 2026",
  },
  {
    id: "RES-2026-006",
    name: "Ana Reyes",
    email: "ana.reyes@email.com",
    mobile: "0922 678 9012",
    address: "Purok 4, Camunatan",
    status: "Active",
    verification: "Pending",
    reports: 0,
    registered: "Aug 29, 2026",
  },
];

const statusStyles = {
  Active: "bg-[#ECFDF3] text-[#027A48]",
  Inactive: "bg-[#F2F4F7] text-[#667085]",
};

const verificationStyles = {
  Verified: "border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]",
  Pending: "border-[#FEDF89] bg-[#FFF4E5] text-[#B54708]",
};

function ResidentsPage({ onViewResidentReports }) {
  const [residents] = useState(initialResidents);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedResidentId, setSelectedResidentId] = useState(
    initialResidents[0].id,
  );

  const filteredResidents = useMemo(() => {
    return residents.filter((resident) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        search === "" ||
        resident.name.toLowerCase().includes(search) ||
        resident.id.toLowerCase().includes(search) ||
        resident.email.toLowerCase().includes(search) ||
        resident.mobile.includes(search) ||
        resident.address.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || resident.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [residents, searchTerm, statusFilter]);

  const selectedResident =
    filteredResidents.find((resident) => resident.id === selectedResidentId) ??
    filteredResidents[0] ??
    null;

  const totalResidents = residents.length;

  const activeResidents = residents.filter(
    (resident) => resident.status === "Active",
  ).length;

  const verifiedResidents = residents.filter(
    (resident) => resident.verification === "Verified",
  ).length;

  const totalReports = residents.reduce(
    (total, resident) => total + resident.reports,
    0,
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* PAGE HEADER */}
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8346F2]">
            MANAGEMENT
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1F1D47]">
            Residents
          </h1>

          <p className="mt-1 text-sm text-[#667085]">
            Manage registered residents and review their account information.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-[#E4E7EC] bg-white px-3 py-2 shadow-sm sm:flex">
          <span className="h-2 w-2 rounded-full bg-[#2ED47A]" />

          <span className="text-xs font-semibold text-[#344054]">
            Resident Registry
          </span>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#E4E7EC] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Total Residents
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#1F1D47]">
            {totalResidents}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Registered accounts</p>
        </div>

        <div className="rounded-2xl border border-[#ABEFC6] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Active Accounts
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#027A48]">
            {activeResidents}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Currently active</p>
        </div>

        <div className="rounded-2xl border border-[#DDD6FE] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Verified Residents
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#6941C6]">
            {verifiedResidents}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Verified accounts</p>
        </div>

        <div className="rounded-2xl border border-[#E4E7EC] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Reports Submitted
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#1F1D47]">
            {totalReports}
          </p>

          <p className="mt-1 text-xs text-[#667085]">
            From registered residents
          </p>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.65fr)]">
        {/* RESIDENT TABLE */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
          {/* TOOLBAR */}
          <div className="flex shrink-0 flex-col gap-3 border-b border-[#E4E7EC] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] px-3 transition focus-within:border-[#8346F2] focus-within:bg-white">
                <span className="text-sm text-[#667085]">⌕</span>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search residents..."
                  className="min-w-0 flex-1 bg-transparent text-xs text-[#1F1D47] outline-none placeholder:text-[#98A2B3]"
                  aria-label="Search residents"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-xl border border-[#E4E7EC] bg-white px-3 text-xs font-semibold text-[#344054] outline-none focus:border-[#8346F2]"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead className="sticky top-0 z-10 bg-[#F8FAFC]">
                <tr className="border-b border-[#E4E7EC]">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                    Resident
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                    Contact
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                    Address
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                    Verification
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                    Reports
                  </th>

                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody>
                {filteredResidents.map((resident) => {
                  const isSelected = selectedResident?.id === resident.id;

                  return (
                    <tr
                      key={resident.id}
                      onClick={() => setSelectedResidentId(resident.id)}
                      className={`cursor-pointer border-b border-[#E4E7EC] transition ${
                        isSelected ? "bg-[#F5F3FF]" : "hover:bg-[#FAF9FF]"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4F3FF] text-xs font-bold text-[#6941C6]">
                            {resident.name.charAt(0)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[#1F1D47]">
                              {resident.name}
                            </p>

                            <p className="mt-0.5 text-[10px] text-[#667085]">
                              {resident.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-[#344054]">
                          {resident.mobile}
                        </p>

                        <p className="mt-0.5 text-[10px] text-[#667085]">
                          {resident.email}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="max-w-[180px] truncate text-xs font-medium text-[#344054]">
                          {resident.address}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2 py-1 text-[10px] font-bold ${
                            verificationStyles[resident.verification]
                          }`}
                        >
                          {resident.verification}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                            statusStyles[resident.status]
                          }`}
                        >
                          {resident.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right text-xs font-bold text-[#344054]">
                        {resident.reports}
                      </td>

                      <td className="px-4 py-3 text-right text-sm text-[#98A2B3]">
                        ›
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredResidents.length === 0 && (
              <div className="flex h-full min-h-[260px] items-center justify-center p-6 text-center">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F3FF] text-lg text-[#8346F2]">
                    ♙
                  </div>

                  <p className="mt-3 text-sm font-bold text-[#1F1D47]">
                    No residents found
                  </p>

                  <p className="mt-1 text-xs text-[#667085]">
                    Try adjusting your search or status filter.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* TABLE FOOTER */}
          <div className="flex shrink-0 items-center justify-between border-t border-[#E4E7EC] px-4 py-3">
            <p className="text-xs text-[#667085]">
              Showing{" "}
              <span className="font-semibold text-[#344054]">
                {filteredResidents.length}
              </span>{" "}
              of {totalResidents} residents
            </p>

            <p className="hidden text-[10px] text-[#98A2B3] sm:block">
              Select a resident to view details
            </p>
          </div>
        </section>

        {/* DETAILS */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
          {selectedResident ? (
            <>
              <div className="shrink-0 border-b border-[#E4E7EC] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#8346F2] text-lg font-bold text-white">
                    {selectedResident.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-base font-extrabold text-[#1F1D47]">
                      {selectedResident.name}
                    </p>

                    <p className="mt-0.5 text-xs text-[#667085]">
                      {selectedResident.id}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      statusStyles[selectedResident.status]
                    }`}
                  >
                    {selectedResident.status}
                  </span>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                      verificationStyles[selectedResident.verification]
                    }`}
                  >
                    {selectedResident.verification}
                  </span>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto p-5">
                <div className="space-y-5">
                  {/* CONTACT */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#8346F2]">
                      Contact Information
                    </h3>

                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#98A2B3]">
                          Mobile Number
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#344054]">
                          {selectedResident.mobile}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#98A2B3]">
                          Email Address
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-[#344054]">
                          {selectedResident.email}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#98A2B3]">
                          Address
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#344054]">
                          {selectedResident.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACCOUNT */}
                  <div className="border-t border-[#E4E7EC] pt-5">
                    <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#8346F2]">
                      Account Information
                    </h3>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] p-3">
                        <p className="text-[9px] font-bold uppercase text-[#98A2B3]">
                          Reports
                        </p>

                        <p className="mt-1 text-lg font-extrabold text-[#1F1D47]">
                          {selectedResident.reports}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] p-3">
                        <p className="text-[9px] font-bold uppercase text-[#98A2B3]">
                          Registered
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#344054]">
                          {selectedResident.registered}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* REPORT ACTIVITY */}
                  <div className="border-t border-[#E4E7EC] pt-5">
                    <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#8346F2]">
                      Report Activity
                    </h3>

                    <div className="mt-3 rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#1F1D47]">
                            {selectedResident.reports} submitted reports
                          </p>

                          <p className="mt-1 text-xs text-[#667085]">
                            Reports associated with this resident account.
                          </p>
                        </div>

                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4F3FF] text-sm font-bold text-[#8346F2]">
                          {selectedResident.reports}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="shrink-0 border-t border-[#E4E7EC] p-4">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedResident) {
                      onViewResidentReports(selectedResident);
                    }
                  }}
                  disabled={!selectedResident}
                  className="w-full rounded-xl border border-[#8346F2] bg-white px-4 py-2.5 text-xs font-bold text-[#8346F2] transition hover:bg-[#F5F3FF] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  View Resident Reports
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center">
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F3FF] text-lg text-[#8346F2]">
                  ♙
                </div>

                <p className="mt-3 text-sm font-bold text-[#1F1D47]">
                  No resident selected
                </p>

                <p className="mt-1 text-xs text-[#667085]">
                  Select a resident from the registry.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ResidentsPage;
