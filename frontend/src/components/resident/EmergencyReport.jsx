// src/components/resident/EmergencyReport.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  Flame,
  Stethoscope,
  ShieldAlert,
  Waves,
  Car,
  Tent,
  MapPin,
  Phone,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  LocateFixed,
  ShieldCheck,
  Pencil,
  Users,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { emergencyTypes } from '../../data/mockData';

const iconMap = {
  HeartPulse,
  Flame,
  Stethoscope,
  ShieldAlert,
  Waves,
  Car,
  Tent,
};

const emergencyCategoryInfo = {
  'life-death': {
    label: 'Life-Threatening',
    description: "Someone's life is in immediate danger.",
  },
  fire: {
    label: 'Fire Emergency',
    description: 'Active fire, heavy smoke, or immediate fire danger.',
  },
  medical: {
    label: 'Medical Emergency',
    description: 'Serious injury, illness, or urgent medical help.',
  },
  violence: {
    label: 'Violence / Safety Threat',
    description: 'Violence, threats, or immediate danger from another person.',
  },
  flood: {
    label: 'Flood Rescue',
    description: 'Urgent rescue or assistance because of flooding.',
  },
  accident: {
    label: 'Road Accident',
    description: 'Vehicle crash or serious road-related accident.',
  },
  evacuation: {
    label: 'Urgent Evacuation',
    description: 'Immediate help is needed to evacuate safely.',
  },
};

function getEmergencyInfo(type) {
  return (
    emergencyCategoryInfo[type?.id] || {
      label: type?.label || '',
      description: '',
    }
  );
}

