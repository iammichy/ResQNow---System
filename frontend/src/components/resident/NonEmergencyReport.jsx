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
  Info,
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
import {
  nonEmergencyTypes,
  purokOptions,
} from '../../data/mockData';

// ============ ICONS ============
const iconMap = {
  'evac-assistance': Tent,
  'bhw-assistance': Stethoscope,
  'road-obstruction': TreePine,
  'damaged-facility': Wrench,
  cleanup: Broom,
  'community-concern': MessageSquare,
  'other-assistance': CircleHelp,
};
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

function getConcernInfo(type) {
  return (
    concernCategoryInfo[type?.id] || {
      label: type?.label || '',
      description: '',
    }
  );
}

// ============ SUBCATEGORIES ============
const subcategories = {
  'evac-assistance': ['Transportation', 'Temporary Shelter', 'Supplies'],
  'bhw-assistance': ['Health Check', 'Home Visit', 'Medicine Assistance'],
  'road-obstruction': ['Fallen Tree / Branch', 'Debris Blocking Road', 'Vehicle / Object Blocking Road', 'Other Road Obstruction',],
  'damaged-facility': ['Street Light', 'Road', 'Drainage', 'Barangay Facility'],
  cleanup: ['Waste Collection', 'Storm Debris / Branches', 'Drainage Clean-up'],
  'community-concern': ['Sanitation', 'Noise', 'Stray Animals', 'Public Area'],
};

const affectedOptions = [
  'Child',
  'Senior Citizen',
  'PWD',
  'Pregnant Person',
  'Injured Person',
];

const concernHints = {
  'evac-assistance':
    'Use this for non-urgent help preparing for or getting to an evacuation center. If there is immediate danger, use Emergency → Urgent Evacuation.',
  'bhw-assistance':
    'Describe the health concern and mention any important medicines, conditions, or allergies if known.',
  'road-obstruction':
    'Use this when a road or pathway is blocked. Mention whether passage is fully or partly blocked and any hazards nearby.',
  'damaged-facility':
    'Use this for damaged public infrastructure such as streetlights, roads, drainage, or barangay facilities.',
  cleanup:
    'Use this when an area needs waste or debris removal. If a road or pathway is blocked, choose Blocked Road / Obstruction instead.',
  'community-concern':
    'Use this for neighborhood concerns such as sanitation, noise, stray animals, or unsafe public areas.',
  'other-assistance':
    'Choose this only when the assistance you need does not match the other categories.',
};

