import { useState } from "react";

import AdminLogin from "./auth/AdminLogin";

import AdminLayout from "./components/layout/AdminLayout";

import Dashboard from "./pages/dashboard/Dashboard";

import AuditLogs from "./pages/audit-logs/AuditLogs";

import SettingsRoles from "./pages/settings/SettingsRoles";

import ManualAddReport from "./pages/manual-report/ManualAddReport";

import AnnouncementsPage from "./pages/announcements/AnnouncementsPage";

import IncidentMap from "./pages/map/IncidentMap";

import AllReports from "./pages/all-reports/AllReports";

import LiveUpdates from "./pages/live-updates/LiveUpdates";

import Verification from "./pages/verification/Verification";

import ReportDetails from "./pages/report-details/ReportDetails";

import Prioritization from "./pages/prioritization/Prioritization";

import ResidentsPage from "./pages/residents/ResidentsPage";

import PersonnelPage from "./pages/personnel/PersonnelPage";

import LanguageProvider from "./context/LanguageProvider";

import { ROLES, hasPermission } from "./data/roles";

function App() {
  /* =========================
     AUTHENTICATION
  ========================= */

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("resqnow_admin_session") === "true";
  });

  /* =========================
     NAVIGATION
  ========================= */
  /* =========================
   NAVIGATION / RBAC
========================= */

  const [activePage, setActivePage] = useState("dashboard");

  const [currentUser] = useState({
    id: "ADM-2026-001",
    name: "Administrator",
    role: ROLES.ADMIN,
  });

  const can = (permission) => {
    return hasPermission(currentUser.role, permission);
  };
  const [selectedReport, setSelectedReport] = useState(null);

  const [selectedResident, setSelectedResident] = useState(null);

  /* =========================
     SHARED REPORT DATA
  ========================= */

  const [reportUpdates, setReportUpdates] = useState({});

  /* =========================
     AUDIT LOGS
  ========================= */

  const [auditLogs, setAuditLogs] = useState([]);

  /* =========================
     GLOBAL SYSTEM SETTINGS
  ========================= */
  const [systemSettings, setSystemSettings] = useState({
    systemName: "ResQNow",
    barangayName: "Barangay Camunatan",
    cityName: "City of Ilagan",
    language: "English",
    notifications: true,
    criticalAlerts: true,
    assignmentAlerts: true,
    announcementAlerts: true,
    autoRefresh: true,
  });
  /* ========================= ()
     AUTHENTICATION HANDLERS
  ========================= */

  const handleLogin = (adminData) => {
    sessionStorage.setItem("resqnow_admin_session", "true");

    sessionStorage.setItem("resqnow_admin_user", JSON.stringify(adminData));

    setIsAuthenticated(true);

    setActivePage("dashboard");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("resqnow_admin_session");

    sessionStorage.removeItem("resqnow_admin_user");

    setIsAuthenticated(false);

    setActivePage("dashboard");

    setSelectedReport(null);

    setSelectedResident(null);
  };

  /* =========================
     NAVIGATION
  ========================= */

  const handleNavigate = (pageId) => {
    if (pageId !== "all-reports") {
      setSelectedResident(null);
    }

    setActivePage(pageId);
  };

  /* =========================
     REPORT SELECTION
  ========================= */

  const handleOpenReport = (report) => {
    const latestReport = {
      ...report,
      ...(reportUpdates[report.id] || {}),
    };

    setSelectedReport(latestReport);

    setActivePage("report-details");
  };

  /* =========================
     RESIDENT REPORTS
  ========================= */

  const handleViewResidentReports = (resident) => {
    setSelectedResident(resident);

    setActivePage("all-reports");
  };

  /* =========================
     SHARED REPORT UPDATE
  ========================= */

  const handleReportUpdate = (updatedReport) => {
    if (!updatedReport?.id) return;

    setReportUpdates((currentUpdates) => {
      const existingUpdate = currentUpdates[updatedReport.id] || {};

      return {
        ...currentUpdates,

        [updatedReport.id]: {
          ...existingUpdate,
          ...updatedReport,
        },
      };
    });

    /* Keep selected report synchronized */

    setSelectedReport((currentReport) => {
      if (!currentReport || currentReport.id !== updatedReport.id) {
        return currentReport;
      }

      return {
        ...currentReport,
        ...updatedReport,
      };
    });
  };

  /* =========================
     AUDIT LOG MANAGEMENT
  ========================= */

  const addAuditLog = ({
    action,

    category = "Report Action",

    target,

    field,

    oldValue,

    newValue,

    remarks = "",

    status = "Success",
  }) => {
    const adminData = JSON.parse(
      sessionStorage.getItem("resqnow_admin_user") || "{}",
    );

    const uniqueId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newLog = {
      id: `LOG-${uniqueId}`,

      action,

      category,

      target,

      field: field || "—",

      oldValue:
        oldValue === undefined || oldValue === null || oldValue === ""
          ? "—"
          : String(oldValue),

      newValue:
        newValue === undefined || newValue === null || newValue === ""
          ? "—"
          : String(newValue),

      remarks: remarks || "No remarks provided.",

      user: adminData.username || adminData.name || "Administrator",

      role: adminData.role || "Barangay Administrator",

      dateTime: new Date().toISOString(),

      status,
    };

    setAuditLogs((currentLogs) => [newLog, ...currentLogs]);
  };

  /* =========================
     GLOBAL SETTINGS UPDATE
  ========================= */

  const handleSettingsUpdate = (updatedSettings, changes = []) => {
    setSystemSettings(updatedSettings);

    /*
      Record every changed setting
      in the Audit Logs.
    */

    changes.forEach((change) => {
      addAuditLog({
        action: change.action || "System Setting Updated",

        category: "System Action",

        target: "SYSTEM-SETTINGS",

        field: change.field,

        oldValue: change.oldValue,

        newValue: change.newValue,

        remarks: change.remarks || "System setting was updated.",
      });
    });
  };

  /* =========================
     PAGE RENDERING
  ========================= */

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            onOpenReport={handleOpenReport}
            onNavigate={handleNavigate}
            reportUpdates={reportUpdates}
          />
        );

      case "all-reports":
        return (
          <AllReports
            onOpenReport={handleOpenReport}
            selectedResident={selectedResident}
            reportUpdates={reportUpdates}
          />
        );

      case "verification":
        return (
          <Verification
            reportUpdates={reportUpdates}
            onVerificationUpdate={handleReportUpdate}
            onAddAuditLog={addAuditLog}
            onNavigate={handleNavigate}
          />
        );

      case "prioritization":
        return (
          <Prioritization
            reportUpdates={reportUpdates}
            onPriorityUpdate={handleReportUpdate}
            onAddAuditLog={addAuditLog}
            onNavigate={handleNavigate}
            onOpenReport={handleOpenReport}
          />
        );

      case "map":
        return <IncidentMap />;

      case "live-updates":
        return <LiveUpdates onBack={() => handleNavigate("dashboard")} />;

      case "residents":
        return (
          <ResidentsPage onViewResidentReports={handleViewResidentReports} />
        );

      case "personnel":
        return (
          <PersonnelPage
            onOpenReport={handleOpenReport}
            reportUpdates={reportUpdates}
          />
        );

      case "announcements":
        return <AnnouncementsPage onAddAuditLog={addAuditLog} />;

      case "audit-logs":
        return <AuditLogs logs={auditLogs} />;

      case "settings":
        return (
          <SettingsRoles
            systemSettings={systemSettings}
            onSettingsUpdate={handleSettingsUpdate}
            onAddAuditLog={addAuditLog}
          />
        );

      case "manual-report":
        return <ManualAddReport />;

      case "report-details":
        return (
          <ReportDetails
            key={selectedReport?.id}
            report={selectedReport}
            onBack={() => handleNavigate("all-reports")}
            onReportUpdate={handleReportUpdate}
            onAddAuditLog={addAuditLog}
          />
        );

      default:
        return (
          <div className="flex min-h-full items-center justify-center">
            <div className="rounded-2xl border border-[#E4E7EC] bg-white px-8 py-10 text-center shadow-sm">
              <p className="text-sm font-semibold text-[#8346F2]">
                ResQNow Web Admin
              </p>

              <h1 className="mt-2 text-2xl font-extrabold text-[#1F1D47]">
                Module Not Implemented Yet
              </h1>

              <p className="mt-2 text-sm text-[#667085]">
                This module will be implemented in a future phase.
              </p>
            </div>
          </div>
        );
    }
  };

  /* =========================
     LOGIN SCREEN
  ========================= */

  if (!isAuthenticated) {
    return (
      <LanguageProvider language={systemSettings?.language || "English"}>
        <AdminLogin onLogin={handleLogin} />
      </LanguageProvider>
    );
  }

  /* =========================
     ADMIN SYSTEM
  ========================= */

  return (
    <LanguageProvider language={systemSettings.language}>
      <AdminLayout
        activePage={activePage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onAddManualReport={() => handleNavigate("manual-report")}
        currentUser={currentUser}
        can={can}
      >
        {renderPage()}
      </AdminLayout>
    </LanguageProvider>
  );
}

export default App;
