// src/components/resident/NonEmergencyReport.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tent,
  Stethoscope,
  TreePine,
  Wrench,
  Broom,
  MessageSquare,
  CircleHelp,
  MapPin,
  UserRound,
  Users,
  HandHeart,
  Camera,
  ChevronDown,
  Check,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { nonEmergencyTypes, purokOptions } from '../../data/mockData';

// ============ ICONS ============
// Icons used for each non-emergency concern
const iconMap = {
  'evac-assistance': Tent,
  'bhw-assistance': Stethoscope,
  'road-obstruction': TreePine,
  'damaged-facility': Wrench,
  cleanup: Broom,
  'community-concern': MessageSquare,
  'other-assistance': CircleHelp,
};

// ============ CATEGORY INFO ============
// Resident-friendly labels and descriptions
const concernCategoryInfo = {
  'evac-assistance': {
    label: 'Evacuation Help',
    description: 'Non-urgent help preparing for or getting to an evacuation center.',
  },
  'bhw-assistance': {
    label: 'Health Worker Assistance',
    description: 'Request a BHW visit, health check, or basic health assistance.',
  },
  'road-obstruction': {
    label: 'Blocked Road / Obstruction',
    description: 'Tree, debris, vehicle, or object is blocking a road or pathway.',
  },
  'damaged-facility': {
    label: 'Damaged Public Facility',
    description: 'Damaged streetlight, road, drainage, or barangay facility.',
  },
  cleanup: {
    label: 'Community Clean-Up',
    description: 'Waste, branches, or scattered debris needs barangay clean-up.',
  },
  'community-concern': {
    label: 'Community Concern',
    description: 'Sanitation, noise, stray animals, or other neighborhood concerns.',
  },
  'other-assistance': {
    label: 'Other Barangay Assistance',
    description: 'Request barangay help that does not fit the categories above.',
  },
};

// Get information for a selected concern
function getConcernInfo(type) {
  return concernCategoryInfo[type?.id] || {
    label: type?.label || '',
    description: '',
  };
}

// ============ SUBCATEGORIES ============
// Optional subcategories shown after selecting a concern
const subcategories = {
  'evac-assistance': [
    'Transportation',
    'Temporary Shelter',
    'Supplies',
  ],
  'bhw-assistance': [
    'Health Check',
    'Home Visit',
    'Medicine Assistance',
  ],
  'road-obstruction': [
    'Fallen Tree / Branch',
    'Debris Blocking Road',
    'Vehicle / Object Blocking Road',
    'Other Road Obstruction',
  ],
  'damaged-facility': [
    'Street Light',
    'Road',
    'Drainage',
    'Barangay Facility',
  ],
  cleanup: [
    'Waste Collection',
    'Storm Debris / Branches',
    'Drainage Clean-up',
  ],
  'community-concern': [
    'Sanitation',
    'Noise',
    'Stray Animals',
    'Public Area',
  ],
};

// People who may be affected
const affectedOptions = [
  'Child',
  'Senior Citizen',
  'PWD',
  'Pregnant Person',
  'Injured Person',
];

