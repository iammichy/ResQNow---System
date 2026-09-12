import {
  AlertTriangle,
  CalendarDays,
  Check,
  ClipboardList,
  FileText,
  Flag,
  HeartPulse,
  Home,
  Plus,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Total Reports",
    value: "47",
    change: "+12%",
    text: "from last week",
    icon: FileText,
    accent: "#8346F2",
    iconBg: "bg-[#F3EEFF]",
    iconColor: "text-[#8346F2]",
  },
  {
    title: "Emergency Reports",
    value: "15",
    change: "+25%",
    text: "from last week",
    icon: AlertTriangle,
    accent: "#FF2D55",
    iconBg: "bg-[#FFF0F3]",
    iconColor: "text-[#FF2D55]",
  },
  {
    title: "Pending Verification",
    value: "12",
    change: "+8%",
    text: "from yesterday",
    icon: ClipboardList,
    accent: "#FF8C42",
    iconBg: "bg-[#FFF4EC]",
    iconColor: "text-[#FF8C42]",
  },
  {
    title: "Resolved Reports",
    value: "10",
    change: "+18%",
    text: "from last week",
    icon: Check,
    accent: "#2ED47A",
    iconBg: "bg-[#EDFFF5]",
    iconColor: "text-[#2ED47A]",
  },
];

const updates = [
  {
    time: "09:32 AM",
    title: "Evacuation alert issued",
    description: "Building A and surrounding areas. • By Sarah Johnson",
    icon: AlertTriangle,
    type: "danger",
  },
  {
    time: "09:28 AM",
    title: "Shelter 2 is now open",
    description: "Accepting residents from Purok 2. • By Michael Chen",
    icon: Home,
    type: "success",
  },
  {
    time: "09:24 AM",
    title: "Medical support team en route",
    description: "Team dispatched to the incident location. • By Priya Sharma",
    icon: Plus,
    type: "info",
  },
];

const priorityData = [
  {
    label: "Critical",
    value: "15",
    percentage: "32%",
    color: "bg-[#D90429]",
  },
  {
    label: "High",
    value: "12",
    percentage: "26%",
    color: "bg-[#FF2D55]",
  },
  {
    label: "Medium",
    value: "10",
    percentage: "21%",
    color: "bg-[#FF8C42]",
  },
  {
    label: "Resolved",
    value: "10",
    percentage: "21%",
    color: "bg-[#2ED47A]",
  },
];

