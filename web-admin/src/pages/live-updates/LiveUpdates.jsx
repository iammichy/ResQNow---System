import { useMemo, useState } from "react";

const updatesData = [
  {
    id: 1,
    type: "Emergency",
    icon: "⚠",
    title: "Evacuation alert issued",
    description:
      "Building A and surrounding areas in Purok 2 are advised to prepare for evacuation due to increasing flood risk.",
    location: "Purok 2, Camunatan",
    reportedBy: "Sarah Johnson",
    time: "09:32 AM",
    date: "September 4, 2026",
    relatedReport: "INC-2025-0412",
    status: "Active",
  },
  {
    id: 2,
    type: "Evacuation",
    icon: "⌂",
    title: "Shelter 2 is now open",
    description:
      "Shelter 2 is now open and accepting residents from affected areas in Purok 2.",
    location: "Purok 2, Camunatan",
    reportedBy: "Michael Chen",
    time: "09:28 AM",
    date: "September 4, 2026",
    relatedReport: "INC-2025-0412",
    status: "Active",
  },
  {
    id: 3,
    type: "Response",
    icon: "+",
    title: "Medical support team en route",
    description:
      "A medical response team has been dispatched to provide assistance at the incident location.",
    location: "Purok 2, Camunatan",
    reportedBy: "Priya Sharma",
    time: "09:24 AM",
    date: "September 4, 2026",
    relatedReport: "INC-2025-0412",
    status: "Responding",
  },
  {
    id: 4,
    type: "Report",
    icon: "!",
    title: "Flood level increased",
    description:
      "Water levels in the affected area have increased and are being continuously monitored.",
    location: "Purok 3, Camunatan",
    reportedBy: "Barangay Response Team",
    time: "09:10 AM",
    date: "September 4, 2026",
    relatedReport: "RPT-2026-001",
    status: "Monitoring",
  },
  {
    id: 5,
    type: "Verification",
    icon: "✓",
    title: "Incident report verified",
    description:
      "The submitted hazard report has been reviewed and verified by authorized barangay personnel.",
    location: "National Highway",
    reportedBy: "Verification Team",
    time: "08:55 AM",
    date: "September 4, 2026",
    relatedReport: "RPT-2026-002",
    status: "Verified",
  },
  {
    id: 6,
    type: "Response",
    icon: "✓",
    title: "Response operation completed",
    description:
      "The assigned response team has completed the initial operation and the situation is under monitoring.",
    location: "Purok 5, Riverside",
    reportedBy: "Response Team Alpha",
    time: "08:30 AM",
    date: "September 4, 2026",
    relatedReport: "RPT-2026-004",
    status: "Completed",
  },
];

const typeStyles = {
  Emergency: {
    bg: "bg-red-50",
    text: "text-red-500",
    border: "border-red-100",
  },
  Evacuation: {
    bg: "bg-teal-50",
    text: "text-teal-600",
    border: "border-teal-100",
  },
  Response: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
  },
  Report: {
    bg: "bg-orange-50",
    text: "text-orange-500",
    border: "border-orange-100",
  },
  Verification: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-100",
  },
};

const statusStyles = {
  Active: "bg-red-50 text-red-600",
  Responding: "bg-blue-50 text-blue-600",
  Monitoring: "bg-orange-50 text-orange-600",
  Verified: "bg-green-50 text-green-600",
  Completed: "bg-emerald-50 text-emerald-600",
};

