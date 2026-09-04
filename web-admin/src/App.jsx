import { useState } from "react";

import AdminLogin from "../auth/AdminLogin";
import AdminDashboard from "../dashboard/AdminDashboard";
import AllReports from "../all-reports/AllReports.jsx";
import ReportDetails from "../report-details/ReportDetails.jsx";
import ManualAddReport from "../manual-report/ManualAddReport.jsx";
import ResidentsPage from "../residents/ResidentsPage.jsx";
import ResidentDetails from "../residents/ResidentDetails.jsx";
import AuditLogs from "../action-logs/AuditLogs.jsx";
import SettingsRoles from "../settings-roles/SettingsRoles.jsx";
import Announcements from "../announcements/Announcements.jsx";

import {
  adminReports as initialReports,
  residents as initialResidents,
} from "../data/sampleAdminData";

function App() {
  const [admin, setAdmin] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [reports, setReports] = useState(initialReports);
  const [actionLogs, setActionLogs] = useState([]);
  const [residents, setResidents] = useState(initialResidents);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);

  // Update an existing report
  const updateReport = (updatedReport) => {
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.report_id === updatedReport.report_id ? updatedReport : report,
      ),
    );

    setSelectedReport(updatedReport);
  };

  // Create a new report
  const handleCreateReport = (newReport) => {
    setReports((currentReports) => [...currentReports, newReport]);
    setPage("reports");
  };

  const updateResident = (updatedResident) => {
    setResidents((currentResidents) =>
      currentResidents.map((resident) =>
        resident.resident_id === updatedResident.resident_id
          ? updatedResident
          : resident,
      ),
    );

    setSelectedResident(updatedResident);
  };

  // Add an action log entry
  const handleAddLog = (logEntry) => {
    setActionLogs((currentLogs) => [logEntry, ...currentLogs]);
  };

  // Update logged-in admin information
  const handleUpdateAdmin = (updatedFields) => {
    setAdmin((currentAdmin) => ({
      ...currentAdmin,
      ...updatedFields,
    }));
  };

  // Login
  if (!admin) {
    return <AdminLogin onLogin={setAdmin} />;
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "reports", label: "All Reports" },
    { id: "manual-report", label: "Manual Add Report" },
    { id: "residents", label: "Residents" },
    { id: "settings-roles", label: "Settings & Roles" },
    { id: "audit-logs", label: "Audit Logs" },
    { id: "announcements", label: "Announcements" },
  ];

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setPage("report-details");
  };

  const handleViewResident = (resident) => {
    setSelectedResident(resident);
    setPage("resident-details");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Persistent Admin Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage("dashboard")}
              className="text-left"
            >
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                ResQNow
              </h1>

              <p className="text-sm text-slate-500">
                Barangay Web Admin System
              </p>
            </button>

            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                {admin?.full_name || "Barangay Admin"}
              </p>

              <p className="text-xs text-slate-500">
                {admin?.role || "super_admin"}
              </p>
            </div>
          </div>

          {/* Persistent Navigation */}
          <nav className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
            {navigationItems.map((item) => {
              const isActive = page === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPage(item.id)}
                  className={
                    isActive
                      ? "rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                      : "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <div>
        {page === "dashboard" && (
          <AdminDashboard
            admin={admin}
            reports={reports}
            onViewAllReports={() => setPage("reports")}
            onViewReport={handleViewReport}
            onNavigate={setPage}
          />
        )}

        {page === "reports" && (
          <AllReports reports={reports} onViewReport={handleViewReport} />
        )}

        {page === "report-details" && (
          <ReportDetails
            admin={admin}
            report={selectedReport}
            onBack={() => setPage("reports")}
            onUpdateReport={updateReport}
            onAddLog={handleAddLog}
          />
        )}

        {page === "manual-report" && (
          <ManualAddReport
            admin={admin}
            onBack={() => setPage("dashboard")}
            onCreateReport={handleCreateReport}
            onAddLog={handleAddLog}
          />
        )}

        {page === "residents" && (
          <ResidentsPage
            admin={admin}
            residents={residents}
            reports={reports}
            onBack={() => setPage("dashboard")}
            onViewResident={handleViewResident}
          />
        )}

        {page === "resident-details" && (
          <ResidentDetails
            admin={admin}
            resident={selectedResident}
            reports={reports}
            onBack={() => setPage("residents")}
            onUpdateResident={updateResident}
            onAddLog={handleAddLog}
            onViewReport={handleViewReport}
          />
        )}

        {page === "audit-logs" && <AuditLogs logs={actionLogs} />}

        {page === "settings-roles" && (
          <SettingsRoles
            admin={admin}
            onBack={() => setPage("dashboard")}
            onUpdateAdmin={handleUpdateAdmin}
            onAddLog={handleAddLog}
          />
        )}

        {page === "announcements" && (
          <Announcements
            admin={admin}
            onBack={() => setPage("dashboard")}
            onAddLog={handleAddLog}
          />
        )}
      </div>
    </div>
  );
}

export default App;
