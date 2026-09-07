import { useState } from "react";

const initialPersonnel = [
  {
    id: "PER-2026-001",
    name: "Carlos Mendoza",
    role: "Response Team Leader",
    team: "Emergency Response Team A",
    status: "Active",
    access: "Personnel",
  },
  {
    id: "PER-2026-002",
    name: "Mark Reyes",
    role: "Emergency Responder",
    team: "Emergency Response Team A",
    status: "Active",
    access: "Personnel",
  },
  {
    id: "PER-2026-003",
    name: "John Bautista",
    role: "Emergency Responder",
    team: "Emergency Response Team B",
    status: "Active",
    access: "Personnel",
  },
  {
    id: "PER-2026-004",
    name: "Ana Garcia",
    role: "Barangay Personnel",
    team: "Emergency Response Team B",
    status: "Active",
    access: "Personnel",
  },
  {
    id: "PER-2026-005",
    name: "Miguel Santos",
    role: "Emergency Responder",
    team: "Emergency Response Team C",
    status: "Active",
    access: "Personnel",
  },
];

const initialSettings = {
  systemName: "ResQNow",
  barangayName: "Barangay Camunatan",
  cityName: "City of Ilagan",
  language: "English",
  notifications: true,
  criticalAlerts: true,
  assignmentAlerts: true,
  announcementAlerts: true,
  autoRefresh: true,
};

const tabs = [
  {
    id: "general",
    label: "General Settings",
    description: "System information and preferences",
    icon: <SettingsIcon />,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alert and notification preferences",
    icon: <BellIcon />,
  },
  {
    id: "roles",
    label: "Roles & Access",
    description: "Personnel accounts and permissions",
    icon: <UsersIcon />,
  },
];

