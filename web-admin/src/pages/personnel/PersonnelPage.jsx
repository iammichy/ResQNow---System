import { useMemo, useState } from "react";

const initialPersonnel = [
  {
    id: "PER-2026-001",
    name: "Carlos Mendoza",
    role: "Response Team Leader",
    team: "Emergency Response Team A",
    mobile: "0917 456 7890",
    status: "Active",
    availability: "Assigned",
    assignment: "RPT-2026-001",
    location: "Purok 3, Camunatan",
    joined: "Jan 15, 2026",
  },
  {
    id: "PER-2026-002",
    name: "Mark Reyes",
    role: "Emergency Responder",
    team: "Emergency Response Team A",
    mobile: "0918 567 8901",
    status: "Active",
    availability: "Available",
    assignment: null,
    location: "Barangay Hall",
    joined: "Feb 03, 2026",
  },
  {
    id: "PER-2026-003",
    name: "John Bautista",
    role: "Emergency Responder",
    team: "Emergency Response Team B",
    mobile: "0919 678 9012",
    status: "Active",
    availability: "Assigned",
    assignment: "RPT-2026-003",
    location: "Purok 1, Camunatan",
    joined: "Feb 18, 2026",
  },
  {
    id: "PER-2026-004",
    name: "Ana Garcia",
    role: "Barangay Personnel",
    team: "Emergency Response Team B",
    mobile: "0920 789 0123",
    status: "Active",
    availability: "Available",
    assignment: null,
    location: "Barangay Hall",
    joined: "Mar 02, 2026",
  },
  {
    id: "PER-2026-005",
    name: "Miguel Santos",
    role: "Emergency Responder",
    team: "Emergency Response Team C",
    mobile: "0921 890 1234",
    status: "Active",
    availability: "Assigned",
    assignment: "RPT-2026-006",
    location: "Purok 4, Camunatan",
    joined: "Mar 15, 2026",
  },
  {
    id: "PER-2026-006",
    name: "Ramon Cruz",
    role: "Barangay Personnel",
    team: "Emergency Response Team C",
    mobile: "0922 901 2345",
    status: "Inactive",
    availability: "Unavailable",
    assignment: null,
    location: "—",
    joined: "Apr 11, 2026",
  },
];

const statusStyles = {
  Active: "bg-[#ECFDF3] text-[#027A48]",
  Inactive: "bg-[#F2F4F7] text-[#667085]",
};

const availabilityStyles = {
  Available: "border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]",
  Assigned: "border-[#DDD6FE] bg-[#F4F3FF] text-[#6941C6]",
  Unavailable: "border-[#FECACA] bg-[#FEF2F2] text-[#B42318]",
};