const bottomStats = [
  {
    title: "Alerts Sent",
    value: "3",
    text: "Last 24h",
    icon: Flag,
    iconClass: "text-[#FF2D55] bg-[#FFF0F3]",
  },
  {
    title: "People Accounted",
    value: "1,102",
    text: "88% of total",
    icon: Users,
    iconClass: "text-[#00A98F] bg-[#ECFFFB]",
  },
  {
    title: "Active Incidents",
    value: "2",
    text: "Across locations",
    icon: AlertTriangle,
    iconClass: "text-[#D90429] bg-[#FFF0F3]",
  },
  {
    title: "Resources Deployed",
    value: "36",
    text: "Teams & equipment",
    icon: HeartPulse,
    iconClass: "text-[#8346F2] bg-[#F3EEFF]",
  },
];
export default function Dashboard({ onNavigate, reportUpdates = {} }) {
  const updatedReports = Object.values(reportUpdates);

  const dashboardStats = stats.map((stat) => {
    let value = stat.value;

    if (stat.title === "Pending Verification") {
      value = updatedReports.filter(
        (report) =>
          report.status === "For Verification" ||
          report.status === "Pending Verification",
      ).length.toString();
    }

    if (stat.title === "Resolved Reports") {
      value = updatedReports.filter(
        (report) => report.status === "Resolved",
      ).length.toString();
    }

    return {
      ...stat,
      value,
    };
  });

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[var(--warm-ivory)]">
      <div
        className="
          mx-auto flex max-w-[1600px] flex-col
          gap-2.5 px-5 py-4
          xl:px-7
        "
      >
        {/* ================= HEADER ================= */}

        <div className="flex shrink-0 items-start justify-between">
          <div>
            <p className="mb-1 text-[11px] font-bold tracking-wide text-[#45648B]">
              RESQNOW ADMIN DASHBOARD
            </p>

            <h1 className="text-[24px] font-extrabold leading-tight text-[var(--text-primary)]">
              Good morning, Admin!
            </h1>

            <p className="mt-1 text-[14px] text-[var(--text-muted)]">
              Here's the current situation in your barangay.
            </p>
          </div>

          {/* DATE CARD */}

          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-mist)] bg-white px-3.5 py-2.5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3EEFF] text-[var(--brand-violet)] shadow-sm">
              <CalendarDays size={19} strokeWidth={2} />
            </div>

            <div>
              <p className="text-[15px] font-bold text-[var(--text-primary)]">
                September 4, 2026
              </p>

              <p className="text-[13px] text-[var(--text-muted)]">
                Monday, 10:32 AM
              </p>
            </div>
          </div>
        </div>

        {/* ================= TOP STAT CARDS ================= */}

        <div className="grid shrink-0 grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="
                  relative overflow-hidden rounded-2xl
                  border border-[var(--border-soft)]
                  bg-white px-4 py-3 shadow-sm
                "
                style={{
                  borderTopWidth: "2px",
                  borderTopColor: stat.accent,
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-[#56657A]">
                      {stat.title}
                    </p>

                    <p className="mt-1 text-[28px] font-extrabold leading-none text-[var(--text-primary)]">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`
                      flex h-[48px] w-[48px]
                      items-center justify-center
                      rounded-2xl
                      ${stat.iconBg}
                      ${stat.iconColor}
                    `}
                  >
                    <Icon size={21} strokeWidth={2} />
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1 text-sm">
                  <span className="font-bold text-[#167267]">
                    ↑ {stat.change}
                  </span>

                  <span className="text-[var(--text-muted)]">
                    {stat.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= MAIN CONTENT ================= */}

        <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-[1.15fr_0.85fr]">

          {/* ========== LEFT COLUMN ========== */}

          <div className="flex flex-col gap-2.5">

            {/* ================= ACTIVE INCIDENT ================= */}

            <section className="shrink-0 overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white shadow-sm">

              {/* CARD HEADER */}

              <div className="flex h-[48px] items-center justify-between border-b border-[#E8ECF1] px-4">
                <h2 className="text-[18px] font-bold text-[var(--text-primary)]">
                  Active Incident
                </h2>

                <div className="flex items-center gap-2 rounded-full bg-[#FFF0F3] px-3.5 py-1.5 text-sm font-bold text-[#D90429]">
                  <span className="h-3 w-3 rounded-full bg-[#FF2D55] shadow-[0_0_10px_rgba(255,45,85,0.55)]" />
                  Active incident
                </div>
              </div>

              <div className="p-3">

                {/* EMERGENCY ALERT */}

                <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#FF2D55] to-[#D90429] px-5 py-2.5 text-white">
                  <div className="flex items-center gap-4">

                    <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-white text-[#D90429]">
                      <AlertTriangle size={23} strokeWidth={2.2} />
                    </div>

                    <div>
                      <h3 className="text-[20px] font-extrabold">
                        Evacuation alert
                      </h3>

                      <p className="mt-0.5 text-[14px] font-semibold">
                        Building A & surrounding areas
                      </p>

                      <p className="mt-0.5 text-sm">
                        Purok 2
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm">
                      Issued Today
                    </p>

                    <p className="mt-1 text-[20px] font-extrabold">
                      09:32 AM
                    </p>
                  </div>
                </div>

                {/* INCIDENT DETAILS */}

                <div className="mt-2.5 grid grid-cols-4 gap-2.5">

                  <div className="rounded-xl bg-[#F7F9FC] px-4 py-2.5">
                    <p className="text-xs text-[var(--text-muted)]">
                      Incident ID
                    </p>

                    <p className="mt-1.5 font-bold text-[var(--text-primary)]">
                      INC-2025-0412
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F7F9FC] px-4 py-2.5">
                    <p className="text-xs text-[var(--text-muted)]">
                      Location
                    </p>

                    <p className="mt-1.5 font-bold text-[var(--text-primary)]">
                      Purok 2
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F7F9FC] px-4 py-2.5">
                    <p className="text-xs text-[var(--text-muted)]">
                      People at risk
                    </p>

                    <p className="mt-1.5 font-bold text-[var(--text-primary)]">
                      ~200
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FFF0F3] px-4 py-2.5">
                    <p className="text-xs text-[var(--text-muted)]">
                      Priority
                    </p>

                    <p className="mt-1.5 font-bold text-[#FF2D55]">
                      High
                    </p>
                  </div>

                </div>
              </div>
            </section>

            {/* ================= PRIORITY OVERVIEW ================= */}

            <section className="flex min-h-[190px] flex-1 flex-col rounded-2xl border border-[var(--border-soft)] bg-white p-3.5 shadow-sm">
              <h2 className="shrink-0 text-[18px] font-bold text-[var(--text-primary)]">
                Priority Overview
              </h2>

              <div className="mt-2 flex flex-1 items-center gap-7">

                {/* DONUT */}

                <div className="relative flex shrink-0 items-center justify-center">
                  <div
                    className="relative h-[125px] w-[125px] rounded-full"
                    style={{
                      background:
                        "conic-gradient(#D90429 0deg 115deg, #FF2D55 115deg 209deg, #FF8C42 209deg 285deg, #2ED47A 285deg 360deg)",
                    }}
                  >
                    <div className="absolute inset-[20px] flex flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-[24px] font-extrabold text-[var(--text-primary)]">
                        47
                      </span>

                      <span className="text-[10px] text-[var(--text-muted)]">
                        Total reports
                      </span>
                    </div>
                  </div>
                </div>

                {/* LEGEND */}

                <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5">
                  {priorityData.map((item) => (
                    <div
                      key={item.label}
                      className="grid grid-cols-[16px_1fr_auto_auto] items-center gap-3"
                    >
                      <span
                        className={`h-3.5 w-3.5 rounded-full ${item.color}`}
                      />

                      <span className="text-[16px] font-medium text-[#43516A]">
                        {item.label}
                      </span>

                      <span className="font-bold text-[var(--text-primary)]">
                        {item.value}
                      </span>

                      <span className="text-sm text-[var(--text-muted)]">
                        {item.percentage}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </section>
          </div>

          {/* ========== RIGHT COLUMN ========== */}

          <section className="flex flex-col rounded-2xl border border-[var(--border-soft)] bg-white p-3.5 shadow-sm">

            {/* HEADER */}

            <div className="flex shrink-0 items-center justify-between border-b border-[#E8ECF1] pb-2.5">
              <h2 className="text-[19px] font-bold text-[var(--text-primary)]">
                Live Updates
              </h2>

              <button
                type="button"
                onClick={() => onNavigate("live-updates")}
                className="
                  text-sm font-semibold text-[var(--brand-violet)]
                  transition hover:text-[#6F32D8]
                "
              >
                View all updates →
              </button>
            </div>

            {/* TIMELINE */}

            <div className="relative ml-4 min-h-0 flex-1 overflow-y-auto pr-1">

              <div className="absolute bottom-4 left-[11px] top-3 w-px bg-[#D9E0E8]" />

              <div className="space-y-0">
                {updates.map((update, index) => {
                  const Icon = update.icon;

                  const iconStyle =
                    update.type === "danger"
                      ? "bg-[#FFF0F3] text-[#D90429]"
                      : update.type === "success"
                        ? "bg-[#EDFFF5] text-[#2ED47A]"
                        : "bg-[#EEF8FF] text-[#38BDF8]";

                  return (
                    <div
                      key={update.title}
                      className={`relative flex gap-4 ${
                        index !== updates.length - 1
                          ? "border-b border-[#EEF1F4]"
                          : ""
                      } py-3.5 first:pt-2`}
                    >

                      {/* ICON */}

                      <div
                        className={`
                          relative z-10 flex h-[42px] w-[42px]
                          shrink-0 items-center justify-center
                          rounded-full ${iconStyle}
                        `}
                      >
                        <Icon size={18} strokeWidth={2} />
                      </div>

                      {/* CONTENT */}

                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-[var(--text-muted)]">
                          {update.time}
                        </p>

                        <h3 className="mt-0.5 text-[16px] font-bold text-[var(--text-primary)]">
                          {update.title}
                        </h3>

                        <p className="mt-0.5 text-[14px] text-[var(--text-muted)]">
                          {update.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* ================= BOTTOM STATISTICS ================= */}

        <div className="grid shrink-0 grid-cols-2 gap-2.5 xl:grid-cols-4">
          {bottomStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="
                  flex h-[72px] items-center justify-between
                  rounded-2xl border border-[var(--border-soft)]
                  bg-white px-4 shadow-sm
                "
              >
                <div>
                  <p className="text-[13px] font-medium text-[#56657A]">
                    {stat.title}
                  </p>

                  <div className="mt-0.5 flex items-baseline gap-2">
                    <span className="text-[24px] font-extrabold text-[var(--text-primary)]">
                      {stat.value}
                    </span>

                    <span className="text-[13px] text-[var(--text-muted)]">
                      {stat.text}
                    </span>
                  </div>
                </div>

                <div
                  className={`
                    flex h-[46px] w-[46px]
                    items-center justify-center
                    rounded-2xl ${stat.iconClass}
                  `}
                >
                  <Icon size={20} strokeWidth={2} />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}