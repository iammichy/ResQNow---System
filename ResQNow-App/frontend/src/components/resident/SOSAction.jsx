import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  MessageSquareText,
  Phone,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';

import {
  captureBestEffortLocation,
  clearPendingSosKey,
  getOrCreateSosKey,
  SOS_REASONS,
  openSosSms,
  submitSos,
} from '../../services/sosService';
import SosLocationConfirm from './SosLocationConfirm';

const SWIPE_THRESHOLD = 0.84;
const HOLD_MS = 2000;

export default function SOSAction({ user, hotline, onCreated, onCallHotline }) {
  const trackRef = useRef(null);
  const dragStartRef = useRef(0);
  const draggingRef = useRef(false);
  const holdTimerRef = useRef(null);
  const holdStartRef = useRef(0);
  const holdAnimationRef = useRef(null);

  const [phase, setPhase] = useState('idle');
  const [dragX, setDragX] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [lastLocation, setLastLocation] = useState(null);
  const [lastKey, setLastKey] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);
  const [lastError, setLastError] = useState('');
  const [locationMode, setLocationMode] = useState('gps');
  const [locationOutcome, setLocationOutcome] = useState(null);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [manualLocation, setManualLocation] = useState(null);
  const [manualLocationText, setManualLocationText] = useState('');
  const [locationError, setLocationError] = useState('');

  const isBusy = ['locating', 'sending'].includes(phase);
  const maxTravel = Math.max(0, trackWidth - 64);
  const swipePercent = maxTravel > 0 ? Math.min(1, dragX / maxTravel) : 0;

  useEffect(() => {
    const measure = () => {
      setTrackWidth(trackRef.current?.getBoundingClientRect().width || 0);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(holdTimerRef.current);
      window.cancelAnimationFrame(holdAnimationRef.current);
    };
  }, []);

  const instruction = useMemo(() => {
    if (phase === 'locating') return 'Getting the fastest available location...';
    if (phase === 'sending') return 'Sending SOS securely to ResQNow...';
    if (phase === 'location') return 'Confirm where help is needed.';
    if (phase === 'fallback') return 'Online delivery could not be confirmed.';
    return 'Life-threatening emergency only';
  }, [phase]);

  const sendSos = async ({
    location = null,
    reason = selectedReason,
  } = {}) => {
    if (
      !reason ||
      phase === 'sending'
    ) {
      return;
    }

    const idempotencyKey =
      lastKey ||
      getOrCreateSosKey(
        reason
      );

    setLastKey(
      idempotencyKey
    );

    setLastError('');
    setLocationError('');

    // Preserve the exact location for retry / SMS fallback.
    setLastLocation(
      location
    );

    setPhase('sending');

    try {
      const result =
        await submitSos({
          location,
          idempotencyKey,
          reason,
        });

      clearPendingSosKey();

      setPhase(
        'success'
      );

      onCreated?.(
        result.report
      );
    } catch (error) {
      setLastError(
        error?.message ||
          'ResQNow could not confirm online delivery. Use the SMS or hotline fallback now.'
      );

      setPhase(
        'fallback'
      );
    }
  };

  const captureSosLocation = async () => {
    setLastError('');
    setLocationError('');
    setPhase('locating');

    const result =
      await captureBestEffortLocation();

    const captured =
      result.location
        ? {
            ...result.location,
            source: 'gps',
          }
        : null;

    setLocationOutcome(
      result.outcome
    );

    setGpsLocation(
      captured
    );

    // Manual coordinates are intentionally separate from GPS.
    setManualLocation(
      null
    );

    setLocationMode(
      captured
        ? 'gps'
        : 'manual'
    );

    setPhase(
      'location'
    );
  };

  const executeSos = async ({
    reuseLocation = false,
    reason = null,
  } = {}) => {
    if (isBusy) {
      return;
    }

    const chosenReason =
      reason ||
      selectedReason;

    if (!chosenReason) {
      setPhase('reason');
      setDragX(0);
      setHoldProgress(0);
      return;
    }

    setSelectedReason(
      chosenReason
    );

    if (reuseLocation) {
      await sendSos({
        location:
          lastLocation,
        reason:
          chosenReason,
      });

      return;
    }

    await captureSosLocation();
  };

  const sendGpsLocation = async () => {
    if (!gpsLocation) {
      setLocationError(
        'Current GPS is unavailable. Retry GPS or use Manual Location.'
      );

      return;
    }

    await sendSos({
      location: {
        ...gpsLocation,
        source: 'gps',
      },
      reason:
        selectedReason,
    });
  };

  const handleManualMapChange = (
    next
  ) => {
    setLocationError('');

    if (!next) {
      setManualLocation(
        null
      );

      return;
    }

    setManualLocation({
      latitude:
        Number(
          next.latitude
        ),
      longitude:
        Number(
          next.longitude
        ),
      source:
        'manual',
      capturedAt:
        new Date()
          .toISOString(),
    });
  };

  const sendManualLocation = async () => {
    const label =
      manualLocationText
        .trim();

    const latitude =
      manualLocation?.latitude;

    const longitude =
      manualLocation?.longitude;

    const hasCoordinates =
      Number.isFinite(
        Number(latitude)
      ) &&
      Number.isFinite(
        Number(longitude)
      );

    if (
      !label &&
      !hasCoordinates
    ) {
      setLocationError(
        'Enter a brief location or place the incident pin on the map.'
      );

      return;
    }

    const location = {
      source:
        'manual',

      label:
        label ||
        'Resident-pinned incident location',

      capturedAt:
        new Date()
          .toISOString(),

      ...(hasCoordinates
        ? {
            latitude:
              Number(
                latitude
              ),

            longitude:
              Number(
                longitude
              ),
          }
        : {}),
    };

    await sendSos({
      location,
      reason:
        selectedReason,
    });
  };

  const sendRegisteredAddressFallback = async () => {
    /*
     * Null is intentional:
     * Laravel will use the resident's saved profile location
     * and mark the location source as "saved".
     */
    await sendSos({
      location: null,
      reason:
        selectedReason,
    });
  };
  const resetSwipe = () => {
    draggingRef.current = false;
    setDragX(0);
  };

  const handlePointerDown = (event) => {
    if (phase !== 'idle') return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    draggingRef.current = true;
    dragStartRef.current = event.clientX - dragX;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!draggingRef.current || phase !== 'idle') return;
    const next = Math.min(maxTravel, Math.max(0, event.clientX - dragStartRef.current));
    setDragX(next);
  };

  const handlePointerEnd = () => {
    if (!draggingRef.current || phase !== 'idle') return;
    draggingRef.current = false;

    if (swipePercent >= SWIPE_THRESHOLD) {
      setDragX(maxTravel);
      executeSos();
      return;
    }

    resetSwipe();
  };

  const updateHoldProgress = () => {
    const elapsed = Date.now() - holdStartRef.current;
    setHoldProgress(Math.min(1, elapsed / HOLD_MS));

    if (elapsed < HOLD_MS) {
      holdAnimationRef.current = window.requestAnimationFrame(updateHoldProgress);
    }
  };

  const startHold = (event) => {
    if (phase !== 'idle') return;
    if (event?.pointerType === 'mouse' && event.button !== 0) return;

    window.clearTimeout(holdTimerRef.current);
    window.cancelAnimationFrame(holdAnimationRef.current);
    holdStartRef.current = Date.now();
    setHoldProgress(0);
    holdAnimationRef.current = window.requestAnimationFrame(updateHoldProgress);

    holdTimerRef.current = window.setTimeout(() => {
      setHoldProgress(1);
      executeSos();
    }, HOLD_MS);
  };

  const cancelHold = () => {
    window.clearTimeout(holdTimerRef.current);
    window.cancelAnimationFrame(holdAnimationRef.current);
    if (phase === 'idle') setHoldProgress(0);
  };

  const handleHoldKeyDown = (event) => {
    if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
      event.preventDefault();
      startHold();
    }
  };

  const handleHoldKeyUp = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      cancelHold();
    }
  };

  const openSmsFallback = () => {
    if (!hotline?.number) {
      onCallHotline?.();
      return;
    }

    try {
      openSosSms({
        number: hotline.number,
        user,
        location: lastLocation,
        idempotencyKey: lastKey,
        reason: selectedReason,
      });
    } catch (error) {
      setLastError(error?.message || 'Unable to open the SMS application.');
    }
  };

  if (phase === 'reason') {
    return (
      <section className="rounded-3xl border-2 border-resqnow-critical/25 bg-white p-4 shadow-[0_12px_32px_rgba(217,45,32,0.10)]">
        <div className="mb-3">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-resqnow-critical">
            Emergency SOS
          </p>

          <p className="text-[15px] font-extrabold text-resqnow-primary mt-1">
            What is happening?
          </p>

          <p className="text-[10px] text-resqnow-muted mt-1 leading-relaxed">
            Tap one quick reason. No additional questions are required before sending.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SOS_REASONS.map((item, index) => (
            <button
              key={item.code}
              type="button"
              onClick={() => executeSos({ reason: item.code })}
              className="min-h-[62px] rounded-2xl border border-resqnow-critical/20 bg-resqnow-critical/5 px-3 py-2 text-left active:scale-[0.98] transition-transform"
            >
              <span className="block text-[9px] font-extrabold text-resqnow-critical mb-0.5">
                {index + 1}
              </span>

              <span className="block text-[11px] font-extrabold text-resqnow-primary leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setPhase('idle');
            setSelectedReason(null);
            setDragX(0);
            setHoldProgress(0);
          }}
          className="mt-3 w-full min-h-[40px] rounded-xl border border-resqnow-border-soft bg-resqnow-canvas text-[10px] font-extrabold text-resqnow-secondary"
        >
          Back
        </button>
      </section>
    );
  }

  if (phase === 'fallback') {
    return (
      <section className="rounded-3xl border-2 border-resqnow-critical/25 bg-white overflow-hidden shadow-[0_10px_28px_rgba(217,45,32,0.10)]">
        <div className="bg-resqnow-critical/10 px-4 py-3 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-resqnow-critical text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-extrabold text-resqnow-critical uppercase tracking-[0.08em]">
              SOS fallback required
            </p>
            <p className="text-[11px] text-resqnow-secondary mt-1 leading-relaxed">
              {lastError || 'ResQNow could not confirm online delivery.'}
            </p>
          </div>
        </div>

        <div className="p-4 space-y-2.5">
          <button
            type="button"
            onClick={openSmsFallback}
            className="w-full min-h-[52px] rounded-2xl bg-resqnow-critical text-white text-[12px] font-extrabold flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
          >
            <MessageSquareText className="w-4.5 h-4.5" />
            Open Emergency SMS
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => executeSos({ reuseLocation: true })}
              className="min-h-[46px] rounded-xl border border-resqnow-violet/20 text-resqnow-violet text-[10px] font-extrabold flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry ResQNow
            </button>
            <button
              type="button"
              onClick={onCallHotline}
              className="min-h-[46px] rounded-xl border border-resqnow-critical/20 text-resqnow-critical text-[10px] font-extrabold flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Hotline
            </button>
          </div>

          <p className="text-[9px] text-resqnow-muted text-center leading-relaxed">
            SMS opens your phone's messaging app. You still confirm and send the message yourself.
          </p>
        </div>
      </section>
    );
  }

  if (isBusy || phase === 'success') {
    return (
      <section className="rounded-3xl border border-resqnow-violet/20 bg-white p-5 shadow-[0_10px_28px_rgba(11,79,156,0.10)]">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            phase === 'success'
              ? 'bg-resqnow-safe/10 text-resqnow-safe'
              : 'bg-resqnow-violet/10 text-resqnow-violet'
          }`}>
            {phase === 'success' ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Loader2 className="w-6 h-6 animate-spin" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold text-resqnow-primary">
              {phase === 'success' ? 'SOS received' : instruction}
            </p>
            <p className="text-[10px] text-resqnow-muted mt-1 leading-relaxed">
              {phase === 'locating'
                ? 'GPS is best-effort. ResQNow will continue even if location permission is denied or times out.'
                : phase === 'sending'
                ? 'Do not close this screen while the request is being confirmed.'
                : 'Loading your Active Rescue card...'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (phase === 'location') {
    return (
      <SosLocationConfirm
        mode={locationMode}
        gpsLocation={gpsLocation}
        manualLocation={manualLocation}
        locationOutcome={locationOutcome}
        manualText={manualLocationText}
        error={locationError}
        onModeChange={(nextMode) => {
          setLocationMode(nextMode);
          setLocationError('');
        }}
        onManualTextChange={(value) => {
          setManualLocationText(value);
          setLocationError('');
        }}
        onManualMapChange={handleManualMapChange}
        onRetryGps={captureSosLocation}
        onSendGps={sendGpsLocation}
        onSendManual={sendManualLocation}
        onUseSavedAddress={sendRegisteredAddressFallback}
        onBack={() => {
          setLocationError('');
          setPhase('reason');
        }}
      />
    );
  }

  return (
    <section className="rounded-3xl bg-white border-2 border-resqnow-critical/20 p-4 shadow-[0_12px_32px_rgba(217,45,32,0.10)]">
      <div className="flex items-start gap-3 mb-3.5">
        <div className="w-11 h-11 rounded-2xl bg-resqnow-critical/10 text-resqnow-critical flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-resqnow-critical">
            Emergency SOS
          </p>
          <p className="text-[14px] font-extrabold text-resqnow-primary mt-0.5">
            Need immediate rescue?
          </p>
          <p className="text-[10px] text-resqnow-muted mt-1 leading-relaxed">
            {instruction}. Swipe fully, then tap one quick reason. ResQNow will immediately try to send your identity and the fastest available location.
          </p>
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative h-[64px] rounded-[20px] bg-resqnow-violet overflow-hidden select-none touch-none"
        aria-label="Swipe to trigger emergency SOS"
      >
        <div
          className="absolute inset-y-0 left-0 bg-resqnow-critical transition-[width] duration-75"
          style={{ width: `${Math.max(64, dragX + 64)}px` }}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-16">
          <span className="text-white text-[13px] font-extrabold tracking-[0.02em] drop-shadow-sm">
            Swipe to SOS
          </span>
          <ChevronRight className="w-4 h-4 text-white ml-1" />
        </div>

        <button
          type="button"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(swipePercent * 100)}
          aria-label="Swipe SOS control"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          className="absolute top-1 left-1 w-[56px] h-[56px] rounded-[17px] bg-white text-resqnow-critical flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          style={{ transform: `translateX(${dragX}px)` }}
        >
          <ShieldAlert className="w-6 h-6" strokeWidth={2.5} />
        </button>
      </div>

      <button
        type="button"
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerCancel={cancelHold}
        onPointerLeave={cancelHold}
        onKeyDown={handleHoldKeyDown}
        onKeyUp={handleHoldKeyUp}
        className="relative mt-3 w-full min-h-[46px] rounded-xl border border-resqnow-border-soft bg-resqnow-canvas overflow-hidden text-[10px] font-extrabold text-resqnow-primary active:scale-[0.995] transition-transform"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-resqnow-critical/12"
          style={{ width: `${holdProgress * 100}%` }}
        />
        <span className="relative z-10">
          Unable to swipe? Press & hold SOS for 2 seconds
        </span>
      </button>

      <p className="mt-2.5 text-[9px] text-resqnow-muted text-center leading-relaxed">
        SOS is for immediate danger. Use the red Report button below for structured emergency or community reports.
      </p>
    </section>
  );
}