function PersonnelPage() {
  const [personnel] = useState(initialPersonnel);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPersonnelId, setSelectedPersonnelId] = useState(
    initialPersonnel[0].id,
  );

  const filteredPersonnel = useMemo(() => {
    return personnel.filter((person) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        search === "" ||
        person.name.toLowerCase().includes(search) ||
        person.id.toLowerCase().includes(search) ||
        person.role.toLowerCase().includes(search) ||
        person.team.toLowerCase().includes(search) ||
        person.mobile.includes(search);

      const matchesStatus =
        statusFilter === "All" || person.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [personnel, searchTerm, statusFilter]);

  const selectedPersonnel =
    filteredPersonnel.find((person) => person.id === selectedPersonnelId) ??
    filteredPersonnel[0] ??
    null;

  const totalPersonnel = personnel.length;

  const activePersonnel = personnel.filter(
    (person) => person.status === "Active",
  ).length;

  const availablePersonnel = personnel.filter(
    (person) =>
      person.status === "Active" && person.availability === "Available",
  ).length;

  const assignedPersonnel = personnel.filter(
    (person) =>
      person.status === "Active" && person.availability === "Assigned",
  ).length;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* PAGE HEADER */}
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8346F2]">
            MANAGEMENT
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1F1D47]">
            Personnel
          </h1>

          <p className="mt-1 text-sm text-[#667085]">
            Manage barangay response personnel, teams, and current assignments.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-[#E4E7EC] bg-white px-3 py-2 shadow-sm sm:flex">
          <span className="h-2 w-2 rounded-full bg-[#2ED47A]" />

          <span className="text-xs font-semibold text-[#344054]">
            Personnel Registry
          </span>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#E4E7EC] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Total Personnel
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#1F1D47]">
            {totalPersonnel}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Registered personnel</p>
        </div>

        <div className="rounded-2xl border border-[#ABEFC6] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Active Personnel
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#027A48]">
            {activePersonnel}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Currently active</p>
        </div>

        <div className="rounded-2xl border border-[#ABEFC6] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Available
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#027A48]">
            {availablePersonnel}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Ready for assignment</p>
        </div>

        <div className="rounded-2xl border border-[#DDD6FE] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Assigned
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#6941C6]">
            {assignedPersonnel}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Handling active reports</p>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.65fr)]">
        {/* PERSONNEL TABLE */}
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
                  placeholder="Search personnel..."
                  className="min-w-0 flex-1 bg-transparent text-xs text-[#1F1D47] outline-none placeholder:text-[#98A2B3]"
                  aria-label="Search personnel"
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
            <table className="w-full min-w-[820px] border-collapse">
              <thead className="sticky top-0 z-10 bg-[#F8FAFC]">
                <tr className="border-b border-[#E4E7EC]">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                    Personnel
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                    Role
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                    Team
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                    Availability
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                    Assignment
                  </th>

                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody>
                {filteredPersonnel.map((person) => {
                  const isSelected = selectedPersonnel?.id === person.id;

                  return (
                    <tr
                      key={person.id}
                      onClick={() => setSelectedPersonnelId(person.id)}
                      className={`cursor-pointer border-b border-[#E4E7EC] transition ${
                        isSelected ? "bg-[#F5F3FF]" : "hover:bg-[#FAF9FF]"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4F3FF] text-xs font-bold text-[#6941C6]">
                            {person.name.charAt(0)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[#1F1D47]">
                              {person.name}
                            </p>

                            <p className="mt-0.5 text-[10px] text-[#667085]">
                              {person.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-[#344054]">
                          {person.role}
                        </p>

                        <p className="mt-0.5 text-[10px] text-[#667085]">
                          {person.mobile}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="max-w-[190px] truncate text-xs font-medium text-[#344054]">
                          {person.team}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2 py-1 text-[10px] font-bold ${
                            availabilityStyles[person.availability]
                          }`}
                        >
                          {person.availability}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                            statusStyles[person.status]
                          }`}
                        >
                          {person.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        {person.assignment ? (
                          <span className="text-xs font-bold text-[#6941C6]">
                            {person.assignment}
                          </span>
                        ) : (
                          <span className="text-xs text-[#98A2B3]">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right text-sm text-[#98A2B3]">
                        ›
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredPersonnel.length === 0 && (
              <div className="flex h-full min-h-[260px] items-center justify-center p-6 text-center">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F3FF] text-lg text-[#8346F2]">
                    ♙
                  </div>

                  <p className="mt-3 text-sm font-bold text-[#1F1D47]">
                    No personnel found
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
                {filteredPersonnel.length}
              </span>{" "}
              of {totalPersonnel} personnel
            </p>

            <p className="hidden text-[10px] text-[#98A2B3] sm:block">
              Select personnel to view details
            </p>
          </div>
        </section>

        {/* DETAILS */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
          {selectedPersonnel ? (
            <>
              <div className="shrink-0 border-b border-[#E4E7EC] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#8346F2] text-lg font-bold text-white">
                    {selectedPersonnel.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-base font-extrabold text-[#1F1D47]">
                      {selectedPersonnel.name}
                    </p>

                    <p className="mt-0.5 text-xs text-[#667085]">
                      {selectedPersonnel.id}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      statusStyles[selectedPersonnel.status]
                    }`}
                  >
                    {selectedPersonnel.status}
                  </span>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                      availabilityStyles[selectedPersonnel.availability]
                    }`}
                  >
                    {selectedPersonnel.availability}
                  </span>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto p-5">
                <div className="space-y-5">
                  {/* ROLE & TEAM */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#8346F2]">
                      Personnel Information
                    </h3>

                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#98A2B3]">
                          Role
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#344054]">
                          {selectedPersonnel.role}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#98A2B3]">
                          Response Team
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#344054]">
                          {selectedPersonnel.team}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#98A2B3]">
                          Mobile Number
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#344054]">
                          {selectedPersonnel.mobile}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ASSIGNMENT */}
                  <div className="border-t border-[#E4E7EC] pt-5">
                    <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#8346F2]">
                      Current Assignment
                    </h3>

                    <div className="mt-3 rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] p-4">
                      {selectedPersonnel.assignment ? (
                        <>
                          <p className="text-[10px] font-bold uppercase text-[#98A2B3]">
                            Active Report
                          </p>

                          <p className="mt-1 text-sm font-extrabold text-[#6941C6]">
                            {selectedPersonnel.assignment}
                          </p>

                          <p className="mt-2 text-xs text-[#667085]">
                            Current location:{" "}
                            <span className="font-semibold text-[#344054]">
                              {selectedPersonnel.location}
                            </span>
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-[#027A48]">
                            No active assignment
                          </p>

                          <p className="mt-1 text-xs text-[#667085]">
                            This personnel is currently available for
                            deployment.
                          </p>
                        </>
                      )}
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
                          Status
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#344054]">
                          {selectedPersonnel.status}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] p-3">
                        <p className="text-[9px] font-bold uppercase text-[#98A2B3]">
                          Joined
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#344054]">
                          {selectedPersonnel.joined}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="shrink-0 border-t border-[#E4E7EC] p-4">
                <button
                  type="button"
                  className="w-full rounded-xl border border-[#8346F2] bg-white px-4 py-2.5 text-xs font-bold text-[#8346F2] transition hover:bg-[#F5F3FF]"
                >
                  View Assignments
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
                  No personnel selected
                </p>

                <p className="mt-1 text-xs text-[#667085]">
                  Select personnel from the registry.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default PersonnelPage;
