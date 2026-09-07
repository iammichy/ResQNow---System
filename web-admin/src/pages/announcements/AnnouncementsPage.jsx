import { useState } from "react";

const announcements = [
  {
    id: "ANN-2026-001",
    title: "Flood Warning Advisory",
    category: "Emergency Advisory",
    status: "Published",
    audience: "All Residents",
    published: "Sep 4, 2026 • 08:30 AM",
    content:
      "Residents are advised to remain alert as continuous rainfall may cause flooding in low-lying areas of Barangay Camunatan. Please monitor official barangay announcements and prepare for possible evacuation if conditions worsen.",
  },
  {
    id: "ANN-2026-002",
    title: "Emergency Hotline Numbers",
    category: "Public Information",
    status: "Published",
    audience: "All Residents",
    published: "Sep 3, 2026 • 04:15 PM",
    content:
      "Residents may contact the barangay emergency hotline for urgent assistance, incident reporting, and other emergency concerns.",
  },
  {
    id: "ANN-2026-003",
    title: "Temporary Road Closure",
    category: "Traffic Advisory",
    status: "Published",
    audience: "Affected Residents",
    published: "Sep 3, 2026 • 01:00 PM",
    content:
      "A portion of Camunatan Main Road will be temporarily closed due to a reported obstruction. Residents are advised to use alternate routes until the area is cleared.",
  },
  {
    id: "ANN-2026-004",
    title: "Community Emergency Preparedness",
    category: "Public Information",
    status: "Scheduled",
    audience: "All Residents",
    published: "Sep 6, 2026 • 09:00 AM",
    content:
      "Residents are encouraged to review their household emergency plans, prepare essential supplies, and identify the nearest evacuation area.",
  },
  {
    id: "ANN-2026-005",
    title: "Barangay Cleanup Drive",
    category: "Community",
    status: "Draft",
    audience: "All Residents",
    published: "Not scheduled",
    content:
      "Announcement regarding the upcoming barangay cleanup drive and community participation guidelines.",
  },
];

const statusStyles = {
  Published: "bg-[#ECFDF3] text-[#027A48]",
  Scheduled: "bg-[#F4F3FF] text-[#6941C6]",
  Draft: "bg-[#F2F4F7] text-[#667085]",
};