export default function EmergencyReport() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedType, setSelectedType] = useState(null);
  const [locationMode, setLocationMode] = useState(null);
  const [location, setLocation] = useState('');
  const [reportingForOther, setReportingForOther] = useState(false);
  const [victimName, setVictimName] = useState('');
  const [victimContact, setVictimContact] = useState('');
  const [showOptional, setShowOptional] = useState(false);
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const newReportId = `EM-${String(Date.now()).slice(-6)}`;

  const useCurrentLocation = () => {
    setLocation(user?.address || '');
    setLocationMode('auto');
    setError('');
  };

  const startManualEntry = () => {
    setLocationMode('manual');
    setError('');
  };

  const handleSend = () => {
    setError('');

    if (!selectedType) {
      setError('Please select the type of emergency.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!location.trim()) {
      setError('Please set your location so responders know where to go.');
      return;
    }

    setShowConfirm(true);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowConfirm(false);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  // ============ SUCCESS ============
  if (submitted) {
    return (
      <div className="px-4 pt-6 pb-28 min-h-screen bg-slate-50">
        <div className="bg-white border border-green-200 rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-500 to-teal-500" />

          <div className="p-5 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>

            <h1 className="text-lg font-bold text-slate-900">
              Emergency Report Submitted
            </h1>

            <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed">
              Your report is ready for barangay personnel to review and respond.
            </p>

            <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-3.5">
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-wide">
                Report ID
              </p>

              <p className="text-lg font-bold text-green-800 mt-0.5">
                {newReportId}
              </p>

              <p className="text-[11px] text-green-700 mt-0.5">
                {getEmergencyInfo(selectedType).label}
              </p>
            </div>

            <div className="mt-4 text-left bg-slate-50 rounded-xl p-3.5">
              <InfoRow label="Reporter" value={user?.fullName || 'Resident'} />
              <InfoRow label="Location" value={location} />

              {reportingForOther && victimName && (
                <InfoRow label="For" value={victimName} />
              )}

              <InfoRow label="Status" value="Submitted" />
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white text-[13px] font-semibold active:scale-[0.99] transition-all"
            >
              Back to Home
            </button>

            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setSelectedType(null);
                setLocation('');
                setLocationMode(null);
                setLandmark('');
                setDescription('');
                setVictimName('');
                setVictimContact('');
                setReportingForOther(false);
              }}
              className="w-full mt-2 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-[12px] font-semibold hover:bg-slate-50 transition-colors"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ MAIN FORM ============
  return (
    <div className="px-4 pt-4 pb-28 min-h-screen bg-slate-50">

      {/* HEADER */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />

          <h1 className="text-lg font-bold text-slate-900">
            Emergency Report
          </h1>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />

          <p className="text-[11px] text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* ============ EMERGENCY TYPE ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl p-3 mb-3">
        <h2 className="text-sm font-bold text-slate-900 px-1 mb-2">
          What is the emergency?
        </h2>

        <div className="grid grid-cols-2 gap-2">
          {emergencyTypes.map((type) => {
            const Icon = iconMap[type.icon] || AlertTriangle;
            const selected = selectedType?.id === type.id;
            const info = getEmergencyInfo(type);

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setSelectedType(type);
                  setError('');
                }}
                className={`p-2.5 min-h-[112px] rounded-xl border text-left transition-all ${
                  type.id === 'evacuation' ? 'col-span-2' : ''
                } ${
                  selected
                    ? 'bg-red-50 border-red-300 ring-1 ring-red-200'
                    : 'bg-white border-slate-200 hover:border-red-200 hover:bg-red-50/30'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selected
                      ? 'bg-red-100 text-red-600'
                      : 'bg-slate-50 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <p
                  className={`text-[12px] font-bold mt-2 leading-snug ${
                    selected ? 'text-red-700' : 'text-slate-900'
                  }`}
               >
                 {info.label}
                </p>

                <p
                  className={`text-[9px] mt-1.5 leading-relaxed ${
    selected ? 'text-red-600/80' : 'text-slate-400'
  }`}
>
  {info.description}
</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ============ LOCATION ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl p-3 mb-3">
        <div className="px-1 mb-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />

            <h2 className="text-sm font-bold text-slate-900">
              Where is the emergency?
            </h2>
          </div>

          <p className="text-[10px] text-slate-400 mt-0.5">
            {reportingForOther
              ? 'The emergency may not be at your location. Set where it is actually happening.'
              : 'This will use your current location.'}
          </p>
        </div>

        {locationMode !== 'manual' && (
          <button
            type="button"
            onClick={useCurrentLocation}
            className={`w-full flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
              locationMode === 'auto'
                ? 'bg-blue-50 border-blue-300'
                : 'bg-blue-600 border-blue-600 hover:bg-blue-700'
            }`}
          >
            <LocateFixed
              className={`w-5 h-5 shrink-0 ${
                locationMode === 'auto'
                  ? 'text-blue-600'
                  : 'text-white'
              }`}
            />

            <div className="flex-1 text-left">
              <p
                className={`text-[12px] font-semibold ${
                  locationMode === 'auto'
                    ? 'text-blue-800'
                    : 'text-white'
                }`}
              >
                {reportingForOther
                  ? 'Emergency is at my current location'
                  : 'Use Current Location'}
              </p>

              {locationMode === 'auto' && (
                <p className="text-[10px] text-blue-600 mt-0.5 break-words">
                  {location}
                </p>
              )}
            </div>

            {locationMode === 'auto' ? (
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/80 shrink-0" />
            )}
          </button>
        )}

        {locationMode === 'manual' ? (
          <div>
            <textarea
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setError('');
              }}
              rows="2"
              placeholder={
                reportingForOther
                  ? 'Where is the victim located?'
                  : 'Type the location or landmark'
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[12px] resize-none outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
            />

            <button
              type="button"
              onClick={useCurrentLocation}
              className="mt-1.5 text-[10px] font-semibold text-blue-600"
            >
              ← Use my current location instead
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startManualEntry}
            className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-700"
          >
            <Pencil className="w-3 h-3" />

            {reportingForOther
              ? 'Emergency is somewhere else'
              : 'Enter location manually'}
          </button>
        )}
      </section>

      {/* ============ REPORTING FOR SOMEONE ELSE ============ */}
      <section
        className={`rounded-2xl border-2 p-3 mb-3 transition-colors ${
          reportingForOther
            ? 'border-amber-300 bg-amber-50'
            : 'border-slate-200 bg-white'
        }`}
      >
        <button
          type="button"
          onClick={() => setReportingForOther((prev) => !prev)}
          className="w-full flex items-center gap-2.5 text-left"
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              reportingForOther
                ? 'bg-amber-200 text-amber-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Users className="w-4 h-4" />
          </div>

          <div className="flex-1">
            <p
              className={`text-[13px] font-bold ${
                reportingForOther
                  ? 'text-amber-900'
                  : 'text-slate-800'
              }`}
            >
              Reporting for someone else?
            </p>

            <p className="text-[10px] text-slate-400 mt-0.5">
              {reportingForOther
                ? 'Add the victim’s details below.'
                : 'Tap if the emergency is for another person.'}
            </p>
          </div>

          <div
            className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${
              reportingForOther
                ? 'bg-amber-500'
                : 'bg-slate-300'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                reportingForOther
                  ? 'left-[22px]'
                  : 'left-0.5'
              }`}
            />
          </div>
        </button>

        {reportingForOther && (
          <div className="mt-3 pt-3 border-t border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                Victim Name
              </label>

              <input
                type="text"
                value={victimName}
                onChange={(e) => setVictimName(e.target.value)}
                placeholder="I don't know the name"
                className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2.5 text-[12px] outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                Victim Contact
              </label>

              <input
                type="tel"
                value={victimContact}
                onChange={(e) => setVictimContact(e.target.value)}
                placeholder="Optional"
                className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2.5 text-[12px] outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>
        )}
      </section>

      {/* ============ REPORTER INFO ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl p-3 mb-3">
        <div className="flex items-center gap-2 px-1">
          <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />

          <p className="text-[11px] text-slate-600">
            Your name, contact, and purok will be sent automatically.
          </p>
        </div>
      </section>

      {/* ============ OPTIONAL DETAILS ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-3">
        <button
          type="button"
          onClick={() => setShowOptional((prev) => !prev)}
          className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div>
            <h2 className="text-[13px] font-bold text-slate-900">
              Optional Details
            </h2>

            <p className="text-[10px] text-slate-400 mt-0.5">
              Landmark & short description
            </p>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              showOptional ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showOptional && (
          <div className="px-3.5 pb-3.5 border-t border-slate-100 space-y-3">
            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Nearby Landmark
              </label>

              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Example: Near the covered court"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[12px] outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Short Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="2"
                placeholder="Briefly describe what is happening..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[12px] resize-none outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        )}
      </section>

      {/* ============ SIGNAL WARNING ============ */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-3">
        <Phone className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />

        <p className="text-[10px] text-amber-700 leading-relaxed flex-1">
          Weak signal? Call the hotline directly.{' '}

          <button
            type="button"
            onClick={() => navigate('/contacts')}
            className="font-bold underline"
          >
            View Contacts
          </button>
        </p>
      </div>

      {/* ============ SEND BUTTON ============ */}
      <button
        type="button"
        onClick={handleSend}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(220,38,38,0.35)] active:scale-[0.99] transition-all"
      >
        Send Emergency Report
      </button>

      {/* ============ CONFIRM MODAL ============ */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5">

            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />

              <h3 className="text-base font-bold text-slate-900">
                Confirm Emergency Report
              </h3>
            </div>

            <p className="text-[12px] text-slate-600 leading-relaxed mb-3">
              Send now? Your name, contact number, address, and location will be
              sent to barangay personnel.
            </p>

            <div className="bg-slate-50 rounded-xl p-3.5 mb-4">
              <InfoRow
                label="Type"
                value={getEmergencyInfo(selectedType).label}
              />

              <InfoRow label="Location" value={location} />

              <InfoRow
                label="Reporter"
                value={user?.fullName || 'Resident'}
              />

              <InfoRow
                label="Contact"
                value={user?.contactNumber || 'Not provided'}
              />

              {reportingForOther && victimName && (
                <InfoRow label="Victim" value={victimName} />
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white text-[14px] font-bold flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Now'
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={isSubmitting}
              className="w-full mt-2 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-[13px] font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

// ============ INFO ROW ============
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="text-[11px] text-slate-400 shrink-0">
        {label}
      </span>

      <span className="text-[11px] font-medium text-slate-700 text-right break-words">
        {value}
      </span>
    </div>
  );
}