// src/components/resident/TrackReports.jsx
import { useMemo, useState } from 'react';
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
} from 'lucide-react';

import { mockAllReports } from '../../data/mockData';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'Emergency', label: 'Emergency' },
  { id: 'Non-Emergency', label: 'Non-Emergency' },
];

function getStatusStyle(status) {
  switch (status) {
    case 'Resolved':
      return 'bg-green-100 text-green-700';

    case 'In Progress':
    case 'Responded':
    case 'Responders En Route':
      return 'bg-orange-100 text-orange-700';

    case 'Pending Verification':
      return 'bg-blue-100 text-blue-700';

    case 'Verified':
      return 'bg-teal-100 text-teal-700';

    case 'Invalid':
      return 'bg-red-100 text-red-700';

    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function getPriorityStyle(priority) {
  switch (priority) {
    case 'High':
      return 'bg-red-50 text-red-600 border-red-100';

    case 'Medium':
      return 'bg-amber-50 text-amber-600 border-amber-100';

    case 'Low':
      return 'bg-slate-50 text-slate-500 border-slate-200';

    default:
      return 'bg-slate-50 text-slate-500 border-slate-200';
  }
}

export default function TrackReports() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const emergencyCount = mockAllReports.filter(
    (report) => report.reportType === 'Emergency'
  ).length;

  const nonEmergencyCount = mockAllReports.filter(
    (report) => report.reportType === 'Non-Emergency'
  ).length;

  const activeCount = mockAllReports.filter(
    (report) => !['Resolved', 'Invalid'].includes(report.status)
  ).length;

  const resolvedCount = mockAllReports.filter(
    (report) => report.status === 'Resolved'
  ).length;

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return mockAllReports.filter((report) => {
      const matchesFilter =
        filter === 'all' || report.reportType === filter;

      const matchesSearch =
        !query ||
        report.id.toLowerCase().includes(query) ||
        report.concernType.toLowerCase().includes(query) ||
        report.location.toLowerCase().includes(query) ||
        report.status.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  return (
    <div className="px-4 pt-5 pb-8 min-h-screen bg-slate-50">

      {/* ============ PAGE HEADER ============ */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">Track Reports</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor the progress and status of your submitted reports.
        </p>
      </div>

      {/* ============ SUMMARY ============ */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="bg-white border border-blue-100 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Activity className="w-4.5 h-4.5 text-blue-600" />
          </div>

          <div>
            <p className="text-lg font-bold text-slate-900">{activeCount}</p>
            <p className="text-[10px] text-slate-500">Active Reports</p>
          </div>
        </div>

        <div className="bg-white border border-green-100 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-4.5 h-4.5 text-green-600" />
          </div>

          <div>
            <p className="text-lg font-bold text-slate-900">{resolvedCount}</p>
            <p className="text-[10px] text-slate-500">Resolved</p>
          </div>
        </div>
      </div>

      {/* ============ SEARCH ============ */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search report ID, concern, location..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-[13px] outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
        />
      </div>

      {/* ============ FILTERS ============ */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {filters.map((item) => {
          const count =
            item.id === 'all'
              ? mockAllReports.length
              : item.id === 'Emergency'
              ? emergencyCount
              : nonEmergencyCount;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-semibold border transition-all ${
                filter === item.id
                  ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white border-transparent shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {item.label}
              <span
                className={`ml-1.5 ${
                  filter === item.id ? 'text-white/80' : 'text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ============ RESULT COUNT ============ */}
      <div className="flex items-center gap-2 px-1 mb-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
        <p className="text-[10px] text-slate-400">
          {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'} found
        </p>
      </div>

      {/* ============ REPORT LIST ============ */}
      {filteredReports.length > 0 ? (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const isEmergency = report.reportType === 'Emergency';

            return (
              <button
                key={report.id}
                type="button"
                onClick={() => navigate(`/track/${report.id}`)}
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-slate-300 hover:shadow-sm active:scale-[0.995] transition-all"
              >
                {/* Top */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isEmergency
                        ? 'bg-red-50 text-red-500'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {isEmergency ? (
                      <Siren className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400">
                        {report.id}
                      </span>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isEmergency
                            ? 'bg-red-100 text-red-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {report.reportType}
                      </span>
                    </div>

                    <p className="text-[14px] font-semibold text-slate-900 mt-1">
                      {report.concernType}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-3" />
                </div>

                {/* Location */}
                <div className="flex items-start gap-2 mt-3 text-[11px] text-slate-500">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{report.location}</span>
                </div>

                {/* Latest Update */}
                {report.latestUpdate && (
                  <div className="mt-3 bg-slate-50 rounded-xl px-3 py-2.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                      Latest Update
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed line-clamp-2">
                      {report.latestUpdate}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[9px] font-bold px-2 py-1 rounded-full ${getStatusStyle(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>

                    <span
                      className={`text-[9px] font-semibold px-2 py-1 rounded-full border ${getPriorityStyle(
                        report.priority
                      )}`}
                    >
                      {report.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[9px] text-slate-400 shrink-0">
                    <Clock className="w-3 h-3" />
                    {report.submittedAt}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl py-12 px-6 text-center">
          <Search className="w-9 h-9 text-slate-300 mx-auto mb-3" />

          <p className="text-sm font-semibold text-slate-700">
            No reports found
          </p>

          <p className="text-[11px] text-slate-400 mt-1">
            Try changing your search or report filter.
          </p>
        </div>
      )}
    </div>
  );
}