function AnnouncementsPage() {
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(
    announcements[0].id,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredAnnouncements = announcements.filter((announcement) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      search === "" ||
      announcement.title.toLowerCase().includes(search) ||
      announcement.category.toLowerCase().includes(search) ||
      announcement.audience.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || announcement.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedAnnouncement =
    filteredAnnouncements.find(
      (announcement) => announcement.id === selectedAnnouncementId,
    ) ??
    filteredAnnouncements[0] ??
    null;

  const publishedCount = announcements.filter(
    (announcement) => announcement.status === "Published",
  ).length;

  const scheduledCount = announcements.filter(
    (announcement) => announcement.status === "Scheduled",
  ).length;

  const draftCount = announcements.filter(
    (announcement) => announcement.status === "Draft",
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
            Announcements
          </h1>

          <p className="mt-1 text-sm text-[#667085]">
            Create and manage emergency advisories and barangay announcements.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-[#E4E7EC] bg-white px-3 py-2 shadow-sm sm:flex">
          <span className="h-2 w-2 rounded-full bg-[#2ED47A]" />

          <span className="text-xs font-semibold text-[#344054]">
            Communication Center
          </span>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#E4E7EC] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Total Announcements
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#1F1D47]">
            {announcements.length}
          </p>

          <p className="mt-1 text-xs text-[#667085]">
            All communication records
          </p>
        </div>

        <div className="rounded-2xl border border-[#ABEFC6] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Published
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#027A48]">
            {publishedCount}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Currently visible</p>
        </div>

        <div className="rounded-2xl border border-[#DDD6FE] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Scheduled
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#6941C6]">
            {scheduledCount}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Upcoming announcements</p>
        </div>

        <div className="rounded-2xl border border-[#E4E7EC] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
            Drafts
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#1F1D47]">
            {draftCount}
          </p>

          <p className="mt-1 text-xs text-[#667085]">Not yet published</p>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        {/* ANNOUNCEMENT LIST */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
          {/* TOOLBAR */}
          <div className="flex shrink-0 flex-col gap-3 border-b border-[#E4E7EC] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] px-3 transition focus-within:border-[#8346F2] focus-within:bg-white">
              <span className="text-sm text-[#667085]">⌕</span>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search announcements..."
                className="min-w-0 flex-1 bg-transparent text-xs text-[#1F1D47] outline-none placeholder:text-[#98A2B3]"
                aria-label="Search announcements"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-xl border border-[#E4E7EC] bg-white px-3 text-xs font-semibold text-[#344054] outline-none focus:border-[#8346F2]"
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* LIST */}
          <div className="min-h-0 flex-1 overflow-auto">
            {filteredAnnouncements.map((announcement) => {
              const isSelected = selectedAnnouncement?.id === announcement.id;

              return (
                <button
                  key={announcement.id}
                  type="button"
                  onClick={() => setSelectedAnnouncementId(announcement.id)}
                  className={`flex w-full items-start gap-3 border-b border-[#E4E7EC] px-4 py-4 text-left transition ${
                    isSelected ? "bg-[#F5F3FF]" : "bg-white hover:bg-[#FAF9FF]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                      isSelected
                        ? "bg-[#8346F2] text-white"
                        : "bg-[#F4F3FF] text-[#6941C6]"
                    }`}
                  >
                    !
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#1F1D47]">
                          {announcement.title}
                        </p>

                        <p className="mt-1 text-[10px] text-[#667085]">
                          {announcement.category} • {announcement.audience}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                          statusStyles[announcement.status]
                        }`}
                      >
                        {announcement.status}
                      </span>
                    </div>

                    <p className="mt-2 text-[10px] text-[#98A2B3]">
                      {announcement.published}
                    </p>
                  </div>

                  <span className="pt-1 text-sm text-[#98A2B3]">›</span>
                </button>
              );
            })}

            {filteredAnnouncements.length === 0 && (
              <div className="flex h-full min-h-[260px] items-center justify-center p-6 text-center">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F3FF] text-lg font-bold text-[#8346F2]">
                    !
                  </div>

                  <p className="mt-3 text-sm font-bold text-[#1F1D47]">
                    No announcements found
                  </p>

                  <p className="mt-1 text-xs text-[#667085]">
                    Try adjusting your search or status filter.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 items-center justify-between border-t border-[#E4E7EC] px-4 py-3">
            <p className="text-xs text-[#667085]">
              Showing{" "}
              <span className="font-semibold text-[#344054]">
                {filteredAnnouncements.length}
              </span>{" "}
              of {announcements.length} announcements
            </p>

            <button
              type="button"
              className="rounded-lg bg-[#8346F2] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#7335E6]"
            >
              + New Announcement
            </button>
          </div>
        </section>

        {/* DETAILS */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
          {selectedAnnouncement ? (
            <>
              <div className="shrink-0 border-b border-[#E4E7EC] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8346F2]">
                      Announcement Details
                    </p>

                    <h2 className="mt-1 text-lg font-extrabold leading-6 text-[#1F1D47]">
                      {selectedAnnouncement.title}
                    </h2>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      statusStyles[selectedAnnouncement.status]
                    }`}
                  >
                    {selectedAnnouncement.status}
                  </span>
                </div>

                <p className="mt-2 text-xs text-[#667085]">
                  {selectedAnnouncement.id}
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-auto p-5">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] p-3">
                      <p className="text-[9px] font-bold uppercase text-[#98A2B3]">
                        Category
                      </p>

                      <p className="mt-1 text-xs font-bold text-[#344054]">
                        {selectedAnnouncement.category}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] p-3">
                      <p className="text-[9px] font-bold uppercase text-[#98A2B3]">
                        Audience
                      </p>

                      <p className="mt-1 text-xs font-bold text-[#344054]">
                        {selectedAnnouncement.audience}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8346F2]">
                      Publication
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#344054]">
                      {selectedAnnouncement.published}
                    </p>
                  </div>

                  <div className="border-t border-[#E4E7EC] pt-5">
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8346F2]">
                      Announcement Content
                    </p>

                    <div className="mt-3 rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] p-4">
                      <p className="text-sm leading-6 text-[#475467]">
                        {selectedAnnouncement.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 gap-2 border-t border-[#E4E7EC] p-4">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-[#8346F2] bg-white px-4 py-2.5 text-xs font-bold text-[#8346F2] transition hover:bg-[#F5F3FF]"
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="flex-1 rounded-xl bg-[#8346F2] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#7335E6]"
                >
                  Manage
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center">
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F3FF] text-lg font-bold text-[#8346F2]">
                  !
                </div>

                <p className="mt-3 text-sm font-bold text-[#1F1D47]">
                  No announcement selected
                </p>

                <p className="mt-1 text-xs text-[#667085]">
                  Select an announcement from the list.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AnnouncementsPage;
