// src/components/resident/EmergencyReport.jsx
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEmergencyReport } from '../../services/reportService';

// Codes and labels must match the API (ReportController::EMERGENCY_CONCERNS).
const CONCERNS = [
  { code: 'life-death', label: 'Life and Death Emergency' },
  { code: 'fire', label: 'Fire Emergency' },
  { code: 'medical', label: 'Medical Emergency' },
  { code: 'violence', label: 'Public Safety / Violence' },
  { code: 'flood', label: 'Flood Rescue Needed' },
  { code: 'accident', label: 'Road Accident' },
  { code: 'evacuation', label: 'Immediate Evacuation' },
];

const PHONE_PATTERN = /^(09|\+639)\d{9}$/;

export default function EmergencyReport() {
  const navigate = useNavigate();
  const submitting = useRef(false);

  const [concernCode, setConcernCode] = useState('medical');
  const [forOther, setForOther] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectContact, setSubjectContact] = useState('');
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [gps, setGps] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function captureLocation() {
    if (!navigator.geolocation) {
      setGpsStatus('GPS is not available on this device.');
      return;
    }

    setGpsStatus('Getting your location…');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGps({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date(position.timestamp).toISOString(),
        });
        setGpsStatus(
          `Location captured (±${Math.round(position.coords.accuracy)} m).`
        );
      },
      () => {
        setGps(null);
        setGpsStatus('Unable to get your location. Type the address instead.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting.current) return;

    const contact = subjectContact.replace(/[\s-]/g, '');

    if (forOther && contact && !PHONE_PATTERN.test(contact)) {
      setError('Enter a valid Philippine mobile number.');
      return;
    }

    submitting.current = true;
    setError('');
    setIsSubmitting(true);

    try {
      const report = await createEmergencyReport({
        concernCode,
        location: location.trim(),
        landmark: landmark.trim() || undefined,
        description: description.trim() || undefined,
        reportingForOther: forOther,
        subjectName: forOther ? subjectName.trim() || undefined : undefined,
        subjectContact: forOther ? contact || undefined : undefined,
        ...(gps
          ? {
              latitude: gps.latitude,
              longitude: gps.longitude,
              locationSource: 'gps',
              locationAccuracy: gps.accuracy,
              locationCapturedAt: gps.capturedAt,
            }
          : { locationSource: 'manual' }),
      });

      navigate(report?.id ? `/track/${report.id}` : '/track');
    } catch (submitError) {
      const firstFieldError = Object.values(submitError.errors || {})[0]?.[0];

      setError(
        firstFieldError ||
          submitError.message ||
          'Failed to submit report. Please try again.'
      );
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  const field =
    'mt-1 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm';

  return (
    <div className="px-4 pt-5 pb-8 min-h-screen">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-resqnow-primary">
          Emergency Report
        </h1>
        <p className="text-xs text-resqnow-muted mt-1">
          Give the facts you know. Barangay personnel will verify and prioritize
          the report.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Type of emergency
          <select
            value={concernCode}
            onChange={(event) => setConcernCode(event.target.value)}
            className={field}
          >
            {CONCERNS.map((concern) => (
              <option key={concern.code} value={concern.code}>
                {concern.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={forOther}
            onChange={(event) => setForOther(event.target.checked)}
          />
          I am reporting for another person
        </label>

        {forOther && (
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-700">
              Name of affected person
              <input
                type="text"
                value={subjectName}
                onChange={(event) => setSubjectName(event.target.value)}
                maxLength={150}
                className={field}
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Their mobile number
              <input
                type="tel"
                value={subjectContact}
                onChange={(event) => setSubjectContact(event.target.value)}
                placeholder="09XXXXXXXXX"
                className={field}
              />
            </label>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Where is the emergency?
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
              maxLength={1000}
              placeholder="House no., street, purok"
              className={field}
            />
          </label>

          <button
            type="button"
            onClick={captureLocation}
            className="text-xs font-semibold text-resqnow-primary underline"
          >
            Use my current location
          </button>
          {gpsStatus && (
            <p className="text-xs text-resqnow-muted">{gpsStatus}</p>
          )}
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Nearest landmark (optional)
          <input
            type="text"
            value={landmark}
            onChange={(event) => setLandmark(event.target.value)}
            maxLength={255}
            className={field}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          What is happening? (optional)
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            maxLength={2000}
            className={field}
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-red-600 p-3 font-bold text-white disabled:bg-slate-400"
        >
          {isSubmitting ? 'Submitting…' : 'Submit Emergency Report'}
        </button>
      </form>
    </div>
  );
}
