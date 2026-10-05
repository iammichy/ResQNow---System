import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BadgeCheck,
  BriefcaseMedical,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Loader2,
  MapPin,
  Navigation,
  Radio,
  RefreshCw,
  ShieldCheck,
  Siren,
  Truck,
  Users,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import {
  acknowledgeAssignment,
  getAssignedReports,
  getResponderOperations,
  performResponderAction,
  updateResponderDutyStatus,
} from '../../services/responderService';
import ResponderAssignedMap from './ResponderAssignedMap';
import ResponderOverviewMap from './ResponderOverviewMap';
import {
  directionsInfo,
  formatClock,
  getPrimaryAction,
  isOpenReport,
  sortOperationalReports,
} from './responderViewUtils';

const actionPresentation = {
  acknowledge: {
    label: 'Acknowledge Mission',
    className: 'bg-resqnow-violet text-white',
  },
  start: {
    label: 'Start Response',
    className: 'bg-resqnow-violet text-white',
  },
  'en-route': {
    label: 'Mark En Route',
    className: 'bg-resqnow-pending text-white',
  },
  arrived: {
    label: 'On Scene',
    className: 'bg-resqnow-indigo text-white',
  },
  'field-outcome': {
    label: 'Submit Field Outcome',
    className: 'bg-resqnow-safe text-white',
  },
};

