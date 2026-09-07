import { useEffect, useRef, useState } from "react";

const notifications = [
  {
    id: 1,
    type: "critical",
    title: "Evacuation alert issued",
    message: "Building A and surrounding areas require attention.",
    time: "Just now",
  },
  {
    id: 2,
    type: "warning",
    title: "New report pending verification",
    message: "A hazard report is waiting for personnel review.",
    time: "10 min ago",
  },
  {
    id: 3,
    type: "info",
    title: "Medical support assigned",
    message: "Response personnel have been assigned to the incident.",
    time: "25 min ago",
  },
];

function Topbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    console.log("Searching for:", query);

    // Frontend placeholder.
    // This will later connect to Supabase search.
  };

  return (
    <header className="relative z-40 shrink-0 border-b border-[#E4E7EC] bg-white">
      {/* GRADIENT BRAND ACCENT */}
      <div className="h-1 w-full bg-gradient-to-r from-[#8346F2] via-[#4F7DF3] to-[#16BFA8]" />

      <div className="flex h-[71px] items-center justify-between px-6">
        {/* SEARCH */}
        <div className="flex min-w-0 flex-1 items-center">
          <form
            onSubmit={handleSearch}
            className="flex h-10 w-full max-w-[500px] items-center gap-3 rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] px-4 transition focus-within:border-[#4F7DF3] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4F7DF3]/10"
          >
            <span className="text-base text-[#667085]">⌕</span>

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search reports, residents, or locations..."
              className="min-w-0 flex-1 bg-transparent text-sm text-[#1F1D47] outline-none placeholder:text-[#98A2B3]"
              aria-label="Search reports, residents, or locations"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-sm font-semibold text-[#98A2B3] transition hover:text-[#667085]"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </form>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="ml-6 flex shrink-0 items-center gap-4">
          {/* NOTIFICATIONS */}
          <div ref={notificationRef} className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setShowNotifications((current) => !current)}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                showNotifications
                  ? "border-transparent bg-gradient-to-br from-[#8346F2] via-[#4F7DF3] to-[#16BFA8] text-white shadow-md"
                  : "border-[#E4E7EC] bg-white text-[#667085] hover:border-[#4F7DF3] hover:text-[#4F7DF3]"
              }`}
            >
              🔔
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-[#FF2D55]" />
            </button>

            {/* NOTIFICATION PANEL */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-[360px] overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-xl shadow-[#1F1D47]/10">
                {/* PANEL HEADER */}
                <div className="border-b border-[#E4E7EC] bg-gradient-to-r from-[#F3EEFF] via-[#F4F7FF] to-[#ECFFFB] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#1F1D47]">
                        Notifications
                      </h3>

                      <p className="mt-0.5 text-xs text-[#667085]">
                        Latest system activity
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#8346F2] shadow-sm">
                      {notifications.length} new
                    </span>
                  </div>
                </div>

                {/* NOTIFICATION LIST */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      className="flex w-full items-start gap-3 border-b border-[#F2F4F7] px-4 py-3 text-left transition hover:bg-[#F9FAFB]"
                    >
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          notification.type === "critical"
                            ? "bg-[#FF4D4F]"
                            : notification.type === "warning"
                              ? "bg-[#F59E0B]"
                              : "bg-[#3B82F6]"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#1F1D47]">
                          {notification.title}
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-[#667085]">
                          {notification.message}
                        </p>

                        <p className="mt-1.5 text-[11px] text-[#98A2B3]">
                          {notification.time}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* PANEL FOOTER */}
                <button
                  type="button"
                  className="w-full border-t border-[#E4E7EC] px-4 py-3 text-center text-xs font-semibold text-[#4F7DF3] transition hover:bg-[#F4F7FF]"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>

          {/* ADMIN PROFILE */}
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8346F2] via-[#4F7DF3] to-[#16BFA8] text-sm font-bold text-white shadow-md">
              A
            </div>

            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-[#1F1D47]">
                Administrator
              </p>

              <p className="truncate text-xs text-[#667085]">
                Barangay Personnel
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
