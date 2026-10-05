import {
  AlertTriangle,
  ArrowLeft,
  Crosshair,
  House,
  MapPin,
  Send,
} from 'lucide-react';

import LocationPicker from '../common/LocationPicker';

function numberOrNull(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function buildMapUrl(location) {
  const latitude =
    numberOrNull(location?.latitude);

  const longitude =
    numberOrNull(location?.longitude);

  if (
    latitude === null ||
    longitude === null
  ) {
    return null;
  }

  const latSpan = 0.003;
  const lngSpan = 0.004;

  const bbox = [
    longitude - lngSpan,
    latitude - latSpan,
    longitude + lngSpan,
    latitude + latSpan,
  ].join(',');

  return (
    'https://www.openstreetmap.org/export/embed.html' +
    `?bbox=${encodeURIComponent(bbox)}` +
    '&layer=mapnik' +
    `&marker=${latitude}%2C${longitude}`
  );
}

function gpsMessage(
  outcome,
  hasGps
) {
  if (hasGps) {
    return 'Current device location captured. Confirm this is where help is needed before sending.';
  }

  switch (outcome) {
    case 'denied':
      return 'GPS permission was denied. Use Manual Location or the registered-address fallback.';

    case 'timeout':
      return 'GPS took too long. Retry GPS or enter the incident location manually.';

    case 'unsupported':
      return 'GPS is not available on this device. Enter the incident location manually.';

    default:
      return 'Current GPS location could not be obtained. Enter or pin the incident location manually.';
  }
}

export default function SosLocationConfirm({
  mode,
  gpsLocation,
  manualLocation,
  locationOutcome,
  manualText,
  error,
  onModeChange,
  onManualTextChange,
  onManualMapChange,
  onRetryGps,
  onSendGps,
  onSendManual,
  onUseSavedAddress,
  onBack,
}) {
  const gpsLatitude =
    numberOrNull(
      gpsLocation?.latitude
    );

  const gpsLongitude =
    numberOrNull(
      gpsLocation?.longitude
    );

  const hasGps =
    gpsLatitude !== null &&
    gpsLongitude !== null;

  const gpsAccuracy =
    numberOrNull(
      gpsLocation?.accuracy
    );

  const gpsMapUrl =
    buildMapUrl(
      gpsLocation
    );

  const manualLatitude =
    numberOrNull(
      manualLocation?.latitude
    );

  const manualLongitude =
    numberOrNull(
      manualLocation?.longitude
    );

  const hasManualPin =
    manualLatitude !== null &&
    manualLongitude !== null;

  const canSendManual =
    manualText.trim().length > 0 ||
    hasManualPin;

  return (
    <section className="rounded-2xl border border-resqnow-border-soft bg-white p-4 shadow-[0_8px_24px_rgba(31,29,71,.08)]">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-resqnow-border-soft text-resqnow-secondary"
          aria-label="Back to SOS reason"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-extrabold uppercase tracking-[.14em] text-resqnow-critical">
            SOS Incident Location
          </p>

          <h3 className="mt-0.5 text-[15px] font-extrabold text-resqnow-primary">
            Confirm where help is needed
          </h3>

          <p className="mt-1 text-[10px] leading-relaxed text-resqnow-muted">
            GPS is attempted first. If the emergency is somewhere else or the
            GPS is inaccurate, use Manual Location.
          </p>
        </div>

        <MapPin className="h-5 w-5 shrink-0 text-resqnow-critical" />
      </div>

      <div
        className="mt-4 grid grid-cols-2 rounded-xl bg-resqnow-canvas p-1"
        role="tablist"
        aria-label="SOS incident location method"
      >
        <button
          type="button"
          role="tab"
          aria-selected={
            mode === 'gps'
          }
          onClick={() =>
            onModeChange('gps')
          }
          className={`min-h-[44px] rounded-lg px-3 text-[11px] font-extrabold ${
            mode === 'gps'
              ? 'bg-white text-resqnow-violet shadow-sm'
              : 'text-resqnow-muted'
          }`}
        >
          Current GPS
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={
            mode === 'manual'
          }
          onClick={() =>
            onModeChange('manual')
          }
          className={`min-h-[44px] rounded-lg px-3 text-[11px] font-extrabold ${
            mode === 'manual'
              ? 'bg-white text-resqnow-violet shadow-sm'
              : 'text-resqnow-muted'
          }`}
        >
          Manual Location
        </button>
      </div>

      {mode === 'gps' ? (
        <div className="mt-3">
          <div
            className={`rounded-xl border p-3 ${
              hasGps
                ? 'border-resqnow-safe/25 bg-resqnow-safe/10'
                : 'border-resqnow-caution/25 bg-resqnow-caution/10'
            }`}
          >
            <div className="flex items-start gap-2">
              {hasGps ? (
                <Crosshair className="mt-0.5 h-4 w-4 shrink-0 text-resqnow-safe" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-resqnow-caution" />
              )}

              <div>
                <p className="text-[10px] font-semibold leading-relaxed text-resqnow-secondary">
                  {gpsMessage(
                    locationOutcome,
                    hasGps
                  )}
                </p>

                {hasGps && (
                  <div className="mt-2 space-y-0.5 text-[9px] text-resqnow-muted">
                    <p>
                      Coordinates:{' '}
                      {gpsLatitude.toFixed(
                        6
                      )}
                      ,{' '}
                      {gpsLongitude.toFixed(
                        6
                      )}
                    </p>

                    <p>
                      Accuracy:{' '}
                      {gpsAccuracy !==
                      null
                        ? `approximately ${Math.round(
                            gpsAccuracy
                          )} m`
                        : 'not reported'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {gpsMapUrl ? (
            <div className="mt-3 h-64 overflow-hidden rounded-xl border border-resqnow-border-soft bg-resqnow-canvas">
              <iframe
                title="Current SOS GPS location"
                src={gpsMapUrl}
                loading="lazy"
                className="h-full w-full border-0"
              />
            </div>
          ) : (
            <div className="mt-3 flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-resqnow-border bg-resqnow-canvas px-5 text-center">
              <MapPin className="h-6 w-6 text-resqnow-muted" />

              <p className="mt-2 text-[11px] font-bold text-resqnow-primary">
                GPS location unavailable
              </p>

              <p className="mt-1 text-[9px] leading-relaxed text-resqnow-muted">
                Switch to Manual Location to enter a landmark or place the
                incident pin yourself.
              </p>
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={
                onRetryGps
              }
              className="min-h-[46px] rounded-xl border border-resqnow-violet/20 bg-resqnow-violet/5 px-3 text-[11px] font-extrabold text-resqnow-violet"
            >
              Retry GPS
            </button>

            <button
              type="button"
              disabled={!hasGps}
              onClick={
                onSendGps
              }
              className="min-h-[46px] rounded-xl bg-resqnow-critical px-3 text-[11px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="inline-flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send with GPS
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <label
            htmlFor="sos-manual-location"
            className="text-[10px] font-extrabold text-resqnow-primary"
          >
            Current incident location / nearby landmark
          </label>

          <input
            id="sos-manual-location"
            type="text"
            maxLength={240}
            value={manualText}
            onChange={(event) =>
              onManualTextChange(
                event.target.value
              )
            }
            placeholder="Example: beside Camunatan Elementary School"
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-resqnow-border bg-white px-3 text-[12px] text-resqnow-primary outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10"
          />

          <p className="mt-1.5 text-[9px] leading-relaxed text-resqnow-muted">
            You may enter a location, place a pin, or provide both.
          </p>

          <div className="mt-3">
            <LocationPicker
              value={
                manualLocation
              }
              onChange={
                onManualMapChange
              }
              labels={{
                locate:
                  'Use device location as pin',
                locating:
                  'Finding location...',
                remove:
                  'Remove pin',
                hint:
                  'Tap the map to place the incident pin.',
                placed:
                  'Incident pin placed. Drag it to adjust.',
              }}
            />
          </div>

          <button
            type="button"
            disabled={
              !canSendManual
            }
            onClick={
              onSendManual
            }
            className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-resqnow-critical px-4 text-[11px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            Send SOS with Manual Location
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-xl border border-resqnow-critical/20 bg-resqnow-critical/10 px-3 py-2.5"
        >
          <p className="text-[10px] font-semibold leading-relaxed text-resqnow-crimson">
            {error}
          </p>
        </div>
      )}

      <div className="mt-4 border-t border-resqnow-border-soft pt-3">
        <button
          type="button"
          onClick={
            onUseSavedAddress
          }
          className="flex w-full items-start gap-2.5 rounded-xl border border-resqnow-border-soft bg-resqnow-canvas px-3 py-3 text-left"
        >
          <House className="mt-0.5 h-4 w-4 shrink-0 text-resqnow-violet" />

          <span>
            <span className="block text-[10px] font-extrabold text-resqnow-primary">
              Use registered address fallback
            </span>

            <span className="mt-0.5 block text-[9px] leading-relaxed text-resqnow-muted">
              Use this only when the current incident location cannot be
              obtained. Admin and responders will be told that it is the
              registered address, not confirmed current GPS.
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}