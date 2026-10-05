import {
  AlertTriangle,
  ChevronRight,
  FileText,
  ShieldAlert,
} from 'lucide-react';

import {
  useNavigate,
} from 'react-router-dom';


export default function SubmitReportChoice() {
  const navigate =
    useNavigate();

  return (
    <div className="px-4 pt-5 pb-8 min-h-screen">

      <div className="mb-4">

        <h1 className="text-xl font-bold text-resqnow-primary">
          Submit a Report
        </h1>

        <p className="text-xs text-resqnow-muted mt-1">
          Choose the type that best matches the situation.
        </p>

      </div>


      {/* SOS THRESHOLD */}
      <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3.5">

        <div className="flex items-start gap-3">

          <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>

          <div>

            <p className="text-[11px] font-extrabold text-red-700">
              Is someone in immediate life-threatening danger?
            </p>

            <p className="text-[9px] leading-relaxed text-red-700/80 mt-1">
              Use SOS Fast-Track when there may not be enough time to
              complete a longer form, such as a severe medical emergency,
              trapped person, active fire, violence, or another immediate
              threat to life or safety.
            </p>

            <p className="text-[9px] font-bold text-red-600 mt-1.5">
              SOS Fast-Track is separate from Emergency Report.
            </p>

          </div>

        </div>

      </div>


      <div className="grid grid-cols-2 gap-3">

        {/* EMERGENCY REPORT */}
        <button
          type="button"
          onClick={() =>
            navigate(
              '/submit/emergency'
            )
          }
          className="rounded-3xl p-[1px] bg-emergency-gradient text-left shadow-sm active:scale-[0.99] transition-all"
        >

          <div className="h-full rounded-[23px] bg-emergency-gradient p-4">

            <div className="flex items-start justify-between gap-2">

              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <ChevronRight className="w-4 h-4 text-white/70" />

            </div>

            <h2 className="text-[13px] font-bold text-white mt-4">
              Emergency Report
            </h2>

            <p className="text-[10px] text-white/90 mt-2 leading-relaxed">
              Fire, flood, medical emergency, road accident,
              violence or safety threat, rescue, or urgent evacuation.
            </p>

            <p className="text-[8px] font-bold text-white/90 mt-3">
              Urgent guided reporting
            </p>

          </div>

        </button>


        {/* NON-EMERGENCY */}
        <button
          type="button"
          onClick={() =>
            navigate(
              '/submit/non-emergency'
            )
          }
          className="rounded-3xl p-[1px] bg-brand-gradient text-left shadow-sm active:scale-[0.99] transition-all"
        >

          <div className="h-full rounded-[23px] bg-brand-gradient p-4">

            <div className="flex items-start justify-between gap-2">

              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
                <FileText className="w-5 h-5" />
              </div>

              <ChevronRight className="w-4 h-4 text-white/70" />

            </div>

            <h2 className="text-[13px] font-bold text-white mt-4">
              Non-Emergency Report
            </h2>

            <p className="text-[10px] text-white/90 mt-2 leading-relaxed">
              Hazards or assistance that require barangay review
              but are not an immediate threat to life.
            </p>

            <p className="text-[8px] font-bold text-white/90 mt-3">
              Hazard and assistance reporting
            </p>

          </div>

        </button>

      </div>


      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3.5">

        <p className="text-[11px] font-bold text-resqnow-primary">
          Quick guide
        </p>

        <div className="mt-1.5 space-y-1 text-[9px] leading-relaxed text-resqnow-muted">

          <p>
            <span className="font-bold text-red-600">
              SOS:
            </span>
            {' '}
            immediate life-threatening danger and fastest reporting.
          </p>

          <p>
            <span className="font-bold text-resqnow-critical">
              Emergency Report:
            </span>
            {' '}
            urgent incident when you can still answer a short
            factual situation check.
          </p>

          <p>
            <span className="font-bold text-resqnow-violet">
              Non-Emergency:
            </span>
            {' '}
            hazards or assistance that can be reviewed by barangay personnel.
          </p>

        </div>

      </div>

    </div>
  );
}