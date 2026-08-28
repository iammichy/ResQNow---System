// src/components/resident/SubmitReportChoice.jsx
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  FileText,
  ChevronRight,
  Clock3,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react';

export default function SubmitReportChoice() {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-5 pb-8 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900">Submit a Report</h1>
        <p className="text-xs text-slate-500 mt-1">
          Choose the type of report that matches your situation.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Emergency */}
        <button
          type="button"
          onClick={() => navigate('/submit/emergency')}
          className="rounded-3xl p-[1px] bg-gradient-to-br from-red-600 to-orange-500 text-left shadow-sm hover:shadow-md active:scale-[0.99] transition-all"
        >
          <div className="h-full rounded-[23px] bg-gradient-to-br from-red-500 to-orange-500 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <ChevronRight className="w-4 h-4 text-white/70 shrink-0 mt-1" />
            </div>

            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="text-[14px] font-bold text-white leading-tight">
                  Emergency
                </h2>

                <span className="text-[8px] font-bold uppercase tracking-wide bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                  Urgent
                </span>
              </div>

              <p className="text-[11px] text-white/90 mt-2 leading-relaxed">
                For immediate danger, fire, flood, injury, rescue, or urgent
                evacuation.
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-white/15 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Clock3 className="w-3.5 h-3.5 text-white shrink-0" />
                <p className="text-[10px] font-medium text-white">
                  Quick reporting flow
                </p>
              </div>
            </div>
          </div>
        </button>

        {/* Non-Emergency */}
        <button
          type="button"
          onClick={() => navigate('/submit/non-emergency')}
          className="rounded-3xl p-[1px] bg-gradient-to-br from-teal-500 to-blue-600 text-left shadow-sm hover:shadow-md active:scale-[0.99] transition-all"
        >
          <div className="h-full rounded-[23px] bg-gradient-to-br from-teal-500 to-blue-600 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
                <FileText className="w-5 h-5" />
              </div>

              <ChevronRight className="w-4 h-4 text-white/70 shrink-0 mt-1" />
            </div>

            <div className="mt-5">
              <h2 className="text-[14px] font-bold text-white leading-tight">
                Non-Emergency
              </h2>

              <p className="text-[11px] text-white/90 mt-2 leading-relaxed">
                For barangay concerns like damaged facilities, obstructions, and
                assistance requests.
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-white/15 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-3.5 h-3.5 text-white shrink-0" />
                <p className="text-[10px] font-medium text-white">
                  More details may be needed
                </p>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Help */}
      <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-3.5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-teal-600" />
          </div>

          <div>
            <p className="text-[12px] font-semibold text-slate-800">
              Not sure what to choose?
            </p>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
              Use <span className="font-semibold text-red-500">Emergency</span>{' '}
              if urgent help is needed right away. Use{' '}
              <span className="font-semibold text-blue-600">Non-Emergency</span>{' '}
              for concerns that can be reviewed by barangay personnel.
            </p>
          </div>
        </div>
      </div>

      {/* Note */}
      <p className="text-[10px] text-slate-400 text-center leading-relaxed px-4 mt-4">
        If internet or mobile signal is weak during an emergency, use the
        Contacts page to call the barangay hotline directly.
      </p>
    </div>
  );
}