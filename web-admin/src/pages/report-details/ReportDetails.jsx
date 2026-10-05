import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getAllIncidents,
  getAllPersonnel,
  getAllAuditLogs,
  assignIncidentPersonnel,
  updateIncidentStatus,

  createIncidentFromReport,
  verifyReport,
  returnReportForReview,
  assignReportPriority,
} from "../../services/reportsService";

import {
  getReportCategoryLabel,
  getReportDisplayTitle,
  getSosReasonLabel,
} from "../../utils/reportDisplay";
import IncidentLocationCard from "../../components/IncidentLocationCard";

const priorityStyles = {
  Critical: "border-[#FECDCA] bg-[#FEF3F2] text-[#D92D20]",
  High: "border-[#FEDF89] bg-[#FFF4E5] text-[#B54708]",
  Moderate: "border-[#FDE68A] bg-[#FFFAEB] text-[#A15C00]",
  Low: "border-[#E4E7EC] bg-[#F2F4F7] text-[#667085]",
};

const statusStyles = {
  "For Verification": "bg-[#FFF7ED] text-[#B54708]",
  "For Prioritization": "bg-[#EFF8FF] text-[#175CD3]",
  Prioritized: "bg-[#ECFDF3] text-[#027A48]",
  "Pending Response": "bg-[#EAF1FA] text-[#174A86]",
  Dispatched: "bg-[#EEF4FF] text-[#174A86]",
  "In Progress": "bg-[#EEF4FF] text-[#174A86]",
  "Responders En Route": "bg-[#FFF7ED] text-[#B54708]",
  Responded: "bg-[#ECFDF3] text-[#027A48]",
  Resolved: "bg-[#ECFDF3] text-[#027A48]",
  Closed: "bg-[#F2F4F7] text-[#475467]",
};

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#344054]">{value}</p>
    </div>
  );
}

function formatTriageValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Not assessed";
  }

  return String(value);
}

function getRecommendationStyle(priority) {
  switch (priority) {
    case "Critical":
      return {
        container: "border-[#FECDCA] bg-[#FEF3F2]",
        badge: "bg-[#FEE4E2] text-[#B42318]",
        text: "text-[#B42318]",
      };

    case "High":
      return {
        container: "border-[#FEDF89] bg-[#FFF4E5]",
        badge: "bg-[#FEF0C7] text-[#B54708]",
        text: "text-[#B54708]",
      };

    case "Moderate":
      return {
        container: "border-[#FDE68A] bg-[#FFFAEB]",
        badge: "bg-[#FEF0C7] text-[#A15C00]",
        text: "text-[#A15C00]",
      };

    default:
      return {
        container: "border-[#E4E7EC] bg-[#F8FAFC]",
        badge: "bg-[#F2F4F7] text-[#475467]",
        text: "text-[#475467]",
      };
  }
}

