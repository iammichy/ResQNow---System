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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("resqnow_admin_session") === "true";
  });

  const [activePage, setActivePage] = useState("dashboard");
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);

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
  };

  const handleNavigate = (pageId) => {
    if (pageId !== "all-reports") {
      setSelectedResident(null);
    }

    setActivePage(pageId);
  };

  const handleOpenReport = (report) => {
    setSelectedReport(report);
    setActivePage("report-details");
  };

  const handleViewResidentReports = (resident) => {
    setSelectedResident(resident);
    setActivePage("all-reports");
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            onOpenReport={handleOpenReport}
            onNavigate={handleNavigate}
          />
        );

      case "all-reports":
        return (
          <AllReports
            onOpenReport={handleOpenReport}
            onNavigate={handleNavigate}
            selectedResident={selectedResident}
          />
        );

      case "verification":
        return <Verification />;

      case "prioritization":
        return <Prioritization />;

      case "map":
        return <IncidentMap />;

      case "live-updates":
  return (
    <LiveUpdates
      onBack={() => handleNavigate("dashboard")}
    />
  );

      case "residents":
        return (
          <ResidentsPage onViewResidentReports={handleViewResidentReports} />
        );

      case "personnel":
        return <PersonnelPage />;

      case "announcements":
        return <AnnouncementsPage />;

      case "audit-logs":
        return <AuditLogs />;

      case "settings":
        return <SettingsRoles />;

      case "manual-report":
        return <ManualAddReport />;

      case "report-details":
        return (
          <ReportDetails
            report={selectedReport}
            onBack={() => handleNavigate("all-reports")}
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

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <AdminLayout
      activePage={activePage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      onAddManualReport={() => handleNavigate("manual-report")}
    >
      {renderPage()}
    </AdminLayout>
  );
}

export default App;
