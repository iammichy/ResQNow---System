const navigationGroups = [
  {
    label: "OVERVIEW",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "⌂",
      },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      {
        id: "all-reports",
        label: "All Reports",
        icon: "▣",
      },
      {
        id: "verification",
        label: "Verification",
        icon: "✓",
      },
      {
        id: "prioritization",
        label: "Prioritization",
        icon: "⚡",
      },
      {
        id: "map",
        label: "Incident Map",
        icon: "◉",
      },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      {
        id: "residents",
        label: "Residents",
        icon: "♙",
      },
      {
        id: "personnel",
        label: "Personnel",
        icon: "♙",
      },
      {
        id: "announcements",
        label: "Announcements",
        icon: "▰",
      },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      {
        id: "audit-logs",
        label: "Audit Logs",
        icon: "▤",
      },
      {
        id: "settings",
        label: "Settings & Roles",
        icon: "⚙",
      },
    ],
  },
];

function Sidebar({
  activePage = "dashboard",
  onNavigate,
  onAddManualReport,
  onLogout,
}) {
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

  return (
    <aside className="flex h-screen w-62.5 shrink-0 flex-col overflow-hidden bg-gradient-to-b from-[#6D3FD9] via-[#4F7DF3] to-[#16BFA8] text-white">
      
      {/* BRAND */}
      <div className="shrink-0 border-b border-white/20 bg-black/5 px-5 py-4 backdrop-blur-sm">
        <div className="text-[25px] font-extrabold leading-none tracking-tight">
          Res<span className="text-white">Q</span>Now
        </div>

        <p className="mt-1.5 text-xs font-medium text-white/75">
          Barangay Web Admin
        </p>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navigationGroups.map((group) => (
          <div key={group.label} className="mb-4 last:mb-0">
            
            {/* GROUP LABEL */}
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">
              {group.label}
            </p>

            {/* GROUP ITEMS */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigation(item.id)}
                    className={`group flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-white text-[#4F5FEA] shadow-lg shadow-black/10"
                        : "font-medium text-white/80 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm transition ${
                        isActive
                          ? "bg-gradient-to-br from-[#8346F2] via-[#4F7DF3] to-[#16BFA8] text-white"
                          : "bg-white/10 text-white/80 group-hover:bg-white/20 group-hover:text-white"
                      }`}
                    >
                      {item.icon}
                    </span>

                    <span className="truncate">
                      {item.label}
                    </span>
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
        <button
          type="button"
          onClick={handleManualReport}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#4F5FEA] shadow-lg transition-all duration-200 hover:scale-[1.01] hover:shadow-xl active:scale-[0.98]"
        >
          <span className="text-lg leading-none">+</span>
          <span>Add Manual Report</span>
        </button>

        {/* SIGN OUT */}
        <div className="mt-2 px-3">
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-white/75 transition hover:bg-white/15 hover:text-white"
          >
            Sign Out
          </button>
        </div>

        {/* SYSTEM STATUS */}
        <div className="mt-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#2ED47A] shadow-sm shadow-[#2ED47A]/50" />

            <span className="text-xs font-semibold text-white">
              All systems operational
            </span>
          </div>

          <p className="mt-1 pl-4 text-[10px] text-white/65">
            Last sync: 2 min ago
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;