export default function NonEmergencyReport() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedType, setSelectedType] = useState(null);
  const [subcategory, setSubcategory] = useState('');

  const [reportingFor, setReportingFor] = useState('Myself');
  const [personName, setPersonName] = useState('');
  const [personContact, setPersonContact] = useState('');
  const [relationship, setRelationship] = useState('');

  const [purok, setPurok] = useState(user?.purok || 'Purok 1');
  const [location, setLocation] = useState(user?.address || '');
  const [landmark, setLandmark] = useState('');
  const [showLocation, setShowLocation] = useState(false);

  const [description, setDescription] = useState('');
  const [assistance, setAssistance] = useState('');
  const [affected, setAffected] = useState([]);

  const [photoPreview, setPhotoPreview] = useState('');

  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const newReportId = `NE-${String(Date.now()).slice(-6)}`;

  const availableSubcategories = selectedType
    ? subcategories[selectedType.id] || []
    : [];

  const toggleAffected = (item) => {
    setAffected((prev) =>
      prev.includes(item)
        ? prev.filter((person) => person !== item)
        : [...prev, item]
    );
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  };

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
      <div className="px-4 pt-8 pb-28 min-h-screen bg-slate-50">
        <div className="bg-white border border-green-200 rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-teal-500 to-blue-600" />

          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="text-xl font-bold text-slate-900">Report Submitted</h1>
            <p className="text-[12px] text-slate-500 mt-2 leading-relaxed">
              Your concern has been submitted and is waiting for barangay verification.
            </p>

            <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Report ID</p>
              <p className="text-lg font-bold text-blue-800 mt-1">{newReportId}</p>
              <p className="text-[11px] text-blue-700 mt-1">{getConcernInfo(selectedType).label}</p>
            </div>

            <div className="mt-4 bg-slate-50 rounded-xl p-4 text-left">
              <InfoRow label="Status" value="Pending Verification" />
              <InfoRow label="Location" value={location} />
              <InfoRow label="Reporter" value={user?.fullName || 'Resident'} />
            </div>

            <button
              type="button"
              onClick={() => navigate('/track')}
              className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white text-[13px] font-semibold active:scale-[0.99] transition-all"
            >
              View My Reports
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full mt-2 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-[12px] font-semibold hover:bg-slate-50 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-28 min-h-screen bg-slate-50">
      {/* ============ HEADER ============ */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900">Non-Emergency Report</h1>
        <p className="text-xs text-slate-500 mt-1">
          Report a barangay concern or request assistance.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-700">{error}</p>
        </div>
      )}

      {/* ============ REPORTING FOR ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <h2 className="text-sm font-bold text-slate-900">Who is this report for?</h2>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Tell us who may need the barangay assistance.
        </p>

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

        {reportingFor === 'Another Person' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
            <Field label="Name">
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="If known"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-[12px] text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </Field>
            <Field label="Contact Number">
              <input
                type="tel"
                value={personContact}
                onChange={(e) => setPersonContact(e.target.value)}
                placeholder="Optional"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-[12px] text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Relationship / Note">
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="Example: Neighbor"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-[12px] text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </Field>
            </div>
          </div>
        )}
      </section>

      {/* ============ CONCERN TYPE ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <h2 className="text-sm font-bold text-slate-900">What is your concern?</h2>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Select the category that best matches your report.
        </p>

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
                className={`p-3 min-h-[132px] rounded-xl border text-left transition-all ${
                 type.id === 'other-assistance' ? 'col-span-2' : ''
                } ${
                  selected
                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-100'
                    : 'bg-white border-slate-200 hover:bg-blue-50/30 hover:border-blue-200'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    selected ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-500'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <p className={`text-[11px] font-semibold mt-2 leading-snug ${
                  selected ? 'text-blue-700' : 'text-slate-700'
                }`}>
                  {info.label}
                </p>
                <p className={`text-[9px] mt-1 leading-relaxed ${
                  selected ? 'text-blue-600/80' : 'text-slate-400'
                }`}>
                  {info.description}
</p>
              </button>
            );
          })}
        </div>

               {/* Subcategory — emphasized with hint */}
        {availableSubcategories.length > 0 && (
          <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-bold text-slate-700">
                Specify the concern <span className="text-slate-400 font-medium">(optional)</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableSubcategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSubcategory(item)}
                  className={`px-3.5 py-2 rounded-full text-[11px] font-semibold border transition-all ${
                    subcategory === item
                      ? 'bg-teal-500 border-teal-500 text-white shadow-sm'
                      : 'bg-white border-slate-300 text-slate-600 hover:border-teal-400 hover:text-teal-600'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
                {/* Clarifier — only shows for Evacuation Preparation */}
        {selectedType?.id === 'evac-assistance' && (
          <p className="mt-3 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
            In danger right now? Use <strong>Emergency Report → Immediate Evacuation</strong> instead.
          </p>
        )}

        {/* Contextual hint — tells the resident what info helps */}
        {selectedType && concernHints[selectedType.id] && (
          <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
            <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-blue-700 leading-relaxed">
              <span className="font-bold">Tip:</span> {concernHints[selectedType.id]}
            </p>
          </div>
        )}
      </section>

      {/* ============ LOCATION ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-4">
        <button
          type="button"
          onClick={() => setShowLocation((prev) => !prev)}
          className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900">Incident Location</h2>
              <p className="text-[10px] text-slate-400 truncate">
                {location || 'Set where the concern is located'}
              </p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${showLocation ? 'rotate-180' : ''}`} />
        </button>

        {showLocation && (
          <div className="px-4 pb-4 border-t border-slate-100">
            <div className="mt-4">
              <Field label="Purok">
                <select
                  value={purok}
                  onChange={(e) => setPurok(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-[12px] text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  {purokOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-3">
              <Field label="Address / Incident Location">
                <textarea
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setError(''); }}
                  rows="2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-[12px] text-slate-700 resize-none outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </Field>
            </div>

            <div className="mt-3">
              <Field label="Nearby Landmark">
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Example: Near the elementary school"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-[12px] text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </Field>
            </div>

            {/* Mock map */}
            <div className="mt-3 bg-blue-50 border border-dashed border-blue-200 rounded-xl p-4 text-center">
              <MapPin className="w-6 h-6 text-blue-500 mx-auto" />
              <p className="text-[11px] font-semibold text-blue-700 mt-2">Pin Incident Location</p>
              <p className="text-[9px] text-blue-500 mt-1">Map pin integration will be connected later.</p>
              <p className="text-[9px] text-slate-400 mt-2">Sample coordinates: 17.1480, 121.8890</p>
            </div>
          </div>
        )}
      </section>

      {/* ============ REPORT DETAILS ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <h2 className="text-sm font-bold text-slate-900">Report Details</h2>
        <p className="text-[10px] text-slate-400 mt-0.5 mb-3">
          Give enough information for barangay personnel to review the concern.
        </p>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); setError(''); }}
            rows="3"
            placeholder="Describe the concern briefly..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-[12px] text-slate-700 resize-none outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </Field>

        <div className="mt-4">
          <Field label="Assistance Needed">
            <textarea
              value={assistance}
              onChange={(e) => setAssistance(e.target.value)}
              rows="2"
              placeholder="Example: Clean-up crew, transportation, repair..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-[12px] text-slate-700 resize-none outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </Field>
        </div>
      </section>

      {/* ============ AFFECTED INDIVIDUALS ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-teal-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Affected Individuals</h2>
            <p className="text-[10px] text-slate-400">Select all that apply. Optional.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          {affectedOptions.map((item) => {
            const selected = affected.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleAffected(item)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                  selected
                    ? 'bg-teal-50 border-teal-300 text-teal-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                  selected ? 'bg-teal-500 border-teal-500' : 'border-slate-300'
                }`}>
                  {selected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[10px] font-medium">{item}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ============ OPTIONAL PHOTO ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="w-4 h-4 text-blue-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Photo Evidence</h2>
            <p className="text-[10px] text-slate-400">Optional only.</p>
          </div>
        </div>

        {!photoPreview ? (
          <label className="block border-2 border-dashed border-slate-200 rounded-xl p-5 text-center cursor-pointer hover:bg-slate-50 hover:border-blue-200 transition-colors">
            <Camera className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="text-[11px] font-semibold text-slate-600 mt-2">Add Photo</p>
            <p className="text-[9px] text-slate-400 mt-1">JPG or PNG</p>
            <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </label>
        ) : (
          <div className="relative">
            <img src={photoPreview} alt="Report preview" className="w-full h-40 object-cover rounded-xl" />
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(photoPreview);
                setPhotoPreview('');
              }}
              className="absolute top-2 right-2 w-8 h-8 bg-slate-900/70 text-white rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* ============ AUTO REPORTER INFO ============ */}
      <div className="bg-teal-50/60 border border-teal-100 rounded-xl p-3 mb-4">
        <div className="flex items-start gap-2">
          <HandHeart className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-teal-700 leading-relaxed">
            Your name, contact number, address, and purok will be included
            automatically with this report.
          </p>
        </div>
      </div>

      {/* ============ REVIEW ============ */}
      <button
        type="button"
        onClick={handleReview}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white text-[13px] font-bold shadow-sm active:scale-[0.99] transition-all"
      >
        Review Report
      </button>

      <p className="text-[9px] text-slate-400 text-center mt-2">
        Non-emergency reports will start as Pending Verification.
      </p>

      {/* ============ CONFIRM MODAL ============ */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Confirm Report</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Review the important details before submitting.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              {/* Concern */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3">
                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wide">Concern Type</p>
                <p className="text-[13px] font-semibold text-blue-800 mt-1">{getConcernInfo(selectedType).label}</p>
                {subcategory && <p className="text-[10px] text-blue-600 mt-1">{subcategory}</p>}
              </div>

              <InfoRow label="Reporting For" value={reportingFor} />
              {reportingFor === 'Another Person' && personName && <InfoRow label="Person" value={personName} />}
              <InfoRow label="Purok" value={purok} />
              <InfoRow label="Location" value={location} />
              {landmark && <InfoRow label="Landmark" value={landmark} />}
              <InfoRow label="Status" value="Pending Verification" />

              <div className="mt-3 bg-slate-50 rounded-xl p-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Description</p>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{description}</p>
              </div>

              {assistance && (
                <div className="mt-3 bg-teal-50/60 rounded-xl p-3">
                  <p className="text-[9px] font-bold text-teal-600 uppercase tracking-wide">Assistance Needed</p>
                  <p className="text-[11px] text-teal-700 mt-1 leading-relaxed">{assistance}</p>
                </div>
              )}

              {affected.length > 0 && (
                <div className="mt-3">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Affected Individuals</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {affected.map((item) => (
                      <span key={item} className="text-[9px] font-medium bg-teal-50 text-teal-600 px-2 py-1 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={isSubmitting}
                  className="py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-[12px] font-semibold hover:bg-slate-50 disabled:opacity-50"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white text-[12px] font-bold flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
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
function ChoiceButton({ selected, label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
        selected
          ? 'bg-teal-50 border-teal-300 text-teal-700'
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-[10px] text-slate-400 shrink-0">{label}</span>
      <span className="text-[10px] font-medium text-slate-700 text-right">{value || 'Not provided'}</span>
    </div>
  );
}
