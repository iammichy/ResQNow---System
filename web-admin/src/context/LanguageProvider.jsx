import { useMemo } from "react";

import { LanguageContext } from "./LanguageContext.jsx";

const translations = {
  English: {
    /* =========================
       NAVIGATION GROUPS
    ========================= */

    overview: "OVERVIEW",
    operations: "OPERATIONS",
    management: "MANAGEMENT",
    system: "SYSTEM",

    /* =========================
       NAVIGATION
    ========================= */

    dashboard: "Dashboard",
    allReports: "All Reports",
    reports: "Reports",
    verification: "Verification",
    prioritization: "Prioritization",
    incidentMap: "Incident Map",
    residents: "Residents",
    personnel: "Personnel",
    announcements: "Announcements",
    auditLogs: "Audit Logs",
    settingsRoles: "Settings & Roles",
    settings: "Settings",

    /* =========================
       SIDEBAR
    ========================= */

    barangayWebAdmin: "Barangay Web Admin",
    addManualReport: "Add Manual Report",
    signOut: "Sign Out",
    allSystemsOperational: "All systems operational",
    lastSync: "Last sync",
    currentAccess: "Current Access",

    /* =========================
       GENERAL ACTIONS
    ========================= */

    logout: "Logout",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    search: "Search",
    close: "Close",
    confirm: "Confirm",
    back: "Back",

    /* =========================
       TOPBAR SEARCH
    ========================= */

    searchReportsResidentsLocations:
      "Search reports, residents, or locations...",

    clearSearch: "Clear search",

    /* =========================
       NOTIFICATIONS
    ========================= */

    notifications: "Notifications",

    latestSystemActivity: "Latest system activity",

    new: "new",

    viewAllNotifications: "View all notifications",

    administrator: "Administrator",

    barangayPersonnel: "Barangay Personnel",

    evacuationAlertIssued: "Evacuation alert issued",

    evacuationAlertMessage:
      "Building A and surrounding areas require attention.",

    newReportPendingVerification:
      "New report pending verification",

    hazardReportWaiting:
      "A hazard report is waiting for personnel review.",

    medicalSupportAssigned:
      "Medical support assigned",

    responsePersonnelAssigned:
      "Response personnel have been assigned to the incident.",

    justNow: "Just now",

    tenMinutesAgo: "10 min ago",

    twentyFiveMinutesAgo: "25 min ago",

    /* =========================
       AUDIT LOGS
    ========================= */

    activityHistory: "Activity History",

    activityInformation: "Activity Information",

    searchActivities: "Search activities...",

    allCategories: "All Categories",
  },

  Filipino: {
    /* =========================
       NAVIGATION GROUPS
    ========================= */

    overview: "PANGKALAHATAN",
    operations: "OPERASYON",
    management: "PAMAMAHALA",
    system: "SISTEMA",

    /* =========================
       NAVIGATION
    ========================= */

    dashboard: "Dashboard",
    allReports: "Lahat ng Ulat",
    reports: "Mga Ulat",
    verification: "Beripikasyon",
    prioritization: "Pagbibigay ng Prayoridad",
    incidentMap: "Mapa ng mga Insidente",
    residents: "Mga Residente",
    personnel: "Mga Tauhan",
    announcements: "Mga Anunsyo",
    auditLogs: "Talaan ng Aktibidad",
    settingsRoles: "Mga Setting at Tungkulin",
    settings: "Mga Setting",

    /* =========================
       SIDEBAR
    ========================= */

    barangayWebAdmin: "Web Admin ng Barangay",

    addManualReport:
      "Magdagdag ng Manu-manong Ulat",

    signOut: "Mag-sign Out",

    allSystemsOperational:
      "Maayos ang lahat ng sistema",

    lastSync: "Huling pag-sync",

    currentAccess: "Kasalukuyang Access",

    /* =========================
       GENERAL ACTIONS
    ========================= */

    logout: "Mag-logout",
    save: "I-save",
    cancel: "Kanselahin",
    edit: "I-edit",
    delete: "Tanggalin",
    view: "Tingnan",
    search: "Maghanap",
    close: "Isara",
    confirm: "Kumpirmahin",
    back: "Bumalik",

    /* =========================
       TOPBAR SEARCH
    ========================= */

    searchReportsResidentsLocations:
      "Maghanap ng mga ulat, residente, o lokasyon...",

    clearSearch: "I-clear ang paghahanap",

    /* =========================
       NOTIFICATIONS
    ========================= */

    notifications: "Mga Abiso",

    latestSystemActivity:
      "Pinakabagong aktibidad ng sistema",

    new: "bago",

    viewAllNotifications:
      "Tingnan ang lahat ng abiso",

    administrator: "Administrador",

    barangayPersonnel:
      "Tauhan ng Barangay",

    evacuationAlertIssued:
      "Naglabas ng abiso para sa paglikas",

    evacuationAlertMessage:
      "Ang Building A at mga kalapit na lugar ay nangangailangan ng agarang pansin.",

    newReportPendingVerification:
      "May bagong ulat na naghihintay ng beripikasyon",

    hazardReportWaiting:
      "May hazard report na naghihintay para sa pagsusuri ng mga tauhan.",

    medicalSupportAssigned:
      "Naitalaga ang medical support",

    responsePersonnelAssigned:
      "Naitalaga na ang response personnel sa insidente.",

    justNow: "Ngayon lang",

    tenMinutesAgo:
      "10 minuto ang nakalipas",

    twentyFiveMinutesAgo:
      "25 minuto ang nakalipas",

    /* =========================
       AUDIT LOGS
    ========================= */

    activityHistory:
      "Kasaysayan ng Aktibidad",

    activityInformation:
      "Impormasyon ng Aktibidad",

    searchActivities:
      "Maghanap ng aktibidad...",

    allCategories:
      "Lahat ng Kategorya",
  },
};

export default function LanguageProvider({
  language = "English",
  children,
}) {
  const value = useMemo(() => {
    const currentLanguage = translations[language]
      ? language
      : "English";

    return {
      language: currentLanguage,

      t: (key) =>
        translations[currentLanguage][key] || key,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}