export default function ResponderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [operations, setOperations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dutySaving, setDutySaving] = useState(false);
  const [actionSaving, setActionSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [outcomeSummary, setResolveSummary] = useState('');

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) {
      setIsLoading(true);
    }

    setError('');

    let firstError = null;

    const reportsRequest =
      getAssignedReports()
        .then((assignedReports) => {
          setReports(assignedReports);
        })
        .catch((requestError) => {
          firstError ??= requestError;
        });

    const operationsRequest =
      getResponderOperations()
        .then((operationalState) => {
          // This can render the operational dashboard immediately
          // even if the assigned-report request is still finishing.
          setOperations(operationalState);
        })
        .catch((requestError) => {
          firstError ??= requestError;
        });

    await Promise.allSettled([
      reportsRequest,
      operationsRequest,
    ]);

    if (firstError) {
      setError(
        firstError?.message ||
          'Unable to load responder operations.'
      );
    } else {
      setLastUpdated(new Date());
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openReports = useMemo(
    () => reports.filter(isOpenReport),
    [reports]
  );

  const activeMission = useMemo(
    () => sortOperationalReports(openReports, user?.id)[0] || null,
    [openReports, user?.id]
  );

  const nextAction = getPrimaryAction(activeMission);
  const directions = activeMission ? directionsInfo(activeMission) : null;
  const affected = activeMission?.responderIntel?.affectedIndividuals || activeMission?.affectedIndividuals || [];
  const householdFlags = activeMission?.responderIntel?.householdFlags || [];

  async function toggleDuty() {
    if (!operations || dutySaving) return;

    setDutySaving(true);
    setError('');

    try {
      const updated = await updateResponderDutyStatus(!operations.isOnDuty);
      setOperations((current) => ({ ...current, ...updated }));
    } catch (requestError) {
      setError(requestError?.message || 'Unable to update duty status.');
    } finally {
      setDutySaving(false);
    }
  }

  async function performPrimaryAction() {
    if (!activeMission || !nextAction || actionSaving) return;

    if (nextAction.value === 'field-outcome' && !outcomeSummary.trim()) {
      setActionError('Add a short field outcome before submitting this mission update.');
      return;
    }

    setActionSaving(true);
    setActionError('');

    try {
      const updated =
        nextAction.value === 'acknowledge'
          ? await acknowledgeAssignment(activeMission.id, activeMission.version)
          : await performResponderAction(activeMission.id, {
              action: nextAction.value,
              remarks: nextAction.value === 'field-outcome' ? outcomeSummary.trim() : null,
              expectedVersion: activeMission.version,
            });

      setReports((current) =>
        current.map((report) => (report.id === updated.id ? updated : report))
      );
      setResolveSummary('');
      setLastUpdated(new Date());
      const refreshedOperations = await getResponderOperations();
      setOperations(refreshedOperations);
    } catch (requestError) {
      setActionError(
        requestError?.status === 409
          ? 'Mission state changed. Refresh before trying again.'
          : requestError?.message || 'Unable to save mission status.'
      );
    } finally {
      setActionSaving(false);
    }
  }

  return (
    <div className="px-4 pt-1 pb-28 min-h-screen space-y-4">
      {error && (
        <div role="alert" className="rounded-2xl border border-resqnow-critical/20 bg-resqnow-critical/8 p-3 text-[11px] text-resqnow-crimson">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {isLoading && !operations ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-resqnow-border-soft bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-resqnow-violet" />

              <div>
                <p className="text-sm font-bold text-resqnow-ink">
                  Preparing responder workspace
                </p>

                <p className="mt-1 text-[11px] text-resqnow-muted">
                  Syncing your duty status and assigned incidents...
                </p>
              </div>
            </div>
          </div>

          <div className="h-[220px] rounded-2xl border border-resqnow-border-soft bg-white animate-pulse" />

          <div className="h-[120px] rounded-2xl border border-resqnow-border-soft bg-white animate-pulse" />
        </div>
      ) : (
        <>
          {activeMission ? (
            <MissionLocationCard report={activeMission} directions={directions} />
          ) : (
            <ResponderOverviewMap awareness={operations?.awareness} />
          )}

          <section className={`flex items-center justify-between gap-3 ${activeMission ? 'px-0.5' : ''}`}>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[.14em] text-resqnow-violet">
                Field operations
              </p>
              <h1 className={`${activeMission ? 'mt-0.5 text-[15px]' : 'mt-1 text-[18px]'} font-extrabold text-resqnow-primary`}>
                {user?.fullName || 'Responder'}
              </h1>
              {!activeMission && (
                <p className="mt-1 text-[10px] text-resqnow-placeholder">
                  {lastUpdated ? `Last synchronized ${formatClock(lastUpdated)}` : 'Synchronizing responder stateâ€¦'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeMission && lastUpdated && (
                <span className="hidden text-[9px] text-resqnow-placeholder sm:inline">
                  Synced {formatClock(lastUpdated)}
                </span>
              )}
              <button
                type="button"
                onClick={() => load()}
                disabled={isLoading}
                aria-label="Refresh operations"
                className={`${activeMission ? 'w-9 h-9' : 'w-10 h-10'} rounded-xl border border-resqnow-border-soft bg-white text-resqnow-violet flex items-center justify-center shadow-sm disabled:opacity-50`}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </section>

          <DutyStatusCard
            operations={operations}
            saving={dutySaving}
            onToggle={toggleDuty}
            compact={Boolean(activeMission)}
          />

          {activeMission ? (
            <ActiveMission
              report={activeMission}
              directions={directions}
              affected={affected}
              householdFlags={householdFlags}
              nextAction={nextAction}
              actionSaving={actionSaving}
              actionError={actionError}
              outcomeSummary={outcomeSummary}
              setResolveSummary={setResolveSummary}
              onAction={performPrimaryAction}
              onOpen={() => navigate(`/responder/missions/${activeMission.id}`)}
            />
          ) : (
            <IdleOperations
              operations={operations}
              onMissions={() => navigate('/responder/missions')}
              onContacts={() => navigate('/responder/contacts')}
            />
          )}
        </>
      )}
    </div>
  );
}

function MissionLocationCard({ report, directions }) {
  const accuracy = Number(report?.locationAccuracy);
  const accuracyLabel = Number.isFinite(accuracy) && accuracy > 0 ? ` Â· approx. Â±${Math.round(accuracy)} m` : '';

  return (
    <section className="rounded-2xl border border-resqnow-critical/20 bg-white p-3.5 shadow-[0_8px_24px_rgba(217,45,32,.08)]">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[.14em] text-resqnow-critical">Assigned reporter location</p>
          <h2 className="mt-0.5 text-[14px] font-extrabold text-resqnow-primary">{report.id} Â· Incident map</h2>
          <p className="mt-0.5 text-[9px] leading-relaxed text-resqnow-muted">{`Submitted GPS/report location${accuracyLabel} Â· not live resident tracking Â· Navigate opens device routing`}</p>
        </div>
        <MapPin className="h-5 w-5 shrink-0 text-resqnow-critical" />
      </div>

      <ResponderAssignedMap
        reports={[report]}
        heightClass="h-[190px]"
        showLegend={false}
        ariaLabel={`Reporter location for ${report.id}`}
      />

      <div className="mt-2 flex items-center gap-2 rounded-xl bg-resqnow-canvas p-3">
        <MapPin className="h-4 w-4 shrink-0 text-resqnow-critical" />
        <p className="min-w-0 flex-1 text-[10px] font-semibold leading-relaxed text-resqnow-secondary">
          {report.location || 'Location unavailable'}{report.landmark ? ` Â· ${report.landmark}` : ''}
        </p>
        {directions?.href && (
          <a
            href={directions.href}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-lg bg-resqnow-violet px-2.5 py-2 text-[9px] font-extrabold text-white"
          >
            Navigate
          </a>
        )}
      </div>
    </section>
  );
}

function DutyStatusCard({ operations, saving, onToggle, compact = false }) {
  const onDuty = Boolean(operations?.isOnDuty);
  const role = operations?.responderRole || 'Emergency Responder';
  const asset = operations?.currentAsset || operations?.teamName || 'Not assigned';

  if (compact) {
    return (
      <section className={`rounded-xl border bg-white px-3 py-2.5 shadow-sm ${onDuty ? 'border-resqnow-safe/30' : 'border-resqnow-border-soft'}`}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${onDuty ? 'bg-resqnow-safe' : 'bg-resqnow-border'}`} />
              <p className={`text-[11px] font-extrabold ${onDuty ? 'text-resqnow-safe' : 'text-resqnow-muted'}`}>
                {onDuty ? 'ON DUTY' : 'OFF DUTY'}
              </p>
              <span className="text-[9px] text-resqnow-placeholder">â€¢</span>
              <p className="truncate text-[9px] font-semibold text-resqnow-secondary">{role}</p>
            </div>
            <p className="mt-0.5 truncate text-[9px] text-resqnow-muted">Asset / team: {asset}</p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={onDuty}
            aria-label={onDuty ? 'Go off duty' : 'Go on duty'}
            onClick={onToggle}
            disabled={saving}
            className={`relative h-8 w-14 shrink-0 rounded-full border transition-colors ${
              onDuty ? 'border-resqnow-safe bg-resqnow-safe' : 'border-resqnow-border bg-white'
            } disabled:opacity-60`}
          >
            <span className={`absolute top-1 h-6 w-6 rounded-full shadow-sm transition-all ${onDuty ? 'left-7 bg-white' : 'left-1 bg-resqnow-border'}`} />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={`rounded-2xl border bg-white p-4 shadow-sm ${onDuty ? 'border-resqnow-safe/30' : 'border-resqnow-border-soft'}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${onDuty ? 'bg-resqnow-safe' : 'bg-resqnow-border'}`} />
            <p className={`text-[12px] font-extrabold ${onDuty ? 'text-resqnow-safe' : 'text-resqnow-muted'}`}>
              {onDuty ? 'ON DUTY' : 'OFF DUTY'}
            </p>
          </div>
          <p className="mt-1 text-[10px] text-resqnow-muted">
            {onDuty ? 'Available for dispatcher assignment.' : 'Not available for new dispatcher assignments.'}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={onDuty}
          onClick={onToggle}
          disabled={saving}
          className={`relative h-9 w-16 shrink-0 rounded-full border transition-colors ${
            onDuty
              ? 'border-resqnow-safe bg-resqnow-safe'
              : 'border-resqnow-border bg-white'
          } disabled:opacity-60`}
        >
          <span className={`absolute top-1 h-7 w-7 rounded-full shadow-sm transition-all ${onDuty ? 'left-8 bg-white' : 'left-1 bg-resqnow-border'}`} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <OperationalIdentity
          icon={ShieldCheck}
          label="Role"
          value={role}
        />
        <OperationalIdentity
          icon={Truck}
          label="Asset / Team"
          value={asset}
        />
      </div>
    </section>
  );
}

function ActiveMission({
  report,
  directions,
  affected,
  householdFlags,
  nextAction,
  actionSaving,
  actionError,
  outcomeSummary,
  setResolveSummary,
  onAction,
  onOpen,
}) {
  const presentation = nextAction ? actionPresentation[nextAction.value] : null;

  return (
    <section className="overflow-hidden rounded-2xl border border-resqnow-critical/25 bg-white shadow-[0_10px_26px_rgba(217,45,32,.10)]">
      <div className="h-1.5 bg-resqnow-critical" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-resqnow-critical">
              Active mission
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-extrabold text-resqnow-primary">{report.id}</span>
              <span className="rounded-full bg-resqnow-critical/10 px-2 py-1 text-[9px] font-extrabold text-resqnow-critical">
                {report.priority} priority
              </span>
              <span className="rounded-full bg-resqnow-violet/10 px-2 py-1 text-[9px] font-bold text-resqnow-violet">
                {report.status}
              </span>
            </div>
          </div>
          <Siren className="h-6 w-6 shrink-0 text-resqnow-critical" />
        </div>

        <h2 className="mt-3 text-[18px] font-extrabold leading-tight text-resqnow-primary">
          {report.concernType}
        </h2>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-resqnow-canvas p-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-resqnow-critical" />
          <div>
            <p className="text-[11px] font-bold text-resqnow-primary">
              {report.location || 'Location unavailable'}
            </p>
            {report.landmark && <p className="mt-0.5 text-[10px] text-resqnow-muted">Landmark: {report.landmark}</p>}
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <IntelBlock title="Incident flags" icon={BadgeCheck} values={affected} />
          <IntelBlock title="Household profile" icon={Users} values={householdFlags} />
        </div>

        <a
          href={directions.href}
          target="_blank"
          rel="noreferrer"
          className="mt-3 min-h-[52px] w-full rounded-xl border border-resqnow-violet/20 bg-resqnow-violet/8 px-4 text-[12px] font-extrabold text-resqnow-violet flex items-center justify-center gap-2 active:scale-[.99]"
        >
          <Navigation className="h-4 w-4" />
          Navigate to Target
        </a>

        {nextAction?.value === 'field-outcome' && (
          <label className="mt-3 block">
            <span className="text-[10px] font-bold text-resqnow-secondary">Field outcome summary *</span>
            <textarea
              value={outcomeSummary}
              onChange={(event) => setResolveSummary(event.target.value.slice(0, 2000))}
              rows={3}
              placeholder="Summarize what was found and the assistance provided."
              className="mt-1.5 w-full resize-none rounded-xl border border-resqnow-border bg-resqnow-canvas px-3 py-3 text-[12px] outline-none focus:border-resqnow-safe/50 focus:ring-2 focus:ring-resqnow-safe/10"
            />
          </label>
        )}

        {actionError && (
          <p className="mt-2 rounded-xl border border-resqnow-critical/20 bg-resqnow-critical/8 p-2.5 text-[10px] font-semibold text-resqnow-crimson">
            {actionError}
          </p>
        )}

        {presentation ? (
          <button
            type="button"
            onClick={onAction}
            disabled={actionSaving}
            className={`mt-3 min-h-[56px] w-full rounded-xl px-4 text-[13px] font-extrabold shadow-sm active:scale-[.99] disabled:opacity-60 ${presentation.className}`}
          >
            {actionSaving ? (
              <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Savingâ€¦</span>
            ) : (
              presentation.label
            )}
          </button>
        ) : (
          <div className="mt-3 rounded-xl border border-resqnow-safe/20 bg-resqnow-safe/8 p-3 text-[11px] font-semibold text-resqnow-safe">
            No further lifecycle action is currently available.
          </div>
        )}

        <button
          type="button"
          onClick={onOpen}
          className="mt-2 min-h-[44px] w-full rounded-xl border border-resqnow-border-soft bg-white text-[11px] font-bold text-resqnow-secondary"
        >
          Open Full Mission Record
        </button>
      </div>
    </section>
  );
}

function IdleOperations({ operations, onMissions, onContacts }) {
  const awareness = operations?.awareness || {};

  return (
    <>
      <section className="rounded-2xl border border-resqnow-safe/20 bg-white p-5 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-9 w-9 text-resqnow-safe" />
        <p className="mt-3 text-[15px] font-extrabold text-resqnow-primary">No active mission</p>
        <p className="mt-1 text-[11px] leading-relaxed text-resqnow-muted">
          Assigned incidents will take over this screen automatically after the app refreshes.
        </p>
      </section>

      <section className="rounded-2xl border border-resqnow-border-soft bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-resqnow-violet" />
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[.14em] text-resqnow-violet">Situational awareness</p>
            <h2 className="text-[14px] font-bold text-resqnow-primary">Barangay operational load</h2>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <AwarenessMetric
            icon={Siren}
            value={awareness.activeEmergencyCount ?? 0}
            label="Active emergencies"
          />
          <AwarenessMetric
            icon={CircleDot}
            value={awareness.unassignedEmergencyCount ?? 0}
            label="Awaiting assignment"
          />
        </div>

        <p className="mt-3 text-[9px] leading-relaxed text-resqnow-placeholder">
          Exact unassigned incident locations are restricted. Field responders receive victim and location details only after dispatcher assignment.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onMissions}
          className="min-h-[50px] rounded-xl bg-resqnow-violet px-3 text-[11px] font-bold text-white flex items-center justify-center gap-2"
        >
          <BriefcaseMedical className="h-4 w-4" /> Missions
        </button>
        <button
          type="button"
          onClick={onContacts}
          className="min-h-[50px] rounded-xl border border-resqnow-violet/20 bg-white px-3 text-[11px] font-bold text-resqnow-violet flex items-center justify-center gap-2"
        >
          Operational Contacts <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}

function OperationalIdentity({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-resqnow-canvas p-3">
      <Icon className="h-4 w-4 text-resqnow-violet" />
      <p className="mt-2 text-[9px] font-extrabold uppercase tracking-wide text-resqnow-placeholder">{label}</p>
      <p className="mt-1 text-[11px] font-bold text-resqnow-primary">{value}</p>
    </div>
  );
}

function IntelBlock({ title, icon: Icon, values }) {
  const list = Array.isArray(values) ? values.filter(Boolean) : [];

  return (
    <div className="rounded-xl border border-resqnow-border-soft bg-white p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-resqnow-violet" />
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-resqnow-secondary">{title}</p>
      </div>
      {list.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {list.map((item) => (
            <span key={String(item)} className="rounded-full bg-resqnow-caution/15 px-2 py-1 text-[9px] font-bold text-resqnow-caution">
              {String(item)}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[10px] text-resqnow-muted">No flags recorded.</p>
      )}
    </div>
  );
}

function AwarenessMetric({ icon: Icon, value, label }) {
  return (
    <div className="rounded-xl bg-resqnow-canvas p-3">
      <Icon className="h-4 w-4 text-resqnow-violet" />
      <p className="mt-2 text-[20px] font-extrabold text-resqnow-primary">{value}</p>
      <p className="text-[9px] font-semibold text-resqnow-muted">{label}</p>
    </div>
  );
}