// ============ NON-EMERGENCY REPORT ============
// Detailed report form for non-urgent concerns
export default function NonEmergencyReport() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Concern type
  const [selectedType, setSelectedType] = useState(null);
  const [subcategory, setSubcategory] = useState('');

  // Who the report is for
  const [reportingFor, setReportingFor] = useState('Myself');
  const [personName, setPersonName] = useState('');
  const [personContact, setPersonContact] = useState('');
  const [relationship, setRelationship] = useState('');

  // Incident location
  const [purok, setPurok] = useState(user?.purok || 'Purok 1');
  const [location, setLocation] = useState(user?.address || '');
  const [landmark, setLandmark] = useState('');
  const [showLocation, setShowLocation] = useState(false);

  // Report details
  const [description, setDescription] = useState('');
  const [assistance, setAssistance] = useState('');
  const [affected, setAffected] = useState([]);

  // Optional photo
  const [photoPreview, setPhotoPreview] = useState('');

  // Form and submit states
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Keep the mock report ID the same while the page is open
  const [newReportId] = useState(
    () => `NE-${String(Date.now()).slice(-6)}`
  );

  // Get available subcategories
  const availableSubcategories = selectedType
    ? subcategories[selectedType.id] || []
    : [];

  // ============ AFFECTED INDIVIDUALS ============
  // Add or remove an affected individual type
  const toggleAffected = (item) => {
    setAffected((prev) =>
      prev.includes(item)
        ? prev.filter((person) => person !== item)
        : [...prev, item]
    );
  };

  // ============ PHOTO ============
  // Create a preview for the optional photo
  const handlePhoto = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview(URL.createObjectURL(file));
  };

  // ============ REVIEW ============
  // Check required fields before opening confirmation
  const handleReview = () => {
    setError('');

    if (!selectedType) {
      setError('Please select a concern type.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!location.trim()) {
      setError('Please provide the incident location.');
      return;
    }

    if (!description.trim()) {
      setError('Please add a short description of the concern.');
      return;
    }

    setShowConfirm(true);
  };

  // ============ SUBMIT ============
  // Temporary mock non-emergency submission
  const handleSubmit = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowConfirm(false);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  };

  // ============ SUCCESS ============
  if (submitted) {
    return (
      <div className="px-4 pt-8 pb-28 min-h-screen">

        {/* Success card */}
        <div className="bg-white border border-resqnow-safe/30 rounded-2xl overflow-hidden">

          {/* Brand line */}
          <div className="h-1 bg-brand-gradient" />

          <div className="p-6 text-center">

            {/* Success icon */}
            <div className="w-16 h-16 rounded-full bg-resqnow-safe/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-resqnow-safe" />
            </div>

            <h1 className="text-xl font-bold text-resqnow-primary">
              Report Submitted
            </h1>

            <p className="text-[12px] text-resqnow-muted mt-2 leading-relaxed">
              Your concern has been submitted and is waiting for barangay verification.
            </p>

            {/* Report ID */}
            <div className="mt-5 bg-resqnow-violet/5 border border-resqnow-violet/15 rounded-xl p-4">

              <p className="text-[10px] font-bold text-resqnow-violet uppercase tracking-wide">
                Report ID
              </p>

              <p className="text-lg font-bold text-resqnow-primary mt-1">
                {newReportId}
              </p>

              <p className="text-[11px] text-resqnow-muted mt-1">
                {getConcernInfo(selectedType).label}
              </p>
            </div>

            {/* Report summary */}
            <div className="mt-4 bg-resqnow-canvas rounded-xl p-4 text-left">

              {/* Initial status */}
              <div className="flex items-center justify-between gap-4 py-2 border-b border-resqnow-border-soft">

                <span className="text-[10px] text-resqnow-muted">
                  Status
                </span>

                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-resqnow-pending/15 text-resqnow-pending">
                  Pending Verification
                </span>
              </div>

              <InfoRow
                label="Location"
                value={location}
              />

              <InfoRow
                label="Reporter"
                value={user?.fullName || 'Resident'}
              />
            </div>

            {/* View reports */}
            <button
              type="button"
              onClick={() => navigate('/track')}
              className="w-full mt-5 py-3 rounded-xl bg-brand-gradient text-white text-[13px] font-semibold shadow-[0_4px_16px_rgba(131,70,242,0.20)] active:scale-[0.99] transition-all"
            >
              View My Reports
            </button>

            {/* Back home */}
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full mt-2 py-3 rounded-xl border border-resqnow-border bg-white text-resqnow-muted text-[12px] font-semibold hover:bg-resqnow-canvas transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ MAIN FORM ============
  return (
    <div className="px-4 pt-5 pb-28 min-h-screen">

      {/* ============ HEADER ============ */}
      <div className="mb-4">

        <h1 className="text-xl font-bold text-resqnow-primary">
          Non-Emergency Report
        </h1>

        <p className="text-xs text-resqnow-muted mt-1">
          Report a barangay concern or request assistance.
        </p>
      </div>

      {/* ============ ERROR ============ */}
      {error && (
        <div className="mb-4 flex items-start gap-2.5 bg-resqnow-critical/10 border border-resqnow-critical/20 rounded-xl px-4 py-3">

          <AlertCircle className="w-4 h-4 text-resqnow-critical shrink-0 mt-0.5" />

          <p className="text-[11px] text-resqnow-crimson">
            {error}
          </p>
        </div>
      )}

      {/* ============ REPORTING FOR ============ */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl p-4 mb-4">

        <h2 className="text-sm font-bold text-resqnow-primary">
          Who is this report for?
        </h2>

        <p className="text-[10px] text-resqnow-muted mt-0.5">
          Tell us who may need the barangay assistance.
        </p>

        {/* Myself / Another Person */}
        <div className="grid grid-cols-2 gap-2 mt-3">

          <ChoiceButton
            selected={reportingFor === 'Myself'}
            label="Myself"
            icon={UserRound}
            onClick={() => setReportingFor('Myself')}
          />

          <ChoiceButton
            selected={reportingFor === 'Another Person'}
            label="Another Person"
            icon={Users}
            onClick={() => setReportingFor('Another Person')}
          />
        </div>

        {/* Another person information */}
        {reportingFor === 'Another Person' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-resqnow-border-soft">

            {/* Name */}
            <Field label="Name">
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="If known"
                className="w-full bg-resqnow-canvas border border-resqnow-border rounded-xl px-3 py-3 text-[12px] text-resqnow-primary outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10 transition-all"
              />
            </Field>

            {/* Contact */}
            <Field label="Contact Number">
              <input
                type="tel"
                value={personContact}
                onChange={(e) => setPersonContact(e.target.value)}
                placeholder="Optional"
                className="w-full bg-resqnow-canvas border border-resqnow-border rounded-xl px-3 py-3 text-[12px] text-resqnow-primary outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10 transition-all"
              />
            </Field>

            {/* Relationship */}
            <div className="sm:col-span-2">
              <Field label="Relationship / Note">
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="Example: Neighbor"
                  className="w-full bg-resqnow-canvas border border-resqnow-border rounded-xl px-3 py-3 text-[12px] text-resqnow-primary outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10 transition-all"
                />
              </Field>
            </div>
          </div>
        )}
      </section>

      {/* ============ CONCERN TYPE ============ */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl p-4 mb-4">

        <h2 className="text-[15px] font-bold text-resqnow-primary">
          What is your concern?
        </h2>

        <p className="text-[10px] text-resqnow-muted mt-0.5">
          Select the category that best matches your report.
        </p>

        {/* Concern cards */}
        <div className="grid grid-cols-2 gap-2 mt-3">

          {nonEmergencyTypes.map((type) => {
            const Icon = iconMap[type.id] || CircleHelp;
            const selected = selectedType?.id === type.id;
            const info = getConcernInfo(type);

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setSelectedType(type);
                  setSubcategory('');
                  setError('');
                }}
                className={`p-3 min-h-[124px] rounded-xl border text-left active:scale-[0.98] transition-all ${
                  type.id === 'other-assistance'
                    ? 'col-span-2'
                    : ''
                } ${
                  selected
                    ? 'bg-resqnow-violet/10 border-resqnow-violet/30 ring-1 ring-resqnow-violet/15'
                    : 'bg-white border-resqnow-border-soft hover:bg-resqnow-violet/5 hover:border-resqnow-violet/20'
                }`}
              >
                {/* Concern icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    selected
                      ? 'bg-resqnow-violet/15 text-resqnow-violet'
                      : 'bg-resqnow-canvas text-resqnow-muted'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </div>

                {/* Concern label */}
                <p
                  className={`text-[12px] font-bold mt-2 leading-snug ${
                    selected
                      ? 'text-resqnow-violet'
                      : 'text-resqnow-primary'
                  }`}
                >
                  {info.label}
                </p>

                {/* Concern description */}
                <p
                  className={`text-[9px] mt-1.5 leading-relaxed ${
                    selected
                      ? 'text-resqnow-violet/80'
                      : 'text-resqnow-muted'
                  }`}
                >
                  {info.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* ============ SUBCATEGORY ============ */}
        {/* Only appears when the category has subcategories */}
        {availableSubcategories.length > 0 && (
          <div className="mt-4 rounded-xl bg-resqnow-canvas border border-resqnow-border-soft p-3">

            <p className="text-[11px] font-bold text-resqnow-secondary mb-2.5">
              Specify the concern{' '}
              <span className="text-resqnow-muted font-medium">
                (optional)
              </span>
            </p>

            <div className="flex flex-wrap gap-2">

              {availableSubcategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSubcategory(item)}
                  className={`px-3.5 py-2 rounded-full text-[11px] font-semibold border active:scale-95 transition-all ${
                    subcategory === item
                      ? 'bg-resqnow-violet border-resqnow-violet text-white shadow-sm'
                      : 'bg-white border-resqnow-border text-resqnow-muted hover:border-resqnow-violet/40 hover:text-resqnow-violet'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Evacuation warning */}
        {selectedType?.id === 'evac-assistance' && (
          <div className="mt-3 text-[10px] text-resqnow-secondary bg-resqnow-caution/10 border border-resqnow-caution/20 rounded-lg px-3 py-2 leading-relaxed">

            In danger right now? Use{' '}

            <button
              type="button"
              onClick={() => navigate('/submit/emergency')}
              className="font-bold text-resqnow-critical underline"
            >
              Emergency Report → Urgent Evacuation
            </button>{' '}

            instead.
          </div>
        )}
      </section>

      {/* ============ LOCATION ============ */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl overflow-hidden mb-4">

        {/* Location accordion */}
        <button
          type="button"
          onClick={() => setShowLocation((prev) => !prev)}
          className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-resqnow-canvas transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">

            <MapPin className="w-4 h-4 text-resqnow-violet shrink-0" />

            <div className="min-w-0">

              <h2 className="text-sm font-bold text-resqnow-primary">
                Incident Location
              </h2>

              <p className="text-[10px] text-resqnow-muted truncate">
                {location || 'Set where the concern is located'}
              </p>
            </div>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-resqnow-muted shrink-0 transition-transform ${
              showLocation
                ? 'rotate-180'
                : ''
            }`}
          />
        </button>

        {/* Location fields */}
        {showLocation && (
          <div className="px-4 pb-4 border-t border-resqnow-border-soft">

            {/* Purok */}
            <div className="mt-4">
              <Field label="Purok">

                <select
                  value={purok}
                  onChange={(e) => setPurok(e.target.value)}
                  className="w-full bg-resqnow-canvas border border-resqnow-border rounded-xl px-3 py-3 text-[12px] text-resqnow-primary outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10 transition-all"
                >
                  {purokOptions.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Address */}
            <div className="mt-3">
              <Field label="Address / Incident Location">

                <textarea
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setError('');
                  }}
                  rows="2"
                  placeholder="Enter the location of the concern"
                  className="w-full bg-resqnow-canvas border border-resqnow-border rounded-xl px-3 py-3 text-[12px] text-resqnow-primary resize-none outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10 transition-all"
                />
              </Field>
            </div>

            {/* Landmark */}
            <div className="mt-3">
              <Field label="Nearby Landmark">

                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Example: Near the elementary school"
                  className="w-full bg-resqnow-canvas border border-resqnow-border rounded-xl px-3 py-3 text-[12px] text-resqnow-primary outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10 transition-all"
                />
              </Field>
            </div>

            {/* Mock map */}
            <div className="mt-3 bg-resqnow-violet/5 border border-dashed border-resqnow-violet/20 rounded-xl p-4 text-center">

              <MapPin className="w-6 h-6 text-resqnow-violet mx-auto" />

              <p className="text-[11px] font-semibold text-resqnow-primary mt-2">
                Pin Incident Location
              </p>

              <p className="text-[9px] text-resqnow-violet mt-1">
                Map pin integration will be connected later.
              </p>

              <p className="text-[9px] text-resqnow-muted mt-2">
                Sample coordinates: 17.1480, 121.8890
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ============ REPORT DETAILS ============ */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl p-4 mb-4">

        <h2 className="text-sm font-bold text-resqnow-primary">
          Report Details
        </h2>

        <p className="text-[10px] text-resqnow-muted mt-0.5 mb-3">
          Give enough information for barangay personnel to review the concern.
        </p>

        {/* Description */}
        <Field label="Description">

          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setError('');
            }}
            rows="3"
            placeholder="Describe the concern briefly..."
            className="w-full bg-resqnow-canvas border border-resqnow-border rounded-xl px-3 py-3 text-[12px] text-resqnow-primary resize-none outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10 transition-all"
          />
        </Field>

        {/* Assistance */}
        <div className="mt-4">
          <Field label="Assistance Needed">

            <textarea
              value={assistance}
              onChange={(e) => setAssistance(e.target.value)}
              rows="2"
              placeholder="Example: Clean-up crew, transportation, repair..."
              className="w-full bg-resqnow-canvas border border-resqnow-border rounded-xl px-3 py-3 text-[12px] text-resqnow-primary resize-none outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10 transition-all"
            />
          </Field>
        </div>
      </section>

      {/* ============ AFFECTED INDIVIDUALS ============ */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl p-4 mb-4">

        <div className="flex items-center gap-2">

          <Users className="w-4 h-4 text-resqnow-violet" />

          <div>
            <h2 className="text-sm font-bold text-resqnow-primary">
              Affected Individuals
            </h2>

            <p className="text-[10px] text-resqnow-muted">
              Select all that apply. Optional.
            </p>
          </div>
        </div>

        {/* Affected options */}
        <div className="grid grid-cols-2 gap-2 mt-3">

          {affectedOptions.map((item) => {
            const selected = affected.includes(item);

            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleAffected(item)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left active:scale-[0.98] transition-all ${
                  selected
                    ? 'bg-resqnow-violet/10 border-resqnow-violet/30 text-resqnow-violet'
                    : 'bg-white border-resqnow-border-soft text-resqnow-muted hover:bg-resqnow-violet/5'
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                    selected
                      ? 'bg-resqnow-violet border-resqnow-violet'
                      : 'border-resqnow-border'
                  }`}
                >
                  {selected && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>

                <span className="text-[10px] font-medium">
                  {item}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ============ OPTIONAL PHOTO ============ */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl p-4 mb-4">

        <div className="flex items-center gap-2 mb-3">

          <Camera className="w-4 h-4 text-resqnow-violet" />

          <div>
            <h2 className="text-sm font-bold text-resqnow-primary">
              Photo Evidence
            </h2>

            <p className="text-[10px] text-resqnow-muted">
              Optional only.
            </p>
          </div>
        </div>

        {/* Add photo */}
        {!photoPreview ? (
          <label className="block border-2 border-dashed border-resqnow-border-soft rounded-xl p-5 text-center cursor-pointer hover:bg-resqnow-violet/5 hover:border-resqnow-violet/20 transition-colors">

            <Camera className="w-6 h-6 text-resqnow-placeholder mx-auto" />

            <p className="text-[11px] font-semibold text-resqnow-secondary mt-2">
              Add Photo
            </p>

            <p className="text-[9px] text-resqnow-muted mt-1">
              JPG or PNG
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
            />
          </label>
        ) : (
          <div className="relative">

            {/* Photo preview */}
            <img
              src={photoPreview}
              alt="Report preview"
              className="w-full h-40 object-cover rounded-xl"
            />

            {/* Remove photo */}
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(photoPreview);
                setPhotoPreview('');
              }}
              aria-label="Remove photo"
              className="absolute top-2 right-2 w-8 h-8 bg-resqnow-primary/80 text-white rounded-full flex items-center justify-center active:scale-90 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* ============ REPORTER INFO ============ */}
      <div className="bg-resqnow-mint/5 border border-resqnow-mint/15 rounded-xl p-3 mb-4">

        <div className="flex items-start gap-2">

          <HandHeart className="w-4 h-4 text-resqnow-mint shrink-0 mt-0.5" />

          <p className="text-[10px] text-resqnow-secondary leading-relaxed">
            Your name, contact number, address, and purok will be included automatically with this report.
          </p>
        </div>
      </div>

      {/* ============ REVIEW REPORT ============ */}
      {/* Normal non-emergency submit uses the Brand gradient */}
      <button
        type="button"
        onClick={handleReview}
        className="w-full py-3.5 rounded-xl bg-brand-gradient text-white text-[13px] font-bold shadow-[0_5px_18px_rgba(131,70,242,0.20)] active:scale-[0.98] transition-all"
      >
        Review Report
      </button>

      {/* Initial status note */}
      <div className="flex items-center justify-center gap-1.5 mt-2">

        <span className="w-1.5 h-1.5 rounded-full bg-resqnow-pending" />

        <p className="text-[9px] text-resqnow-muted text-center">
          Non-emergency reports will start as Pending Verification.
        </p>
      </div>

      {/* ============ CONFIRM MODAL ============ */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] bg-resqnow-primary/40 flex items-end sm:items-center justify-center p-0 sm:p-4">

          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-resqnow-border-soft">

              <div>
                <p className="text-sm font-bold text-resqnow-primary">
                  Confirm Report
                </p>

                <p className="text-[10px] text-resqnow-muted mt-0.5">
                  Review the important details before submitting.
                </p>
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                aria-label="Close confirmation"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-resqnow-muted hover:bg-resqnow-canvas disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal content */}
            <div className="p-4">

              {/* Concern */}
              <div className="bg-resqnow-violet/5 border border-resqnow-violet/15 rounded-xl p-3 mb-3">

                <p className="text-[9px] font-bold text-resqnow-violet uppercase tracking-wide">
                  Concern Type
                </p>

                <p className="text-[13px] font-semibold text-resqnow-primary mt-1">
                  {getConcernInfo(selectedType).label}
                </p>

                {subcategory && (
                  <p className="text-[10px] text-resqnow-violet mt-1">
                    {subcategory}
                  </p>
                )}
              </div>

              {/* Main information */}
              <InfoRow
                label="Reporting For"
                value={reportingFor}
              />

              {reportingFor === 'Another Person' && personName && (
                <InfoRow
                  label="Person"
                  value={personName}
                />
              )}

              {reportingFor === 'Another Person' && personContact && (
                <InfoRow
                  label="Person Contact"
                  value={personContact}
                />
              )}

              {reportingFor === 'Another Person' && relationship && (
                <InfoRow
                  label="Relationship / Note"
                  value={relationship}
                />
              )}

              <InfoRow
                label="Purok"
                value={purok}
              />

              <InfoRow
                label="Location"
                value={location}
              />

              {landmark && (
                <InfoRow
                  label="Landmark"
                  value={landmark}
                />
              )}

              {/* Pending Verification */}
              <div className="flex items-center justify-between gap-4 py-2 border-b border-resqnow-border-soft">

                <span className="text-[10px] text-resqnow-muted">
                  Status
                </span>

                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-resqnow-pending/15 text-resqnow-pending">
                  Pending Verification
                </span>
              </div>

              {/* Description */}
              <div className="mt-3 bg-resqnow-canvas rounded-xl p-3">

                <p className="text-[9px] font-bold text-resqnow-muted uppercase tracking-wide">
                  Description
                </p>

                <p className="text-[11px] text-resqnow-secondary mt-1 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Assistance */}
              {assistance && (
                <div className="mt-3 bg-resqnow-mint/5 border border-resqnow-mint/10 rounded-xl p-3">

                  <p className="text-[9px] font-bold text-resqnow-mint uppercase tracking-wide">
                    Assistance Needed
                  </p>

                  <p className="text-[11px] text-resqnow-secondary mt-1 leading-relaxed">
                    {assistance}
                  </p>
                </div>
              )}

              {/* Affected individuals */}
              {affected.length > 0 && (
                <div className="mt-3">

                  <p className="text-[9px] font-bold text-resqnow-muted uppercase tracking-wide">
                    Affected Individuals
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-2">

                    {affected.map((item) => (
                      <span
                        key={item}
                        className="text-[9px] font-semibold px-2 py-1 rounded-full bg-resqnow-violet/10 text-resqnow-violet"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo attached */}
              {photoPreview && (
                <div className="mt-3 flex items-center gap-2 bg-resqnow-canvas rounded-xl px-3 py-2.5">

                  <Camera className="w-4 h-4 text-resqnow-violet" />

                  <p className="text-[10px] text-resqnow-secondary">
                    Photo evidence attached
                  </p>
                </div>
              )}

              {/* Modal buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4">

                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={isSubmitting}
                  className="py-3 rounded-xl border border-resqnow-border bg-white text-resqnow-muted text-[12px] font-semibold hover:bg-resqnow-canvas disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>

                {/* Confirm */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="py-3 rounded-xl bg-brand-gradient text-white text-[12px] font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Confirm & Submit'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ SMALL COMPONENTS ============

// Selection button for Myself / Another Person
function ChoiceButton({
  selected,
  label,
  icon: Icon,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-xl border flex items-center gap-2.5 text-left active:scale-[0.98] transition-all ${
        selected
          ? 'bg-resqnow-violet/10 border-resqnow-violet/30 text-resqnow-violet'
          : 'bg-white border-resqnow-border-soft text-resqnow-muted hover:bg-resqnow-violet/5'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />

      <span className="text-[11px] font-semibold">
        {label}
      </span>
    </button>
  );
}

// Small form field wrapper
function Field({
  label,
  children,
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-resqnow-secondary mb-1.5">
        {label}
      </label>

      {children}
    </div>
  );
}

// Small information row
function InfoRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-resqnow-border-soft last:border-0">

      <span className="text-[10px] text-resqnow-muted shrink-0">
        {label}
      </span>

      <span className="text-[10px] font-medium text-resqnow-primary text-right">
        {value || 'Not provided'}
      </span>
    </div>
  );
}