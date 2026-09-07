import { useMemo, useState } from "react";

const incidents = [
  {
    id: "RPT-2026-001",
    type: "Flooding",
    category: "Hazard-Related",
    location: "Purok 3, Camunatan",
    priority: "Critical",
    status: "Responding",
    peopleAffected: "Approximately 35 people",
    x: "42%",
    y: "32%",
  },
  {
    id: "RPT-2026-002",
    type: "Road Obstruction",
    category: "Incident-Related",
    location: "National Highway",
    priority: "High",
    status: "For Verification",
    peopleAffected: "Estimated 15–20 people",
    x: "68%",
    y: "24%",
  },
  {
    id: "RPT-2026-003",
    type: "Medical Assistance",
    category: "Assistance-Related",
    location: "Purok 1, Camunatan",
    priority: "High",
    status: "Assigned",
    peopleAffected: "1 person",
    x: "28%",
    y: "56%",
  },
  {
    id: "RPT-2026-004",
    type: "Rising Water Level",
    category: "Hazard-Related",
    location: "Purok 5, Riverside",
    priority: "Medium",
    status: "Monitoring",
    peopleAffected: "Estimated 8–10 people",
    x: "76%",
    y: "66%",
  },
  {
    id: "RPT-2026-006",
    type: "Evacuation Assistance",
    category: "Assistance-Related",
    location: "Purok 4, Camunatan",
    priority: "Critical",
    status: "Responding",
    peopleAffected: "Estimated 20 people",
    x: "55%",
    y: "72%",
  },
];

const priorityStyles = {
  Critical: "bg-[#FEF3F2] text-[#D92D20] border-[#FECDCA]",
  High: "bg-[#FFF4E5] text-[#B54708] border-[#FEDF89]",
  Medium: "bg-[#FFFAEB] text-[#A15C00] border-[#FDE68A]",
  Low: "bg-[#F2F4F7] text-[#667085] border-[#E4E7EC]",
};

const statusStyles = {
  Responding: "bg-[#EEF4FF] text-[#3538CD]",
  "For Verification": "bg-[#FFF4E5] text-[#B54708]",
  Assigned: "bg-[#F4F3FF] text-[#6941C6]",
  Monitoring: "bg-[#ECFDF3] text-[#027A48]",
};

