import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronRight,
  FileText,
  MapPin,
  Maximize2,
  RefreshCw,
  Search,
  Siren,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { getAssignedReports } from '../../services/responderService';
import { getPriorityStyle, getStatusStyle } from '../../utils/statusUtils';
import ResponderAssignedMap from './ResponderAssignedMap';
import {
  formatClock,
  isOpenReport,
  sortOperationalReports,
  validCoordinates,
} from './responderViewUtils';

const storageKey = 'resqnow_responder_track_state';

const typeFilters = [
  { id: 'all', label: 'All types' },
  { id: 'Emergency', label: 'Emergency' },
  { id: 'Non-Emergency', label: 'Non-Emergency' },
];

const priorityFilters = [
  { id: 'all', label: 'All priorities' },
  { id: 'High', label: 'High' },
  { id: 'Medium', label: 'Medium' },
  { id: 'Low', label: 'Low' },
];

function readSavedState() {
  try {
    const raw = sessionStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function ResponderTrack() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const restored = useRef(false);

  const saved = readSavedState();

  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState(saved?.search || '');
  const [typeFilter, setTypeFilter] = useState(saved?.typeFilter || 'all');
  const [priorityFilter, setPriorityFilter] = useState(saved?.priorityFilter || 'all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadReports = useCallback(async () => {
    setError('');
    if (!hasLoaded) setIsLoading(true);

    try {
      const data = await getAssignedReports();
      setReports(data);
      setLastUpdated(new Date());
      setHasLoaded(true);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load assigned reports.');
    } finally {
      setIsLoading(false);
    }
  }, [hasLoaded]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    if (!hasLoaded || restored.current) return;
    restored.current = true;
    const scrollY = Number(saved?.scrollY || 0);
    requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: 'auto' }));
  }, [hasLoaded, saved?.scrollY]);

  const openReports = useMemo(
    () => sortOperationalReports(reports.filter(isOpenReport), user?.id),
    [reports, user?.id]
  );

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return openReports.filter((report) => {
      const matchesType =
        typeFilter === 'all' || report.reportType === typeFilter;
      const matchesPriority =
        priorityFilter === 'all' || report.priority === priorityFilter;
      const matchesSearch =
        !query ||
        report.id?.toLowerCase().includes(query) ||
        report.concernType?.toLowerCase().includes(query) ||
        report.location?.toLowerCase().includes(query) ||
        report.landmark?.toLowerCase().includes(query) ||
        report.status?.toLowerCase().includes(query);

      return matchesType && matchesPriority && matchesSearch;
    });
  }, [openReports, search, typeFilter, priorityFilter]);

  const mappedCount = useMemo(
    () => filteredReports.filter((report) => validCoordinates(report)).length,
    [filteredReports]
  );

  function persistState() {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        search,
        typeFilter,
        priorityFilter,
        scrollY: window.scrollY,
      })
    );
  }

  function openIncident(report) {
    persistState();
    navigate(`/responder/incidents/${report.id}`, {
      state: {
        returnTo: `${location.pathname}${location.search}`,
      },
    });
  }

  function openFullMap() {
    persistState();
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (priorityFilter !== 'all') params.set('priority', priorityFilter);

    navigate(`/responder/incidents/map${params.toString() ? `?${params}` : ''}`, {
      state: {
        returnTo: `${location.pathname}${location.search}`,
      },
    });
  }

  const initialFailure = !hasLoaded && error;

  return (
    <div className="px-4 pt-4 pb-28 min-h-screen">
      <section className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[.14em] text-resqnow-violet">
            Assigned reports
          </p>
          <h1 className="mt-1 text-[21px] font-extrabold text-resqnow-primary">
            Track
          </h1>
          <p className="mt-1 text-[11px] text-resqnow-muted">
            {hasLoaded
              ? `${filteredReports.length} shown · ${mappedCount} with map locations`
              : 'Loading your assigned incident locations…'}
          </p>
          {lastUpdated && (
            <p className="mt-1 text-[9px] text-resqnow-placeholder">
              Last updated {formatClock(lastUpdated)}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={loadReports}
          disabled={isLoading}
          aria-label="Refresh assigned reports"
          className="w-11 h-11 rounded-xl border border-resqnow-border-soft bg-white text-resqnow-violet flex items-center justify-center shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </section>

      {error && (
        <div
          role="status"
          className="mb-4 flex items-start gap-3 rounded-2xl border border-resqnow-critical/20 bg-resqnow-critical/8 p-3 text-[11px] text-resqnow-crimson"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-bold">
              {hasLoaded ? 'Unable to refresh Track' : 'Unable to load Track'}
            </p>
            <p className="mt-1">{error}</p>
            {hasLoaded && (
              <p className="mt-1 text-resqnow-muted">
                Showing previously loaded assignments
                {lastUpdated ? ` from ${formatClock(lastUpdated)}` : ''}.
              </p>
            )}
            {initialFailure && (
              <button
                type="button"
                onClick={loadReports}
                className="mt-2 min-h-[40px] rounded-xl border border-resqnow-critical/20 bg-white px-3 text-[11px] font-bold text-resqnow-crimson"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {!initialFailure && (
        <>
          <section className="mb-4 rounded-2xl border border-resqnow-border-soft bg-white p-3 shadow-[0_4px_16px_rgba(31,29,71,.04)]">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.12em] text-resqnow-placeholder">
                  Location overview
                </p>
                <h2 className="mt-1 text-[14px] font-bold text-resqnow-primary">
                  Assigned map
                </h2>
              </div>

              <button
                type="button"
                onClick={openFullMap}
                disabled={!mappedCount}
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl px-3 text-[10px] font-bold text-resqnow-violet disabled:text-resqnow-placeholder"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Open map
              </button>
            </div>

            {isLoading && !hasLoaded ? (
              <div className="h-[250px] animate-pulse rounded-2xl bg-resqnow-canvas" />
            ) : (
              <ResponderAssignedMap
                reports={filteredReports}
                onSelect={openIncident}
                heightClass="h-[250px]"
              />
            )}

            <p className="mt-2 px-1 text-[9px] leading-relaxed text-resqnow-placeholder">
              Map pins use submitted incident coordinates. Reports without coordinates stay in the list below.
            </p>
          </section>

          <section className="mb-4 space-y-3">
            <div className="relative">
              <label htmlFor="responder-track-search" className="sr-only">
                Search assigned reports
              </label>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-resqnow-placeholder" />
              <input
                id="responder-track-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search report, concern, location…"
                className="w-full bg-resqnow-canvas border border-resqnow-border rounded-xl pl-10 pr-4 py-3.5 text-[13px] text-resqnow-primary outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10 transition-all"
              />
            </div>

            <FilterRow
              label="Type"
              options={typeFilters}
              value={typeFilter}
              onChange={setTypeFilter}
            />

            <FilterRow
              label="Priority"
              options={priorityFilters}
              value={priorityFilter}
              onChange={setPriorityFilter}
            />
          </section>

          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.12em] text-resqnow-placeholder">
                  Active assignments
                </p>
                <h2 className="mt-1 text-[15px] font-bold text-resqnow-primary">
                  Assigned reports
                </h2>
              </div>
              <p className="text-[10px] font-semibold text-resqnow-muted">
                {filteredReports.length} result{filteredReports.length === 1 ? '' : 's'}
              </p>
            </div>

            {isLoading && !hasLoaded ? (
              <div className="space-y-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-40 animate-pulse rounded-2xl border border-resqnow-border-soft bg-white" />
                ))}
              </div>
            ) : filteredReports.length ? (
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <TrackReportCard
                    key={report.id}
                    report={report}
                    onOpen={() => openIncident(report)}
                  />
                ))}
              </div>
            ) : hasLoaded ? (
              <div className="rounded-2xl border border-resqnow-border-soft bg-white px-5 py-10 text-center">
                <MapPin className="mx-auto h-7 w-7 text-resqnow-placeholder" />
                <p className="mt-3 text-[13px] font-bold text-resqnow-primary">
                  {openReports.length ? 'No matching assigned reports' : 'No active assignments'}
                </p>
                <p className="mt-1 text-[11px] text-resqnow-muted">
                  {openReports.length
                    ? 'Try another search or filter.'
                    : 'New incidents assigned to your account will appear here.'}
                </p>
              </div>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}

function FilterRow({ label, options, value, onChange }) {
  return (
    <div>
      <p className="mb-1.5 px-1 text-[9px] font-bold uppercase tracking-wide text-resqnow-placeholder">
        {label}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.id)}
              className={`shrink-0 min-h-[42px] rounded-full border px-4 text-[10px] font-semibold transition-all active:scale-95 ${
                selected
                  ? 'border-resqnow-violet bg-resqnow-violet text-white'
                  : 'border-resqnow-border-soft bg-white text-resqnow-muted hover:text-resqnow-violet'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TrackReportCard({ report, onOpen }) {
  const isEmergency = report.reportType === 'Emergency';

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-resqnow-border-soft bg-white p-4 text-left shadow-[0_4px_14px_rgba(31,29,71,.04)] hover:border-resqnow-violet/25 active:scale-[0.99] transition-all"
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            isEmergency
              ? 'bg-resqnow-critical/10 text-resqnow-critical'
              : 'bg-resqnow-violet/10 text-resqnow-violet'
          }`}
        >
          {isEmergency ? <Siren className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-resqnow-primary">{report.id}</span>
            <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${getStatusStyle(report.status)}`}>
              {report.status}
            </span>
            <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${getPriorityStyle(report.priority)}`}>
              {report.priority}
            </span>
          </div>
          <p className="mt-1 text-[14px] font-semibold text-resqnow-primary">
            {report.concernType}
          </p>
        </div>

        <ChevronRight className="w-4 h-4 text-resqnow-placeholder shrink-0 mt-3" />
      </div>

      <div className="mt-3 flex items-start gap-2 text-[11px] text-resqnow-muted">
        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          {report.location || 'Location unavailable'}
          {report.landmark ? ` · ${report.landmark}` : ''}
        </span>
      </div>

      {report.latestUpdate && (
        <div className="mt-3 bg-resqnow-canvas rounded-xl px-3 py-2.5">
          <p className="text-[9px] font-bold text-resqnow-muted uppercase tracking-wide">
            Latest update
          </p>
          <p className="mt-1 text-[11px] text-resqnow-secondary leading-relaxed line-clamp-2">
            {report.latestUpdate}
          </p>
        </div>
      )}
    </button>
  );
}
