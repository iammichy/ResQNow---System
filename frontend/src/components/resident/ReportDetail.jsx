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

// ============ REPORT DETAIL ============
// Full detail view of a single report — shows timeline, status, personnel, and remarks
export default function ReportDetail() {
  const navigate = useNavigate();
  const { reportId } = useParams();

  // Find the report by ID from the URL
  const report = mockAllReports.find((item) => item.id === reportId);

  // Report not found state
  if (!report) {
    return (
      <div className="px-4 pt-5 pb-10 min-h-screen">
        <button
          type="button"
          onClick={() => navigate('/track')}
          className="flex items-center gap-1.5 text-[12px] font-medium text-resqnow-muted hover:text-resqnow-primary mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Track
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl py-12 px-6 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-resqnow-primary">Report not found</p>
          <p className="text-[11px] text-resqnow-muted mt-1">The report you are looking for does not exist.</p>
          <button
            type="button"
            onClick={() => navigate('/track')}
            className="mt-5 px-4 py-2.5 rounded-xl bg-brand-gradient text-white text-[12px] font-semibold"
          >
            View My Reports
          </button>
        </div>
      </div>
    );
  }

  const isEmergency = report.reportType === 'Emergency';
  const isResolved = report.status === 'Resolved';
  const isInvalid = report.status === 'Invalid';

  return (
    <div className="px-4 pt-5 pb-10 min-h-screen">

      {/* ============ BACK BUTTON ============ */}
      <button
        type="button"
        onClick={() => navigate('/track')}
        className="flex items-center gap-1.5 text-[12px] font-medium text-resqnow-muted hover:text-resqnow-primary mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Track
      </button>

      {/* ============ REPORT HEADER ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-4">
        <div className={`h-1 ${isEmergency ? 'bg-emergency-gradient' : 'bg-brand-gradient'}`} />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isEmergency ? 'bg-resqnow-critical/10 text-resqnow-critical' : 'bg-resqnow-violet/10 text-resqnow-violet'
            }`}>
              {isEmergency ? <Siren className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-resqnow-muted">{report.id}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  isEmergency ? 'bg-resqnow-critical/15 text-resqnow-critical' : 'bg-resqnow-violet/15 text-resqnow-violet'
                }`}>
                  {report.reportType}
                </span>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityStyle(report.priority)}`}>
                  {report.priority} Priority
                </span>
              </div>
              <h1 className="text-lg font-bold text-resqnow-primary mt-1">{report.concernType}</h1>
              {report.subcategory && <p className="text-[11px] text-resqnow-muted mt-0.5">{report.subcategory}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CURRENT STATUS ============ */}
      <section className={`border rounded-2xl p-4 mb-4 ${
        isResolved ? 'bg-resqnow-safe/10 border-resqnow-safe/20' :
        isInvalid ? 'bg-resqnow-critical/10 border-resqnow-critical/20' :
        'bg-white border-slate-200'
      }`}>
        <p className={`text-[10px] font-bold uppercase tracking-wider ${
          isResolved ? 'text-resqnow-safe' : isInvalid ? 'text-resqnow-critical' : 'text-resqnow-muted'
        }`}>
          Current Status
        </p>

        <div className="flex items-center justify-between gap-3 mt-2">
          <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${getStatusStyle(report.status)}`}>
            {report.status}
          </span>
          <div className={`flex items-center gap-1 text-[10px] ${
            isResolved ? 'text-resqnow-safe' : isInvalid ? 'text-resqnow-critical' : 'text-resqnow-muted'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            Updated {report.updatedAt}
          </div>
        </div>

        {report.latestUpdate && (
          <div className={`mt-4 rounded-xl p-3 ${isResolved || isInvalid ? 'bg-white/70' : 'bg-slate-50'}`}>
            <p className={`text-[9px] font-bold uppercase tracking-wide ${
              isResolved ? 'text-resqnow-safe' : isInvalid ? 'text-resqnow-critical' : 'text-resqnow-muted'
            }`}>Latest Update</p>
            <p className={`text-[12px] mt-1 leading-relaxed ${
              isResolved ? 'text-resqnow-safe' : isInvalid ? 'text-resqnow-critical' : 'text-slate-600'
            }`}>{report.latestUpdate}</p>
          </div>
        )}

        {isResolved && report.resolvedRemarks && (
          <div className="mt-3 pt-3 border-t border-resqnow-safe/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-resqnow-safe" />
              <p className="text-[9px] font-bold uppercase tracking-wide text-resqnow-safe">Resolution Remarks</p>
            </div>
            <p className="text-[12px] text-resqnow-safe mt-1.5 leading-relaxed">{report.resolvedRemarks}</p>
          </div>
        )}
      </section>

      {/* ============ REPORT PROGRESS (TIMELINE) ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <h2 className="text-sm font-bold text-resqnow-primary mb-4">Report Progress</h2>
        <div>
          {report.timeline.map((step, index) => {
            const isLast = index === report.timeline.length - 1;
            return (
              <div key={step.status} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    step.done ? 'bg-resqnow-mint text-white' : 'bg-slate-100 text-slate-300 border border-slate-200'
                  }`}>
                    {step.done ? <Check className="w-4 h-4" strokeWidth={3} /> : <Circle className="w-3 h-3" />}
                  </div>
                  {!isLast && <div className={`w-0.5 min-h-[46px] flex-1 ${step.done ? 'bg-resqnow-mint/30' : 'bg-slate-200'}`} />}
                </div>
                <div className={`flex-1 ${isLast ? '' : 'pb-5'}`}>
                  <p className={`text-[12px] font-semibold ${step.done ? 'text-resqnow-primary' : 'text-resqnow-muted'}`}>
                    {step.status}
                  </p>
                  <p className="text-[10px] text-resqnow-muted mt-0.5">{step.date || 'Waiting for update'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ ASSIGNED PERSONNEL ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <UserRound className="w-4 h-4 text-resqnow-violet" />
          <h2 className="text-sm font-bold text-resqnow-primary">Assigned Personnel</h2>
        </div>
        {report.assignedPersonnel ? (
          <div className="flex items-center gap-3 bg-resqnow-violet/5 rounded-xl p-3">
            <div className="w-9 h-9 rounded-full bg-brand-gradient text-white flex items-center justify-center">
              <UserRound className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-resqnow-primary">{report.assignedPersonnel}</p>
              <p className="text-[10px] text-resqnow-muted mt-0.5">Assigned to this report</p>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-resqnow-muted">No personnel has been assigned yet.</p>
        )}
      </section>

      {/* ============ LOCATION ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-resqnow-violet" />
          <h2 className="text-sm font-bold text-resqnow-primary">Incident Location</h2>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[12px] font-semibold text-resqnow-primary">{report.location}</p>
          {report.landmark && <p className="text-[11px] text-resqnow-muted mt-1">Landmark: {report.landmark}</p>}
        </div>
      </section>

      {/* ============ REPORT INFORMATION ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-resqnow-violet" />
          <h2 className="text-sm font-bold text-resqnow-primary">Report Information</h2>
        </div>
        <InfoRow label="Submitted" value={report.submittedAt} />
        <InfoRow label="Report Type" value={report.reportType} />
        <InfoRow label="Concern" value={report.concernType} />
        {report.subcategory && <InfoRow label="Subcategory" value={report.subcategory} />}
        {report.reportingFor && <InfoRow label="Reporting For" value={report.reportingFor} />}

        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-[10px] font-bold text-resqnow-muted uppercase tracking-wide">Description</p>
          <p className="text-[12px] text-slate-600 mt-1.5 leading-relaxed">{report.description || 'No description provided.'}</p>
        </div>

        {report.requiredAssistance && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <HandHeart className="w-4 h-4 text-resqnow-mint" />
              <p className="text-[10px] font-bold text-resqnow-muted uppercase tracking-wide">Assistance Needed</p>
            </div>
            <p className="text-[12px] text-slate-600 mt-1.5 leading-relaxed">{report.requiredAssistance}</p>
          </div>
        )}

        {report.affectedIndividuals?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-resqnow-violet" />
              <p className="text-[10px] font-bold text-resqnow-muted uppercase tracking-wide">Affected Individuals</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.affectedIndividuals.map((person) => (
                <span key={person} className="text-[10px] font-medium px-2.5 py-1 bg-resqnow-violet/10 text-resqnow-violet rounded-full">{person}</span>
              ))}
            </div>
          </div>
        )}

        {(report.victimName || report.victimContact) && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-resqnow-muted uppercase tracking-wide mb-2">Victim Information</p>
            {report.victimName && <InfoRow label="Name" value={report.victimName} />}
            {report.victimContact && <InfoRow label="Contact" value={report.victimContact} />}
          </div>
        )}
      </section>

      {/* ============ BARANGAY REMARKS ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquareText className="w-4 h-4 text-resqnow-mint" />
          <h2 className="text-sm font-bold text-resqnow-primary">Barangay Remarks</h2>
        </div>
        {report.barangayRemarks ? (
          <div className="bg-resqnow-mint/5 rounded-xl p-3">
            <p className="text-[12px] text-slate-600 leading-relaxed">{report.barangayRemarks}</p>
          </div>
        ) : (
          <p className="text-[11px] text-resqnow-muted">No barangay remarks available yet.</p>
        )}
      </section>

      {/* ============ INVALID REPORT ============ */}
      {report.invalidReason && (
        <section className="bg-resqnow-critical/10 border border-resqnow-critical/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-resqnow-critical" />
            <h2 className="text-sm font-bold text-resqnow-crimson">Report Marked Invalid</h2>
          </div>
          <p className="text-[10px] font-bold text-resqnow-critical uppercase tracking-wide">Reason</p>
          <p className="text-[12px] text-resqnow-crimson mt-1 leading-relaxed">{report.invalidReason}</p>
        </section>
      )}
    </div>
  );
}

// ============ INFO ROW ============
function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-[11px] text-resqnow-muted">{label}</span>
      <span className="text-[11px] font-medium text-resqnow-primary text-right">{value || 'Not provided'}</span>
    </div>
  );
}