function IncidentMap() {
  const [selectedIncidentId, setSelectedIncidentId] = useState(incidents[0].id);

  const [priorityFilter, setPriorityFilter] = useState("All");

  const filteredIncidents = useMemo(() => {
    if (priorityFilter === "All") {
      return incidents;
    }

    return incidents.filter((incident) => incident.priority === priorityFilter);
  }, [priorityFilter]);

  const selectedIncident =
    filteredIncidents.find((incident) => incident.id === selectedIncidentId) ??
    filteredIncidents[0] ??
    null;

  const criticalCount = incidents.filter(
    (incident) => incident.priority === "Critical",
  ).length;

  const highCount = incidents.filter(
    (incident) => incident.priority === "High",
  ).length;

  const mediumCount = incidents.filter(
    (incident) => incident.priority === "Medium",
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
            Incident Map
          </h1>

          <p className="mt-1 text-sm text-[#667085]">
            Monitor reported incidents, hazard-prone areas, and active response
            locations.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-[#ABEFC6] bg-[#ECFDF3] px-3 py-2 sm:flex">
          <span className="h-2 w-2 rounded-full bg-[#2ED47A]" />

          <span className="text-xs font-semibold text-[#027A48]">
            Live Incident Monitoring
          </span>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#E4E7EC] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Active Incidents
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#1F1D47]">
            {incidents.length}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Currently on the map</p>
        </div>

        <div className="rounded-2xl border border-[#FECDCA] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Critical
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#D92D20]">
            {criticalCount}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Immediate attention</p>
        </div>

        <div className="rounded-2xl border border-[#FEDF89] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            High
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#B54708]">
            {highCount}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Priority response</p>
        </div>

        <div className="rounded-2xl border border-[#FDE68A] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Medium
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#A15C00]">
            {mediumCount}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Routine monitoring</p>
        </div>
      </div>

      {/* MAP WORKSPACE */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.75fr)]">
        {/* MAP */}
        <section className="relative min-h-0 overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
          {/* MAP HEADER */}
          <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between gap-3">
            <div className="rounded-xl border border-[#E4E7EC] bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
              <p className="text-xs font-bold text-[#1F1D47]">
                Barangay Camunatan
              </p>

              <p className="mt-0.5 text-[10px] text-[#667085]">
                City of Ilagan
              </p>
            </div>

            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="h-9 rounded-xl border border-[#E4E7EC] bg-white/95 px-3 text-xs font-semibold text-[#344054] shadow-sm outline-none focus:border-[#8346F2]"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* MAP CANVAS */}
          <div className="relative h-full min-h-[420px] overflow-hidden bg-[#EEF2F6]">
            {/* MAP GRID */}
            <div className="absolute inset-0 opacity-70">
              <div className="absolute left-[12%] top-0 h-full w-px bg-white" />
              <div className="absolute left-[30%] top-0 h-full w-px bg-white" />
              <div className="absolute left-[50%] top-0 h-full w-px bg-white" />
              <div className="absolute left-[70%] top-0 h-full w-px bg-white" />
              <div className="absolute left-[88%] top-0 h-full w-px bg-white" />

              <div className="absolute left-0 top-[18%] h-px w-full bg-white" />
              <div className="absolute left-0 top-[38%] h-px w-full bg-white" />
              <div className="absolute left-0 top-[58%] h-px w-full bg-white" />
              <div className="absolute left-0 top-[78%] h-px w-full bg-white" />
            </div>

            {/* ROAD NETWORK */}
            <div className="absolute left-[-5%] top-[46%] h-5 w-[110%] rotate-[-12deg] bg-white shadow-sm" />

            <div className="absolute left-[18%] top-[-10%] h-[120%] w-4 rotate-[22deg] bg-white shadow-sm" />

            <div className="absolute left-[60%] top-[-10%] h-[120%] w-3 rotate-[-32deg] bg-white shadow-sm" />

            <div className="absolute left-[-5%] top-[72%] h-3 w-[110%] rotate-[8deg] bg-white shadow-sm" />

            {/* HAZARD-PRONE AREA */}
            <div className="absolute left-[30%] top-[48%] h-32 w-40 rounded-[45%] border-2 border-dashed border-[#38BDF8]/60 bg-[#BAE6FD]/30" />

            <div className="absolute left-[31%] top-[52%] rounded-lg bg-white/90 px-2 py-1 text-[9px] font-bold text-[#0369A1] shadow-sm">
              Flood-prone area
            </div>

            {/* INCIDENT MARKERS */}
            {filteredIncidents.map((incident) => {
              const isSelected = selectedIncident?.id === incident.id;

              const markerClass =
                incident.priority === "Critical"
                  ? "bg-[#EF4444]"
                  : incident.priority === "High"
                    ? "bg-[#F59E0B]"
                    : "bg-[#8346F2]";

              return (
                <button
                  key={incident.id}
                  type="button"
                  onClick={() => setSelectedIncidentId(incident.id)}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: incident.x,
                    top: incident.y,
                  }}
                  aria-label={`View ${incident.id}`}
                >
                  <span
                    className={`relative flex h-9 w-9 items-center justify-center rounded-full border-4 border-white text-xs font-extrabold text-white shadow-lg transition-transform ${
                      markerClass
                    } ${isSelected ? "scale-125" : "hover:scale-110"}`}
                  >
                    {incident.priority === "Critical"
                      ? "!"
                      : incident.priority === "High"
                        ? "!"
                        : "•"}
                  </span>

                  {isSelected && (
                    <span className="absolute left-1/2 top-1/2 -z-10 h-14 w-14 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-[#8346F2]/20" />
                  )}
                </button>
              );
            })}

            {/* MAP LABELS */}
            <span className="absolute left-[12%] top-[20%] text-[10px] font-semibold text-[#667085]/70">
              Purok 1
            </span>

            <span className="absolute left-[43%] top-[18%] text-[10px] font-semibold text-[#667085]/70">
              Purok 3
            </span>

            <span className="absolute left-[72%] top-[42%] text-[10px] font-semibold text-[#667085]/70">
              Purok 5
            </span>

            <span className="absolute left-[55%] top-[78%] text-[10px] font-semibold text-[#667085]/70">
              Purok 4
            </span>

            {/* LEGEND */}
            <div className="absolute bottom-4 left-4 z-20 rounded-xl border border-[#E4E7EC] bg-white/95 p-3 shadow-sm backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
                Map Legend
              </p>

              <div className="mt-2 flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                  <span className="text-[10px] font-medium text-[#667085]">
                    Critical
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-[10px] font-medium text-[#667085]">
                    High
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#8346F2]" />
                  <span className="text-[10px] font-medium text-[#667085]">
                    Medium / Other
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded border border-dashed border-[#38BDF8] bg-[#BAE6FD]/50" />
                  <span className="text-[10px] font-medium text-[#667085]">
                    Hazard Zone
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INCIDENT LIST */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
          <div className="shrink-0 border-b border-[#E4E7EC] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#1F1D47]">
                  Active Incidents
                </h2>

                <p className="mt-0.5 text-xs text-[#667085]">
                  Select an incident to inspect
                </p>
              </div>

              <span className="rounded-full bg-[#F4F3FF] px-2.5 py-1 text-[10px] font-bold text-[#6941C6]">
                {filteredIncidents.length}
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {filteredIncidents.map((incident) => {
              const isSelected = selectedIncident?.id === incident.id;

              return (
                <button
                  key={incident.id}
                  type="button"
                  onClick={() => setSelectedIncidentId(incident.id)}
                  className={`w-full border-b border-[#E4E7EC] p-4 text-left transition ${
                    isSelected ? "bg-[#F5F3FF]" : "hover:bg-[#FAF9FF]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#8346F2]">
                        {incident.id}
                      </p>

                      <p className="mt-1 truncate text-sm font-bold text-[#1F1D47]">
                        {incident.type}
                      </p>

                      <p className="mt-1 truncate text-xs text-[#667085]">
                        {incident.location}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${
                        priorityStyles[incident.priority]
                      }`}
                    >
                      {incident.priority}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                        statusStyles[incident.status]
                      }`}
                    >
                      {incident.status}
                    </span>

                    <span className="text-[10px] text-[#98A2B3]">
                      {incident.peopleAffected}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* SELECTED INCIDENT */}
          {selectedIncident && (
            <div className="shrink-0 border-t border-[#E4E7EC] bg-[#F8FAFC] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
                Selected Incident
              </p>

              <p className="mt-1 text-sm font-extrabold text-[#1F1D47]">
                {selectedIncident.type}
              </p>

              <p className="mt-0.5 text-xs text-[#667085]">
                {selectedIncident.location}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-[#E4E7EC] bg-white p-2.5">
                  <p className="text-[9px] font-bold uppercase text-[#98A2B3]">
                    Priority
                  </p>

                  <p className="mt-1 text-xs font-bold text-[#344054]">
                    {selectedIncident.priority}
                  </p>
                </div>

                <div className="rounded-lg border border-[#E4E7EC] bg-white p-2.5">
                  <p className="text-[9px] font-bold uppercase text-[#98A2B3]">
                    Status
                  </p>

                  <p className="mt-1 text-xs font-bold text-[#344054]">
                    {selectedIncident.status}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default IncidentMap;