function LiveUpdates({ onBack }) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedUpdate, setSelectedUpdate] = useState(null);

  const filteredUpdates = useMemo(() => {
    return updatesData.filter((update) => {
      const matchesType =
        selectedType === "All" || update.type === selectedType;

      const searchValue = search.toLowerCase();

      const matchesSearch =
        update.title.toLowerCase().includes(searchValue) ||
        update.description.toLowerCase().includes(searchValue) ||
        update.location.toLowerCase().includes(searchValue) ||
        update.relatedReport.toLowerCase().includes(searchValue);

      return matchesType && matchesSearch;
    });
  }, [search, selectedType]);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-[1400px]">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#667085] transition hover:text-[#8346F2]"
        >
          ← Back to Dashboard
        </button>
        {/* PAGE HEADER */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8346F2]">
            Operations
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#1F1D47]">
            Live Updates
          </h1>

          <p className="mt-2 text-sm text-[#667085]">
            Monitor the latest emergency and incident updates in the barangay.
          </p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#E4E7EC] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              Today's Updates
            </p>

            <p className="mt-2 text-3xl font-bold text-[#1F1D47]">
              {updatesData.length}
            </p>

            <p className="mt-1 text-sm text-[#667085]">
              Latest operational activities
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              Active Emergencies
            </p>

            <p className="mt-2 text-3xl font-bold text-red-500">
              {updatesData.filter((item) => item.status === "Active").length}
            </p>

            <p className="mt-1 text-sm text-[#667085]">
              Requires continuous monitoring
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              Completed Updates
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {updatesData.filter((item) => item.status === "Completed").length}
            </p>

            <p className="mt-1 text-sm text-[#667085]">
              Successfully completed operations
            </p>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
          {/* UPDATES LIST */}
          <div className="rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
            {/* CONTROLS */}
            <div className="flex flex-col gap-3 border-b border-[#E4E7EC] p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#1F1D47]">
                  Latest Activity
                </h2>

                <p className="mt-1 text-sm text-[#667085]">
                  {filteredUpdates.length} update
                  {filteredUpdates.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search updates..."
                  className="rounded-xl border border-[#D0D5DD] px-4 py-2.5 text-sm text-[#344054] outline-none transition focus:border-[#8346F2]"
                />

                <select
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value)}
                  className="rounded-xl border border-[#D0D5DD] bg-white px-4 py-2.5 text-sm text-[#344054] outline-none focus:border-[#8346F2]"
                >
                  <option value="All">All Updates</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Evacuation">Evacuation</option>
                  <option value="Response">Response</option>
                  <option value="Report">Report</option>
                  <option value="Verification">Verification</option>
                </select>
              </div>
            </div>

            {/* TIMELINE */}
            <div className="max-h-[620px] overflow-y-auto p-5">
              {filteredUpdates.length > 0 ? (
                <div className="relative">
                  <div className="absolute bottom-0 left-6 top-0 w-px bg-[#E4E7EC]" />

                  <div className="space-y-5">
                    {filteredUpdates.map((update) => {
                      const style =
                        typeStyles[update.type] || typeStyles.Report;

                      return (
                        <button
                          key={update.id}
                          type="button"
                          onClick={() => setSelectedUpdate(update)}
                          className={`relative flex w-full gap-4 rounded-xl p-3 text-left transition hover:bg-[#F9FAFB] ${
                            selectedUpdate?.id === update.id
                              ? "bg-[#F7F4FF]"
                              : ""
                          }`}
                        >
                          {/* ICON */}
                          <div
                            className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-lg font-bold ${style.bg} ${style.text} ${style.border}`}
                          >
                            {update.icon}
                          </div>

                          {/* CONTENT */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-xs font-medium text-[#667085]">
                                {update.time}
                              </p>

                              <span
                                className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  statusStyles[update.status]
                                }`}
                              >
                                {update.status}
                              </span>
                            </div>

                            <h3 className="mt-1 text-base font-bold text-[#1F1D47]">
                              {update.title}
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-[#667085]">
                              {update.description}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#667085]">
                              <span>📍 {update.location}</span>

                              <span>By {update.reportedBy}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                  <div className="text-4xl">🔍</div>

                  <h3 className="mt-4 font-bold text-[#1F1D47]">
                    No updates found
                  </h3>

                  <p className="mt-1 text-sm text-[#667085]">
                    Try changing your search or filter.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* UPDATE DETAILS */}
          <div className="rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
            {selectedUpdate ? (
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8346F2]">
                  Update Details
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
                      typeStyles[selectedUpdate.type]?.bg
                    } ${typeStyles[selectedUpdate.type]?.text}`}
                  >
                    {selectedUpdate.icon}
                  </div>

                  <div>
                    <p className="text-xs text-[#667085]">
                      {selectedUpdate.type}
                    </p>

                    <h2 className="font-bold text-[#1F1D47]">
                      {selectedUpdate.title}
                    </h2>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#667085]">
                      Description
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#475467]">
                      {selectedUpdate.description}
                    </p>
                  </div>

                  <div className="border-t border-[#E4E7EC] pt-5">
                    <p className="text-xs font-semibold uppercase text-[#667085]">
                      Location
                    </p>

                    <p className="mt-2 text-sm font-medium text-[#344054]">
                      {selectedUpdate.location}
                    </p>
                  </div>

                  <div className="border-t border-[#E4E7EC] pt-5">
                    <p className="text-xs font-semibold uppercase text-[#667085]">
                      Related Report
                    </p>

                    <p className="mt-2 text-sm font-bold text-[#8346F2]">
                      {selectedUpdate.relatedReport}
                    </p>
                  </div>

                  <div className="border-t border-[#E4E7EC] pt-5">
                    <p className="text-xs font-semibold uppercase text-[#667085]">
                      Posted By
                    </p>

                    <p className="mt-2 text-sm font-medium text-[#344054]">
                      {selectedUpdate.reportedBy}
                    </p>
                  </div>

                  <div className="border-t border-[#E4E7EC] pt-5">
                    <p className="text-xs font-semibold uppercase text-[#667085]">
                      Date & Time
                    </p>

                    <p className="mt-2 text-sm font-medium text-[#344054]">
                      {selectedUpdate.date}
                    </p>

                    <p className="text-sm text-[#667085]">
                      {selectedUpdate.time}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[500px] flex-col items-center justify-center p-6 text-center">
                <div className="text-4xl">📢</div>

                <h3 className="mt-4 font-bold text-[#1F1D47]">
                  Select an update
                </h3>

                <p className="mt-2 text-sm text-[#667085]">
                  Select an activity from the timeline to view its complete
                  details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveUpdates;
