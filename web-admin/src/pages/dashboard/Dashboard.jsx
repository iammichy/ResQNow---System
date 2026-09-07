const stats = [
  {
    title: "Total Reports",
    value: "47",
    change: "+12%",
    text: "from last week",
    icon: "▤",
  },
  {
    title: "Emergency Reports",
    value: "15",
    change: "+25%",
    text: "from last week",
    icon: "⚠",
  },
  {
    title: "Pending Verification",
    value: "12",
    change: "+8%",
    text: "from yesterday",
    icon: "◷",
  },
  {
    title: "Resolved Reports",
    value: "10",
    change: "+18%",
    text: "from last week",
    icon: "✓",
  },
];

const updates = [
  {
    time: "09:32 AM",
    title: "Evacuation alert issued",
    description: "Building A and surrounding areas. • By Sarah Johnson",
    icon: "⚠",
    type: "danger",
  },
  {
    time: "09:28 AM",
    title: "Shelter 2 is now open",
    description: "Accepting residents from Purok 2. • By Michael Chen",
    icon: "⌂",
    type: "success",
  },
  {
    time: "09:24 AM",
    title: "Medical support team en route",
    description: "Team dispatched to the incident location. • By Priya Sharma",
    icon: "+",
    type: "info",
  },
];

const priorityData = [
  {
    label: "Critical",
    value: "15",
    percentage: "32%",
    color: "bg-red-500",
  },
  {
    label: "High",
    value: "12",
    percentage: "26%",
    color: "bg-orange-500",
  },
  {
    label: "Medium",
    value: "10",
    percentage: "21%",
    color: "bg-amber-500",
  },
  {
    label: "Resolved",
    value: "10",
    percentage: "21%",
    color: "bg-teal-600",
  },
];

const bottomStats = [
  {
    title: "Alerts Sent",
    value: "3",
    text: "Last 24h",
    icon: "⚑",
    iconClass: "text-red-500 bg-red-50",
  },
  {
    title: "People Accounted",
    value: "1,102",
    text: "88% of total",
    icon: "♧",
    iconClass: "text-teal-700 bg-teal-50",
  },
  {
    title: "Active Incidents",
    value: "2",
    text: "Across locations",
    icon: "♧",
    iconClass: "text-red-500 bg-red-50",
  },
  {
    title: "Resources Deployed",
    value: "36",
    text: "Teams & equipment",
    icon: "◎",
    iconClass: "text-[#5B4BC4] bg-[#F1EFFF]",
  },
];

