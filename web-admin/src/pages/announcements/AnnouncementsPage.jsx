import { useMemo, useState } from "react";

const initialAnnouncements = [
  {
    id: "ANN-2026-001",
    title: "Flood Warning Advisory",
    message:
      "Residents living near low-lying areas are advised to monitor water levels and prepare for possible evacuation.",
    category: "Weather Advisory",
    priority: "Critical",
    startDate: "2026-09-05",
    endDate: "2026-09-07",
    status: "Published",
    createdAt: "Sep 5, 2026",
    updatedAt: "Sep 5, 2026",
  },
  {
    id: "ANN-2026-002",
    title: "Barangay Clean-Up Drive",
    message:
      "All residents are encouraged to participate in the community clean-up activity this weekend.",
    category: "Community Announcement",
    priority: "Low",
    startDate: "2026-09-06",
    endDate: "2026-09-08",
    status: "Published",
    createdAt: "Sep 4, 2026",
    updatedAt: "Sep 4, 2026",
  },
  {
    id: "ANN-2026-003",
    title: "Health and Safety Reminder",
    message:
      "Residents are reminded to maintain proper sanitation and immediately report possible health concerns.",
    category: "Health Advisory",
    priority: "Medium",
    startDate: "2026-09-06",
    endDate: "",
    status: "Draft",
    createdAt: "Sep 4, 2026",
    updatedAt: "Sep 4, 2026",
  },
];

const categories = [
  "Weather Advisory",
  "Emergency Alert",
  "Evacuation Notice",
  "Community Announcement",
  "Health Advisory",
  "Public Safety Advisory",
];

const priorities = ["Critical", "High", "Medium", "Low"];

const statuses = ["Draft", "Published", "Archived", "Expired"];

const emptyForm = {
  title: "",
  message: "",
  category: "Community Announcement",
  priority: "Medium",
  startDate: "",
  endDate: "",
  status: "Draft",
};

const statusStyles = {
  Published: "bg-[#ECFDF3] text-[#027A48]",
  Draft: "bg-[#F2F4F7] text-[#667085]",
  Archived: "bg-[#FFF4E5] text-[#B54708]",
  Expired: "bg-[#FEF3F2] text-[#D92D20]",
};

const priorityStyles = {
  Critical: "bg-[#FEF3F2] text-[#D92D20] border-[#FECDCA]",
  High: "bg-[#FFF4E5] text-[#B54708] border-[#FEDF89]",
  Medium: "bg-[#FFFAEB] text-[#A15C00] border-[#FDE68A]",
  Low: "bg-[#F2F4F7] text-[#667085] border-[#E4E7EC]",
};

