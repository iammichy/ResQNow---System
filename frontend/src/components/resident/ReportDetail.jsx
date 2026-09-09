// src/components/resident/ReportDetail.jsx
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Siren,
  FileText,
  MapPin,
  Clock,
  UserRound,
  MessageSquareText,
  Check,
  Circle,
  AlertTriangle,
  CheckCircle2,
  Users,
  HandHeart,
} from 'lucide-react';

import { mockAllReports } from '../../data/mockData';
import { getStatusStyle, getPriorityStyle } from '../../utils/statusUtils';

// ============ TIMELINE STYLE ============
// Returns semantic colors for completed timeline steps
function getTimelineStyle(status) {
  switch (status) {
    case 'Submitted':
      return {
        circle: 'bg-resqnow-info text-white',
        line: 'bg-resqnow-info/30',
      };

    case 'Pending Verification':
      return {
        circle: 'bg-resqnow-pending text-white',
        line: 'bg-resqnow-pending/30',
      };

    case 'Verified':
      return {
        circle: 'bg-resqnow-mint text-white',
        line: 'bg-resqnow-mint/30',
      };

    case 'Assigned':
    case 'In Progress':
      return {
        circle: 'bg-resqnow-insight text-white',
        line: 'bg-resqnow-insight/30',
      };

    case 'Responders En Route':
      return {
        circle: 'bg-resqnow-violet text-white',
        line: 'bg-resqnow-violet/30',
      };

    case 'Responded':
      return {
        circle: 'bg-resqnow-mint text-white',
        line: 'bg-resqnow-mint/30',
      };

    case 'Resolved':
      return {
        circle: 'bg-resqnow-safe text-white',
        line: 'bg-resqnow-safe/30',
      };

    case 'Invalid':
      return {
        circle: 'bg-resqnow-crimson text-white',
        line: 'bg-resqnow-crimson/30',
      };

    default:
      return {
        circle: 'bg-resqnow-violet text-white',
        line: 'bg-resqnow-violet/30',
      };
  }
}

