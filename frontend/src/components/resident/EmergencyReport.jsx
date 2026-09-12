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
import { createEmergencyReport } from '../../services/reportService';

// ============ ICONS ============
const iconMap = {
  HeartPulse,
  Flame,
  Stethoscope,
  ShieldAlert,
  Waves,
  Car,
  Tent,
};

// ============ EMERGENCY CATEGORY INFO ============
// Resident-friendly labels and descriptions
const emergencyCategoryInfo = {
  'life-death': {
    label: 'Life-Threatening',
    description:
      "Someone's life is in immediate danger.",
  },

  fire: {
    label: 'Fire Emergency',
    description:
      'Active fire, heavy smoke, or immediate fire danger.',
  },

  medical: {
    label: 'Medical Emergency',
    description:
      'Serious injury, illness, or urgent medical help.',
  },

  violence: {
    label: 'Violence / Safety Threat',
    description:
      'Violence, threats, or immediate danger from another person.',
  },

  flood: {
    label: 'Flood Rescue',
    description:
      'Urgent rescue or assistance because of flooding.',
  },

  accident: {
    label: 'Road Accident',
    description:
      'Vehicle crash or serious road-related accident.',
  },

  evacuation: {
    label: 'Urgent Evacuation',
    description:
      'Immediate help is needed to evacuate safely.',
  },
};

// Get information for an emergency type
function getEmergencyInfo(type) {
  return (
    emergencyCategoryInfo[type?.id] || {
      label: type?.label || '',
      description: '',
    }
  );
}

