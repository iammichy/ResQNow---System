import { useEffect, useMemo, useState } from "react";
import { getAllPersonnel } from "../../services/reportsService";
import { useLanguage } from "../../hooks/useLanguage";

const statusStyles = {
  Active: "bg-[#ECFDF3] text-[#027A48]",
  Inactive: "bg-[#F2F4F7] text-[#667085]",
};

const availabilityStyles = {
  Available: "border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]",
  Assigned: "border-[#DDD6FE] bg-[#F4F3FF] text-[#6941C6]",
  Unavailable: "border-[#FECACA] bg-[#FEF2F2] text-[#B42318]",
};

function formatPersonnel(person) {
  return {
    databaseId: person.id,
    id: person.personnel_code || `PER-${person.id}`,
    name: person.name || "Unknown Personnel",
    role: person.role || "Not specified",
    team: person.team || "Not assigned",
    mobile: person.mobile || "Not provided",
    status: person.status || "Inactive",
    availability: person.availability || "Unavailable",
    assignment: person.assignment || null,
    location: person.location || "—",
    joined: person.joined_at
      ? new Date(person.joined_at).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : "Not specified",
  };
}

function PersonnelPage({ onOpenReport, reportUpdates }) {
  const { t } = useLanguage();

  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPersonnelId, setSelectedPersonnelId] = useState(null);

  useEffect(() => {
    async function loadPersonnel() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllPersonnel();

        const formattedPersonnel = data.map(formatPersonnel);

        setPersonnel(formattedPersonnel);

        if (formattedPersonnel.length > 0) {
          setSelectedPersonnelId(formattedPersonnel[0].id);
        }
      } catch (err) {
        console.error("Failed to load personnel:", err);

        setError(t("unableToLoadPersonnel"));
      } finally {
        setLoading(false);
      }
    }

    loadPersonnel();
  }, []);

  const updatedPersonnel = useMemo(() => {
    return personnel.map((person) => {
      const activeAssignment = Object.values(reportUpdates || {}).find(
        (report) =>
          report.assignment?.personnel === person.name &&
          report.status !== "Resolved",
      );

      if (activeAssignment) {
        return {
          ...person,
          availability: "Assigned",
          assignment: activeAssignment.id,
          location: activeAssignment.location || person.location,
        };
      }

      return {
        ...person,
        availability:
          person.status === "Inactive"
            ? "Unavailable"
            : person.assignment
              ? "Assigned"
              : "Available",
      };
    });
  }, [personnel, reportUpdates]);

  const filteredPersonnel = useMemo(() => {
    return updatedPersonnel.filter((person) => {
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
  }, [updatedPersonnel, searchTerm, statusFilter]);

  const selectedPersonnel =
    filteredPersonnel.find((person) => person.id === selectedPersonnelId) ??
    filteredPersonnel[0] ??
    null;

  const totalPersonnel = personnel.length;

  const activePersonnel = updatedPersonnel.filter(
    (person) => person.status === "Active",
  ).length;

  const availablePersonnel = updatedPersonnel.filter(
    (person) =>
      person.status === "Active" &&
      person.availability === "Available",
  ).length;

  const assignedPersonnel = updatedPersonnel.filter(
    (person) =>
      person.status === "Active" &&
      person.availability === "Assigned",
  ).length;

  const displayStatus = (status) => {
    if (status === "Active") return t("active");
    if (status === "Inactive") return t("inactive");

    return status;
  };

  const displayAvailability = (availability) => {
    if (availability === "Available") return t("available");
    if (availability === "Assigned") return t("assigned");
    if (availability === "Unavailable") return t("unavailable");

    return availability;
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* PAGE HEADER */}
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8346F2]">
            {t("management")}
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1F1D47]">
            {t("personnelPageTitle")}
          </h1>

          <p className="mt-1 text-sm text-[#667085]">
            {t("personnelPageDescription")}
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-[#E4E7EC] bg-white px-3 py-2 shadow-sm sm:flex">
          <span className="h-2 w-2 rounded-full bg-[#2ED47A]" />

          <span className="text-xs font-semibold text-[#344054]">
            {t("personnelRegistry")}
          </span>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#E4E7EC] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            {t("totalPersonnel")}
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#1F1D47]">
            {totalPersonnel}
          </p>

          <p className="mt-1 text-xs text-[#667085]">
            {t("registeredPersonnel")}
          </p>
        </div>

        <div className="rounded-2xl border border-[#ABEFC6] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            {t("activePersonnel")}
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#027A48]">
            {activePersonnel}
          </p>

          <p className="mt-1 text-xs text-[#667085]">
            {t("currentlyActive")}
          </p>
        </div>

        <div className="rounded-2xl border border-[#ABEFC6] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            {t("available")}
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#027A48]">
            {availablePersonnel}
          </p>

          <p className="mt-1 text-xs text-[#667085]">
            {t("readyForAssignment")}
          </p>
        </div>

        <div className="rounded-2xl border border-[#DDD6FE] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            {t("assigned")}
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#6941C6]">
            {assignedPersonnel}
          </p>

          <p className="mt-1 text-xs text-[#667085]">
            {t("handlingActiveReports")}
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#B42318]">
          {error}
        </div>
      )}

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
                  placeholder={t("searchPersonnel")}
                  className="min-w-0 flex-1 bg-transparent text-xs text-[#1F1D47] outline-none placeholder:text-[#98A2B3]"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-xl border border-[#E4E7EC] bg-white px-3 text-xs font-semibold text-[#344054] outline-none focus:border-[#8346F2]"
            >
              <option value="All">{t("allStatus")}</option>
              <option value="Active">{t("active")}</option>
              <option value="Inactive">{t("inactive")}</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="min-h-0 flex-1 overflow-auto">
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm font-medium text-[#667085]">
                  {t("loadingPersonnel")}
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[820px] border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F8FAFC]">
                  <tr className="border-b border-[#E4E7EC]">
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                      {t("personnel")}
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                      {t("role")}
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                      {t("team")}
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                      {t("availability")}
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                      {t("status")}
                    </th>

                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.07em] text-[#667085]">
                      {t("assignment")}
                    </th>

                    <th className="px-4 py-3" />
                  </tr>
                </thead>

                <tbody>
                  {filteredPersonnel.map((person) => {
                    const isSelected =
                      selectedPersonnel?.id === person.id;

                    return (
                      <tr
                        key={person.id}
                        onClick={() =>
                          setSelectedPersonnelId(person.id)
                        }
                        className={`cursor-pointer border-b border-[#E4E7EC] transition ${
                          isSelected
                            ? "bg-[#F5F3FF]"
                            : "hover:bg-[#FAF9FF]"
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
                            {displayAvailability(person.availability)}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                              statusStyles[person.status]
                            }`}
                          >
                            {displayStatus(person.status)}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          {person.assignment ? (
                            <span className="text-xs font-bold text-[#6941C6]">
                              {person.assignment}
                            </span>
                          ) : (
                            <span className="text-xs text-[#98A2B3]">
                              —
                            </span>
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
            )}

            {!loading && filteredPersonnel.length === 0 && (
              <div className="flex min-h-[260px] items-center justify-center p-6 text-center">
                <div>
                  <p className="text-sm font-bold text-[#1F1D47]">
                    {t("noPersonnelFound")}
                  </p>

                  <p className="mt-1 text-xs text-[#667085]">
                    {t("adjustSearchOrStatus")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* TABLE FOOTER */}
          <div className="flex shrink-0 items-center justify-between border-t border-[#E4E7EC] px-4 py-3">
            <p className="text-xs text-[#667085]">
              {t("showing")}{" "}
              <span className="font-semibold text-[#344054]">
                {filteredPersonnel.length}
              </span>{" "}
              {t("of")} {totalPersonnel} {t("personnel").toLowerCase()}
            </p>

            <p className="hidden text-[10px] text-[#98A2B3] sm:block">
              {t("selectPersonnelToViewDetails")}
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
                    {displayStatus(selectedPersonnel.status)}
                  </span>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                      availabilityStyles[
                        selectedPersonnel.availability
                      ]
                    }`}
                  >
                    {displayAvailability(
                      selectedPersonnel.availability,
                    )}
                  </span>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto p-5">
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#8346F2]">
                      {t("personnelInformation")}
                    </h3>

                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#98A2B3]">
                          {t("role")}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#344054]">
                          {selectedPersonnel.role}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#98A2B3]">
                          {t("responseTeam")}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#344054]">
                          {selectedPersonnel.team}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#98A2B3]">
                          {t("mobileNumber")}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#344054]">
                          {selectedPersonnel.mobile}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#E4E7EC] pt-5">
                    <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#8346F2]">
                      {t("currentAssignment")}
                    </h3>

                    <div className="mt-3 rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] p-4">
                      {selectedPersonnel.assignment ? (
                        <>
                          <p className="text-[10px] font-bold uppercase text-[#98A2B3]">
                            {t("activeReport")}
                          </p>

                          <p className="mt-1 text-sm font-extrabold text-[#6941C6]">
                            {selectedPersonnel.assignment}
                          </p>

                          <p className="mt-2 text-xs text-[#667085]">
                            {t("currentLocation")}:{" "}
                            <span className="font-semibold text-[#344054]">
                              {selectedPersonnel.location}
                            </span>
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-[#027A48]">
                            {t("noActiveAssignment")}
                          </p>

                          <p className="mt-1 text-xs text-[#667085]">
                            {t("personnelAvailableForDeployment")}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[#E4E7EC] pt-5">
                    <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#8346F2]">
                      {t("accountInformation")}
                    </h3>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] p-3">
                        <p className="text-[9px] font-bold uppercase text-[#98A2B3]">
                          {t("status")}
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#344054]">
                          {displayStatus(selectedPersonnel.status)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] p-3">
                        <p className="text-[9px] font-bold uppercase text-[#98A2B3]">
                          {t("joined")}
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
                  onClick={() => {
                    if (!selectedPersonnel.assignment) return;

                    onOpenReport?.({
                      id: selectedPersonnel.assignment,
                    });
                  }}
                  disabled={!selectedPersonnel.assignment}
                  className={`w-full rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                    selectedPersonnel.assignment
                      ? "border-[#8346F2] bg-white text-[#8346F2] hover:bg-[#F5F3FF]"
                      : "cursor-not-allowed border-[#E4E7EC] bg-[#F2F4F7] text-[#98A2B3]"
                  }`}
                >
                  {selectedPersonnel.assignment
                    ? `${t("viewAssignment")} • ${selectedPersonnel.assignment}`
                    : t("noActiveAssignmentButton")}
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center">
              <div>
                <p className="text-sm font-bold text-[#1F1D47]">
                  {t("noPersonnelSelected")}
                </p>

                <p className="mt-1 text-xs text-[#667085]">
                  {t("selectPersonnelFromRegistry")}
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