function AnnouncementsPage({ onAddAuditLog }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(
    initialAnnouncements[0].id,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);

  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  /* =========================
     SORT ANNOUNCEMENTS
  ========================= */

  const sortedAnnouncements = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    const priorityOrder = {
      Critical: 1,
      High: 2,
      Medium: 3,
      Low: 4,
    };

    const getEffectiveStatus = (announcement) => {
      // Automatically consider Published announcements expired
      // when their expiration date has already passed.
      if (
        announcement.status === "Published" &&
        announcement.endDate &&
        announcement.endDate < today
      ) {
        return "Expired";
      }

      return announcement.status;
    };

    const statusOrder = {
      Published: 1,
      Draft: 2,
      Expired: 3,
      Archived: 4,
    };

    return [...announcements]
      .map((announcement) => ({
        ...announcement,
        effectiveStatus: getEffectiveStatus(announcement),
      }))
      .sort((a, b) => {
        // First: Active status
        const statusDifference =
          statusOrder[a.effectiveStatus] - statusOrder[b.effectiveStatus];

        if (statusDifference !== 0) {
          return statusDifference;
        }

        // Second: Priority
        const priorityDifference =
          priorityOrder[a.priority] - priorityOrder[b.priority];

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        // Third: Newest updated announcement first
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
  }, [announcements]);

  /* =========================
     FILTER ANNOUNCEMENTS
  ========================= */

  const filteredAnnouncements = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return sortedAnnouncements.filter((announcement) => {
      const matchesSearch =
        search === "" ||
        announcement.title.toLowerCase().includes(search) ||
        announcement.category.toLowerCase().includes(search) ||
        announcement.message.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        (announcement.effectiveStatus || announcement.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sortedAnnouncements, searchTerm, statusFilter]);

  /* =========================
     SELECTED ANNOUNCEMENT
  ========================= */

  const selectedAnnouncement =
    announcements.find(
      (announcement) => announcement.id === selectedAnnouncementId,
    ) || null;

  /* =========================
     COUNTS
  ========================= */

  const publishedCount = announcements.filter(
    (announcement) => announcement.status === "Published",
  ).length;

  const draftCount = announcements.filter(
    (announcement) => announcement.status === "Draft",
  ).length;

  const criticalCount = announcements.filter(
    (announcement) => announcement.priority === "Critical",
  ).length;

  /* =========================
     NEW ANNOUNCEMENT
  ========================= */

  const handleNewAnnouncement = () => {
    setEditingAnnouncement(null);

    setFormData({
      ...emptyForm,
      startDate: new Date().toISOString().split("T")[0],
    });

    setIsFormOpen(true);
  };

  /* =========================
     EDIT ANNOUNCEMENT
  ========================= */

  const handleEditAnnouncement = () => {
    if (!selectedAnnouncement) return;

    setEditingAnnouncement(selectedAnnouncement);

    setFormData({
      title: selectedAnnouncement.title,
      message: selectedAnnouncement.message,
      category: selectedAnnouncement.category,
      priority: selectedAnnouncement.priority,
      startDate: selectedAnnouncement.startDate,
      endDate: selectedAnnouncement.endDate || "",
      status: selectedAnnouncement.status,
    });

    setIsFormOpen(true);
  };

  /* =========================
     FORM CHANGE
  ========================= */

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* =========================
     SAVE ANNOUNCEMENT
  ========================= */

  const handleSaveAnnouncement = (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      alert("Please complete the announcement title and message.");
      return;
    }

    const now = new Date();

    const formattedDate = new Intl.DateTimeFormat("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(now);

    /* =========================
     EDIT ANNOUNCEMENT
  ========================= */

    if (editingAnnouncement) {
      const oldAnnouncement = editingAnnouncement;

      const updatedAnnouncement = {
        ...oldAnnouncement,
        ...formData,
        updatedAt: formattedDate,
      };

      setAnnouncements((current) =>
        current.map((announcement) =>
          announcement.id === editingAnnouncement.id
            ? updatedAnnouncement
            : announcement,
        ),
      );

      setSelectedAnnouncementId(editingAnnouncement.id);

      /* =========================
       AUDIT EVERY FIELD CHANGE
    ========================= */

      const fieldsToTrack = [
        {
          key: "title",
          label: "Announcement Title",
        },
        {
          key: "message",
          label: "Announcement Message",
        },
        {
          key: "category",
          label: "Category",
        },
        {
          key: "priority",
          label: "Priority",
        },
        {
          key: "startDate",
          label: "Start Date",
        },
        {
          key: "endDate",
          label: "End Date / Expiration",
        },
        {
          key: "status",
          label: "Announcement Status",
        },
      ];

      fieldsToTrack.forEach(({ key, label }) => {
        const oldValue = oldAnnouncement[key] || "—";
        const newValue = formData[key] || "—";

        if (String(oldValue) !== String(newValue)) {
          let action = "Announcement Updated";

          if (key === "status") {
            if (newValue === "Published") {
              action = "Announcement Published";
            } else if (newValue === "Archived") {
              action = "Announcement Archived";
            } else if (newValue === "Draft") {
              action = "Announcement Saved as Draft";
            } else if (newValue === "Expired") {
              action = "Announcement Expired";
            }
          }

          onAddAuditLog?.({
            action,
            category: "System Action",
            target: editingAnnouncement.id,
            field: label,
            oldValue,
            newValue,
            remarks: `${label} was changed from "${oldValue}" to "${newValue}".`,
          });
        }
      });
    } else {
      /* =========================
       CREATE ANNOUNCEMENT
    ========================= */

      const newId = `ANN-${Date.now()}`;

      const newAnnouncement = {
        id: newId,
        ...formData,
        createdAt: formattedDate,
        updatedAt: formattedDate,
      };

      setAnnouncements((current) => [newAnnouncement, ...current]);

      setSelectedAnnouncementId(newId);

      onAddAuditLog?.({
        action: "Announcement Created",
        category: "System Action",
        target: newId,
        field: "Announcement",
        oldValue: "—",
        newValue: formData.title,
        remarks: `New ${formData.category} announcement "${formData.title}" was created.`,
      });

      if (formData.status === "Published") {
        onAddAuditLog?.({
          action: "Announcement Published",
          category: "System Action",
          target: newId,
          field: "Announcement Status",
          oldValue: "Draft",
          newValue: "Published",
          remarks: `Announcement "${formData.title}" was published.`,
        });
      }
    }

    setIsFormOpen(false);
    setEditingAnnouncement(null);
    setFormData(emptyForm);
  };

  /* =========================
     MANAGE STATUS
  ========================= */

  const handleStatusChange = (newStatus) => {
    if (!selectedAnnouncement) return;

    const oldStatus = selectedAnnouncement.status;

    if (oldStatus === newStatus) {
      setIsManageOpen(false);
      return;
    }

    const updatedAnnouncement = {
      ...selectedAnnouncement,
      status: newStatus,
      updatedAt: new Intl.DateTimeFormat("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date()),
    };

    setAnnouncements((current) =>
      current.map((announcement) =>
        announcement.id === selectedAnnouncement.id
          ? updatedAnnouncement
          : announcement,
      ),
    );

    let action = "Announcement Status Updated";

    if (newStatus === "Published") {
      action = "Announcement Published";
    }

    if (newStatus === "Archived") {
      action = "Announcement Archived";
    }

    if (newStatus === "Expired") {
      action = "Announcement Expired";
    }

    if (newStatus === "Draft") {
      action = "Announcement Saved as Draft";
    }

    onAddAuditLog?.({
      action,
      category: "System Action",
      target: selectedAnnouncement.id,
      field: "Announcement Status",
      oldValue: oldStatus,
      newValue: newStatus,
      remarks: `Announcement "${selectedAnnouncement.title}" status changed from ${oldStatus} to ${newStatus}.`,
    });

    setIsManageOpen(false);
  };

  return (
    <>
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

          <button
            type="button"
            onClick={handleNewAnnouncement}
            className="rounded-xl bg-[#8346F2] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#7335E6]"
          >
            + New Announcement
          </button>
        </div>

        {/* SUMMARY */}

        <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
          <SummaryCard
            label="Total Announcements"
            value={announcements.length}
            description="All announcement records"
          />

          <SummaryCard
            label="Published"
            value={publishedCount}
            description="Visible to residents"
          />

          <SummaryCard
            label="Drafts"
            value={draftCount}
            description="Pending publication"
          />

          <SummaryCard
            label="Critical Alerts"
            value={criticalCount}
            description="High-priority communication"
          />
        </div>

        {/* MAIN CONTENT */}

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          {/* LIST */}

          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
            {/* FILTERS */}

            <div className="flex shrink-0 flex-col gap-3 border-b border-[#E4E7EC] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1F1D47]">
                  Announcement List
                </h2>

                <p className="mt-0.5 text-xs text-[#667085]">
                  Critical announcements appear first.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search announcements..."
                  className="h-9 w-full rounded-lg border border-[#E4E7EC] bg-[#FCFCFD] px-3 text-xs outline-none focus:border-[#8346F2]"
                />

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-9 rounded-lg border border-[#E4E7EC] bg-[#FCFCFD] px-3 text-xs font-medium text-[#475467] outline-none"
                >
                  <option value="All">All</option>

                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ANNOUNCEMENT LIST */}

            <div className="min-h-0 flex-1 overflow-auto p-3">
              <div className="space-y-2">
                {filteredAnnouncements.map((announcement) => {
                  const isSelected = selectedAnnouncementId === announcement.id;

                  return (
                    <button
                      key={announcement.id}
                      type="button"
                      onClick={() => setSelectedAnnouncementId(announcement.id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-[#8346F2] bg-[#F7F3FF]"
                          : "border-[#E4E7EC] bg-white hover:bg-[#FCFCFD]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-1 text-[10px] font-bold ${
                                priorityStyles[announcement.priority]
                              }`}
                            >
                              {announcement.priority}
                            </span>

                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                                statusStyles[
                                  announcement.effectiveStatus ||
                                    announcement.status
                                ]
                              }`}
                            >
                              {announcement.effectiveStatus ||
                                announcement.status}
                            </span>
                          </div>

                          <h3 className="mt-2 text-sm font-extrabold text-[#1F1D47]">
                            {announcement.title}
                          </h3>

                          <p className="mt-1 text-xs text-[#667085]">
                            {announcement.category}
                          </p>

                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#475467]">
                            {announcement.message}
                          </p>
                        </div>

                        <span className="text-[10px] font-semibold text-[#98A2B3]">
                          {announcement.id}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {filteredAnnouncements.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-sm font-bold text-[#344054]">
                      No announcements found
                    </p>

                    <p className="mt-1 text-xs text-[#98A2B3]">
                      Try changing your search or filter.
                    </p>
                  </div>
                )}
              </div>
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

                  <p className="mt-2 text-xs text-[#98A2B3]">
                    {selectedAnnouncement.id}
                  </p>
                </div>

                <div className="min-h-0 flex-1 overflow-auto p-5">
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <InfoBox
                        label="Category"
                        value={selectedAnnouncement.category}
                      />

                      <InfoBox
                        label="Priority"
                        value={selectedAnnouncement.priority}
                      />

                      <InfoBox
                        label="Start Date"
                        value={selectedAnnouncement.startDate || "—"}
                      />

                      <InfoBox
                        label="Expiration"
                        value={selectedAnnouncement.endDate || "No expiration"}
                      />
                    </div>

                    <div className="border-t border-[#E4E7EC] pt-5">
                      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8346F2]">
                        Announcement Message
                      </p>

                      <div className="mt-3 rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] p-4">
                        <p className="text-sm leading-6 text-[#475467]">
                          {selectedAnnouncement.message}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-[#98A2B3]">
                        Last updated: {selectedAnnouncement.updatedAt}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2 border-t border-[#E4E7EC] p-4">
                  <button
                    type="button"
                    onClick={handleEditAnnouncement}
                    className="flex-1 rounded-xl border border-[#8346F2] bg-white px-4 py-2.5 text-xs font-bold text-[#8346F2] transition hover:bg-[#F5F3FF]"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsManageOpen(true)}
                    className="flex-1 rounded-xl bg-[#8346F2] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#7335E6]"
                  >
                    Manage
                  </button>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center">
                <div>
                  <p className="text-sm font-bold text-[#1F1D47]">
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

      {/* =========================
          CREATE / EDIT MODAL
      ========================= */}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] p-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8346F2]">
                  Announcement Management
                </p>

                <h2 className="mt-1 text-lg font-extrabold text-[#1F1D47]">
                  {editingAnnouncement
                    ? "Edit Announcement"
                    : "New Announcement"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-xl font-bold text-[#667085]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="p-5">
              <div className="space-y-4">
                <FormField
                  label="Announcement Title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Enter announcement title"
                />

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#344054]">
                    Message
                  </label>

                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    rows="5"
                    placeholder="Enter announcement message..."
                    className="w-full rounded-xl border border-[#E4E7EC] bg-[#FCFCFD] px-3 py-3 text-sm outline-none focus:border-[#8346F2]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    options={categories}
                  />

                  <SelectField
                    label="Priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    options={priorities}
                  />

                  <FormField
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleFormChange}
                  />

                  <FormField
                    label="End Date / Expiration"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleFormChange}
                  />

                  <div className="sm:col-span-2">
                    <SelectField
                      label="Status"
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      options={statuses}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-[#E4E7EC] pt-5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-[#E4E7EC] px-4 py-2.5 text-xs font-bold text-[#475467]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#8346F2] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#7335E6]"
                >
                  {editingAnnouncement ? "Save Changes" : "Create Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          MANAGE MODAL
      ========================= */}

      {isManageOpen && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-[#E4E7EC] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8346F2]">
                Manage Announcement
              </p>

              <h2 className="mt-1 text-lg font-extrabold text-[#1F1D47]">
                Change Announcement Status
              </h2>

              <p className="mt-2 text-xs leading-5 text-[#667085]">
                Select the appropriate status for this announcement.
              </p>
            </div>

            <div className="space-y-2 p-5">
              {statuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(status)}
                  className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                    selectedAnnouncement.status === status
                      ? "border-[#8346F2] bg-[#F7F3FF]"
                      : "border-[#E4E7EC] hover:bg-[#FCFCFD]"
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-[#1F1D47]">{status}</p>

                    <p className="mt-1 text-[11px] text-[#667085]">
                      {getStatusDescription(status)}
                    </p>
                  </div>

                  {selectedAnnouncement.status === status && (
                    <span className="text-sm font-bold text-[#8346F2]">✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-[#E4E7EC] p-4">
              <button
                type="button"
                onClick={() => setIsManageOpen(false)}
                className="w-full rounded-xl border border-[#E4E7EC] py-2.5 text-xs font-bold text-[#475467]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================
   REUSABLE COMPONENTS
========================= */

function SummaryCard({ label, value, description }) {
  return (
    <div className="rounded-2xl border border-[#E4E7EC] bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-extrabold text-[#1F1D47]">{value}</p>

      <p className="mt-1 text-[10px] text-[#667085]">{description}</p>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] p-3">
      <p className="text-[9px] font-bold uppercase text-[#98A2B3]">{label}</p>

      <p className="mt-1 text-xs font-bold text-[#344054]">{value}</p>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-[#344054]">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-[#E4E7EC] bg-[#FCFCFD] px-3 text-sm outline-none focus:border-[#8346F2]"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-[#344054]">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-10 w-full rounded-xl border border-[#E4E7EC] bg-[#FCFCFD] px-3 text-sm outline-none focus:border-[#8346F2]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function getStatusDescription(status) {
  const descriptions = {
    Draft: "Saved internally and not yet visible to residents.",
    Published: "Currently active and visible to residents.",
    Archived: "Stored for record purposes and no longer active.",
    Expired: "Automatically or manually marked as no longer valid.",
  };

  return descriptions[status];
}

export default AnnouncementsPage;