export default function Dashboard({ onNavigate }) {
  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[#FFF8ED]">
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

            <h1 className="text-[24px] font-extrabold leading-tight text-[#1F2A44]">
              Good morning, Admin!
            </h1>

            <p className="mt-1 text-[14px] text-[#64748B]">
              Here's the current situation in your barangay.
            </p>
          </div>

          {/* DATE CARD */}

          <div className="flex items-center gap-3 rounded-2xl border border-[#DDE3EA] bg-white px-3.5 py-2.5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7346D8] to-[#20B5A7] text-lg text-white shadow-sm">
              ▣
            </div>

            <div>
              <p className="text-[15px] font-bold text-[#26324A]">
                September 4, 2026
              </p>

              <p className="text-[13px] text-[#64748B]">
                Monday, 10:32 AM
              </p>
            </div>
          </div>
        </div>

        {/* ================= TOP STAT CARDS ================= */}

        <div className="grid shrink-0 grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              className={`
                relative overflow-hidden rounded-2xl border border-[#DCE2EA]
                bg-white px-4 py-3 shadow-sm
                ${index === 0 ? "border-t-2 border-t-[#7C3AED]" : ""}
                ${index === 1 ? "border-t-2 border-t-[#7C3AED]" : ""}
                ${index === 2 ? "border-t-2 border-t-[#3B82F6]" : ""}
                ${index === 3 ? "border-t-2 border-t-[#0F9B8E]" : ""}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[14px] font-medium text-[#56657A]">
                    {stat.title}
                  </p>

                  <p className="mt-1 text-[28px] font-extrabold leading-none text-[#202A44]">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-[48px] w-[48px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#733BD4] to-[#18AFA4] text-[21px] font-light text-white shadow-md">
                  {stat.icon}
                </div>
              </div>

              <div className="mt-2 flex items-center gap-1 text-sm">
                <span className="font-bold text-[#167267]">
                  ↑ {stat.change}
                </span>

                <span className="text-[#64748B]">{stat.text}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ================= MAIN CONTENT ================= */}

        {/*
          IMPORTANT:
          min-h-0 prevents grid children from overflowing.
          No absolute positioning.
          Priority Overview will NEVER overlap Active Incident.
        */}

        <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-[1.15fr_0.85fr]">
          {/* ========== LEFT COLUMN ========== */}

          <div className="flex flex-col gap-2.5">
            {/* ================= ACTIVE INCIDENT ================= */}

            <section className="shrink-0 overflow-hidden rounded-2xl border border-[#DCE2EA] bg-white shadow-sm">
              {/* CARD HEADER */}

              <div className="flex h-[48px] items-center justify-between border-b border-[#E8ECF1] px-4">
                <h2 className="text-[18px] font-bold text-[#26324A]">
                  Active Incident
                </h2>

                <div className="flex items-center gap-2 rounded-full bg-red-50 px-3.5 py-1.5 text-sm font-bold text-red-500">
                  <span className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]" />
                  Active incident
                </div>
              </div>

              <div className="p-3">
                {/* ALERT */}

                <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#FF3B3B] via-[#FF5A36] to-[#FF9D00] px-5 py-2.5 text-white">
                  <div className="flex items-center gap-4">
                    <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-white text-[22px] text-red-500">
                      ⚠
                    </div>

                    <div>
                      <h3 className="text-[20px] font-extrabold">
                        Evacuation alert
                      </h3>

                      <p className="mt-0.5 text-[14px] font-semibold">
                        Building A & surrounding areas
                      </p>

                      <p className="mt-0.5 text-sm">Purok 2</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm">Issued Today</p>

                    <p className="mt-1 text-[20px] font-extrabold">
                      09:32 AM
                    </p>
                  </div>
                </div>

                {/* INCIDENT DETAILS */}

                <div className="mt-2.5 grid grid-cols-4 gap-2.5">
                  <div className="rounded-xl bg-[#F7F9FC] px-4 py-2.5">
                    <p className="text-xs text-[#64748B]">
                      Incident ID
                    </p>

                    <p className="mt-1.5 font-bold text-[#27324A]">
                      INC-2025-0412
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F7F9FC] px-4 py-2.5">
                    <p className="text-xs text-[#64748B]">
                      Location
                    </p>

                    <p className="mt-1.5 font-bold text-[#27324A]">
                      Purok 2
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F7F9FC] px-4 py-2.5">
                    <p className="text-xs text-[#64748B]">
                      People at risk
                    </p>

                    <p className="mt-1.5 font-bold text-[#27324A]">
                      ~200
                    </p>
                  </div>

                  <div className="rounded-xl bg-red-50 px-4 py-2.5">
                    <p className="text-xs text-[#64748B]">
                      Priority
                    </p>

                    <p className="mt-1.5 font-bold text-red-500">
                      High
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= PRIORITY OVERVIEW ================= */}

            <section className="flex min-h-[190px] flex-1 flex-col rounded-2xl border border-[#DCE2EA] bg-white p-3.5 shadow-sm">
              <h2 className="shrink-0 text-[18px] font-bold text-[#26324A]">
                Priority Overview
              </h2>

              <div className="mt-2 flex flex-1 items-center gap-7">
                {/* DONUT */}

                <div className="relative flex shrink-0 items-center justify-center">
                  <div
                    className="relative h-[125px] w-[125px] rounded-full"
                    style={{
                      background:
                        "conic-gradient(#ef4444 0deg 115deg, #f97316 115deg 209deg, #f59e0b 209deg 285deg, #159b8e 285deg 360deg)",
                    }}
                  >
                    <div className="absolute inset-[20px] flex flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-[24px] font-extrabold text-[#27324A]">
                        47
                      </span>

                      <span className="text-[10px] text-[#64748B]">
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

                      <span className="font-bold text-[#27324A]">
                        {item.value}
                      </span>

                      <span className="text-sm text-[#64748B]">
                        {item.percentage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* ========== RIGHT COLUMN ========== */}

          <section className="flex flex-col rounded-2xl border border-[#DCE2EA] bg-white p-3.5 shadow-sm">
            {/* HEADER */}

            <div className="flex shrink-0 items-center justify-between border-b border-[#E8ECF1] pb-2.5">
              <h2 className="text-[19px] font-bold text-[#26324A]">
                Live Updates
              </h2>

             <button
  type="button"
  onClick={() => onNavigate("live-updates")}
  className="text-sm font-semibold text-[#2563A8] transition hover:text-[#1D4ED8]"
>
  View all updates →
</button>
            </div>

            {/* TIMELINE */}

            <div className="relative ml-4 min-h-0 flex-1 overflow-y-auto pr-1">
              {/* Vertical Line */}

              <div className="absolute bottom-4 left-[11px] top-3 w-px bg-[#D9E0E8]" />

              <div className="space-y-0">
                {updates.map((update, index) => (
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
                        relative z-10 flex h-[42px] w-[42px] shrink-0
                        items-center justify-center rounded-full
                        text-[19px]
                        ${
                          update.type === "danger"
                            ? "bg-red-50 text-red-500"
                            : ""
                        }
                        ${
                          update.type === "success"
                            ? "bg-teal-50 text-[#168F86]"
                            : ""
                        }
                        ${
                          update.type === "info"
                            ? "bg-[#EEF3FF] text-[#4169C1]"
                            : ""
                        }
                      `}
                    >
                      {update.icon}
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-[#64748B]">
                        {update.time}
                      </p>

                      <h3 className="mt-0.5 text-[16px] font-bold text-[#27324A]">
                        {update.title}
                      </h3>

                      <p className="mt-0.5 text-[14px] text-[#64748B]">
                        {update.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ================= BOTTOM STATISTICS ================= */}

        <div className="grid shrink-0 grid-cols-2 gap-2.5 xl:grid-cols-4">
          {bottomStats.map((stat) => (
            <div
              key={stat.title}
              className="flex h-[72px] items-center justify-between rounded-2xl border border-[#DCE2EA] bg-white px-4 shadow-sm"
            >
              <div>
                <p className="text-[13px] font-medium text-[#56657A]">
                  {stat.title}
                </p>

                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="text-[24px] font-extrabold text-[#27324A]">
                    {stat.value}
                  </span>

                  <span className="text-[13px] text-[#64748B]">
                    {stat.text}
                  </span>
                </div>
              </div>

              <div
                className={`flex h-[46px] w-[46px] items-center justify-center rounded-2xl text-[21px] ${stat.iconClass}`}
              >
                {stat.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}