import { useCallback, useMemo, useState } from "react";

const initialAnnouncements = [
  {
    announcement_id: "ANN-001",
    title: "Heavy Rainfall Advisory",
    message:
      "Residents are advised to remain alert and prepare for possible flooding.",
    category: "Weather Advisory",
    priority: "High",
    start_date: "2026-09-01T18:00",
    end_date: "2026-09-02T08:00",
    status: "Published",
  },
  {
    announcement_id: "ANN-002",
    title: "Community Safety Reminder",
    message:
      "Please keep emergency contact numbers accessible and follow barangay safety instructions.",
    category: "Community Announcement",
    priority: "Normal",
    start_date: "2026-09-01T08:00",
    end_date: "2026-09-07T18:00",
    status: "Published",
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

const priorities = ["Critical", "High", "Normal", "Low"];

const statuses = ["Draft", "Published", "Archived", "Expired"];

const getPriorityRank = (priority) => {
  const ranks = {
    Critical: 1,
    High: 2,
    Normal: 3,
    Low: 4,
  };

  return ranks[priority] || 99;
};

const formatDate = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function Announcements({ admin, onAddLog }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");

  const [filterStatus, setFilterStatus] = useState("All");

  const [form, setForm] = useState({
    title: "",
    message: "",
    category: "Community Announcement",
    priority: "Normal",
    start_date: "",
    end_date: "",
    status: "Draft",
  });

  const resetForm = () => {
    setForm({
      title: "",
      message: "",
      category: "Community Announcement",
      priority: "Normal",
      start_date: "",
      end_date: "",
      status: "Draft",
    });
  };

  const sortedAnnouncements = useMemo(() => {
    return [...announcements]
      .filter((announcement) => {
        const matchesSearch =
          announcement.title.toLowerCase().includes(search.toLowerCase()) ||
          announcement.message.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
          filterStatus === "All" || announcement.status === filterStatus;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const priorityDifference =
          getPriorityRank(a.priority) - getPriorityRank(b.priority);

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        return new Date(b.start_date) - new Date(a.start_date);
      });
  }, [announcements, search, filterStatus]);

  const publishedCount = announcements.filter(
    (item) => item.status === "Published",
  ).length;

  const criticalCount = announcements.filter(
    (item) => item.priority === "Critical",
  ).length;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.message.trim() ||
      !form.start_date ||
      !form.end_date
    ) {
      alert("Title, message, start date, and end date are required.");
      return;
    }

    if (new Date(form.end_date) <= new Date(form.start_date)) {
      alert("End date must be later than the start date.");
      return;
    }

    const newAnnouncement = {
      announcement_id: `ANN-${String(announcements.length + 1).padStart(
        3,
        "0",
      )}`,
      title: form.title.trim(),
      message: form.message.trim(),
      category: form.category,
      priority: form.priority,
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status,
    };

    setAnnouncements((current) => [newAnnouncement, ...current]);

    onAddLog?.({
      log_id: `LOG-${Date.now()}`,
      report_id: null,
      action: "Announcement Created",
      details: `${newAnnouncement.announcement_id} "${newAnnouncement.title}" was created.`,
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

    resetForm();
    setShowForm(false);
  };

  const handleArchive = useCallback(
    (announcement) => {
      const updated = {
        ...announcement,
        status: "Archived",
      };

      setAnnouncements((current) =>
        current.map((item) =>
          item.announcement_id === announcement.announcement_id
            ? updated
            : item,
        ),
      );

      const logId = `LOG-${Date.now()}`;
      const timestamp = new Date().toLocaleString("en-PH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      onAddLog?.({
        log_id: logId,
        report_id: null,
        action: "Announcement Archived",
        details: `${announcement.announcement_id} "${announcement.title}" was archived.`,
        performed_by: admin?.full_name || "Barangay Admin",
        timestamp,
      });
    },
    [admin?.full_name, onAddLog],
  );

  const getPriorityClasses = (priority) => {
    if (priority === "Critical") {
      return "bg-red-100 text-red-700 ring-red-200";
    }

    if (priority === "High") {
      return "bg-orange-100 text-orange-700 ring-orange-200";
    }

    if (priority === "Normal") {
      return "bg-blue-100 text-blue-700 ring-blue-200";
    }

    return "bg-gray-100 text-gray-700 ring-gray-200";
  };

  const getStatusClasses = (status) => {
    if (status === "Published") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Draft") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (status === "Archived") {
      return "bg-gray-100 text-gray-600";
    }

    return "bg-purple-100 text-purple-700";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">
                Announcements
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create and manage barangay advisories, alerts, and public
                announcements.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              + Create Announcement
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">
                Total Announcements
              </p>

              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            </div>

            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {announcements.length}
            </p>
          </div>

          <div className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-green-700">Published</p>

              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            </div>

            <p className="text-3xl font-bold tracking-tight text-green-600">
              {publishedCount}
            </p>
          </div>

          <div className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-red-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-red-700">Critical</p>

              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            </div>

            <p className="text-3xl font-bold tracking-tight text-red-600">
              {criticalCount}
            </p>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="text-lg font-bold text-slate-900">
                Create Announcement
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Provide the announcement details before publishing.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
              <div>
                <label
                  htmlFor="announcementTitle"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Title
                </label>

                <input
                  id="announcementTitle"
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter announcement title"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="announcementMessage"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Message
                </label>

                <textarea
                  id="announcementMessage"
                  rows="5"
                  value={form.message}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      message: e.target.value,
                    })
                  }
                  placeholder="Enter the announcement message"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="announcementCategory"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Category
                  </label>

                  <select
                    id="announcementCategory"
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="announcementPriority"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Priority
                  </label>

                  <select
                    id="announcementPriority"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="announcementStatus"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Status
                  </label>

                  <select
                    id="announcementStatus"
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="announcementStart"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Start Date
                  </label>

                  <input
                    id="announcementStart"
                    type="datetime-local"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        start_date: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="announcementEnd"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    End Date / Expiration
                  </label>

                  <input
                    id="announcementEnd"
                    type="datetime-local"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        end_date: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Save Announcement
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Filters */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div>
              <label
                htmlFor="announcementSearch"
                className="block text-sm font-semibold text-slate-700"
              >
                Search
              </label>

              <input
                id="announcementSearch"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search announcements..."
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="announcementFilter"
                className="block text-sm font-semibold text-slate-700"
              >
                Status
              </label>

              <select
                id="announcementFilter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="All">All Statuses</option>

                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Announcement List */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-lg font-bold text-slate-900">
              Announcement List
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Critical and high-priority announcements are displayed first.
            </p>
          </div>

          {sortedAnnouncements.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-500">
                No announcements found.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {sortedAnnouncements.map((announcement) => (
                <article
                  key={announcement.announcement_id}
                  className="px-6 py-6 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {announcement.announcement_id}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getPriorityClasses(
                            announcement.priority,
                          )}`}
                        >
                          {announcement.priority}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                            announcement.status,
                          )}`}
                        >
                          {announcement.status}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {announcement.category}
                        </span>
                      </div>

                      <h4 className="mt-3 text-lg font-bold text-slate-900">
                        {announcement.title}
                      </h4>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        {announcement.message}
                      </p>

                      <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                        <p>
                          <span className="font-semibold text-slate-700">
                            Start:
                          </span>{" "}
                          {formatDate(announcement.start_date)}
                        </p>

                        <p>
                          <span className="font-semibold text-slate-700">
                            Expires:
                          </span>{" "}
                          {formatDate(announcement.end_date)}
                        </p>
                      </div>
                    </div>

                    {announcement.status !== "Archived" && (
                      <button
                        type="button"
                        onClick={() => handleArchive(announcement)}
                        className="shrink-0 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
