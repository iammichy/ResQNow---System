import { useContext, useEffect, useRef, useState } from "react";

import { Bell, Search, X } from "lucide-react";
import { LanguageContext } from "../../context/LanguageContext.jsx";

function Topbar() {
  const languageContext = useContext(LanguageContext);

  const t = languageContext?.t || ((key) => key);

  const [searchQuery, setSearchQuery] = useState("");

  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef(null);

  const notifications = [
    {
      id: 1,
      type: "critical",
      title: t("evacuationAlertIssued"),
      message: t("evacuationAlertMessage"),
      time: t("justNow"),
    },

    {
      id: 2,
      type: "warning",
      title: t("newReportPendingVerification"),
      message: t("hazardReportWaiting"),
      time: t("tenMinutesAgo"),
    },

    {
      id: 3,
      type: "info",
      title: t("medicalSupportAssigned"),
      message: t("responsePersonnelAssigned"),
      time: t("twentyFiveMinutesAgo"),
    },
  ];

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
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    console.log("Searching for:", query);

    // Frontend placeholder.
    // This will later connect to Laravel API search.
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "critical":
        return "bg-[#D90429]";

      case "warning":
        return "bg-[#FF8C42]";

      case "info":
      default:
        return "bg-[#38BDF8]";
    }
  };

  return (
    <header className="relative z-40 shrink-0 border-b border-[var(--border-soft)] bg-[var(--card-white)]">
      {/* GRADIENT BRAND ACCENT */}

      <div className="h-1 w-full bg-gradient-to-r from-[#8346F2] via-[#818CF8] to-[#00C9A7]" />

      <div className="flex h-[71px] items-center justify-between px-6">
        {/* SEARCH */}

        <div className="flex min-w-0 flex-1 items-center">
          <form
            onSubmit={handleSearch}
            className="
              flex h-10 w-full max-w-[500px] items-center gap-3
              rounded-xl border border-[var(--border-soft)]
              bg-[var(--canvas-neutral)]
              px-4 transition
              focus-within:border-[var(--brand-violet)]
              focus-within:bg-white
              focus-within:ring-2
              focus-within:ring-[var(--brand-violet)]/10
            "
          >
            <Search
              size={18}
              className="shrink-0 text-[var(--text-muted)]"
              strokeWidth={2}
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder={t("searchReportsResidentsLocations")}
              className="
                min-w-0 flex-1 bg-transparent text-sm
                text-[var(--text-primary)]
                outline-none
                placeholder:text-[var(--text-placeholder)]
              "
              aria-label={t("searchReportsResidentsLocations")}
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="
                  text-[var(--text-placeholder)]
                  transition
                  hover:text-[var(--text-muted)]
                "
                aria-label={t("clearSearch")}
              >
                <X size={17} strokeWidth={2.5} />
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
              aria-label={t("notifications")}
              onClick={() =>
                setShowNotifications((current) => !current)
              }
              className={`
                relative flex h-10 w-10 items-center justify-center
                rounded-xl border transition
                ${
                  showNotifications
                    ? "border-[var(--brand-violet)] bg-[var(--brand-violet)] text-white shadow-md"
                    : "border-[var(--border-soft)] bg-white text-[var(--text-muted)] hover:border-[var(--brand-violet)] hover:text-[var(--brand-violet)]"
                }
              `}
            >
              <Bell size={19} strokeWidth={2} />

              {/* NOTIFICATION BADGE */}

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-[var(--critical-rose)]" />
            </button>

            {/* NOTIFICATION PANEL */}

            {showNotifications && (
              <div
                className="
                  absolute right-0 top-12 w-[360px]
                  overflow-hidden rounded-2xl
                  border border-[var(--border-soft)]
                  bg-white
                  shadow-xl shadow-[#1F1D47]/10
                "
              >
                {/* PANEL HEADER */}

                <div className="border-b border-[var(--border-soft)] bg-[var(--soft-blue-mist)] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        {t("notifications")}
                      </h3>

                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        {t("latestSystemActivity")}
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[var(--brand-violet)] shadow-sm">
                      {notifications.length} {t("new")}
                    </span>
                  </div>
                </div>

                {/* NOTIFICATION LIST */}

                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      className="
                        flex w-full items-start gap-3
                        border-b border-[#F2F4F7]
                        px-4 py-3 text-left
                        transition hover:bg-[#F9FAFB]
                      "
                    >
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getNotificationColor(
                          notification.type,
                        )}`}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {notification.title}
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                          {notification.message}
                        </p>

                        <p className="mt-1.5 text-[11px] text-[var(--text-placeholder)]">
                          {notification.time}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* PANEL FOOTER */}

                <button
                  type="button"
                  className="
                    w-full border-t border-[var(--border-soft)]
                    px-4 py-3 text-center text-xs
                    font-semibold text-[var(--brand-violet)]
                    transition
                    hover:bg-[var(--soft-blue-mist)]
                  "
                >
                  {t("viewAllNotifications")}
                </button>
              </div>
            )}
          </div>

          {/* ADMIN PROFILE */}

          <div className="flex items-center gap-3 px-2 py-1.5">
            <div
              className="
                flex h-10 w-10 shrink-0 items-center justify-center
                rounded-full
                bg-gradient-to-br
                from-[#8346F2]
                via-[#818CF8]
                to-[#00C9A7]
                text-sm font-bold text-white shadow-md
              "
            >
              A
            </div>

            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {t("administrator")}
              </p>

              <p className="truncate text-xs text-[var(--text-muted)]">
                {t("barangayPersonnel")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;