function SettingsRoles() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(initialSettings);
  const [personnel] = useState(initialPersonnel);
  const [selectedPersonnel, setSelectedPersonnel] = useState(
    initialPersonnel[0],
  );

  const updateSetting = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      {/* PAGE HEADER */}
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8346F2]">
            System
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1F1D47]">
            Settings & Roles
          </h1>

          <p className="mt-1 text-sm text-[#667085]">
            Manage system preferences, notifications, and personnel access.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-[#E4E7EC] bg-white px-3 py-2 shadow-sm sm:flex">
          <span className="h-2 w-2 rounded-full bg-[#2ED47A]" />
          <span className="text-xs font-semibold text-[#475467]">
            System configuration
          </span>
        </div>
      </div>

      {/* SETTINGS WORKSPACE */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
        {/* LEFT NAVIGATION */}
        <aside className="min-h-0 overflow-auto rounded-2xl border border-[#E4E7EC] bg-white p-2 shadow-sm">
          <div className="px-3 pb-2 pt-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#98A2B3]">
              Configuration
            </p>
          </div>

          <div className="space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                    isActive
                      ? "bg-[#F0EBFF] text-[#8346F2]"
                      : "text-[#475467] hover:bg-[#F9FAFB]"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-[#8346F2] text-white"
                        : "bg-[#F2F4F7] text-[#667085]"
                    }`}
                  >
                    {tab.icon}
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold">
                      {tab.label}
                    </span>

                    <span
                      className={`mt-0.5 block text-[10px] leading-4 ${
                        isActive ? "text-[#6D28D9]" : "text-[#98A2B3]"
                      }`}
                    >
                      {tab.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* SECURITY STATUS */}
          <div className="mt-4 rounded-xl border border-[#E4E7EC] bg-[#FCFCFD] p-3">
            <div className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F8F4] text-[#008F78]">
                <ShieldIcon />
              </div>

              <div>
                <p className="text-[11px] font-bold text-[#344054]">
                  Access Protected
                </p>

                <p className="mt-0.5 text-[10px] leading-4 text-[#98A2B3]">
                  Only authorized barangay personnel can manage these settings.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-sm">
          {activeTab === "general" && (
            <GeneralSettings
              settings={settings}
              updateSetting={updateSetting}
            />
          )}

          {activeTab === "notifications" && (
            <NotificationSettings
              settings={settings}
              updateSetting={updateSetting}
            />
          )}

          {activeTab === "roles" && (
            <RolesSettings
              personnel={personnel}
              selectedPersonnel={selectedPersonnel}
              setSelectedPersonnel={setSelectedPersonnel}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function GeneralSettings({ settings, updateSetting }) {
  return (
    <>
      <SectionHeader
        eyebrow="System Configuration"
        title="General Settings"
        description="Basic information and default preferences for the ResQNow system."
      />

      <div className="min-h-0 flex-1 overflow-auto p-5">
        {/* SYSTEM INFORMATION */}
        <SettingsSection
          title="System Information"
          description="Identify the emergency management system and its operating barangay."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="System Name"
              value={settings.systemName}
              onChange={(value) => updateSetting("systemName", value)}
            />

            <Field
              label="Barangay"
              value={settings.barangayName}
              onChange={(value) => updateSetting("barangayName", value)}
            />

            <Field
              label="City / Municipality"
              value={settings.cityName}
              onChange={(value) => updateSetting("cityName", value)}
            />

            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-[#475467]">
                Default Language
              </label>

              <select
                value={settings.language}
                onChange={(event) =>
                  updateSetting("language", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-[#E4E7EC] bg-[#FCFCFD] px-3 text-xs font-medium text-[#344054] outline-none transition focus:border-[#8346F2] focus:ring-2 focus:ring-[#8346F2]/10"
              >
                <option>English</option>
                <option>Filipino</option>
              </select>
            </div>
          </div>
        </SettingsSection>

        {/* SYSTEM STATUS */}
        <SettingsSection
          title="System Behavior"
          description="Control default behavior of the administrative dashboard."
        >
          <div className="space-y-3">
            <ToggleRow
              label="Automatic Data Refresh"
              description="Keep dashboard information refreshed while personnel are monitoring operations."
              enabled={settings.autoRefresh}
              onChange={(value) => updateSetting("autoRefresh", value)}
            />
          </div>
        </SettingsSection>

        {/* INFORMATION NOTE */}
        <div className="mt-4 rounded-xl border border-[#E4E7EC] bg-[#F9F7FF] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDE9FE] text-[#8346F2]">
              <InfoIcon />
            </div>

            <div>
              <p className="text-xs font-bold text-[#1F1D47]">
                Configuration Preview
              </p>

              <p className="mt-1 text-[11px] leading-5 text-[#667085]">
                These controls currently represent the administrative
                configuration interface. Persistent system settings will be
                connected to the backend during API integration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function NotificationSettings({ settings, updateSetting }) {
  return (
    <>
      <SectionHeader
        eyebrow="Alert Management"
        title="Notification Settings"
        description="Configure which operational events should generate administrative alerts."
      />

      <div className="min-h-0 flex-1 overflow-auto p-5">
        <SettingsSection
          title="Operational Alerts"
          description="Choose the events that require attention from barangay personnel."
        >
          <div className="space-y-3">
            <ToggleRow
              label="Critical Incident Alerts"
              description="Receive alerts when a report is classified as Critical priority."
              enabled={settings.criticalAlerts}
              onChange={(value) => updateSetting("criticalAlerts", value)}
              accent="critical"
            />

            <ToggleRow
              label="Personnel Assignment Alerts"
              description="Receive notifications when personnel or response teams are assigned to a report."
              enabled={settings.assignmentAlerts}
              onChange={(value) => updateSetting("assignmentAlerts", value)}
            />

            <ToggleRow
              label="Announcement Alerts"
              description="Receive notifications when an announcement is published or scheduled."
              enabled={settings.announcementAlerts}
              onChange={(value) => updateSetting("announcementAlerts", value)}
            />
          </div>
        </SettingsSection>

        <div className="mt-4 rounded-xl border border-[#FDE2E2] bg-[#FFF8F8] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FEECEC] text-[#EF4444]">
              <AlertIcon />
            </div>

            <div>
              <p className="text-xs font-bold text-[#7F1D1D]">
                Emergency Alert Notice
              </p>

              <p className="mt-1 text-[11px] leading-5 text-[#667085]">
                Critical incident notifications are intended for operational
                awareness and should not replace established barangay emergency
                communication procedures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function RolesSettings({ personnel, selectedPersonnel, setSelectedPersonnel }) {
  return (
    <>
      <SectionHeader
        eyebrow="Access Control"
        title="Roles & Access"
        description="Review personnel accounts and their current administrative access."
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.7fr)]">
        {/* PERSONNEL LIST */}
        <div className="min-h-0 overflow-auto border-b border-[#E4E7EC] xl:border-b-0 xl:border-r">
          <div className="sticky top-0 z-10 border-b border-[#E4E7EC] bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#344054]">
                  Personnel Accounts
                </p>

                <p className="mt-0.5 text-[10px] text-[#98A2B3]">
                  {personnel.length} authorized personnel
                </p>
              </div>

              <span className="rounded-full bg-[#E8F8F4] px-2.5 py-1 text-[10px] font-bold text-[#008F78]">
                Access Controlled
              </span>
            </div>
          </div>

          <div className="p-3">
            <div className="space-y-2">
              {personnel.map((person) => {
                const isSelected = selectedPersonnel?.id === person.id;

                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => setSelectedPersonnel(person)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? "border-[#D9C8FF] bg-[#F7F3FF]"
                        : "border-[#E4E7EC] bg-white hover:bg-[#FCFCFD]"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-[10px] font-extrabold text-[#6D28D9]">
                      {getInitials(person.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-[#344054]">
                        {person.name}
                      </p>

                      <p className="truncate text-[10px] text-[#98A2B3]">
                        {person.role}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-[#E8F8F4] px-2 py-1 text-[9px] font-bold text-[#008F78]">
                      {person.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* PERSONNEL DETAILS */}
        <div className="min-h-0 overflow-auto p-4">
          {selectedPersonnel && (
            <>
              <div className="rounded-xl border border-[#E4E7EC] bg-[#FCFCFD] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#8346F2] text-sm font-extrabold text-white">
                    {getInitials(selectedPersonnel.name)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-[#1F1D47]">
                      {selectedPersonnel.name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-[#667085]">
                      {selectedPersonnel.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <DetailRow label="Role" value={selectedPersonnel.role} />

                <DetailRow
                  label="Response Team"
                  value={selectedPersonnel.team}
                />

                <DetailRow
                  label="Account Status"
                  value={selectedPersonnel.status}
                />

                <DetailRow
                  label="Access Level"
                  value={selectedPersonnel.access}
                />
              </div>

              <div className="mt-4 rounded-xl border border-[#E4E7EC] bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#98A2B3]">
                  Current Permissions
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <PermissionBadge label="View Reports" />
                  <PermissionBadge label="Verify Reports" />
                  <PermissionBadge label="Prioritize Reports" />
                  <PermissionBadge label="Assign Personnel" />
                  <PermissionBadge label="Update Status" />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#E4E7EC] bg-[#F9F7FF] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDE9FE] text-[#8346F2]">
                    <ShieldIcon />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#1F1D47]">
                      Role-Based Access
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-[#667085]">
                      Access permissions are currently displayed as a
                      configuration preview. Actual authorization will be
                      enforced by the backend authentication and role system.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="shrink-0 border-b border-[#E4E7EC] px-5 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8346F2]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-lg font-extrabold text-[#1F1D47]">{title}</h2>

      <p className="mt-1 text-xs text-[#667085]">{description}</p>
    </div>
  );
}

function SettingsSection({ title, description, children }) {
  return (
    <div className="rounded-xl border border-[#E4E7EC] bg-white p-4">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[#344054]">{title}</h3>

        <p className="mt-0.5 text-[11px] text-[#98A2B3]">{description}</p>
      </div>

      {children}
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold text-[#475467]">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-[#E4E7EC] bg-[#FCFCFD] px-3 text-xs font-medium text-[#344054] outline-none transition focus:border-[#8346F2] focus:ring-2 focus:ring-[#8346F2]/10"
      />
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
  accent = "default",
}) {
  const activeColor = accent === "critical" ? "bg-[#EF4444]" : "bg-[#8346F2]";

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E4E7EC] bg-[#FCFCFD] p-3.5">
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#344054]">{label}</p>

        <p className="mt-0.5 max-w-2xl text-[10px] leading-4 text-[#98A2B3]">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? activeColor : "bg-[#D0D5DD]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#F0F1F3] py-2.5 last:border-b-0">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-[#98A2B3]">
        {label}
      </span>

      <span className="text-right text-xs font-semibold text-[#344054]">
        {value}
      </span>
    </div>
  );
}

function PermissionBadge({ label }) {
  return (
    <span className="rounded-full bg-[#F0EBFF] px-2.5 py-1 text-[10px] font-semibold text-[#6D28D9]">
      {label}
    </span>
  );
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SettingsIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.46 15a1.7 1.7 0 0 0-1.56-1.03H6.7v-2.4h.2a1.7 1.7 0 0 0 1.56-1.03 1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56V5.5h2.4v.2a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.2v2.4h-.2A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 3 5 6v5c0 4.5 2.9 8.4 7 10 4.1-1.6 7-5.5 7-10V6z" />
      <path d="m9.5 12 1.7 1.7 3.5-3.5" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <path d="M12 7h.01" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 3 2.8 19h18.4z" />
      <path d="M12 9v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export default SettingsRoles;
