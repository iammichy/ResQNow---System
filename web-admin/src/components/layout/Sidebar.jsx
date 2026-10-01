import {
  LayoutDashboard,
  FileText,
  BadgeCheck,
  ListFilter,
  MapPinned,
  Users,
  UserCog,
  Megaphone,
  ClipboardList,
  Settings,
  Plus,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { getCurrentUser } from "../../services/authService";

function Sidebar({
  activePage = "dashboard",
  onNavigate,
  onAddManualReport,
  onLogout,
  // RBAC
  currentUser,
  can,
  // GLOBAL SYSTEM SETTINGS
  systemSettings,
}) {
  const { t } = useLanguage();
  const [systemStatus, setSystemStatus] = useState("operational");
  const [lastSync, setLastSync] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(clockInterval);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkSystemStatus = async () => {
      try {
        await getCurrentUser();

        if (!isMounted) return;

        setSystemStatus("operational");
        setLastSync(new Date());
      } catch (error) {
        console.error("System health check failed:", error);

        if (!isMounted) return;

        setSystemStatus("error");
        setLastSync(new Date());
      }
    };

    checkSystemStatus();

    const statusInterval = setInterval(() => {
      checkSystemStatus();
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(statusInterval);
    };
  }, []);

  const getLastSyncText = () => {
    const seconds = Math.floor(
      (currentTime.getTime() - lastSync.getTime()) / 1000,
    );

    if (seconds < 5) {
      return "Just now";
    }

    if (seconds < 60) {
      return `${seconds} sec ago`;
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes === 1) {
      return "1 min ago";
    }

    return `${minutes} min ago`;
  };

  const navigationGroups = [
    {
      label: t("overview"),
      items: [
        {
          id: "dashboard",
          label: t("dashboard"),
          icon: LayoutDashboard,
          permission: "dashboard.view",
        },
      ],
    },
    {
      label: t("operations"),
      items: [
        {
          id: "all-reports",
          label: t("allReports"),
          icon: FileText,
          permission: "reports.view",
        },
        {
          id: "verification",
          label: t("verification"),
          icon: BadgeCheck,
          permission: "verification.view",
        },
        {
          id: "prioritization",
          label: t("prioritization"),
          icon: ListFilter,
          permission: "prioritization.view",
        },
        {
          id: "map",
          label: t("incidentMap"),
          icon: MapPinned,
          permission: "map.view",
        },
      ],
    },
    {
      label: t("management"),
      items: [
        {
          id: "residents",
          label: t("residents"),
          icon: Users,
          permission: "residents.view",
        },
        {
          id: "personnel",
          label: t("personnel"),
          icon: UserCog,
          permission: "personnel.view",
        },
        {
          id: "announcements",
          label: t("announcements"),
          icon: Megaphone,
          permission: "announcements.view",
        },
      ],
    },
    {
      label: t("system"),
      items: [
        {
          id: "audit-logs",
          label: t("auditLogs"),
          icon: ClipboardList,
          permission: "audit.view",
        },
        {
          id: "settings",
          label: t("settingsRoles"),
          icon: Settings,
          permission: "settings.view",
        },
      ],
    },
  ];

  const handleNavigation = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
    }
  };

  const handleManualReport = () => {
    if (onAddManualReport) {
      onAddManualReport();
    }
  };

  // Filter navigation based on permissions
  const visibleNavigationGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.permission) return true;

        return can ? can(item.permission) : true;
      }),
    }))
    .filter((group) => group.items.length > 0);

  const canCreateReport = can ? can("reports.create") : true;

  return (
    <aside
      className="
        flex h-screen w-62.5 shrink-0 flex-col overflow-hidden
        bg-gradient-to-b
        from-[#8346F2]
        via-[#818CF8]
        to-[#00C9A7]
        text-white
      "
    >
      {/* BRAND */}
      <div className="shrink-0 border-b border-white/20 bg-black/5 px-5 py-4 backdrop-blur-sm">
        <div className="text-[25px] font-extrabold leading-none tracking-tight">
          {systemSettings?.systemName || "ResQNow"}
        </div>

        <p className="mt-1.5 text-xs font-medium text-white/75">
          {t("barangayWebAdmin")}
        </p>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {visibleNavigationGroups.map((group) => (
          <div key={group.label} className="mb-4 last:mb-0">
            {/* GROUP LABEL */}
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">
              {group.label}
            </p>

            {/* GROUP ITEMS */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activePage === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigation(item.id)}
                    className={`
                      group flex h-10 w-full items-center gap-3
                      rounded-xl px-3 text-left text-sm
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-white font-semibold text-[#1F1D47] shadow-lg shadow-black/10"
                          : "font-medium text-white/80 hover:bg-white/15 hover:text-white"
                      }
                    `}
                  >
                    <span
                      className={`
                        flex h-7 w-7 shrink-0 items-center justify-center
                        rounded-lg transition
                        ${
                          isActive
                            ? "bg-[#8346F2]/10 text-[#8346F2]"
                            : "bg-white/10 text-white/80 group-hover:bg-white/20 group-hover:text-white"
                        }
                      `}
                    >
                      <Icon size={17} strokeWidth={2} />
                    </span>

                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* BOTTOM AREA */}
      <div className="shrink-0 border-t border-white/20 bg-black/5 p-3 backdrop-blur-sm">
        {/* ADD MANUAL REPORT */}
        {canCreateReport && (
          <button
            type="button"
            onClick={handleManualReport}
            className="
              flex h-11 w-full items-center justify-center gap-2
              rounded-xl
              bg-gradient-to-r
              from-[#FF5A36]
              to-[#FF8C42]
              px-4 text-sm font-bold text-white
              shadow-lg shadow-black/15
              transition-all duration-200
              hover:scale-[1.01]
              hover:shadow-xl
              active:scale-[0.98]
            "
          >
            <Plus size={18} strokeWidth={2.5} />

            <span>{t("addManualReport")}</span>
          </button>
        )}

        {/* CURRENT ROLE */}
        <div className="mt-3 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/55">
            {t("currentAccess")}
          </p>

          <p className="mt-1 truncate text-xs font-bold text-white">
            {currentUser?.role || t("administrator")}
          </p>
        </div>

        {/* SIGN OUT */}
        <div className="mt-2 px-3">
          <button
            type="button"
            onClick={onLogout}
            className="
              w-full rounded-xl px-3 py-2.5
              text-left text-sm font-semibold text-white/75
              transition
              hover:bg-white/15
              hover:text-white
            "
          >
            {t("signOut")}
          </button>
        </div>

        {/* SYSTEM STATUS */}
        <div className="mt-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ${
                systemStatus === "operational"
                  ? "bg-[#2ED47A] shadow-[#2ED47A]/50"
                  : "bg-[#FF2D55] shadow-[#FF2D55]/50"
              }`}
            />

            <span className="text-xs font-semibold text-white">
              {systemStatus === "operational"
                ? t("allSystemsOperational")
                : "System connection issue"}
            </span>
          </div>

          <p className="mt-1 pl-4 text-[10px] text-white/65">
            {t("lastSync")}: {getLastSyncText()}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
