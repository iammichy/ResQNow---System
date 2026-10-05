import { lazy, Suspense, useEffect, useState } from "react";


import AdminLayout from "./components/layout/AdminLayout";














import LanguageProvider from "./context/LanguageProvider";

import { ROLES, hasPermission, normalizeRole } from "./data/roles";

import { createAuditLog, getAllAuditLogs } from "./services/reportsService";

import {
  getCurrentUser,
  getStoredUser,
  isAuthenticated as hasAuthToken,
  logout as logoutUser,
} from "./services/authService";

const AdminLogin = lazy(
  () => import("./auth/AdminLogin"),
);

const Dashboard = lazy(
  () => import("./pages/dashboard/Dashboard"),
);

const AuditLogs = lazy(
  () => import("./pages/audit-logs/AuditLogs"),
);

const SettingsRoles = lazy(
  () => import("./pages/settings/SettingsRoles"),
);

const ManualAddReport = lazy(
  () => import("./pages/manual-report/ManualAddReport"),
);

const AnnouncementsPage = lazy(
  () => import("./pages/announcements/AnnouncementsPage"),
);

const IncidentMap = lazy(
  () => import("./pages/map/IncidentMap"),
);

const AllReports = lazy(
  () => import("./pages/all-reports/AllReports"),
);

const LiveUpdates = lazy(
  () => import("./pages/live-updates/LiveUpdates"),
);

const Verification = lazy(
  () => import("./pages/verification/Verification"),
);

const ReportDetails = lazy(
  () => import("./pages/report-details/ReportDetails"),
);

const Prioritization = lazy(
  () => import("./pages/prioritization/Prioritization"),
);

const ResidentsPage = lazy(
  () => import("./pages/residents/ResidentsPage"),
);

const PersonnelPage = lazy(
  () => import("./pages/personnel/PersonnelPage"),
);

function AdminLoadingFallback() {
  return (
    <div className="flex min-h-[220px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#D0D5DD] border-t-[#1F5FA6]" />

        <p className="mt-3 text-sm font-semibold text-[#667085]">
          Loading ResQNow...
        </p>
      </div>
    </div>
  );
}