function AutomatedRiskItem({ label, value, score, highlighted = false }) {
  return (
    <div
      className={`rounded-lg border p-3.5 ${
        highlighted
          ? "border-[#C7D7FE] bg-[#F5F8FF]"
          : "border-[#E4E7EC] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">
            {label}
          </p>

          <p className="mt-1.5 text-sm font-bold text-[#344054]">
            {formatTriageValue(value)}
          </p>
        </div>

        {score !== null && score !== undefined && (
          <span className="shrink-0 rounded-lg bg-[#EEF2FF] px-2 py-1 text-[11px] font-bold text-[#4F46E5]">
            +{score}
          </span>
        )}
      </div>
    </div>
  );
}
function formatDisplayDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString([], {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  });
}

function formatHistoryTime(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  });
}

function resolveReportDatabaseId(report) {
  if (report?.databaseId) {
    return Number(report.databaseId);
  }

  const match = String(report?.id || "").match(/\d+$/);

  return match ? Number(match[0]) : null;
}

function formatVerificationFactLabel(key) {
  return String(key || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatVerificationFactValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Not specified";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ReportDetails({
  report: selectedReport, onBack, onReportUpdate }) {
  const report = {
    ...(selectedReport || {}),
    id: selectedReport?.id || "Not available",
    type:
      selectedReport?.type || selectedReport?.report_type || "Not available",
    category: selectedReport?.category || "Not available",
    priority: selectedReport?.priority || "Not Prioritized",
    status:
      selectedReport?.status ||
      selectedReport?.verification_status ||
      "For Verification",
    verification:
      selectedReport?.verification ||
      selectedReport?.verification_status ||
      "Pending",
    reporter:
      selectedReport?.reporter ||
      selectedReport?.reporter_name ||
      selectedReport?.user?.name ||
      "Unknown Resident",
    contact:
      selectedReport?.contact ||
      selectedReport?.contact_number ||
      selectedReport?.user?.profile?.contact_number ||
      selectedReport?.user?.contact_number ||
      "Not provided",
    location: selectedReport?.location || "Not provided",
    latitude:
      selectedReport?.latitude ??
      null,

    longitude:
      selectedReport?.longitude ??
      null,

    locationSource:
      selectedReport?.locationSource ??
      selectedReport?.location_source ??
      null,

    locationAccuracy:
      selectedReport?.locationAccuracy ??
      selectedReport?.location_accuracy ??
      null,

    locationCapturedAt:
      selectedReport?.locationCapturedAt ??
      selectedReport?.location_captured_at ??
      null,
    submitted: formatDisplayDate(
      selectedReport?.created_at || selectedReport?.submitted,
    ),
    description: selectedReport?.description || "No description provided.",
    triage: {
      threatToLife:
        selectedReport?.threat_to_life ??
        selectedReport?.triage?.threatToLife ??
        "Not assessed",
      assistanceNeed:
        selectedReport?.assistance_need ??
        selectedReport?.triage?.assistanceNeed ??
        "Not assessed",
      peopleAffected:
        selectedReport?.affected_residents ??
        selectedReport?.people_affected ??
        selectedReport?.triage?.peopleAffected ??
        null,
      vulnerablePersons:
        selectedReport?.vulnerable_persons ??
        selectedReport?.triage?.vulnerablePersons ??
        "Not assessed",
      accessImpact:
        selectedReport?.triage?.accessImpact ??
        selectedReport?.road_passability ??
        "Not assessed",
      locationRisk:
        selectedReport?.location_risk ??
        selectedReport?.triage?.locationRisk ??
        "Not assessed",
      hazardSeverity:
        selectedReport?.hazard_severity ??
        selectedReport?.triage?.hazardSeverity ??
        "Not assessed",
      rateOfWorsening:
        selectedReport?.rate_of_worsening ??
        selectedReport?.triage?.rateOfWorsening ??
        "Not assessed",
      waterLevel:
        selectedReport?.waterLevel ??
        selectedReport?.triage?.waterLevel ??
        "Not assessed",

      roadPassability:
        selectedReport?.roadPassability ??
        selectedReport?.triage?.roadPassability ??
        "Not assessed",

      evacuationNeed:
        selectedReport?.evacuationNeed ??
        selectedReport?.triage?.evacuationNeed ??
        selectedReport?.assistanceEvacuationNeed ??
        "Not assessed",

      affectedResidents:
        selectedReport?.affectedResidents ??
        selectedReport?.triage?.affectedResidents ??
        null,

      assistanceEvacuationNeed:
        selectedReport?.assistanceEvacuationNeed ??
        selectedReport?.triage?.assistanceEvacuationNeed ??
        "Not assessed",

      score:
        selectedReport?.triageScore ?? selectedReport?.triage?.score ?? null,

      recommendation:
        selectedReport?.triageRecommendation ??
        selectedReport?.triage?.recommendation ??
        null,

      remarks:
        selectedReport?.triageRemarks ?? selectedReport?.triage?.remarks ?? "",

      assessedAt:
        selectedReport?.triageAssessedAt ??
        selectedReport?.triage?.assessedAt ??
        null,
    },
    assignment: selectedReport?.assignment || {},
    evidence: Array.isArray(selectedReport?.evidence)
      ? selectedReport.evidence
      : [],
    history: Array.isArray(selectedReport?.history)
      ? selectedReport.history
      : [],
  };

  /*
   * Assessment presentation follows the kind of report.
   * The authoritative priority still comes from ResQNow's
   * triage logic; this only removes irrelevant UI fields.
   */
  const normalizedReportIdentity = [
    selectedReport?.concern_code,
    selectedReport?.concernCode,
    report.type,
    report.category,
    report.id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const isSosReport =
    selectedReport?.concern_code === "sos" ||
    selectedReport?.concernCode === "sos" ||
    normalizedReportIdentity.includes(" sos");

  const reportDisplaySource = {
    ...(selectedReport || {}),
    ...report,
  };

  const sosReasonLabel =
    getSosReasonLabel(
      reportDisplaySource,
    );

  const displayCategory =
    getReportCategoryLabel(
      reportDisplaySource,
    );

  const displayTitle =
    getReportDisplayTitle(
      reportDisplaySource,
    );

  const isNonEmergencyReport =
    !isSosReport &&
    (
      normalizedReportIdentity.includes(
        "non-emergency",
      ) ||
      normalizedReportIdentity.includes(
        "non emergency",
      ) ||
      String(report.id)
        .toUpperCase()
        .startsWith("NE-")
    );

  const assessmentVariant =
    isSosReport
      ? "sos"
      : isNonEmergencyReport
        ? "non-emergency"
        : "emergency";

  const assessmentTitle =
    assessmentVariant === "sos"
      ? "Emergency Triage Summary"
      : assessmentVariant === "non-emergency"
        ? "Situation Assessment"
        : "Emergency Assessment";

  const assessmentSubtitle =
    assessmentVariant === "sos"
      ? "Fast-track summary of the immediate life-safety information used by ResQNow."
      : assessmentVariant === "non-emergency"
        ? "System assessment based only on the factual information applicable to this situation."
        : "System assessment based only on the verified facts applicable to this emergency.";

  const isMeaningfulAssessmentValue =
    (value) => {
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return false;
      }

      const normalized =
        String(value)
          .trim()
          .toLowerCase();

      return ![
        "not assessed",
        "not reported",
        "not specified",
        "n/a",
      ].includes(normalized);
    };

  const submittedSvfAnswers =
    selectedReport?.svf?.answers &&
    typeof selectedReport.svf.answers ===
      "object"
      ? selectedReport.svf.answers
      : {};

  const svfAssessmentFacts =
    Object.entries(
      submittedSvfAnswers,
    )
      .filter(([, value]) =>
        isMeaningfulAssessmentValue(
          value,
        ),
      )
      .map(([key, value]) => ({
        label:
          formatVerificationFactLabel(
            key,
          ),
        value:
          formatVerificationFactValue(
            value,
          ),
      }));

  const fallbackAssessmentFacts = [
    {
      label: "Threat to Life",
      value: report.triage.threatToLife,
    },
    {
      label: "Assistance Need",
      value: report.triage.assistanceNeed,
    },
    {
      label: "People Affected",
      value:
        report.triage.peopleAffected !==
          null
          ? `${report.triage.peopleAffected}`
          : null,
    },
    {
      label: "Vulnerable Persons",
      value:
        report.triage.vulnerablePersons,
    },
    {
      label: "Access Impact",
      value: report.triage.accessImpact,
    },
    {
      label: "Location Risk",
      value: report.triage.locationRisk,
    },
    {
      label: "Hazard Severity",
      value:
        report.triage.hazardSeverity,
    },
    {
      label: "Rate of Worsening",
      value:
        report.triage.rateOfWorsening,
    },
    {
      label: "Water Level",
      value: report.triage.waterLevel,
    },
    {
      label: "Road Passability",
      value:
        report.triage.roadPassability,
    },
    {
      label: "Evacuation Need",
      value:
        report.triage.evacuationNeed,
    },
  ].filter((fact) =>
    isMeaningfulAssessmentValue(
      fact.value,
    ),
  );

  const assessmentFacts = [
    ...(
      isSosReport &&
      isMeaningfulAssessmentValue(
        sosReasonLabel,
      )
        ? [
            {
              label: "SOS Reason",
              value:
                formatVerificationFactValue(
                  sosReasonLabel,
                ),
            },
          ]
        : []
    ),
    ...(
      selectedReport?.svf?.category &&
      isMeaningfulAssessmentValue(
        selectedReport.svf.category,
      )
        ? [
            {
              label: "Situation Type",
              value:
                formatVerificationFactValue(
                  selectedReport.svf.category,
                ),
            },
          ]
        : []
    ),
    ...(
      svfAssessmentFacts.length > 0
        ? svfAssessmentFacts
        : fallbackAssessmentFacts
    ),
  ];

  const isHighlightedAssessmentFact =
    (value) =>
      /critical|high|immediate|required|yes|blocked|impassable|severe|life[- ]threat/i.test(
        String(value || ""),
      );

  const [status, setStatus] = useState(report.status);
  const [assignment, setAssignment] = useState(() => ({
    ...(report.assignment || {}),
  }));

  const [history, setHistory] = useState(() => [...(report.history || [])]);

  const [showMoreHistory, setShowMoreHistory] = useState(false);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState(
    () => report.assignment?.team || "",
  );

  const [selectedPersonnel, setSelectedPersonnel] = useState("");

  const [personnelList, setPersonnelList] = useState([]);
  const [incident, setIncident] = useState(null);

 /*
  * The report carries detailed responder progress.
  * The incident carries the broader Admin coordination state.
  */
 const reportDisplayStatus =
   incident?.report?.status ||
   report.status;

 const reportStatusDescription =
   reportDisplayStatus === "For Verification"
     ? "This report is awaiting barangay verification."
     : reportDisplayStatus === "For Prioritization"
       ? "The verified report is awaiting priority confirmation."
       : reportDisplayStatus === "Prioritized"
         ? "The system-computed priority has been confirmed."
         : reportDisplayStatus === "Pending Response"
           ? "The case is ready for response coordination."
           : reportDisplayStatus === "Assigned"
             ? "A primary responder has been assigned."
             : reportDisplayStatus === "In Progress"
               ? "The assigned responder has started field response."
               : reportDisplayStatus === "Responders En Route"
                 ? "The assigned responder is traveling to the incident."
                 : reportDisplayStatus === "Responded"
                   ? "Responder arrival / response has been recorded."
                   : reportDisplayStatus === "Resolved"
                     ? "The report has been resolved."
                     : reportDisplayStatus === "Closed"
                       ? "The case has been administratively closed."
                       : "Current report lifecycle status.";
  const [assignmentDecline, setAssignmentDecline] = useState(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [selectedPriority, setSelectedPriority] = useState(
    selectedReport?.priority || "",
  );
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [priorityError, setPriorityError] = useState("");

  /*
   * Admin resolution and administrative closure are
   * deliberately separate from responder field progress.
   */
  const [showResolutionModal, setShowResolutionModal] =
    useState(false);

  const [showClosureModal, setShowClosureModal] =
    useState(false);

  const [resolutionType, setResolutionType] =
    useState("");

  const [resolutionRemarks, setResolutionRemarks] =
    useState("");

  const [handoffAgency, setHandoffAgency] =
    useState("");

  const [handoffDetails, setHandoffDetails] =
    useState("");

  const [lifecycleLoading, setLifecycleLoading] =
    useState(false);

  const [lifecycleError, setLifecycleError] =
    useState("");

  const [inlineSvfAnswers, setInlineSvfAnswers] =
    useState({});

  const [verificationActionLoading, setVerificationActionLoading] =
    useState(false);

  const [verificationActionError, setVerificationActionError] =
    useState("");

  const [showReturnReviewModal, setShowReturnReviewModal] =
    useState(false);

  const [returnReviewRemarks, setReturnReviewRemarks] =
    useState("");

  const [returnReviewError, setReturnReviewError] =
    useState("");

  const [returnReviewLoading, setReturnReviewLoading] =
    useState(false);

  const [priorityActionLoading, setPriorityActionLoading] =
    useState(false);

  const [priorityActionError, setPriorityActionError] =
    useState("");

  const [closureChecklist, setClosureChecklist] =
    useState({
      fieldOutcomeReviewed: false,
      resolutionReviewed: false,
      handoffVerified: false,
      readyConfirmed: false,
    });

  useEffect(() => {
    const allowed =
      selectedReport?.svfAllowedAnswers || {};

    const stored =
      selectedReport?.svf?.answers || {};

    const editableFacts =
      Object.keys(allowed).reduce(
        (facts, key) => {
          facts[key] = stored[key] || "";
          return facts;
        },
        {},
      );

    setInlineSvfAnswers(editableFacts);
    setVerificationActionError("");
    setPriorityActionError("");
  }, [selectedReport?.id]);

  /*
   * Keeps the acknowledgement timeout current while
   * the Admin remains on this report page.
   */
  const [assignmentMonitorNow, setAssignmentMonitorNow] =
    useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setAssignmentMonitorNow(Date.now());
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const loadAssignmentData = async ({ silent = false } = {}) => {
      /*
       * The initial load hydrates the screen from the selected
       * report. Background refreshes must not briefly reset the
       * current incident to stale report values while a fresh
       * operational snapshot is being requested.
       */
      if (!silent) {
        setStatus(report.status);
        setSelectedPriority(
          report.priority !== "Not Prioritized" ? report.priority : "",
        );
        setAssignment({
          team: report.assignment?.team || "Unassigned",
          personnel: report.assignment?.personnel || "Unassigned",
          assignedAt: report.assignment?.assignedAt || "Not yet assigned",
        });
        setHistory(report.history || []);
        setIncident(null);
        setSelectedPersonnel("");
        setSelectedTeam("");
      }

      try {
        const reportIdMatch =
          String(selectedReport?.id || "").match(/\d+$/);

        const reportDatabaseId =
          selectedReport?.databaseId ??
          (
            reportIdMatch
              ? Number(reportIdMatch[0])
              : null
          );

        /*
         * Verification and prioritization do not need
         * responder, incident, or audit-log collections.
         *
         * Render the factual report immediately instead of
         * blocking the page on operational data that cannot
         * yet be used.
         */
        const preCoordinationStatuses =
          new Set([
            "For Verification",
            "For Prioritization",
          ]);

        if (
          preCoordinationStatuses.has(
            report.status,
          )
        ) {
          setIncident(null);
          setPersonnelList([]);
          setAssignmentDecline(null);
          return;
        }

        /*
         * Once a report reaches prioritization/response
         * coordination, first locate its incident.
         *
         * Personnel and audit logs are requested only if
         * an incident actually exists.
         */
        const incidentsData =
          await getAllIncidents();

        const matchedIncident =
          (incidentsData || []).find(
            (item) =>
              Number(item.report_id) ===
                Number(reportDatabaseId) ||
              Number(item.report?.id) ===
                Number(reportDatabaseId) ||
              item.incident_code ===
                `INC-${String(
                  reportDatabaseId || "",
                ).padStart(4, "0")}`,
          );

        setIncident(
          matchedIncident || null,
        );

        /*
         * LIGHTWEIGHT LIVE POLL
         *
         * Three-second polling only needs the current
         * incident/report snapshot. Personnel and full
         * audit history are loaded only during a full refresh.
         */
        if (silent) {
          if (matchedIncident) {
            setStatus(
              matchedIncident.status ||
              report.status,
            );
          }

          return;
        }

        if (!matchedIncident) {
          setPersonnelList([]);
          setAssignmentDecline(null);
          return;
        }

        const [
          personnelData,
          auditLogsData,
        ] = await Promise.all([
          getAllPersonnel(),
          getAllAuditLogs(),
        ]);

        setPersonnelList(
          personnelData || [],
        );

        const auditLogs =
          Array.isArray(auditLogsData)
            ? auditLogsData
            : [];

        if (matchedIncident) {
          setStatus(matchedIncident.status);

          const assignedPersonnelId = matchedIncident.assigned_personnel_id;
          const assignedPersonnel = matchedIncident.personnel;

          setSelectedPersonnel(
            assignedPersonnelId ? String(assignedPersonnelId) : "",
          );
          setSelectedTeam(assignedPersonnel?.team || "");

          setAssignment({
            team: assignedPersonnel?.team || "Unassigned",
            personnel: assignedPersonnel?.name || "Unassigned",
            assignedAt: assignedPersonnel
              ? "Currently assigned"
              : "Not yet assigned",
          });

          const incidentHistory = [];

          let historySequence = 0;

          const addHistoryEvent = ({
            status: eventStatus,
            detail,
            rawTime,
          }) => {
            if (!eventStatus) {
              return;
            }

            const parsedTime =
              rawTime
                ? new Date(rawTime).getTime()
                : 0;

            incidentHistory.push({
              status: eventStatus,
              detail:
                detail ||
                "Lifecycle event recorded.",
              time:
                rawTime
                  ? formatHistoryTime(rawTime)
                  : "Time not recorded",
              rawTime:
                rawTime ||
                null,
              sortTime:
                Number.isFinite(parsedTime)
                  ? parsedTime
                  : 0,
              sequence:
                historySequence++,
            });
          };

          /*
           * Report status logs are authoritative for
           * Resident / Responder lifecycle progress.
           */
          const reportStatusLogs =
            matchedIncident?.report?.status_logs ??
            matchedIncident?.report?.statusLogs ??
            [];

          if (Array.isArray(reportStatusLogs)) {
            [...reportStatusLogs]
              .sort(
                (left, right) =>
                  new Date(
                    left?.created_at ??
                    left?.createdAt ??
                    0,
                  ).getTime() -
                  new Date(
                    right?.created_at ??
                    right?.createdAt ??
                    0,
                  ).getTime(),
              )
              .forEach((log) => {
                const rawTime =
                  log?.created_at ??
                  log?.createdAt ??
                  null;

                const activity =
                  String(
                    log?.activity ||
                    "",
                  )
                    .trim()
                    .toLowerCase();

                /*
                 * Named responder assignments are taken
                 * from the richer Incident audit trail.
                 */
                if (
                  activity === "personnel assigned" ||
                  activity === "responder assigned"
                ) {
                  return;
                }

                if (
                  activity ===
                  "assignment acknowledged"
                ) {
                  addHistoryEvent({
                    status:
                      "Assignment Acknowledged",
                    detail:
                      "The assigned responder acknowledged the incident.",
                    rawTime,
                  });

                  return;
                }

                if (
                  activity ===
                  "response started"
                ) {
                  addHistoryEvent({
                    status:
                      "Response Started",
                    detail:
                      "The assigned responder started field response.",
                    rawTime,
                  });

                  return;
                }

                if (
                  activity ===
                  "responder marked en route"
                ) {
                  addHistoryEvent({
                    status:
                      "Responders En Route",
                    detail:
                      "The responder marked the team en route to the incident.",
                    rawTime,
                  });

                  return;
                }

                if (
                  activity ===
                  "responder recorded arrival / response"
                ) {
                  addHistoryEvent({
                    status:
                      "Responder Arrived / Response Recorded",
                    detail:
                      "The responder recorded arrival and initial response at the incident.",
                    rawTime,
                  });

                  return;
                }

                if (
                  activity ===
                  "responder submitted field outcome"
                ) {
                  addHistoryEvent({
                    status:
                      "Field Outcome Submitted",
                    detail:
                      "The responder submitted the field outcome for Admin review.",
                    rawTime,
                  });

                  return;
                }

                if (
                  activity ===
                  "responder added field update"
                ) {
                  addHistoryEvent({
                    status:
                      "Field Update",
                    detail:
                      log?.remarks ||
                      "The responder added an operational update.",
                    rawTime,
                  });

                  return;
                }

                if (
                  activity ===
                  "responder requested additional support"
                ) {
                  addHistoryEvent({
                    status:
                      "Additional Support Requested",
                    detail:
                      log?.remarks ||
                      "The responder requested additional support.",
                    rawTime,
                  });

                  return;
                }

                if (
                  activity ===
                  "responder requested location assistance"
                ) {
                  addHistoryEvent({
                    status:
                      "Location Assistance Requested",
                    detail:
                      log?.remarks ||
                      "The responder requested location assistance.",
                    rawTime,
                  });

                  return;
                }

                if (
                  activity ===
                  "responder requested incident review"
                ) {
                  addHistoryEvent({
                    status:
                      "Incident Review Requested",
                    detail:
                      log?.remarks ||
                      "The responder requested Admin review.",
                    rawTime,
                  });

                  return;
                }

                if (
                  activity ===
                  "responder declined assignment"
                ) {
                  addHistoryEvent({
                    status:
                      "Assignment Declined",
                    detail:
                      log?.remarks ||
                      "The responder declined the assignment.",
                    rawTime,
                  });

                  return;
                }

                addHistoryEvent({
                  status:
                    log?.status ||
                    log?.activity ||
                    "Report Update",
                  detail:
                    log?.remarks ||
                    log?.activity ||
                    "Report status updated.",
                  rawTime,
                });
              });
          }


          /*
           * Compatibility fallback only if the Incident API
           * has no raw report status logs.
           */
          if (
            !Array.isArray(reportStatusLogs) ||
            reportStatusLogs.length === 0
          ) {
            (report.history || []).forEach((item) => {
              addHistoryEvent({
                status:
                  item?.status,
                detail:
                  item?.detail,
                rawTime:
                  item?.rawTime ||
                  null,
              });
            });
          }

          const reportCreatedAt =
            selectedReport?.created_at ??
            selectedReport?.createdAt ??
            null;

          const hasSubmitted =
            incidentHistory.some(
              (item) =>
                String(
                  item.status ||
                  "",
                ).toLowerCase() ===
                "submitted",
            );

          if (
            !hasSubmitted &&
            reportCreatedAt
          ) {
            addHistoryEvent({
              status:
                "Submitted",
              detail:
                "Report recorded in ResQNow.",
              rawTime:
                reportCreatedAt,
            });
          }

          /*
           * Response Coordination is an Incident milestone.
           */
          if (matchedIncident.created_at) {
            addHistoryEvent({
              status:
                "Response Coordination Started",
              detail:
                `${matchedIncident.incident_code} opened for responder assignment and response monitoring.`,
              rawTime:
                matchedIncident.created_at,
            });
          }

          const incidentAuditLogs =
            auditLogs.filter((log) => {
              return (
                log.category === "Incident" &&
                log.target ===
                  matchedIncident.incident_code
              );
            });

          const latestAssignmentDecline =
            incidentAuditLogs
              .filter(
                (log) =>
                  log.action ===
                  "Responder Assignment Declined",
              )
              .sort(
                (left, right) =>
                  new Date(
                    right.created_at ||
                    0,
                  ) -
                  new Date(
                    left.created_at ||
                    0,
                  ),
              )[0] || null;

          setAssignmentDecline(
            latestAssignmentDecline,
          );

          /*
           * Use Incident audit logs for named assignment
           * changes so generic "Assigned" report logs do not
           * appear multiple times.
           */
          const assignmentAuditLogs =
            incidentAuditLogs
              .filter(
                (log) =>
                  log.action ===
                  "Incident Personnel Assigned",
              )
              .sort(
                (left, right) =>
                  new Date(
                    left.created_at ||
                    0,
                  ) -
                  new Date(
                    right.created_at ||
                    0,
                  ),
              );

          assignmentAuditLogs.forEach(
            (log, index) => {
              addHistoryEvent({
                status:
                  index === 0
                    ? "Responder Assigned"
                    : "Responder Reassigned",
                detail:
                  log.remarks ||
                  (
                    index === 0
                      ? "Primary responder assigned."
                      : "Primary responder assignment changed."
                  ),
                rawTime:
                  log.created_at,
              });
            },
          );

          /*
           * Admin lifecycle milestones.
           */
          incidentAuditLogs.forEach((log) => {
            if (
              log.action ===
                "Incident Status Updated" &&
              (
                log.new_value === "Resolved" ||
                log.new_value === "Closed"
              )
            ) {
              addHistoryEvent({
                status:
                  log.new_value,
                detail:
                  log.remarks ||
                  (
                    log.new_value === "Resolved"
                      ? "Incident resolved after field-response review."
                      : "Incident administratively closed."
                  ),
                rawTime:
                  log.created_at,
              });
            }

            if (
              log.action ===
              "Responder Assignment Declined"
            ) {
              addHistoryEvent({
                status:
                  "Assignment Declined",
                detail:
                  log.remarks ||
                  "Responder declined the assignment.",
                rawTime:
                  log.created_at,
              });
            }
          });

          /*
           * Real chronological ordering.
           */
          incidentHistory.sort(
            (left, right) => {
              if (
                left.sortTime ===
                right.sortTime
              ) {
                return (
                  left.sequence -
                  right.sequence
                );
              }

              return (
                left.sortTime -
                right.sortTime
              );
            },
          );

          /*
           * Exact duplicate protection.
           */
          const seenHistoryEvents =
            new Set();

          const uniqueHistory =
            incidentHistory.filter((item) => {
              const key = [
                item.status,
                item.detail,
                item.rawTime ||
                  item.time,
              ].join("|");

              if (
                seenHistoryEvents.has(key)
              ) {
                return false;
              }

              seenHistoryEvents.add(key);

              return true;
            });

          setHistory(
            uniqueHistory.map(
              ({
                sortTime,
                sequence,
                ...item
              }) => item,
            ),
          );
        }
      } catch (error) {
        /*
         * Initial-load errors must be visible to the Admin.
         * A single failed background poll should keep the last
         * known good operational state instead of replacing the
         * screen with an error.
         */
        if (!silent) {
          console.error("Failed to load incident data:", error);
          setAssignmentError(
            "Failed to load incident and personnel data.",
          );
        }
      }
    };

    /*
     * Do not overwrite selections while the Admin is actively
     * editing assignment/resolution controls.
     */
    if (
      showAssignmentModal ||
      showResolutionModal ||
      showClosureModal ||
      assignmentLoading ||
      lifecycleLoading
    ) {
      return undefined;
    }

    loadAssignmentData();

    let refreshInFlight = false;

    const refreshOperationalData = async (
      silent = true,
    ) => {
      if (
        refreshInFlight ||
        document.visibilityState === "hidden"
      ) {
        return;
      }

      refreshInFlight = true;

      try {
        await loadAssignmentData({
          silent,
        });
      } finally {
        refreshInFlight = false;
      }
    };

    /*
     * Three seconds is quick enough for an emergency-response
     * dashboard without creating an aggressive request loop.
     */
    const intervalId =
      window.setInterval(
        refreshOperationalData,
        3000,
      );

    /*
     * During the localhost demo the Admin and Responder are
     * commonly switched between tabs/windows. Refresh
     * immediately when Admin becomes active again.
     */
    const handleWindowFocus = () => {
      refreshOperationalData(false);
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible"
      ) {
        refreshOperationalData(false);
      }
    };

    window.addEventListener(
      "focus",
      handleWindowFocus,
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      window.clearInterval(intervalId);

      window.removeEventListener(
        "focus",
        handleWindowFocus,
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [
    selectedReport?.id,
    showAssignmentModal,
    showResolutionModal,
    showClosureModal,
    assignmentLoading,
    lifecycleLoading,
  ]);

  const handleStatusChange = async (
    newStatus,
    details = {},
  ) => {
    if (!incident || newStatus === status) {
      return incident;
    }

    const updatedIncident =
      await updateIncidentStatus(
        incident.id,
        {
          status: newStatus,
          ...details,
        },
      );

    setIncident(updatedIncident);
    setStatus(updatedIncident.status);

    setHistory((current) => [
      ...current,
      {
        status: updatedIncident.status,
        detail: `Incident status updated to ${updatedIncident.status} by Barangay Personnel`,
        time: "Just now",
      },
    ]);

    return updatedIncident;
  };

  const openResolutionModal = () => {
    if (!incident || lifecycleLoading) return;

    setLifecycleError("");

    setResolutionType(
      incident.resolution_type || "",
    );

    setResolutionRemarks(
      incident.resolution_remarks || "",
    );

    setHandoffAgency(
      incident.handoff_agency || "",
    );

    setHandoffDetails(
      incident.handoff_details || "",
    );

    setShowResolutionModal(true);
  };

  const openClosureModal = () => {
    if (!incident || lifecycleLoading) return;

    setLifecycleError("");

    setClosureChecklist({
      fieldOutcomeReviewed: false,
      resolutionReviewed: false,
      handoffVerified: false,
      readyConfirmed: false,
    });

    setShowClosureModal(true);
  };

  const handleSubmitResolution = async () => {
    if (lifecycleLoading) return;

    const remarks =
      resolutionRemarks.trim();

    const agency =
      handoffAgency.trim();

    const handoff =
      handoffDetails.trim();

    if (!resolutionType) {
      setLifecycleError(
        "Select a resolution type.",
      );
      return;
    }

    if (!remarks) {
      setLifecycleError(
        "Admin resolution remarks are required.",
      );
      return;
    }

    if (
      resolutionType === "referred_handoff" &&
      (!agency || !handoff)
    ) {
      setLifecycleError(
        "Agency / Office and handoff details are required for a referred or handed-off case.",
      );
      return;
    }

    try {
      setLifecycleLoading(true);
      setLifecycleError("");

      await handleStatusChange(
        "Resolved",
        {
          resolution_type:
            resolutionType,

          resolution_remarks:
            remarks,

          handoff_agency:
            resolutionType ===
            "referred_handoff"
              ? agency
              : null,

          handoff_details:
            resolutionType ===
            "referred_handoff"
              ? handoff
              : null,
        },
      );

      setShowResolutionModal(false);
    } catch (error) {
      console.error(
        "Failed to resolve incident:",
        error,
      );

      setLifecycleError(
        error.message ||
          "Failed to mark the case resolved.",
      );
    } finally {
      setLifecycleLoading(false);
    }
  };

  const handleSubmitClosure = async () => {
    if (lifecycleLoading) return;

    const allConfirmed =
      closureChecklist.fieldOutcomeReviewed &&
      closureChecklist.resolutionReviewed &&
      closureChecklist.handoffVerified &&
      closureChecklist.readyConfirmed;

    if (!allConfirmed) {
      setLifecycleError(
        "Complete all closure confirmations before closing this response case.",
      );
      return;
    }

    try {
      setLifecycleLoading(true);
      setLifecycleError("");

      await handleStatusChange(
        "Closed",
        {
          closure_field_outcome_reviewed:
            closureChecklist.fieldOutcomeReviewed,

          closure_resolution_reviewed:
            closureChecklist.resolutionReviewed,

          closure_handoff_information_verified:
            closureChecklist.handoffVerified,

          closure_ready_confirmed:
            closureChecklist.readyConfirmed,
        },
      );

      setShowClosureModal(false);
    } catch (error) {
      console.error(
        "Failed to close incident:",
        error,
      );

      setLifecycleError(
        error.message ||
          "Failed to close the response case.",
      );
    } finally {
      setLifecycleLoading(false);
    }
  };

  const handleCreateIncident = async () => {
    const reportIdMatch = String(selectedReport?.id || "").match(/\d+$/);
    const reportDatabaseId =
      selectedReport?.databaseId ??
      (reportIdMatch ? Number(reportIdMatch[0]) : null);

    if (!reportDatabaseId) {
      setAssignmentError("The report database ID could not be determined.");
      return;
    }

    try {
      setAssignmentLoading(true);
      setAssignmentError("");

      const createdIncident = await createIncidentFromReport(reportDatabaseId);

      setIncident(createdIncident);
      setStatus(createdIncident.status);

      setAssignment({
        team: "Unassigned",
        personnel: "Unassigned",
        assignedAt: "Not yet assigned",
      });

      onReportUpdate?.({
        id: report.id,
        incident: createdIncident,
      });
    } catch (error) {
      console.error("Failed to create incident:", error);
      setAssignmentError(
        error.message || "Failed to start response coordination.",
      );
    } finally {
      setAssignmentLoading(false);
    }
  };
  const handleSaveAssignment = async () => {
    if (!incident) {
      setAssignmentError("Response coordination has not been started for this report yet.");
      return;
    }

    if (!selectedPersonnel || selectedPersonnel === "Unassigned") {
      setAssignmentError("Please select a primary responder.");
      return;
    }

    const selectedPerson = personnelList.find(
      (person) =>
        person.id === Number(selectedPersonnel) ||
        person.databaseId === Number(selectedPersonnel),
    );

    if (!selectedPerson) {
      setAssignmentError("Selected personnel was not found.");
      return;
    }

    try {
      setAssignmentLoading(true);
      setAssignmentError("");

      const incidentId =
        incident?.id ??
        incident?.databaseId ??
        incident?.data?.id;

      if (!incidentId) {
        throw new Error(
          "Response coordination is missing its incident ID. Refresh this report before assigning a responder.",
        );
      }

      const updatedIncident =
        await assignIncidentPersonnel(
          incidentId,
          selectedPerson.id ||
            selectedPerson.databaseId,
        );

      setIncident(updatedIncident);

      const personnelName =
        updatedIncident?.personnel?.name ||
        selectedPerson.name ||
        "Primary Responder";

      const assignedAt = new Date().toLocaleString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    timeZone: "Asia/Manila",
      });

      const newAssignment = {
        team: selectedTeam,
        personnel: personnelName,
        assignedAt,
      };

      setAssignment(newAssignment);
      setAssignmentDecline(null);

      const auditLogsData = await getAllAuditLogs();
      const auditLogs = Array.isArray(auditLogsData) ? auditLogsData : [];

      const incidentAuditLogs = auditLogs.filter(
        (log) =>
          log.category === "Incident" &&
          log.target === updatedIncident.incident_code,
      );

      const refreshedHistory = [];

      if (selectedReport?.created_at) {
        refreshedHistory.push({
          status: "Report Submitted",
          detail: "Report recorded in ResQNow.",
          time: formatHistoryTime(selectedReport.created_at),
        });
      }

      if (updatedIncident.created_at) {
        refreshedHistory.push({
          status: "Response Coordination Started",
          detail: `${updatedIncident.incident_code} opened for responder assignment and response monitoring.`,
          time: formatHistoryTime(updatedIncident.created_at),
        });
      }

      incidentAuditLogs.forEach((log) => {
        if (log.action === "Incident Status Updated") {
          refreshedHistory.push({
            status: log.new_value,
            detail: log.remarks,
            time: formatHistoryTime(log.created_at),
          });
        }

        if (log.action === "Incident Personnel Assigned") {
          refreshedHistory.push({
            status: "Personnel Assigned",
            detail: log.remarks,
            time: formatHistoryTime(log.created_at),
          });
        }
      });

      if (refreshedHistory.length > 0) {
        setHistory(refreshedHistory);
      }

      onReportUpdate?.({
        id: report.id,
        assignment: newAssignment,
      });

      setShowAssignmentModal(false);
    } catch (error) {
      console.error("Failed to assign personnel:", error);
      setAssignmentError(error.message || "Failed to assign personnel.");
    } finally {
      setAssignmentLoading(false);
    }
  };

  const hasFieldOutcome = Boolean(
    incident?.report?.status_logs?.some(
      (log) => log.activity === "Responder submitted field outcome",
    ),
  );

  const assignmentMonitor =
    incident?.assignment_monitor || null;

  const assignmentDeadlineMs =
    assignmentMonitor?.deadlineAt
      ? new Date(assignmentMonitor.deadlineAt).getTime()
      : null;

  const assignmentAssignedAtMs =
    assignmentMonitor?.assignedAt
      ? new Date(assignmentMonitor.assignedAt).getTime()
      : null;

  const liveMinutesWaiting =
    Number.isFinite(assignmentAssignedAtMs) &&
    !assignmentMonitor?.acknowledged
      ? Math.max(
          0,
          Math.floor(
            (assignmentMonitorNow - assignmentAssignedAtMs) / 60000,
          ),
        )
      : assignmentMonitor?.minutesWaiting || 0;

  const isAssignmentOverdue = Boolean(
    assignmentMonitor?.hasAssignment &&
      !assignmentMonitor?.acknowledged &&
      (
        assignmentMonitor?.overdue ||
        (
          Number.isFinite(assignmentDeadlineMs) &&
          assignmentMonitorNow >= assignmentDeadlineMs
        )
      ),
  );

  const acknowledgementStatus =
    !assignmentMonitor?.hasAssignment
      ? "Not yet assigned"
      : assignmentMonitor.acknowledged
        ? "Acknowledged"
        : isAssignmentOverdue
          ? `Overdue - ${liveMinutesWaiting} min waiting`
          : "Awaiting responder acknowledgement";

  const nextIncidentStatus =
    status === "In Progress" && hasFieldOutcome
      ? "Resolved"
      : status === "Resolved"
        ? "Closed"
        : null;

  const resolutionTypeLabels = {
    resolved_on_scene:
      "Resolved on scene",

    referred_handoff:
      "Referred / handed off",

    no_further_barangay_response:
      "No further barangay response required",

    other:
      "Other",
  };
  const canAssignPriority = !incident && report.status === "For Prioritization";

  const handleExportPDF = async () => {
    const [
      jsPdfModule,
      autoTableModule,
    ] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const JsPDF =
      jsPdfModule.jsPDF ??
      jsPdfModule.default;

    const autoTable =
      autoTableModule.default ??
      autoTableModule.autoTable;

    if (!JsPDF || !autoTable) {
      throw new Error(
        "PDF export libraries could not be loaded.",
      );
    }

    const doc = new JsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();

    // HEADER
    doc.setFillColor(31, 29, 71);
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ResQNow", 14, 13);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Barangay Hazard Report", 14, 20);

    // RESET TEXT COLOR
    doc.setTextColor(31, 29, 71);

    // TITLE
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Report Details", 14, 42);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(102, 112, 133);
    doc.text(`Report ID: ${report.id}`, 14, 50);

    // REPORT INFORMATION
    autoTable(doc, {
      startY: 58,
      head: [["Report Information", "Details"]],
      body: [
        ["Report ID", report.id],
        ["Report Type", report.type],
        ["Category", displayCategory],
        ["Priority", report.priority],
        ["Current Status", reportDisplayStatus],
        ["Verification", report.verification],
        ["Reporter", report.reporter],
        ["Contact Number", report.contact],
        ["Location", report.location],
        ["Submitted", report.submitted],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [131, 70, 242],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
    });

    // DESCRIPTION
    let currentY = doc.lastAutoTable.finalY + 12;

    doc.setTextColor(31, 29, 71);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Report Description", 14, currentY);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 84, 103);

    const descriptionLines = doc.splitTextToSize(
      report.description,
      pageWidth - 28,
    );

    doc.text(descriptionLines, 14, currentY + 7);

    currentY += descriptionLines.length * 5 + 16;

    // CONTEXTUAL SYSTEM ASSESSMENT
  doc.setTextColor(31, 29, 71);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");

  doc.text(
    assessmentTitle,
    14,
    currentY,
  );

  autoTable(doc, {
    startY: currentY + 6,
    head: [["Assessment", "Result"]],
    body: [
      [
        "System Priority",
        report.triage.recommendation ||
          report.priority,
      ],
      ...(
        report.triage.score !== null &&
        report.triage.score !== undefined
          ? [
              [
                "System Score",
                String(
                  report.triage.score,
                ),
              ],
            ]
          : []
      ),
      ...assessmentFacts.map(
        (fact) => [
          fact.label,
          String(fact.value),
        ],
      ),
      ...(
        report.triage.remarks
          ? [
              [
                "Assessment Basis",
                report.triage.remarks,
              ],
            ]
          : []
      ),
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 29, 71],
      textColor: [255, 255, 255],
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
  });

  currentY =
    doc.lastAutoTable.finalY + 12;
  // ASSIGNMENT
    currentY = doc.lastAutoTable.finalY + 12;

    // Check if we need another page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setTextColor(31, 29, 71);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Response Coordination", 14, currentY);

    autoTable(doc, {
      startY: currentY + 6,
      head: [["Assignment", "Details"]],
      body: [
        ["Response Unit", assignment.team],
        ["Primary Responder", assignment.personnel],
        ["Assigned At", assignment.assignedAt],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [131, 70, 242],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
    });

    // STATUS HISTORY
    currentY = doc.lastAutoTable.finalY + 12;

    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setTextColor(31, 29, 71);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Status History", 14, currentY);

    autoTable(doc, {
      startY: currentY + 6,
      head: [["Status", "Details", "Time"]],
      body: history.map((item) => [item.status, item.detail, item.time]),
      theme: "grid",
      headStyles: {
        fillColor: [31, 29, 71],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
    });

    // FOOTER
    const totalPages = doc.getNumberOfPages();

    for (let page = 1; page <= totalPages; page++) {
      doc.setPage(page);

      const height = doc.internal.pageSize.getHeight();

      doc.setFontSize(8);
      doc.setTextColor(152, 162, 179);

      doc.text(
        `Generated by ResQNow - Page ${page} of ${totalPages}`,
        pageWidth / 2,
        height - 10,
        { align: "center" },
      );
    }

    // DOWNLOAD PDF
    doc.save(`${report.id}-Report-Details.pdf`);
  };

  const visibleHistory = showMoreHistory ? history : history.slice(-4);

  const handleInlineVerifyReport = async () => {
  if (verificationActionLoading) {
    return;
  }

  const reportDatabaseId =
    resolveReportDatabaseId(selectedReport);

  if (!reportDatabaseId) {
    setVerificationActionError(
      "The report database ID could not be determined.",
    );
    return;
  }

  const allowedAnswers =
    selectedReport?.svfAllowedAnswers || {};

  const hasEditableSvf =
    Boolean(
      selectedReport?.svf &&
        Object.keys(allowedAnswers).length > 0,
    );

  if (hasEditableSvf) {
    const hasMissingFact =
      Object.keys(allowedAnswers).some(
        (key) => !inlineSvfAnswers[key],
      );

    if (hasMissingFact) {
      setVerificationActionError(
        "Review all Situation Verification Facts before verifying this report.",
      );
      return;
    }
  }

  try {
    setVerificationActionLoading(true);
    setVerificationActionError("");

    const result =
      await verifyReport(
        reportDatabaseId,
        hasEditableSvf
          ? inlineSvfAnswers
          : null,
      );

    const computedPriority =
      result?.data?.priority ||
      report.priority;

    setSelectedPriority(
      computedPriority &&
        computedPriority !== "Not Prioritized"
        ? computedPriority
        : "",
    );

    setStatus("For Prioritization");

    onReportUpdate?.({
      ...selectedReport,
      priority: computedPriority,
      currentPriority: computedPriority,
      verification: "Verified",
      verification_status: "Verified",
      status: "For Prioritization",
    });
  } catch (error) {
    console.error(
      "Failed to verify report:",
      error,
    );

    setVerificationActionError(
      error.message ||
        "Failed to verify report.",
    );
  } finally {
    setVerificationActionLoading(false);
  }
};


const handleInlineReturnForReview = async () => {
  if (returnReviewLoading) {
    return;
  }

  if (!returnReviewRemarks.trim()) {
    setReturnReviewError(
      "Please provide a reason before returning this report for review.",
    );
    return;
  }

  const reportDatabaseId =
    resolveReportDatabaseId(selectedReport);

  if (!reportDatabaseId) {
    setReturnReviewError(
      "The report database ID could not be determined.",
    );
    return;
  }

  try {
    setReturnReviewLoading(true);
    setReturnReviewError("");

    await returnReportForReview(
      reportDatabaseId,
      returnReviewRemarks.trim(),
    );

    onReportUpdate?.({
      ...selectedReport,
      verification: "Returned",
      verification_status: "Returned",
      verificationRemarks:
        returnReviewRemarks.trim(),
    });

    setShowReturnReviewModal(false);
    setReturnReviewRemarks("");
  } catch (error) {
    console.error(
      "Failed to return report for review:",
      error,
    );

    setReturnReviewError(
      error.message ||
        "Failed to return report for review.",
    );
  } finally {
    setReturnReviewLoading(false);
  }
};


const handleInlineConfirmPriority = async () => {
  if (priorityActionLoading) {
    return;
  }

  const reportDatabaseId =
    resolveReportDatabaseId(selectedReport);

  if (!reportDatabaseId) {
    setPriorityActionError(
      "The report database ID could not be determined.",
    );
    return;
  }

  const usesAuthoritativeTriage =
    Boolean(
      selectedReport?.svf ||
        selectedReport?.triageRuleVersion?.startsWith(
          "camunatan-",
        ) ||
        report.triage?.ruleVersion?.startsWith(
          "camunatan-",
        ),
    );

  const systemPriority =
    report.triage?.recommendation ||
    report.priority ||
    selectedPriority;

  if (
    !systemPriority ||
    systemPriority === "Not Prioritized"
  ) {
    setPriorityActionError(
      "No system-computed priority is available for confirmation.",
    );
    return;
  }

  try {
    setPriorityActionLoading(true);
    setPriorityActionError("");

    const confirmedReport =
      await assignReportPriority(
        reportDatabaseId,
        usesAuthoritativeTriage
          ? null
          : systemPriority,
      );

    const confirmedPriority =
      confirmedReport?.priority ||
      systemPriority;

    setSelectedPriority(
      confirmedPriority,
    );

    setStatus("Prioritized");

    onReportUpdate?.({
      ...selectedReport,
      currentPriority:
        confirmedPriority,
      priority:
        confirmedPriority,
      priorityStatus:
        "Confirmed",
      verification:
        "Verified",
      verification_status:
        "Verified",
      status:
        "Prioritized",
    });
  } catch (error) {
    console.error(
      "Failed to confirm priority:",
      error,
    );

    setPriorityActionError(
      error.message ||
        "Failed to confirm the system-computed priority.",
    );
  } finally {
    setPriorityActionLoading(false);
  }
};

const statusDescription =
    status === "For Verification"
      ? "This report is awaiting verification before entering the response workflow."
      : status === "Pending Response"
        ? "The incident is ready for response dispatch."
        : status === "Dispatched"
          ? "Response personnel have been dispatched to the incident."
          : status === "In Progress"
            ? "Response personnel are actively handling the incident."
            : status === "Resolved"
              ? "The incident has been resolved and is ready for closure."
              : status === "Closed"
                ? "The incident response has been completed and closed."
                : "The current response status is being reviewed.";

  const verificationDescription =
    report.verification === "Pending"
      ? "Report is awaiting verification."
      : "Report has passed initial review.";

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* PAGE HEADER */}
      <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#667085] transition hover:text-[#1F5FA6]"
          >
             Back to All Reports
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1F5FA6]">
              Report Details
            </p>

            <span className="text-xs text-[#98A2B3]">/</span>

            <span className="text-xs font-bold text-[#667085]">
              {report.id}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#101C2E]">
              {isSosReport
              ? displayTitle
              : report.type}
            </h1>

            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                priorityStyles[report.priority] || priorityStyles.Low
              }`}
            >
              {report.priority} Priority
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                statusStyles[reportDisplayStatus] || statusStyles["For Verification"]
              }`}
            >
              {reportDisplayStatus}
            </span>
          </div>

          <p className="mt-1 text-sm text-[#667085]">
            Submitted {report.submitted}
          </p>
        </div>

        {/* EXPORT PDF */}
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-2 rounded-lg border border-[#E4E7EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#475467] shadow-sm transition hover:border-[#1F5FA6] hover:text-[#1F5FA6]"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.75fr)]">
        {/* LEFT */}
        <div className="min-h-0 overflow-auto pr-1">
          <div className="space-y-4">
            {/* REPORT INFORMATION */}
            <section className="rounded-xl border border-[#E4E7EC] bg-white shadow-sm">
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <h2 className="text-sm font-bold text-[#101C2E]">
                  Report Information
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-5 p-5 lg:grid-cols-3">
                <InfoItem label="Report ID" value={report.id} />
                <InfoItem label="Reporter" value={report.reporter} />
                <InfoItem label="Contact Number" value={report.contact} />
                <InfoItem label="Category" value={displayCategory} />
                <InfoItem label="Location" value={report.location} />
                <InfoItem label="Submitted" value={report.submitted} />
              </div>
            </section>

          <IncidentLocationCard report={report} />

            {/* DESCRIPTION */}
            <section className="rounded-xl border border-[#E4E7EC] bg-white shadow-sm">
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <h2 className="text-sm font-bold text-[#101C2E]">
                  Report Description
                </h2>
              </div>

              <div className="p-5">
                <p className="text-sm leading-6 text-[#475467]">
                  {report.description}
                </p>
              </div>
            </section>
            {/* CONTEXTUAL SYSTEM ASSESSMENT */}
            <section className="rounded-xl border border-[#E4E7EC] bg-white shadow-sm">
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF1FA] text-[#1F5FA6]">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M12 3l8 4v5c0 4.8-3.4 7.8-8 9-4.6-1.2-8-4.2-8-9V7l8-4z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-bold text-[#101C2E]">
                          {assessmentTitle}
                        </h2>

                        {isSosReport && (
                          <span className="rounded-full bg-[#FEF3F2] px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#B42318]">
                            Immediate Life Threat
                          </span>
                        )}
                      </div>

                      <p className="mt-1 max-w-xl text-xs leading-5 text-[#667085]">
                        {assessmentSubtitle}
                      </p>
                    </div>
                  </div>

                  {report.triage.recommendation ? (
                    <div
                      className={`shrink-0 rounded-lg border px-4 py-2.5 ${
                        getRecommendationStyle(
                          report.triage.recommendation,
                        ).container
                      }`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                        System Priority
                      </p>

                      <div className="mt-1 flex items-center justify-between gap-4">
                        <span
                          className={`text-sm font-extrabold ${
                            getRecommendationStyle(
                              report.triage.recommendation,
                            ).text
                          }`}
                        >
                          {report.triage.recommendation}
                        </span>

                        {report.triage.score !== null &&
                          report.triage.score !== undefined && (
                            <span className="text-xs font-bold text-[#667085]">
                              Score: {report.triage.score}
                            </span>
                          )}
                      </div>
                    </div>
                  ) : (
                    <span className="rounded-full bg-[#F2F4F7] px-3 py-1.5 text-[11px] font-bold text-[#667085]">
                      Assessment Pending
                    </span>
                  )}
                </div>
              </div>

              {report.triage.recommendation ? (
                <div className="space-y-4 p-5">
                  {isSosReport && (
                    <div className="rounded-lg border border-[#FECDCA] bg-[#FEF3F2] p-4">
                      <p className="text-xs font-bold text-[#B42318]">
                        SOS fast-track case
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#B42318]">
                        This report is presented as an immediate
                        life-safety case. Only information relevant
                        to rapid triage and response is shown here.
                      </p>
                    </div>
                  )}

                  {assessmentFacts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {assessmentFacts.map(
                        (fact, index) => (
                          <AutomatedRiskItem
                            key={`${fact.label}-${index}`}
                            label={fact.label}
                            value={fact.value}
                            score={null}
                            highlighted={
                              isHighlightedAssessmentFact(
                                fact.value,
                              )
                            }
                          />
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] p-4">
                      <p className="text-xs font-bold text-[#475467]">
                        No additional assessment fields are applicable
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#667085]">
                        ResQNow has already produced the system priority
                        from the information available for this report.
                        Irrelevant assessment fields are intentionally
                        not displayed.
                      </p>
                    </div>
                  )}

                  {report.triage.remarks && (
                    <div className="rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">
                        Assessment Basis
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#475467]">
                        {report.triage.remarks}
                      </p>
                    </div>
                  )}

                  <div className="rounded-lg border border-[#B2DDFF] bg-[#EFF8FF] p-3">
                    <p className="text-[11px] font-semibold leading-4 text-[#175CD3]">
                      Priority remains system-controlled. Admin verifies
                      factual information and confirms the computed result;
                      Admin does not manually override the priority.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  <div className="rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] p-4">
                    <p className="text-xs font-semibold text-[#667085]">
                      The system assessment will be displayed when
                      sufficient report information is available.
                    </p>
                  </div>
                </div>
              )}
            </section>
            {/* EVIDENCE */}
            {(!isSosReport || report.evidence.length > 0) && (
          <section className="rounded-xl border border-[#E4E7EC] bg-white shadow-sm">
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <h2 className="text-sm font-bold text-[#101C2E]">
                  Submitted Evidence
                </h2>

                <p className="mt-0.5 text-xs text-[#667085]">
                  {(report.evidence || []).length}{" "}
                {(report.evidence || []).length === 1
                  ? "attachment submitted with this report."
                  : "attachments submitted with this report."}
                </p>
              </div>

              {(report.evidence || []).length > 0 ? (
                <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {(report.evidence || []).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="overflow-hidden rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] text-left transition hover:border-[#1F5FA6]"
                    >
                      <div className="flex h-28 items-center justify-center bg-[#EAF1FA] text-2xl text-[#1F5FA6]">
                        Evidence
                      </div>

                      <div className="px-3 py-2.5">
                        <p className="truncate text-xs font-semibold text-[#344054]">
                          {item.label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-5">
                  <div className="rounded-lg border border-dashed border-[#E4E7EC] bg-[#F8FAFC] px-4 py-8 text-center">
                    <p className="text-sm font-semibold text-[#667085]">
                      No evidence attached
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="min-h-0 overflow-auto pr-1">
          <div className="space-y-4">
            {/* STATUS */}
            <section className="rounded-xl border border-[#E4E7EC] bg-white shadow-sm">
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <h2 className="text-sm font-bold text-[#101C2E]">
                  Current Status
                </h2>
              </div>

              <div className="p-5">
                <div className="rounded-lg bg-[#EEF4FF] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                    Report Status
                  </p>

                  <p className="mt-1 text-lg font-bold text-[#174A86]">
                    {reportDisplayStatus}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#667085]">
                    {reportStatusDescription}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">
                    Operational Status
                  </p>

                  <div className="mt-2 rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] px-3 py-2.5 text-sm font-medium text-[#344054]">
                    {status}
                  </div>

                  {!incident && status === "For Verification" ? (
                    <p className="mt-2 text-[11px] font-medium text-[#B54708]">
                      Verification must be completed before response
                      coordination can begin.
                    </p>
                  ) : !incident && status === "Prioritized" ? (
                    <p className="mt-2 text-[11px] font-medium text-[#175CD3]">
                      Verification and prioritization are complete.
                      Response coordination can now be started.
                    </p>
                  ) : !incident ? (
                    <p className="mt-2 text-[11px] text-[#667085]">
                      No response coordination case has been started yet.
                    </p>
                  ) : status === "Pending Response" ? (
                    <p className="mt-2 text-[11px] text-[#667085]">
                      Waiting for assigned response personnel to acknowledge and begin field response.
                    </p>
                  ) : status === "In Progress" && !hasFieldOutcome ? (
                    <p className="mt-2 text-[11px] text-[#667085]">
                      Field progress is updated from the assigned responder's actions.
                    </p>
                  ) : status === "In Progress" && hasFieldOutcome ? (
                    <p className="mt-2 text-[11px] font-semibold text-[#175CD3]">
                      Field outcome submitted. Admin may review the case and mark it resolved.
                    </p>
                  ) : status === "Resolved" ? (
                    <p className="mt-2 text-[11px] font-semibold text-[#667085]">
                      Response is resolved and ready for final administrative closure.
                    </p>
                  ) : status === "Closed" ? (
                    <p className="mt-2 text-[11px] font-semibold text-[#667085]">
                      This response case is closed.
                    </p>
                  ) : (
                    <p className="mt-2 text-[11px] text-[#667085]">
                      Operational progress is controlled by the assigned responder.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* VERIFICATION */}
            <section
              className={`rounded-xl border bg-white shadow-sm ${
                report.verification === "Verified"
                  ? "border-[#A6F4C5]"
                  : report.verification === "Returned"
                    ? "border-[#FDA29B]"
                    : "border-[#FEDF89]"
              }`}
            >
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                      Step 1
                    </p>

                    <h2 className="mt-0.5 text-sm font-bold text-[#101C2E]">
                      Verify Report Facts
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-[#667085]">
                      Review the factual information submitted by the resident.
                      Correct a value only when barangay verification shows that
                      the reported fact is inaccurate.
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      report.verification === "Verified"
                        ? "bg-[#ECFDF3] text-[#027A48]"
                        : report.verification === "Returned"
                          ? "bg-[#FEF3F2] text-[#B42318]"
                          : "bg-[#FFF7ED] text-[#B54708]"
                    }`}
                  >
                    {report.verification}
                  </span>
                </div>
              </div>

              <div className="space-y-4 p-5">
                {report.verification === "Verified" ? (
                  <div className="rounded-lg border border-[#A6F4C5] bg-[#ECFDF3] p-4">
                    <p className="text-sm font-bold text-[#027A48]">
                      Verification complete
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#027A48]">
                      The factual report information has been verified.
                      Continue to Step 2 to confirm the system-computed priority.
                    </p>
                  </div>
                ) : report.verification === "Returned" ? (
                  <div className="rounded-lg border border-[#FDA29B] bg-[#FEF3F2] p-4">
                    <p className="text-sm font-bold text-[#B42318]">
                      Returned for resident review
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#B42318]">
                      This report was returned for correction or clarification.
                      Wait for the resident to resubmit before verifying it.
                    </p>

                    {report.verificationRemarks && (
                      <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs text-[#475467]">
                        {report.verificationRemarks}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {selectedReport?.svf && (
                      <div className="rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-[#101C2E]">
                              Situation Verification Facts
                            </p>

                            <p className="mt-1 text-[11px] leading-4 text-[#667085]">
                              Review every factual field before clicking
                              Verify Report.
                            </p>
                          </div>

                          {Object.keys(
                            selectedReport.svfAllowedAnswers || {},
                          ).length > 0 && (
                            <span className="rounded-full border border-[#B2DDFF] bg-[#EFF8FF] px-2.5 py-1 text-[10px] font-bold text-[#175CD3]">
                              Facts editable
                            </span>
                          )}
                        </div>

                        <div className="mt-4">
                          <InfoItem
                            label="Situation Type"
                            value={formatVerificationFactValue(
                              selectedReport.svf.category,
                            )}
                          />
                        </div>

                        {Object.keys(
                          selectedReport.svfAllowedAnswers || {},
                        ).length > 0 ? (
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            {Object.entries(
                              selectedReport.svfAllowedAnswers,
                            ).map(([key, options]) => (
                              <div key={key}>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
                                  {formatVerificationFactLabel(key)}
                                </label>

                                <select
                                  value={inlineSvfAnswers[key] || ""}
                                  onChange={(event) => {
                                    setInlineSvfAnswers(
                                      (current) => ({
                                        ...current,
                                        [key]:
                                          event.target.value,
                                      }),
                                    );

                                    setVerificationActionError("");
                                  }}
                                  className="mt-2 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2.5 text-sm font-semibold text-[#344054] outline-none focus:border-[#1F5FA6]"
                                >
                                  <option value="" disabled>
                                    Select verified fact
                                  </option>

                                  {options.map((option) => (
                                    <option
                                      key={option}
                                      value={option}
                                    >
                                      {formatVerificationFactValue(
                                        option,
                                      )}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            {Object.entries(
                              selectedReport.svf.answers || {},
                            ).map(([key, value]) => (
                              <InfoItem
                                key={key}
                                label={formatVerificationFactLabel(
                                  key,
                                )}
                                value={formatVerificationFactValue(
                                  value,
                                )}
                              />
                            ))}
                          </div>
                        )}

                        <div className="mt-4 rounded-lg border border-[#B2DDFF] bg-[#EFF8FF] p-3">
                          <p className="text-[11px] font-semibold leading-4 text-[#175CD3]">
                            Admin verifies factual information only.
                            Priority is recomputed automatically by ResQNow
                            and cannot be manually overridden.
                          </p>
                        </div>
                      </div>
                    )}

                    {verificationActionError && (
                      <p
                        role="alert"
                        className="rounded-lg border border-[#FDA29B] bg-[#FEF3F2] px-3 py-2.5 text-xs font-semibold text-[#B42318]"
                      >
                        {verificationActionError}
                      </p>
                    )}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setReturnReviewRemarks("");
                          setReturnReviewError("");
                          setShowReturnReviewModal(true);
                        }}
                        disabled={verificationActionLoading}
                        className="rounded-lg border border-[#FDA29B] bg-white px-4 py-2.5 text-sm font-bold text-[#D92D20] transition hover:bg-[#FEF3F2] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Return for Review
                      </button>

                      <button
                        type="button"
                        onClick={handleInlineVerifyReport}
                        disabled={verificationActionLoading}
                        className="rounded-lg bg-[#1F5FA6] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#174A86] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {verificationActionLoading
                          ? "Verifying & Recomputing..."
                          : "Verify Report"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>
            {/* SYSTEM-COMPUTED PRIORITY */}
            <section className="rounded-xl border border-[#E4E7EC] bg-white shadow-sm">
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                  Step 2
                </p>

                <h2 className="mt-0.5 text-sm font-bold text-[#101C2E]">
                  Confirm System Priority
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#667085]">
                  Review the priority generated by ResQNow from the verified
                  facts. Admin confirms the result but does not manually select
                  or override the priority.
                </p>
              </div>

              <div className="space-y-4 p-5">
                {report.verification !== "Verified" ? (
                  <div className="rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] p-4">
                    <p className="text-xs font-bold text-[#667085]">
                      Step 2 is locked
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#667085]">
                      Complete Step 1 Report Verification first.
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      className={`rounded-lg border p-4 ${
                        report.triage.recommendation ||
                        report.priority
                          ? getRecommendationStyle(
                              report.triage.recommendation ||
                                report.priority,
                            ).container
                          : "border-[#E4E7EC] bg-[#F8FAFC]"
                      }`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                        System Priority
                      </p>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-lg font-extrabold text-[#101C2E]">
                          {report.triage.recommendation ||
                            report.priority ||
                            "Not assessed"}
                        </p>

                        {report.triage.score !== null &&
                          report.triage.score !== undefined && (
                            <span className="text-xs font-bold text-[#667085]">
                              System Score: {report.triage.score}
                            </span>
                          )}
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#B2DDFF] bg-[#EFF8FF] p-4">
                      <p className="text-xs font-bold text-[#175CD3]">
                        System-controlled priority
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#175CD3]">
                        ResQNow has already recalculated this result from the
                        verified facts. Confirming continues the workflow;
                        it does not change the priority.
                      </p>
                    </div>

                    {priorityActionError && (
                      <p
                        role="alert"
                        className="rounded-lg border border-[#FDA29B] bg-[#FEF3F2] px-3 py-2.5 text-xs font-semibold text-[#B42318]"
                      >
                        {priorityActionError}
                      </p>
                    )}

                    {status === "For Prioritization" ? (
                      <button
                        type="button"
                        onClick={handleInlineConfirmPriority}
                        disabled={priorityActionLoading}
                        className="w-full rounded-lg bg-[#1F5FA6] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#174A86] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {priorityActionLoading
                          ? "Confirming Priority..."
                          : "Confirm Priority & Continue"}
                      </button>
                    ) : status === "Prioritized" || incident ? (
                      <div className="rounded-lg border border-[#A6F4C5] bg-[#ECFDF3] p-4">
                        <p className="text-xs font-bold text-[#027A48]">
                          Priority confirmed
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#027A48]">
                          Continue to Step 3 for responder coordination.
                        </p>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </section>
            {/* ASSIGNMENT */}
            <section className="rounded-xl border border-[#E4E7EC] bg-white shadow-sm">
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                  Step 3
                </p>

                <h2 className="mt-0.5 text-sm font-bold text-[#101C2E]">
                  Response Coordination
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#667085]">
                  Assign and monitor responders only after report verification
                  and system prioritization are complete.
                </p>
              </div>

              <div className="space-y-4 p-5">
              {assignmentDecline &&
                incident &&
                !incident.assigned_personnel_id && (
                  <div
                    role="alert"
                    className="rounded-lg border border-[#FDA29B] bg-[#FEF3F2] p-4"
                  >
                    <p className="text-sm font-bold text-[#B42318]">
                      Responder Declined - Reassignment Required
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#B42318]">
                      The assigned responder declined this case.
                      Select another Primary Responder before continuing.
                    </p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg border border-[#FECDCA] bg-white px-3 py-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#912018]">
                          Declined By
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[#344054]">
                          {assignmentDecline.user_name ||
                            "Assigned responder"}
                        </p>
                      </div>

                      <div className="rounded-lg border border-[#FECDCA] bg-white px-3 py-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#912018]">
                          Declined At
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[#344054]">
                          {assignmentDecline.created_at
                            ? formatHistoryTime(
                                assignmentDecline.created_at,
                              )
                            : "Time unavailable"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 rounded-lg border border-[#FECDCA] bg-white px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#912018]">
                        Decline Details
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#344054]">
                        {assignmentDecline.remarks ||
                          "No decline reason was available."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAssignmentError("");
                        setShowAssignmentModal(true);
                      }}
                      className="mt-3 rounded-lg border border-[#D92D20] bg-white px-3 py-2 text-xs font-bold text-[#B42318] transition hover:bg-[#FFF1F0]"
                    >
                      Choose New Primary Responder
                    </button>
                  </div>
                )}

                {isAssignmentOverdue && (
                  <div
                    role="alert"
                    className="rounded-lg border border-[#FDA29B] bg-[#FEF3F2] p-4"
                  >
                    <p className="text-sm font-bold text-[#B42318]">
                      Unacknowledged Assignment
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#B42318]">
                      {assignment.personnel !== "Unassigned"
                        ? assignment.personnel
                        : "The assigned responder"}{" "}
                      has not acknowledged this case within the configured{" "}
                      {assignmentMonitor?.timeoutMinutes || 5}-minute
                      acknowledgement period.
                    </p>

                    <p className="mt-2 text-[11px] leading-4 text-[#912018]">
                      Waiting for approximately {liveMinutesWaiting} minute
                      {liveMinutesWaiting === 1 ? "" : "s"}. ResQNow does not
                      automatically dispatch another responder. Barangay
                      personnel should contact the responder or reassign the
                      case when necessary.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setAssignmentError("");
                        setShowAssignmentModal(true);
                      }}
                      className="mt-3 rounded-lg border border-[#D92D20] bg-white px-3 py-2 text-xs font-bold text-[#B42318] transition hover:bg-[#FFF1F0]"
                    >
                      Change Primary Responder
                    </button>
                  </div>
                )}

                <InfoItem label="Response Unit" value={assignment.team} />

                <InfoItem
                  label="Primary Responder"
                  value={assignment.personnel}
                />

                <InfoItem label="Assigned At" value={assignment.assignedAt} />

                {incident?.assigned_personnel_id && (
                  <InfoItem
                    label="Acknowledgement Status"
                    value={acknowledgementStatus}
                  />
                )}

                {!incident && status === "For Verification" ? (
                <div className="rounded-lg border border-[#FEDF89] bg-[#FFFAEB] p-4">
                  <p className="text-xs font-bold text-[#B54708]">
                    Step 3 is locked
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#B54708]">
                    Complete Step 1 Report Verification above.
                  </p>
                </div>
              ) : !incident && status === "For Prioritization" ? (
                <div className="rounded-lg border border-[#B2DDFF] bg-[#EFF8FF] p-4">
                  <p className="text-xs font-bold text-[#175CD3]">
                    Step 3 is locked
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#175CD3]">
                    Confirm the system-computed priority in Step 2 above.
                  </p>
                </div>
              ) : !incident && status === "Prioritized" ? (
                <button
                  type="button"
                  onClick={handleCreateIncident}
                  disabled={assignmentLoading}
                  className="w-full rounded-lg bg-[#1F5FA6] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#174A86] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {assignmentLoading
                    ? "Starting Response Coordination..."
                    : "Start Response Coordination"}
                </button>
              ) : incident ? (
                <button
                  type="button"
                  onClick={() => {
                    setAssignmentError("");
                    setShowAssignmentModal(true);
                  }}
                  className="w-full rounded-lg border border-[#1F5FA6] bg-white px-4 py-3 text-sm font-bold text-[#1F5FA6] transition hover:bg-[#EAF1FA]"
                >
                  {incident.assigned_personnel_id
                    ? "Change Primary Responder"
                    : "Assign Primary Responder"}
                </button>
              ) : (
                <div className="rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] p-4">
                  <p className="text-xs font-semibold text-[#667085]">
                    Response coordination is not available at the current
                    report stage.
                  </p>
                </div>
              )}
              </div>
            </section>

            {/* HISTORY */}
            <section className="rounded-xl border border-[#E4E7EC] bg-white shadow-sm">
              <div className="border-b border-[#E4E7EC] px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold text-[#101C2E]">
                    Status History
                  </h2>

                  <button
                    type="button"
                    onClick={() => setShowMoreHistory((current) => !current)}
                    className="text-[11px] font-semibold text-[#1F5FA6]"
                  >
                    {showMoreHistory ? "Show Less" : "View All"}
                  </button>
                </div>
              </div>

              <div className="p-5">
                {visibleHistory.length > 0 ? (
                  <div className="space-y-4">
                    {visibleHistory.map((item, index) => (
                      <div
                        key={`${item.status}-${item.time}-${index}`}
                        className="flex gap-3"
                      >
                        <div className="flex flex-col items-center">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF1FA] text-xs font-bold text-[#1F5FA6]">
                            <Check size={14} strokeWidth={3} />
                          </span>

                          {index !== visibleHistory.length - 1 && (
                            <span className="mt-1 h-full w-px bg-[#E4E7EC]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#344054]">
                            {item.status}
                          </p>

                          <p className="mt-0.5 text-[11px] leading-4 text-[#667085]">
                            {item.detail}
                          </p>

                          <p className="mt-1 text-[11px] font-semibold text-[#98A2B3]">
                            {item.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#667085]">
                    No status history is available for this report yet.
                  </p>
                )}
              </div>
            </section>

            {/* ADMIN RESOLUTION RECORD */}
            {incident?.resolution_type && (
              <section className="rounded-xl border border-[#D1E9FF] bg-[#F5FAFF] p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#175CD3]">
                      Admin Resolution Record
                    </p>

                    <h3 className="mt-1 text-sm font-bold text-[#101C2E]">
                      {resolutionTypeLabels[
                        incident.resolution_type
                      ] ||
                        incident.resolution_type}
                    </h3>
                  </div>

                  {incident.resolved_at && (
                    <span className="text-[11px] font-semibold text-[#667085]">
                      {formatDisplayDate(
                        incident.resolved_at,
                      )}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">
                    Admin Resolution Remarks
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#344054]">
                    {incident.resolution_remarks ||
                      "Not provided"}
                  </p>
                </div>

                {incident.resolution_type ===
                  "referred_handoff" && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">
                        Agency / Office
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#344054]">
                        {incident.handoff_agency ||
                          "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">
                        Handoff Details
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#344054]">
                        {incident.handoff_details ||
                          "Not provided"}
                      </p>
                    </div>
                  </div>
                )}

                {incident.status === "Closed" &&
                  incident.closed_at && (
                    <div className="mt-4 rounded-lg border border-[#D0D5DD] bg-white px-3 py-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                        Final Administrative Closure
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[#344054]">
                        Closed{" "}
                        {formatDisplayDate(
                          incident.closed_at,
                        )}
                      </p>
                    </div>
                  )}
              </section>
            )}

            {/* NEXT RESPONSE ACTION */}
            {incident && nextIncidentStatus && (
              <button
                type="button"
                onClick={() => {
                  if (
                    nextIncidentStatus ===
                    "Resolved"
                  ) {
                    openResolutionModal();
                  } else {
                    openClosureModal();
                  }
                }}
                disabled={lifecycleLoading}
                className="w-full rounded-lg bg-[#1F5FA6] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#174A86] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {nextIncidentStatus === "Resolved"
                  ? "Review and Mark Case Resolved"
                  : "Review and Close Response Case"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ADMIN RESOLUTION REVIEW MODAL */}
      {showResolutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#101C2E]/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#E4E7EC] px-6 py-4">
              <h2 className="text-lg font-bold text-[#101C2E]">
                Admin Resolution Review
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#667085]">
                Review the responder field outcome and document the official barangay resolution decision.
              </p>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
              <div>
                <label className="text-xs font-bold text-[#475467]">
                  Resolution Type *
                </label>

                <select
                  value={resolutionType}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    setResolutionType(value);
                    setLifecycleError("");

                    if (
                      value !==
                      "referred_handoff"
                    ) {
                      setHandoffAgency("");
                      setHandoffDetails("");
                    }
                  }}
                  disabled={lifecycleLoading}
                  className="mt-2 h-11 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 text-sm text-[#344054] outline-none focus:border-[#1F5FA6] disabled:bg-[#F2F4F7]"
                >
                  <option value="">
                    Select resolution type
                  </option>

                  <option value="resolved_on_scene">
                    Resolved on scene
                  </option>

                  <option value="referred_handoff">
                    Referred / handed off
                  </option>

                  <option value="no_further_barangay_response">
                    No further barangay response required
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#475467]">
                  Admin Resolution Remarks *
                </label>

                <textarea
                  value={resolutionRemarks}
                  onChange={(event) => {
                    setResolutionRemarks(
                      event.target.value,
                    );

                    setLifecycleError("");
                  }}
                  disabled={lifecycleLoading}
                  rows={4}
                  maxLength={3000}
                  placeholder="Summarize the Admin review, final barangay action, and basis for resolution."
                  className="mt-2 w-full resize-y rounded-lg border border-[#D0D5DD] px-3 py-2.5 text-sm text-[#344054] outline-none focus:border-[#1F5FA6] disabled:bg-[#F2F4F7]"
                />
              </div>

              {resolutionType ===
                "referred_handoff" && (
                <>
                  <div>
                    <label className="text-xs font-bold text-[#475467]">
                      Agency / Office *
                    </label>

                    <input
                      type="text"
                      value={handoffAgency}
                      onChange={(event) => {
                        setHandoffAgency(
                          event.target.value,
                        );

                        setLifecycleError("");
                      }}
                      disabled={lifecycleLoading}
                      maxLength={255}
                      placeholder="Example: City Health Office"
                      className="mt-2 h-11 w-full rounded-lg border border-[#D0D5DD] px-3 text-sm text-[#344054] outline-none focus:border-[#1F5FA6] disabled:bg-[#F2F4F7]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#475467]">
                      Handoff Details *
                    </label>

                    <textarea
                      value={handoffDetails}
                      onChange={(event) => {
                        setHandoffDetails(
                          event.target.value,
                        );

                        setLifecycleError("");
                      }}
                      disabled={lifecycleLoading}
                      rows={3}
                      maxLength={3000}
                      placeholder="State what was endorsed, to whom, and the relevant continuation of care or response."
                      className="mt-2 w-full resize-y rounded-lg border border-[#D0D5DD] px-3 py-2.5 text-sm text-[#344054] outline-none focus:border-[#1F5FA6] disabled:bg-[#F2F4F7]"
                    />
                  </div>
                </>
              )}

              {lifecycleError && (
                <p className="rounded-lg border border-[#FECDCA] bg-[#FEF3F2] px-3 py-2.5 text-xs font-semibold leading-5 text-[#B42318]">
                  {lifecycleError}
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-[#E4E7EC] px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  if (lifecycleLoading) return;

                  setLifecycleError("");
                  setShowResolutionModal(false);
                }}
                disabled={lifecycleLoading}
                className="rounded-lg border border-[#D0D5DD] px-4 py-2.5 text-sm font-semibold text-[#475467] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmitResolution}
                disabled={
                  lifecycleLoading ||
                  !resolutionType ||
                  !resolutionRemarks.trim() ||
                  (
                    resolutionType ===
                      "referred_handoff" &&
                    (
                      !handoffAgency.trim() ||
                      !handoffDetails.trim()
                    )
                  )
                }
                className="rounded-lg bg-[#1F5FA6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174A86] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {lifecycleLoading
                  ? "Saving Resolution..."
                  : "Confirm Resolution"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINAL ADMINISTRATIVE CLOSURE MODAL */}
      {showClosureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#101C2E]/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#E4E7EC] px-6 py-4">
              <h2 className="text-lg font-bold text-[#101C2E]">
                Final Administrative Closure
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#667085]">
                Closing the response case is a final administrative action after resolution. Confirm every item before closure.
              </p>
            </div>

            <div className="space-y-3 p-6">
              {[
                {
                  key:
                    "fieldOutcomeReviewed",
                  label:
                    "Responder field outcome has been reviewed.",
                },
                {
                  key:
                    "resolutionReviewed",
                  label:
                    "Admin resolution record has been reviewed and is complete.",
                },
                {
                  key:
                    "handoffVerified",
                  label:
                    incident?.resolution_type ===
                    "referred_handoff"
                      ? "Required agency / office handoff information has been reviewed and is complete."
                      : "Handoff requirement has been reviewed and is not applicable to this case.",
                },
                {
                  key:
                    "readyConfirmed",
                  label:
                    "This case is ready for final administrative closure.",
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#E4E7EC] bg-[#F9FAFB] p-3"
                >
                  <input
                    type="checkbox"
                    checked={
                      closureChecklist[
                        item.key
                      ]
                    }
                    onChange={(event) => {
                      setClosureChecklist(
                        (current) => ({
                          ...current,
                          [item.key]:
                            event.target.checked,
                        }),
                      );

                      setLifecycleError("");
                    }}
                    disabled={lifecycleLoading}
                    className="mt-0.5 h-4 w-4"
                  />

                  <span className="text-sm leading-5 text-[#344054]">
                    {item.label}
                  </span>
                </label>
              ))}

              {lifecycleError && (
                <p className="rounded-lg border border-[#FECDCA] bg-[#FEF3F2] px-3 py-2.5 text-xs font-semibold leading-5 text-[#B42318]">
                  {lifecycleError}
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-[#E4E7EC] px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  if (lifecycleLoading) return;

                  setLifecycleError("");
                  setShowClosureModal(false);
                }}
                disabled={lifecycleLoading}
                className="rounded-lg border border-[#D0D5DD] px-4 py-2.5 text-sm font-semibold text-[#475467] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmitClosure}
                disabled={
                  lifecycleLoading ||
                  !closureChecklist.fieldOutcomeReviewed ||
                  !closureChecklist.resolutionReviewed ||
                  !closureChecklist.handoffVerified ||
                  !closureChecklist.readyConfirmed
                }
                className="rounded-lg bg-[#1F5FA6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174A86] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {lifecycleLoading
                  ? "Closing Case..."
                  : "Confirm Final Closure"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN FOR REVIEW MODAL */}
    {showReturnReviewModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101C2E]/40 p-4">
        <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
          <div className="border-b border-[#E4E7EC] px-6 py-4">
            <h2 className="text-lg font-bold text-[#101C2E]">
              Return Report for Review
            </h2>

            <p className="mt-1 text-xs leading-5 text-[#667085]">
              Explain what information the resident needs to correct or
              clarify before this report can be verified.
            </p>
          </div>

          <div className="space-y-3 p-6">
            <label className="text-xs font-bold text-[#475467]">
              Review Remarks *
            </label>

            <textarea
              rows="4"
              value={returnReviewRemarks}
              onChange={(event) => {
                setReturnReviewRemarks(event.target.value);
                setReturnReviewError("");
              }}
              placeholder="Example: Please clarify the exact location and current hazard condition."
              className="w-full rounded-lg border border-[#D0D5DD] px-3 py-3 text-sm outline-none focus:border-[#1F5FA6]"
            />

            {returnReviewError && (
              <p className="rounded-lg border border-[#FDA29B] bg-[#FEF3F2] px-3 py-2 text-xs font-semibold text-[#B42318]">
                {returnReviewError}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-[#E4E7EC] px-6 py-4">
            <button
              type="button"
              onClick={() => {
                setShowReturnReviewModal(false);
                setReturnReviewRemarks("");
                setReturnReviewError("");
              }}
              disabled={returnReviewLoading}
              className="rounded-lg border border-[#D0D5DD] px-4 py-2.5 text-sm font-semibold text-[#475467]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleInlineReturnForReview}
              disabled={returnReviewLoading}
              className="rounded-lg bg-[#D92D20] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {returnReviewLoading
                ? "Returning..."
                : "Confirm Return for Review"}
            </button>
          </div>
        </div>
      </div>
    )}
    {/* ASSIGNMENT MODAL */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101C2E]/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#101C2E]">
                  {incident?.assigned_personnel_id ? "Change Primary Responder" : "Assign Primary Responder"}
                </h2>

                <p className="mt-1 text-xs text-[#667085]">
                  {incident?.assigned_personnel_id ? "Select a different available responder for this response case." : "Select the responder who will be primarily accountable for this response case."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAssignmentError("");
                  setShowAssignmentModal(false);
                }}
                className="text-lg font-bold text-[#98A2B3] hover:text-[#344054]"
              >
                X
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="text-xs font-bold text-[#475467]">
                  Response Unit
                </label>

                <select
                  value={selectedTeam}
                  onChange={(event) => {
                    setSelectedTeam(event.target.value);
                    setSelectedPersonnel("");
                  }}
                  className="mt-2 h-11 w-full rounded-lg border border-[#E4E7EC] bg-white px-3 text-sm text-[#344054] outline-none focus:border-[#1F5FA6]"
                >
                  <option value="">Select response unit</option>

                  {Array.from(
                    new Set(
                      personnelList
                        .filter(
                          (person) =>
                            person.status === "Active" &&
                            person.team,
                        )
                        .map((person) => person.team),
                    ),
                  ).map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>

                <p className="mt-1 text-[11px] text-[#98A2B3]">
                  Select the response function needed for this case.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#475467]">
                  Primary Responder
                </label>

                <select
                  value={selectedPersonnel}
                  onChange={(event) => {
                    setSelectedPersonnel(event.target.value);
                  }}
                  disabled={!selectedTeam}
                  className="mt-2 h-11 w-full rounded-lg border border-[#E4E7EC] px-3 text-sm outline-none focus:border-[#1F5FA6]"
                >
                  <option value="">Select primary responder</option>

                  {personnelList
                    .filter(
                      (person) =>
                        person.status === "Active" &&
                        person.team === selectedTeam &&
                        (person.availability === "Available" ||
                          String(person.id) === selectedPersonnel),
                    )
                    .map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name} - {person.role || "Responder"}
                      </option>
                    ))}
                </select>
              </div>

              {assignmentError && (
                <p className="rounded-lg border border-[#FECDCA] bg-[#FEF3F2] px-3 py-2 text-xs font-semibold text-[#B42318]">
                  {assignmentError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E4E7EC] px-6 py-4">
              <button
                type="button"
                onClick={() => setShowAssignmentModal(false)}
                className="rounded-lg border border-[#E4E7EC] px-4 py-2.5 text-sm font-semibold text-[#475467]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveAssignment}
                disabled={assignmentLoading || !selectedPersonnel}
                className="rounded-lg bg-[#1F5FA6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1F5FA6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assignmentLoading ? "Saving..." : incident?.assigned_personnel_id ? "Save Change" : "Assign Primary Responder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportDetails;