// ============ EMERGENCY REPORT ============
// Fast emergency reporting flow for residents
export default function EmergencyReport() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Emergency form state
  const [selectedType, setSelectedType] =
    useState(null);

  const [locationMode, setLocationMode] =
    useState(null);

  const [location, setLocation] =
    useState('');

  // Reporting for another person
  const [
    reportingForOther,
    setReportingForOther,
  ] = useState(false);

  const [victimName, setVictimName] =
    useState('');

  const [
    victimContact,
    setVictimContact,
  ] = useState('');

  // Optional information
  const [
    showOptional,
    setShowOptional,
  ] = useState(false);

  const [landmark, setLandmark] =
    useState('');

  const [description, setDescription] =
    useState('');

  // Form and submission state
  const [error, setError] =
    useState('');

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    submittedReport,
    setSubmittedReport,
  ] = useState(null);

  // ============ LOCATION ============
  // Uses the resident's saved address.
  // Real GPS integration will be connected later.
  const useCurrentLocation = () => {
    setLocation(
      user?.address || ''
    );

    setLocationMode('auto');
    setError('');
  };

  // Allow resident to enter location manually
  const startManualEntry = () => {
    setLocationMode('manual');
    setError('');
  };

  // ============ VALIDATE REPORT ============
  // Check required emergency information
  // before opening confirmation
  const handleSend = () => {
    setError('');

    if (!selectedType) {
      setError(
        'Please select the type of emergency.'
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    if (!location.trim()) {
      setError(
        'Please set your location so responders know where to go.'
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    setShowConfirm(true);
  };

  // ============ SUBMIT REPORT ============
  // Submit the emergency report to Laravel/MySQL
  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const report =
        await createEmergencyReport({
          // Laravel validates this
          // against the canonical concern codes
          concernCode:
            selectedType.id,

          location:
            location.trim(),

          reportingForOther,

          // Only send victim information
          // when reporting for someone else
          subjectName:
            reportingForOther &&
            victimName.trim()
              ? victimName.trim()
              : undefined,

          subjectContact:
            reportingForOther &&
            victimContact.trim()
              ? victimContact
                  .replace(/\s/g, '')
                  .trim()
              : undefined,

          landmark:
            landmark.trim() ||
            undefined,

          description:
            description.trim() ||
            undefined,

          // Latitude/longitude will be
          // added when real map/GPS is connected
        });

      // Store Laravel's actual report response.
      // Example ID: EM-000001
      setSubmittedReport(report);

      setShowConfirm(false);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (submitError) {
      // Get the first Laravel validation message
      // when available.
      const validationMessages =
        Object.values(
          submitError.errors || {}
        ).flat();

      const message =
        validationMessages[0] ||
        submitError.message ||
        'Unable to submit the emergency report. Please try again.';

      setError(message);

      // Close modal so the resident can
      // see and correct the problem.
      setShowConfirm(false);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============ RESET FORM ============
  const resetForm = () => {
    setSubmittedReport(null);

    setSelectedType(null);
    setLocation('');
    setLocationMode(null);

    setLandmark('');
    setDescription('');

    setVictimName('');
    setVictimContact('');

    setReportingForOther(false);
    setShowOptional(false);

    setShowConfirm(false);
    setError('');
  };

  // ============ SUCCESS ============
  if (submittedReport) {
    return (
      <div className="px-4 pt-6 pb-28 min-h-screen">

        {/* Success card */}
        <div className="bg-white border border-resqnow-safe/30 rounded-2xl overflow-hidden">

          {/* Success line */}
          <div className="h-1 bg-active-gradient" />

          <div className="p-5 text-center">

            {/* Success icon */}
            <div className="w-14 h-14 rounded-full bg-resqnow-safe/15 flex items-center justify-center mx-auto mb-3">

              <CheckCircle2 className="w-7 h-7 text-resqnow-safe" />
            </div>

            <h1 className="text-lg font-bold text-resqnow-primary">
              Emergency Report Submitted
            </h1>

            <p className="text-[12px] text-resqnow-muted mt-1.5 leading-relaxed">
              Your emergency report has been received and is ready for barangay response.
            </p>

            {/* REAL REPORT ID FROM LARAVEL */}
            <div className="mt-4 bg-resqnow-safe/10 border border-resqnow-safe/20 rounded-xl p-3.5">

              <p className="text-[10px] font-bold text-resqnow-safe uppercase tracking-wide">
                Report ID
              </p>

              <p className="text-lg font-bold text-resqnow-primary mt-0.5">
                {submittedReport.id}
              </p>

              <p className="text-[11px] text-resqnow-muted mt-0.5">
                {getEmergencyInfo(
                  selectedType
                ).label}
              </p>
            </div>

            {/* Report summary */}
            <div className="mt-4 text-left bg-resqnow-canvas rounded-xl p-3.5">

              <InfoRow
                label="Reporter"
                value={
                  user?.fullName ||
                  'Resident'
                }
              />

              <InfoRow
                label="Location"
                value={
                  submittedReport.location ||
                  location
                }
              />

              {reportingForOther &&
                victimName && (
                  <InfoRow
                    label="For"
                    value={
                      submittedReport.subjectName ||
                      victimName
                    }
                  />
                )}

              {/* Backend status */}
              <div className="flex justify-between gap-4 py-1">

                <span className="text-[11px] text-resqnow-muted shrink-0">
                  Status
                </span>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-resqnow-info/15 text-resqnow-info">
                  {submittedReport.status ||
                    'Submitted'}
                </span>
              </div>
            </div>

            {/* View this report */}
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/track/${submittedReport.id}`
                )
              }
              className="w-full mt-4 py-3 rounded-xl bg-brand-gradient text-white text-[13px] font-semibold active:scale-[0.99] transition-all"
            >
              Track This Report
            </button>

            {/* Back home */}
            <button
              type="button"
              onClick={() =>
                navigate(
                  '/dashboard'
                )
              }
              className="w-full mt-2 py-3 rounded-xl border border-resqnow-border bg-white text-resqnow-muted text-[12px] font-semibold hover:bg-resqnow-canvas transition-colors"
            >
              Back to Home
            </button>

            {/* Submit another */}
            <button
              type="button"
              onClick={resetForm}
              className="w-full mt-2 py-3 rounded-xl border border-resqnow-border-soft bg-white text-resqnow-muted text-[12px] font-semibold hover:bg-resqnow-canvas transition-colors"
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
    <div className="px-4 pt-4 pb-28 min-h-screen">

      {/* ============ HEADER ============ */}
      <div className="mb-3">

        <div className="flex items-center gap-2">

          <AlertTriangle className="w-5 h-5 text-resqnow-critical" />

          <h1 className="text-lg font-bold text-resqnow-primary">
            Emergency Report
          </h1>
        </div>
      </div>

      {/* ============ ERROR ============ */}
      {error && (
        <div className="mb-3 flex items-start gap-2 bg-resqnow-critical/10 border border-resqnow-critical/20 rounded-xl px-3 py-2.5">

          <AlertTriangle className="w-4 h-4 text-resqnow-critical mt-0.5 shrink-0" />

          <p className="text-[11px] text-resqnow-crimson">
            {error}
          </p>
        </div>
      )}

      {/* ============ EMERGENCY TYPE ============ */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl p-3 mb-3">

        <h2 className="text-sm font-bold text-resqnow-primary px-1 mb-2">
          What is the emergency?
        </h2>

        <div className="grid grid-cols-2 gap-2">

          {emergencyTypes.map(
            (type) => {
              const Icon =
                iconMap[type.icon] ||
                AlertTriangle;

              const selected =
                selectedType?.id ===
                type.id;

              const info =
                getEmergencyInfo(
                  type
                );

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setSelectedType(
                      type
                    );

                    setError('');
                  }}
                  className={`p-2.5 min-h-[112px] rounded-xl border text-left active:scale-[0.98] transition-all ${
                    type.id ===
                    'evacuation'
                      ? 'col-span-2'
                      : ''
                  } ${
                    selected
                      ? 'bg-resqnow-critical/10 border-resqnow-critical/30 ring-1 ring-resqnow-critical/20'
                      : 'bg-white border-resqnow-border-soft hover:border-resqnow-critical/30 hover:bg-resqnow-critical/5'
                  }`}
                >

                  {/* Category icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selected
                        ? 'bg-resqnow-critical/15 text-resqnow-critical'
                        : 'bg-resqnow-canvas text-resqnow-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Category label */}
                  <p
                    className={`text-[12px] font-bold mt-2 leading-snug ${
                      selected
                        ? 'text-resqnow-critical'
                        : 'text-resqnow-primary'
                    }`}
                  >
                    {info.label}
                  </p>

                  {/* Description */}
                  <p
                    className={`text-[9px] mt-1.5 leading-relaxed ${
                      selected
                        ? 'text-resqnow-critical/80'
                        : 'text-resqnow-muted'
                    }`}
                  >
                    {
                      info.description
                    }
                  </p>
                </button>
              );
            }
          )}
        </div>
      </section>

      {/* ============ LOCATION ============ */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl p-3 mb-3">

        <div className="px-1 mb-1">

          <div className="flex items-center gap-2">

            <MapPin className="w-4 h-4 text-resqnow-violet" />

            <h2 className="text-sm font-bold text-resqnow-primary">
              Where is the emergency?
            </h2>
          </div>

          <p className="text-[10px] text-resqnow-muted mt-0.5">
            {reportingForOther
              ? 'The emergency may not be at your location. Set where it is actually happening.'
              : 'This will use your saved resident address.'}
          </p>
        </div>

        {/* Saved resident location */}
        {locationMode !==
          'manual' && (
          <button
            type="button"
            onClick={
              useCurrentLocation
            }
            className={`w-full flex items-center gap-2.5 p-3 rounded-xl border active:scale-[0.99] transition-all ${
              locationMode ===
              'auto'
                ? 'bg-resqnow-violet/10 border-resqnow-violet/30'
                : 'bg-resqnow-violet border-resqnow-violet hover:bg-resqnow-violet/90'
            }`}
          >

            <LocateFixed
              className={`w-5 h-5 shrink-0 ${
                locationMode ===
                'auto'
                  ? 'text-resqnow-violet'
                  : 'text-white'
              }`}
            />

            <div className="flex-1 text-left">

              <p
                className={`text-[12px] font-semibold ${
                  locationMode ===
                  'auto'
                    ? 'text-resqnow-primary'
                    : 'text-white'
                }`}
              >
                {reportingForOther
                  ? 'Emergency is at my saved location'
                  : 'Use Saved Location'}
              </p>

              {locationMode ===
                'auto' && (
                <p className="text-[10px] text-resqnow-violet mt-0.5 break-words">
                  {location}
                </p>
              )}
            </div>

            {locationMode ===
            'auto' ? (
              <ShieldCheck className="w-5 h-5 text-resqnow-violet shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/80 shrink-0" />
            )}
          </button>
        )}

        {/* Manual location */}
        {locationMode ===
        'manual' ? (
          <div>

            <textarea
              value={location}
              onChange={(e) => {
                setLocation(
                  e.target.value
                );

                setError('');
              }}
              rows="2"
              placeholder={
                reportingForOther
                  ? 'Where is the victim located?'
                  : 'Type the emergency location'
              }
              className="w-full bg-resqnow-canvas border border-resqnow-border rounded-xl px-3 py-2.5 text-[12px] text-resqnow-primary resize-none outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10"
            />

            <button
              type="button"
              onClick={
                useCurrentLocation
              }
              className="mt-1.5 text-[10px] font-semibold text-resqnow-violet"
            >
              ← Use my saved location instead
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={
              startManualEntry
            }
            className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-resqnow-muted hover:text-resqnow-violet transition-colors"
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
        className={`rounded-2xl border p-3 mb-3 transition-colors ${
          reportingForOther
            ? 'border-resqnow-violet/30 bg-resqnow-violet/5'
            : 'border-resqnow-border-soft bg-white'
        }`}
      >

        <button
          type="button"
          onClick={() =>
            setReportingForOther(
              (prev) => !prev
            )
          }
          className="w-full flex items-center gap-2.5 text-left"
        >

          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              reportingForOther
                ? 'bg-resqnow-violet/10 text-resqnow-violet'
                : 'bg-resqnow-canvas text-resqnow-muted'
            }`}
          >
            <Users className="w-4 h-4" />
          </div>

          <div className="flex-1">

            <p
              className={`text-[13px] font-bold ${
                reportingForOther
                  ? 'text-resqnow-violet'
                  : 'text-resqnow-primary'
              }`}
            >
              Reporting for someone else?
            </p>

            <p className="text-[10px] text-resqnow-muted mt-0.5">
              {reportingForOther
                ? "Add the victim's details below."
                : 'Tap if the emergency is for another person.'}
            </p>
          </div>

          {/* Toggle */}
          <div
            className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${
              reportingForOther
                ? 'bg-resqnow-violet'
                : 'bg-resqnow-border'
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

        {/* Victim information */}
        {reportingForOther && (
          <div className="mt-3 pt-3 border-t border-resqnow-violet/10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">

            <div>

              <label className="block text-[10px] font-semibold text-resqnow-secondary mb-1">
                Victim Name
              </label>

              <input
                type="text"
                value={victimName}
                onChange={(e) =>
                  setVictimName(
                    e.target.value
                  )
                }
                placeholder="I don't know the name"
                className="w-full bg-resqnow-canvas border border-resqnow-border rounded-xl px-3 py-2.5 text-[12px] text-resqnow-primary outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10"
              />
            </div>

            <div>

              <label className="block text-[10px] font-semibold text-resqnow-secondary mb-1">
                Victim Contact
              </label>

              <input
                type="tel"
                value={victimContact}
                onChange={(e) =>
                  setVictimContact(
                    e.target.value
                  )
                }
                placeholder="Optional"
                className="w-full bg-resqnow-canvas border border-resqnow-border rounded-xl px-3 py-2.5 text-[12px] text-resqnow-primary outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10"
              />
            </div>
          </div>
        )}
      </section>

      {/* ============ REPORTER INFO ============ */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl p-3 mb-3">

        <div className="flex items-center gap-2 px-1">

          <ShieldCheck className="w-4 h-4 text-resqnow-mint shrink-0" />

          <p className="text-[11px] text-resqnow-muted">
            Your name, contact, address, and purok are connected to your resident account.
          </p>
        </div>
      </section>

      {/* ============ OPTIONAL DETAILS ============ */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl overflow-hidden mb-3">

        <button
          type="button"
          onClick={() =>
            setShowOptional(
              (prev) => !prev
            )
          }
          className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-resqnow-canvas transition-colors"
        >

          <div>

            <h2 className="text-[13px] font-bold text-resqnow-primary">
              Optional Details
            </h2>

            <p className="text-[10px] text-resqnow-muted mt-0.5">
              Landmark & short description
            </p>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-resqnow-muted transition-transform ${
              showOptional
                ? 'rotate-180'
                : ''
            }`}
          />
        </button>

        {showOptional && (
          <div className="px-3.5 pb-3.5 border-t border-resqnow-border-soft space-y-3">

            {/* Landmark */}
            <div className="mt-3">

              <label className="block text-[11px] font-semibold text-resqnow-secondary mb-1">
                Nearby Landmark
              </label>

              <input
                type="text"
                value={landmark}
                onChange={(e) =>
                  setLandmark(
                    e.target.value
                  )
                }
                placeholder="Example: Near the covered court"
                className="w-full bg-resqnow-canvas border border-resqnow-border rounded-xl px-3 py-2.5 text-[12px] text-resqnow-primary outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10"
              />
            </div>

            {/* Description */}
            <div>

              <label className="block text-[11px] font-semibold text-resqnow-secondary mb-1">
                Short Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                rows="2"
                placeholder="Briefly describe what is happening..."
                className="w-full bg-resqnow-canvas border border-resqnow-border rounded-xl px-3 py-2.5 text-[12px] text-resqnow-primary resize-none outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10"
              />
            </div>
          </div>
        )}
      </section>

      {/* ============ SIGNAL WARNING ============ */}
      <div className="flex items-start gap-2 bg-resqnow-caution/10 border border-resqnow-caution/20 rounded-xl px-3 py-2.5 mb-3">

        <Phone className="w-3.5 h-3.5 text-resqnow-caution mt-0.5 shrink-0" />

        <p className="text-[10px] text-resqnow-secondary leading-relaxed flex-1">
          Weak signal? Call the hotline directly.{' '}

          <button
            type="button"
            onClick={() =>
              navigate(
                '/contacts'
              )
            }
            className="font-bold text-resqnow-caution underline"
          >
            View Contacts
          </button>
        </p>
      </div>

      {/* ============ SEND ============ */}
      <button
        type="button"
        onClick={handleSend}
        disabled={isSubmitting}
        className="w-full py-4 rounded-2xl bg-emergency-gradient text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(255,45,85,0.35)] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        Send Emergency Report
      </button>

      {/* ============ CONFIRM MODAL ============ */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">

          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5">

            <div className="flex items-center gap-2 mb-3">

              <AlertTriangle className="w-5 h-5 text-resqnow-critical" />

              <h3 className="text-base font-bold text-resqnow-primary">
                Confirm Emergency Report
              </h3>
            </div>

            <p className="text-[12px] text-resqnow-muted leading-relaxed mb-3">
              Send now? Your resident account information and emergency location will be sent to barangay personnel.
            </p>

            {/* Confirmation information */}
            <div className="bg-resqnow-canvas rounded-xl p-3.5 mb-4">

              <InfoRow
                label="Type"
                value={getEmergencyInfo(
                  selectedType
                ).label}
              />

              <InfoRow
                label="Location"
                value={location}
              />

              <InfoRow
                label="Reporter"
                value={
                  user?.fullName ||
                  'Resident'
                }
              />

              <InfoRow
                label="Contact"
                value={
                  user?.contactNumber ||
                  'Not provided'
                }
              />

              {reportingForOther &&
                victimName && (
                  <InfoRow
                    label="Victim"
                    value={
                      victimName
                    }
                  />
                )}
            </div>

            {/* REAL API SUBMIT */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emergency-gradient text-white text-[14px] font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.99] transition-all"
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

            {/* Cancel */}
            <button
              type="button"
              onClick={() =>
                setShowConfirm(
                  false
                )
              }
              disabled={isSubmitting}
              className="w-full mt-2 py-3 rounded-xl border border-resqnow-border bg-white text-resqnow-muted text-[13px] font-semibold hover:bg-resqnow-canvas disabled:opacity-60 transition-colors"
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
function InfoRow({
  label,
  value,
}) {
  return (
    <div className="flex justify-between gap-4 py-1">

      <span className="text-[11px] text-resqnow-muted shrink-0">
        {label}
      </span>

      <span className="text-[11px] font-medium text-resqnow-primary text-right break-words">
        {value}
      </span>
    </div>
  );
}