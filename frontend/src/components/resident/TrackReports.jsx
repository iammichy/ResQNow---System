// src/components/resident/TrackReports.jsx

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  Search,
  Siren,
  FileText,
  MapPin,
  Clock,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle2,
  Activity,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import {
  getReports,
} from '../../services/reportService';

import {
  getStatusStyle,
  getPriorityStyle,
} from '../../utils/statusUtils';

// ============ FILTER OPTIONS ============
const filters = [
  {
    id: 'all',
    label: 'All',
  },
  {
    id: 'Emergency',
    label: 'Emergency',
  },
  {
    id: 'Non-Emergency',
    label: 'Non-Emergency',
  },
];

// ============ TRACK REPORTS ============
export default function TrackReports() {
  const navigate =
    useNavigate();

  // Real reports from Laravel
  const [
    reports,
    setReports,
  ] = useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState('');

  // Search and filters
  const [
    filter,
    setFilter,
  ] = useState('all');

  const [
    search,
    setSearch,
  ] = useState('');

  // ============ LOAD REPORTS ============
  const loadReports =
    async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const residentReports =
          await getReports();

        setReports(
          residentReports
        );
      } catch (error) {
        setReports([]);

        setLoadError(
          error.message ||
            'Unable to load your reports.'
        );
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    loadReports();
  }, []);

  // ============ COUNTS ============
  const emergencyCount =
    reports.filter(
      (report) =>
        report.reportType ===
        'Emergency'
    ).length;

  const nonEmergencyCount =
    reports.filter(
      (report) =>
        report.reportType ===
        'Non-Emergency'
    ).length;

  const activeCount =
    reports.filter(
      (report) =>
        ![
          'Resolved',
          'Invalid',
        ].includes(
          report.status
        )
    ).length;

  const resolvedCount =
    reports.filter(
      (report) =>
        report.status ===
        'Resolved'
    ).length;

  // ============ FILTER + SEARCH ============
  const filteredReports =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return reports.filter(
        (report) => {
          const matchesFilter =
            filter === 'all' ||
            report.reportType ===
              filter;

          const matchesSearch =
            !query ||
            report.id
              ?.toLowerCase()
              .includes(query) ||
            report.concernType
              ?.toLowerCase()
              .includes(query) ||
            report.location
              ?.toLowerCase()
              .includes(query) ||
            report.status
              ?.toLowerCase()
              .includes(query);

          return (
            matchesFilter &&
            matchesSearch
          );
        }
      );
    }, [
      reports,
      filter,
      search,
    ]);

  // ============ LOADING ============
  if (isLoading) {
    return (
      <div className="px-4 pt-5 pb-28 min-h-screen">

        <div className="mb-5">

          <h1 className="text-xl font-bold text-resqnow-primary">
            Track Reports
          </h1>

          <p className="text-xs text-resqnow-muted mt-1">
            Monitor the progress and status of your submitted reports.
          </p>
        </div>

        <div className="bg-white border border-resqnow-border-soft rounded-2xl py-14 px-6 text-center">

          <Loader2 className="w-7 h-7 text-resqnow-violet animate-spin mx-auto" />

          <p className="text-[12px] text-resqnow-muted mt-3">
            Loading your reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-28 min-h-screen">

      {/* ============ PAGE HEADER ============ */}
      <div className="mb-5">

        <h1 className="text-xl font-bold text-resqnow-primary">
          Track Reports
        </h1>

        <p className="text-xs text-resqnow-muted mt-1">
          Monitor the progress and status of your submitted reports.
        </p>
      </div>

      {/* ============ ERROR ============ */}
      {loadError && (
        <div className="mb-4 bg-resqnow-critical/10 border border-resqnow-critical/20 rounded-xl p-3">

          <div className="flex items-start gap-2">

            <AlertCircle className="w-4 h-4 text-resqnow-critical mt-0.5 shrink-0" />

            <div className="flex-1">

              <p className="text-[11px] text-resqnow-crimson">
                {loadError}
              </p>

              <button
                type="button"
                onClick={
                  loadReports
                }
                className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-resqnow-violet"
              >
                <RefreshCw className="w-3 h-3" />

                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ SUMMARY ============ */}
      <div className="grid grid-cols-2 gap-2 mb-5">

        {/* Active */}
        <div className="bg-white border border-resqnow-violet/20 rounded-2xl p-3 flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-resqnow-violet/10 flex items-center justify-center shrink-0">

            <Activity className="w-[18px] h-[18px] text-resqnow-violet" />
          </div>

          <div>

            <p className="text-lg font-bold text-resqnow-primary">
              {activeCount}
            </p>

            <p className="text-[10px] text-resqnow-muted">
              Active Reports
            </p>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white border border-resqnow-safe/20 rounded-2xl p-3 flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-resqnow-safe/10 flex items-center justify-center shrink-0">

            <CheckCircle2 className="w-[18px] h-[18px] text-resqnow-safe" />
          </div>

          <div>

            <p className="text-lg font-bold text-resqnow-primary">
              {resolvedCount}
            </p>

            <p className="text-[10px] text-resqnow-muted">
              Resolved
            </p>
          </div>
        </div>
      </div>

      {/* ============ SEARCH ============ */}
      <div className="relative mb-3">

        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-resqnow-placeholder" />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="Search report ID, concern, location..."
          className="w-full bg-resqnow-canvas border border-resqnow-border rounded-xl pl-10 pr-4 py-3 text-[13px] text-resqnow-primary outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10 transition-all"
        />
      </div>

      {/* ============ FILTERS ============ */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">

        {filters.map(
          (item) => {
            const count =
              item.id === 'all'
                ? reports.length
                : item.id ===
                  'Emergency'
                ? emergencyCount
                : nonEmergencyCount;

            const selected =
              filter === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setFilter(
                    item.id
                  )
                }
                className={`shrink-0 min-h-[44px] px-4 py-2.5 rounded-full text-[11px] font-semibold border active:scale-95 transition-all ${
                  selected
                    ? 'bg-resqnow-violet text-white border-resqnow-violet shadow-[0_4px_12px_rgba(131,70,242,0.18)]'
                    : 'bg-white text-resqnow-muted border-resqnow-border-soft hover:border-resqnow-violet/30 hover:text-resqnow-violet'
                }`}
              >
                {item.label}

                <span
                  className={`ml-1.5 ${
                    selected
                      ? 'text-white/80'
                      : 'text-resqnow-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* ============ RESULT COUNT ============ */}
      <div className="flex items-center gap-2 px-1 mb-2">

        <SlidersHorizontal className="w-3.5 h-3.5 text-resqnow-muted" />

        <p className="text-[10px] text-resqnow-muted">
          {
            filteredReports.length
          }{' '}
          {filteredReports.length ===
          1
            ? 'report'
            : 'reports'}{' '}
          found
        </p>
      </div>

      {/* ============ REPORT LIST ============ */}
      {filteredReports.length >
      0 ? (
        <div className="space-y-3">

          {filteredReports.map(
            (report) => {
              const isEmergency =
                report.reportType ===
                'Emergency';

              return (
                <button
                  key={
                    report.id
                  }
                  type="button"
                  onClick={() =>
                    navigate(
                      `/track/${report.id}`
                    )
                  }
                  className="w-full bg-white border border-resqnow-border-soft rounded-2xl p-4 text-left hover:border-resqnow-border hover:shadow-[0_4px_14px_rgba(31,29,71,0.06)] active:scale-[0.99] transition-all"
                >

                  {/* Report heading */}
                  <div className="flex items-start gap-3">

                    {/* Icon */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isEmergency
                          ? 'bg-resqnow-critical/10 text-resqnow-critical'
                          : 'bg-resqnow-violet/10 text-resqnow-violet'
                      }`}
                    >
                      {isEmergency ? (
                        <Siren className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">

                      {/* ID + type */}
                      <div className="flex items-center gap-2 flex-wrap">

                        <span className="text-[10px] font-bold text-resqnow-muted">
                          {
                            report.id
                          }
                        </span>

                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isEmergency
                              ? 'bg-resqnow-critical/15 text-resqnow-critical'
                              : 'bg-resqnow-violet/15 text-resqnow-violet'
                          }`}
                        >
                          {
                            report.reportType
                          }
                        </span>
                      </div>

                      {/* Concern */}
                      <p className="text-[14px] font-semibold text-resqnow-primary mt-1">
                        {
                          report.concernType
                        }
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-resqnow-placeholder shrink-0 mt-3" />
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2 mt-3 text-[11px] text-resqnow-muted">

                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />

                    <span>
                      {
                        report.location
                      }
                    </span>
                  </div>

                  {/* Latest update */}
                  {report.latestUpdate && (
                    <div className="mt-3 bg-resqnow-canvas rounded-xl px-3 py-2.5">

                      <p className="text-[9px] font-bold text-resqnow-muted uppercase tracking-wide">
                        Latest Update
                      </p>

                      <p className="text-[11px] text-resqnow-secondary mt-1 leading-relaxed line-clamp-2">
                        {
                          report.latestUpdate
                        }
                      </p>
                    </div>
                  )}

                  {/* Status + Priority */}
                  <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-resqnow-border-soft">

                    <div className="flex items-center gap-2 flex-wrap">

                      <span
                        className={`text-[9px] font-bold px-2 py-1 rounded-full ${getStatusStyle(
                          report.status
                        )}`}
                      >
                        {
                          report.status
                        }
                      </span>

                      <span
                        className={`text-[9px] font-semibold px-2 py-1 rounded-full border ${getPriorityStyle(
                          report.priority
                        )}`}
                      >
                        {
                          report.priority
                        }
                      </span>
                    </div>

                    {/* Submitted time */}
                    <div className="flex items-center gap-1 text-[9px] text-resqnow-muted shrink-0">

                      <Clock className="w-3 h-3" />

                      {
                        report.submittedAt
                      }
                    </div>
                  </div>
                </button>
              );
            }
          )}
        </div>
      ) : (
        /* ============ EMPTY STATE ============ */
        <div className="bg-white border border-resqnow-border-soft rounded-2xl py-12 px-6 text-center">

          <div className="w-12 h-12 rounded-full bg-resqnow-canvas flex items-center justify-center mx-auto mb-3">

            <Search className="w-6 h-6 text-resqnow-placeholder" />
          </div>

          <p className="text-sm font-semibold text-resqnow-primary">
            {reports.length === 0
              ? 'No reports yet'
              : 'No reports found'}
          </p>

          <p className="text-[11px] text-resqnow-muted mt-1">
            {reports.length === 0
              ? 'Your submitted emergency and non-emergency reports will appear here.'
              : 'Try changing your search or report filter.'}
          </p>
        </div>
      )}
    </div>
  );
}