// ============ REPORT DETAIL ============
// Full detail view of a single report
export default function ReportDetail() {
  const navigate = useNavigate();
  const { reportId } = useParams();

  // Find the report using the ID from the URL
  const report = mockAllReports.find(
    (item) => item.id === reportId
  );

  // ============ REPORT NOT FOUND ============
  if (!report) {
    return (
      <div className="px-4 pt-5 pb-28 min-h-screen">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate('/track')}
          className="flex items-center gap-1.5 text-[12px] font-medium text-resqnow-muted hover:text-resqnow-violet active:scale-95 transition-all mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Track
        </button>

        {/* Empty state */}
        <div className="bg-white border border-resqnow-border-soft rounded-2xl py-12 px-6 text-center">

          <div className="w-12 h-12 rounded-full bg-resqnow-canvas flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-resqnow-placeholder" />
          </div>

          <p className="text-sm font-semibold text-resqnow-primary">
            Report not found
          </p>

          <p className="text-[11px] text-resqnow-muted mt-1">
            The report you are looking for does not exist.
          </p>

          <button
            type="button"
            onClick={() => navigate('/track')}
            className="mt-5 px-4 py-2.5 rounded-xl bg-brand-gradient text-white text-[12px] font-semibold active:scale-[0.98] transition-all"
          >
            View My Reports
          </button>
        </div>
      </div>
    );
  }

  // Report state helpers
  const isEmergency = report.reportType === 'Emergency';
  const isResolved = report.status === 'Resolved';
  const isInvalid = report.status === 'Invalid';

  return (
    <div className="px-4 pt-5 pb-28 min-h-screen">

      {/* ============ BACK BUTTON ============ */}
      <button
        type="button"
        onClick={() => navigate('/track')}
        className="flex items-center gap-1.5 text-[12px] font-medium text-resqnow-muted hover:text-resqnow-violet active:scale-95 transition-all mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Track
      </button>

      {/* ============ REPORT HEADER ============ */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl overflow-hidden mb-4">

        {/* Emergency uses Red, non-emergency uses Brand */}
        <div
          className={`h-1 ${
            isEmergency
              ? 'bg-emergency-gradient'
              : 'bg-brand-gradient'
          }`}
        />

        <div className="p-4">

          <div className="flex items-start gap-3">

            {/* Report icon */}
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                isEmergency
                  ? 'bg-resqnow-critical/10 text-resqnow-critical'
                  : 'bg-resqnow-violet/10 text-resqnow-violet'
              }`}
            >
              {isEmergency ? (
                <Siren className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">

              {/* Report ID + type + priority */}
              <div className="flex items-center gap-2 flex-wrap">

                <span className="text-[10px] font-bold text-resqnow-muted">
                  {report.id}
                </span>

                {/* Report type */}
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isEmergency
                      ? 'bg-resqnow-critical/15 text-resqnow-critical'
                      : 'bg-resqnow-violet/15 text-resqnow-violet'
                  }`}
                >
                  {report.reportType}
                </span>

                {/* Priority */}
                <span
                  className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityStyle(
                    report.priority
                  )}`}
                >
                  {report.priority} Priority
                </span>
              </div>

              {/* Concern */}
              <h1 className="text-lg font-bold text-resqnow-primary mt-1">
                {report.concernType}
              </h1>

              {/* Subcategory */}
              {report.subcategory && (
                <p className="text-[11px] text-resqnow-muted mt-0.5">
                  {report.subcategory}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CURRENT STATUS ============ */}
      <section
        className={`border rounded-2xl p-4 mb-4 ${
          isResolved
            ? 'bg-resqnow-safe/10 border-resqnow-safe/20'
            : isInvalid
            ? 'bg-resqnow-crimson/10 border-resqnow-crimson/20'
            : 'bg-white border-resqnow-border-soft'
        }`}
      >
        {/* Status heading */}
        <p
          className={`text-[10px] font-bold uppercase tracking-wider ${
            isResolved
              ? 'text-resqnow-safe'
              : isInvalid
              ? 'text-resqnow-crimson'
              : 'text-resqnow-muted'
          }`}
        >
          Current Status
        </p>

        {/* Status + update time */}
        <div className="flex items-center justify-between gap-3 mt-2">

          {/* Shared status badge */}
          <span
            className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${getStatusStyle(
              report.status
            )}`}
          >
            {report.status}
          </span>

          <div
            className={`flex items-center gap-1 text-[10px] ${
              isResolved
                ? 'text-resqnow-safe'
                : isInvalid
                ? 'text-resqnow-crimson'
                : 'text-resqnow-muted'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />

            Updated {report.updatedAt}
          </div>
        </div>

        {/* Latest update */}
        {report.latestUpdate && (
          <div
            className={`mt-4 rounded-xl p-3 ${
              isResolved || isInvalid
                ? 'bg-white/70'
                : 'bg-resqnow-canvas'
            }`}
          >
            <p
              className={`text-[9px] font-bold uppercase tracking-wide ${
                isResolved
                  ? 'text-resqnow-safe'
                  : isInvalid
                  ? 'text-resqnow-crimson'
                  : 'text-resqnow-muted'
              }`}
            >
              Latest Update
            </p>

            <p className="text-[12px] text-resqnow-secondary mt-1 leading-relaxed">
              {report.latestUpdate}
            </p>
          </div>
        )}

        {/* Resolved remarks */}
        {isResolved && report.resolvedRemarks && (
          <div className="mt-3 pt-3 border-t border-resqnow-safe/20">

            <div className="flex items-center gap-2">

              <CheckCircle2 className="w-4 h-4 text-resqnow-safe" />

              <p className="text-[9px] font-bold uppercase tracking-wide text-resqnow-safe">
                Resolution Remarks
              </p>
            </div>

            <p className="text-[12px] text-resqnow-secondary mt-1.5 leading-relaxed">
              {report.resolvedRemarks}
            </p>
          </div>
        )}
      </section>

      {/* ============ REPORT PROGRESS ============ */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl p-4 mb-4">

        <h2 className="text-sm font-bold text-resqnow-primary mb-4">
          Report Progress
        </h2>

        <div>
          {report.timeline.map((step, index) => {
            const isLast =
              index === report.timeline.length - 1;

            // Get correct status color
            const timelineStyle =
              getTimelineStyle(step.status);

            return (
              <div
                key={step.status}
                className="flex gap-3"
              >
                {/* Timeline line + circle */}
                <div className="flex flex-col items-center">

                  {/* Status circle */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      step.done
                        ? timelineStyle.circle
                        : 'bg-resqnow-canvas text-resqnow-placeholder border border-resqnow-border-soft'
                    }`}
                  >
                    {step.done ? (
                      <Check
                        className="w-4 h-4"
                        strokeWidth={3}
                      />
                    ) : (
                      <Circle className="w-3 h-3" />
                    )}
                  </div>

                  {/* Connecting line */}
                  {!isLast && (
                    <div
                      className={`w-0.5 min-h-[46px] flex-1 ${
                        step.done
                          ? timelineStyle.line
                          : 'bg-resqnow-border-soft'
                      }`}
                    />
                  )}
                </div>

                {/* Status information */}
                <div
                  className={`flex-1 ${
                    isLast ? '' : 'pb-5'
                  }`}
                >
                  <p
                    className={`text-[12px] font-semibold ${
                      step.done
                        ? 'text-resqnow-primary'
                        : 'text-resqnow-muted'
                    }`}
                  >
                    {step.status}
                  </p>

                  <p className="text-[10px] text-resqnow-muted mt-0.5">
                    {step.date || 'Waiting for update'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ ASSIGNED PERSONNEL ============ */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl p-4 mb-4">

        <div className="flex items-center gap-2 mb-3">

          <UserRound className="w-4 h-4 text-resqnow-insight" />

          <h2 className="text-sm font-bold text-resqnow-primary">
            Assigned Personnel
          </h2>
        </div>

        {report.assignedPersonnel ? (
          <div className="flex items-center gap-3 bg-resqnow-insight/5 border border-resqnow-insight/10 rounded-xl p-3">

            {/* Personnel icon */}
            <div className="w-9 h-9 rounded-full bg-resqnow-insight/15 text-resqnow-insight flex items-center justify-center">
              <UserRound className="w-4 h-4" />
            </div>

            <div>
              <p className="text-[12px] font-semibold text-resqnow-primary">
                {report.assignedPersonnel}
              </p>

              <p className="text-[10px] text-resqnow-muted mt-0.5">
                Assigned to this report
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-resqnow-canvas rounded-xl p-3">

            <p className="text-[11px] text-resqnow-muted">
              No personnel has been assigned yet.
            </p>
          </div>
        )}
      </section>

      {/* ============ LOCATION ============ */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl p-4 mb-4">

        <div className="flex items-center gap-2 mb-3">

          <MapPin className="w-4 h-4 text-resqnow-violet" />

          <h2 className="text-sm font-bold text-resqnow-primary">
            Incident Location
          </h2>
        </div>

        <div className="bg-resqnow-canvas rounded-xl p-3">

          <p className="text-[12px] font-semibold text-resqnow-primary">
            {report.location}
          </p>

          {report.landmark && (
            <p className="text-[11px] text-resqnow-muted mt-1">
              Landmark: {report.landmark}
            </p>
          )}
        </div>
      </section>

      {/* ============ REPORT INFORMATION ============ */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl p-4 mb-4">

        <div className="flex items-center gap-2 mb-3">

          <FileText className="w-4 h-4 text-resqnow-violet" />

          <h2 className="text-sm font-bold text-resqnow-primary">
            Report Information
          </h2>
        </div>

        {/* Main report information */}
        <InfoRow
          label="Submitted"
          value={report.submittedAt}
        />

        <InfoRow
          label="Report Type"
          value={report.reportType}
        />

        <InfoRow
          label="Concern"
          value={report.concernType}
        />

        {report.subcategory && (
          <InfoRow
            label="Subcategory"
            value={report.subcategory}
          />
        )}

        {report.reportingFor && (
          <InfoRow
            label="Reporting For"
            value={report.reportingFor}
          />
        )}

        {/* Description */}
        <div className="mt-4 pt-4 border-t border-resqnow-border-soft">

          <p className="text-[10px] font-bold text-resqnow-muted uppercase tracking-wide">
            Description
          </p>

          <p className="text-[12px] text-resqnow-secondary mt-1.5 leading-relaxed">
            {report.description ||
              'No description provided.'}
          </p>
        </div>

        {/* Assistance needed */}
        {report.requiredAssistance && (
          <div className="mt-4 pt-4 border-t border-resqnow-border-soft">

            <div className="flex items-center gap-2">

              <HandHeart className="w-4 h-4 text-resqnow-violet" />

              <p className="text-[10px] font-bold text-resqnow-muted uppercase tracking-wide">
                Assistance Needed
              </p>
            </div>

            <p className="text-[12px] text-resqnow-secondary mt-1.5 leading-relaxed">
              {report.requiredAssistance}
            </p>
          </div>
        )}

        {/* Affected individuals */}
        {report.affectedIndividuals?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-resqnow-border-soft">

            <div className="flex items-center gap-2 mb-2">

              <Users className="w-4 h-4 text-resqnow-violet" />

              <p className="text-[10px] font-bold text-resqnow-muted uppercase tracking-wide">
                Affected Individuals
              </p>
            </div>

            <div className="flex flex-wrap gap-2">

              {report.affectedIndividuals.map(
                (person) => (
                  <span
                    key={person}
                    className="text-[10px] font-medium px-2.5 py-1 bg-resqnow-violet/10 text-resqnow-violet rounded-full"
                  >
                    {person}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* Victim information */}
        {(report.victimName ||
          report.victimContact) && (
          <div className="mt-4 pt-4 border-t border-resqnow-border-soft">

            <p className="text-[10px] font-bold text-resqnow-muted uppercase tracking-wide mb-2">
              Victim Information
            </p>

            {report.victimName && (
              <InfoRow
                label="Name"
                value={report.victimName}
              />
            )}

            {report.victimContact && (
              <InfoRow
                label="Contact"
                value={report.victimContact}
              />
            )}
          </div>
        )}
      </section>

      {/* ============ BARANGAY REMARKS ============ */}
      {/* Remarks are informational, so use Info Blue */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl p-4 mb-4">

        <div className="flex items-center gap-2 mb-3">

          <MessageSquareText className="w-4 h-4 text-resqnow-info" />

          <h2 className="text-sm font-bold text-resqnow-primary">
            Barangay Remarks
          </h2>
        </div>

        {report.barangayRemarks ? (
          <div className="bg-resqnow-info/5 border border-resqnow-info/10 rounded-xl p-3">

            <p className="text-[12px] text-resqnow-secondary leading-relaxed">
              {report.barangayRemarks}
            </p>
          </div>
        ) : (
          <div className="bg-resqnow-canvas rounded-xl p-3">

            <p className="text-[11px] text-resqnow-muted">
              No barangay remarks available yet.
            </p>
          </div>
        )}
      </section>

      {/* ============ INVALID REPORT ============ */}
      {report.invalidReason && (
        <section className="bg-resqnow-crimson/10 border border-resqnow-crimson/20 rounded-2xl p-4">

          <div className="flex items-center gap-2 mb-2">

            <AlertTriangle className="w-5 h-5 text-resqnow-crimson" />

            <h2 className="text-sm font-bold text-resqnow-crimson">
              Report Marked Invalid
            </h2>
          </div>

          <p className="text-[10px] font-bold text-resqnow-crimson uppercase tracking-wide">
            Reason
          </p>

          <p className="text-[12px] text-resqnow-secondary mt-1 leading-relaxed">
            {report.invalidReason}
          </p>
        </section>
      )}
    </div>
  );
}

// ============ INFO ROW ============
// Small row for report information
function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-resqnow-border-soft last:border-0">

      <span className="text-[11px] text-resqnow-muted">
        {label}
      </span>

      <span className="text-[11px] font-medium text-resqnow-primary text-right">
        {value || 'Not provided'}
      </span>
    </div>
  );
}