function App() {
  /* =========================
     AUTHENTICATION
  ========================= */

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return hasAuthToken();
  });

  const [currentUser, setCurrentUser] = useState(() => {
    return getStoredUser();
  });

  /* =========================
     NAVIGATION / RBAC
  ========================= */

  const [activePage, setActivePage] = useState(() => {
    // RESTORE ADMIN WORKSPACE
    try {
      return (
        sessionStorage.getItem(
          "resqnow-admin-active-page",
        ) || "dashboard"
      );
    } catch {
      return "dashboard";
    }
  });
  const can = (permission) => {
    if (!currentUser) {
      return false;
    }

    return hasPermission(currentUser.role, permission);
  };

  const [selectedReport, setSelectedReport] = useState(() => {
    // RESTORE SELECTED ADMIN REPORT
    try {
      const savedReport =
        sessionStorage.getItem(
          "resqnow-admin-selected-report",
        );

      return savedReport
        ? JSON.parse(savedReport)
        : null;
    } catch {
      return null;
    }
  });

  const [selectedResident, setSelectedResident] = useState(null);

  // PERSIST ADMIN WORKSPACE
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "resqnow-admin-active-page",
        activePage,
      );

      if (selectedReport) {
        sessionStorage.setItem(
          "resqnow-admin-selected-report",
          JSON.stringify(selectedReport),
        );
      } else {
        sessionStorage.removeItem(
          "resqnow-admin-selected-report",
        );
      }
    } catch {
      // Storage failure must not interrupt Admin work.
    }
  }, [
    activePage,
    selectedReport,
  ]);

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

  /* =========================
     AUTHENTICATION HANDLERS
  ========================= */

  const handleLogin = (user) => {
    const normalizedUser = {
      ...user,
      id: user.id, // Explicitly map user_id for A04 personnel assignments
      role: normalizeRole(user.role),
    };
    
    setCurrentUser(normalizedUser);
    setIsAuthenticated(true);
    setActivePage("dashboard");
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setCurrentUser(null);

      setIsAuthenticated(false);

      setActivePage("dashboard");

      // CLEAR ADMIN WORKSPACE
      try {
        sessionStorage.removeItem(
          "resqnow-admin-active-page",
        );

        sessionStorage.removeItem(
          "resqnow-admin-selected-report",
        );
      } catch {
        // Ignore browser-storage cleanup failure.
      }

      setSelectedReport(null);

      setSelectedResident(null);
    }
  };
  /* =========================
   VERIFY AUTHENTICATION
========================= */

  useEffect(() => {
    const verifyAuthentication = async () => {
      if (!hasAuthToken()) {
        return;
      }

      try {
        const user = await getCurrentUser();

        const normalizedUser = {
          ...user,
          role: normalizeRole(user.role),
        };

        /*
         * The Web Admin is limited to defined operational roles.
         */
        if (!Object.values(ROLES).includes(normalizedUser.role)) {
          localStorage.removeItem("resqnow_token");
          localStorage.removeItem("resqnow_user");

          sessionStorage.removeItem("resqnow_token");
          sessionStorage.removeItem("resqnow_user");

          setCurrentUser(null);
          setIsAuthenticated(false);

          return;
        }

        setCurrentUser(normalizedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error(
          "Authentication verification failed:",
          error,
        );

        /*
         * PRESERVE AUTH ON TRANSIENT VERIFICATION FAILURE
         *
         * apiClient already removes the current token when the
         * backend genuinely returns 401. Network errors and
         * temporary server errors must not behave like Logout.
         */
        if (!hasAuthToken()) {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      }
    };

    verifyAuthentication();
  }, []);

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

    // SAVE REPORT BEFORE NAVIGATION
    try {
      sessionStorage.setItem(
        "resqnow-admin-selected-report",
        JSON.stringify(latestReport),
      );

      sessionStorage.setItem(
        "resqnow-admin-active-page",
        "report-details",
      );
    } catch {
      // Continue with in-memory navigation.
    }

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
     LOAD AUDIT LOGS
  ========================= */

  useEffect(() => {
    // DEFER GLOBAL AUDIT LOGS
    // Fetch the complete audit collection only when Admin
    // actually opens the Audit Logs page.
    if (activePage !== "audit-logs") {
      return undefined;
    }
    const loadAuditLogs = async () => {
      try {
        const data = await getAllAuditLogs();

        const formattedLogs = data.map((log) => ({
          id: `LOG-${log.id}`,

          action: log.action,

          category: log.category,

          target: log.target || "—",

          field: log.field || "—",

          oldValue:
            log.old_value === null ||
            log.old_value === undefined ||
            log.old_value === ""
              ? "—"
              : String(log.old_value),

          newValue:
            log.new_value === null ||
            log.new_value === undefined ||
            log.new_value === ""
              ? "—"
              : String(log.new_value),

          remarks: log.remarks || "No remarks provided.",

          user: log.user_name || "Administrator",

          role: log.user_role || "Barangay Administrator",

          dateTime: log.created_at,

          status: log.status || "Success",
        }));

        setAuditLogs(formattedLogs);
      } catch (error) {
        console.error("Failed to load audit logs:", error);
      }
    };

    if (isAuthenticated) {
      loadAuditLogs();
    }
  }, [activePage]);  /* =========================
     AUDIT LOG MANAGEMENT
  ========================= */

  const addAuditLog = async ({
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

    const auditLogData = {
      action,
      category,
      target: target || null,
      field: field || null,

      old_value:
        oldValue === undefined || oldValue === null || oldValue === ""
          ? null
          : String(oldValue),

      new_value:
        newValue === undefined || newValue === null || newValue === ""
          ? null
          : String(newValue),

      remarks: remarks || null,

      user_name: adminData.username || adminData.name || "Administrator",

      user_role: adminData.role || "Barangay Administrator",

      status,
    };

    try {
      const result = await createAuditLog(auditLogData);

      const savedLog = result.data;

      const newLog = {
        id: `LOG-${savedLog.id}`,

        action: savedLog.action,

        category: savedLog.category,

        target: savedLog.target || "—",

        field: savedLog.field || "—",

        oldValue:
          savedLog.old_value === null ||
          savedLog.old_value === undefined ||
          savedLog.old_value === ""
            ? "—"
            : String(savedLog.old_value),

        newValue:
          savedLog.new_value === null ||
          savedLog.new_value === undefined ||
          savedLog.new_value === ""
            ? "—"
            : String(savedLog.new_value),

        remarks: savedLog.remarks || "No remarks provided.",

        user: savedLog.user_name || "Administrator",

        role: savedLog.user_role || "Barangay Administrator",

        dateTime: savedLog.created_at || new Date().toISOString(),

        status: savedLog.status || "Success",
      };

      setAuditLogs((currentLogs) => [newLog, ...currentLogs]);
    } catch (error) {
      console.error("Failed to create audit log:", error);
    }
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
            autoRefresh={systemSettings.autoRefresh}
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
        return <IncidentMap autoRefresh={systemSettings.autoRefresh} />;

      case "live-updates":
        return (
          <LiveUpdates
            onBack={() => handleNavigate("dashboard")}
            autoRefresh={systemSettings.autoRefresh}
          />
        );

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
        /*
         * Defensive fallback:
         * an unknown or stale page key must never expose an
         * unfinished screen during Admin operations.
         */
        return (
          <Dashboard
            onOpenReport={handleOpenReport}
            onNavigate={handleNavigate}
            reportUpdates={reportUpdates}
            autoRefresh={systemSettings.autoRefresh}
          />
        );
    }
  };

  /* =========================
     LOGIN SCREEN
  ========================= */

  if (!isAuthenticated) {
    return (
      <LanguageProvider language={systemSettings?.language || "English"}>
        <Suspense fallback={<AdminLoadingFallback />}>
          <AdminLogin onLogin={handleLogin} />
        </Suspense>
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
        systemSettings={systemSettings}
      >
        <Suspense fallback={<AdminLoadingFallback />}>
          {renderPage()}
        </Suspense>
      </AdminLayout>
    </LanguageProvider>
  );
}

export default App;
