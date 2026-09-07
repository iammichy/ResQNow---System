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
import { getStatusStyle, getPriorityStyle } from '../../utils/statusUtils';

// Filter options for the tab bar
const filters = [
  { id: 'all', label: 'All' },
  { id: 'Emergency', label: 'Emergency' },
  { id: 'Non-Emergency', label: 'Non-Emergency' },
];

export default function TrackReports() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Count reports by type and status
  const emergencyCount = mockAllReports.filter((r) => r.reportType === 'Emergency').length;
  const nonEmergencyCount = mockAllReports.filter((r) => r.reportType === 'Non-Emergency').length;
  const activeCount = mockAllReports.filter((r) => !['Resolved', 'Invalid'].includes(r.status)).length;
  const resolvedCount = mockAllReports.filter((r) => r.status === 'Resolved').length;

  // Filter and search reports
  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mockAllReports.filter((report) => {
      const matchesFilter = filter === 'all' || report.reportType === filter;
      const matchesSearch = !query || report.id.toLowerCase().includes(query) || report.concernType.toLowerCase().includes(query) || report.location.toLowerCase().includes(query) || report.status.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  return (
    <div className="px-4 pt-5 pb-8 min-h-screen">

      {/* ============ PAGE HEADER ============ */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-resqnow-primary">Track Reports</h1>
        <p className="text-xs text-resqnow-muted mt-1">Monitor the progress and status of your submitted reports.</p>
      </div>

      {/* ============ SUMMARY ============ */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="bg-white border border-resqnow-violet/20 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-resqnow-violet/10 flex items-center justify-center">
            <Activity className="w-4.5 h-4.5 text-resqnow-violet" />
          </div>
          <div>
            <p className="text-lg font-bold text-resqnow-primary">{activeCount}</p>
            <p className="text-[10px] text-resqnow-muted">Active Reports</p>
          </div>
        </div>

        <div className="bg-white border border-resqnow-safe/20 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-resqnow-safe/10 flex items-center justify-center">
            <CheckCircle2 className="w-4.5 h-4.5 text-resqnow-safe" />
          </div>
          <div>
            <p className="text-lg font-bold text-resqnow-primary">{resolvedCount}</p>
            <p className="text-[10px] text-resqnow-muted">Resolved</p>
          </div>
        </div>
      </div>

      {/* ============ SEARCH ============ */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-resqnow-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search report ID, concern, location..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-[13px] outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10 transition-all"
        />
      </div>

      {/* ============ FILTERS ============ */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {filters.map((item) => {
          const count = item.id === 'all' ? mockAllReports.length : item.id === 'Emergency' ? emergencyCount : nonEmergencyCount;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-semibold border transition-all ${
                filter === item.id
                  ? 'bg-brand-gradient text-white border-transparent shadow-sm'
                  : 'bg-white text-resqnow-muted border-slate-200 hover:border-slate-300'
              }`}
            >
              {item.label}
              <span className={`ml-1.5 ${filter === item.id ? 'text-white/80' : 'text-resqnow-muted'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* ============ RESULT COUNT ============ */}
      <div className="flex items-center gap-2 px-1 mb-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-resqnow-muted" />
        <p className="text-[10px] text-resqnow-muted">{filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'} found</p>
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
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    isEmergency ? 'bg-resqnow-critical/10 text-resqnow-critical' : 'bg-resqnow-violet/10 text-resqnow-violet'
                  }`}>
                    {isEmergency ? <Siren className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-resqnow-muted">{report.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isEmergency ? 'bg-resqnow-critical/15 text-resqnow-critical' : 'bg-resqnow-violet/15 text-resqnow-violet'
                      }`}>{report.reportType}</span>
                    </div>
                    <p className="text-[14px] font-semibold text-resqnow-primary mt-1">{report.concernType}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-3" />
                </div>

                <div className="flex items-start gap-2 mt-3 text-[11px] text-resqnow-muted">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{report.location}</span>
                </div>

                {report.latestUpdate && (
                  <div className="mt-3 bg-slate-50 rounded-xl px-3 py-2.5">
                    <p className="text-[9px] font-bold text-resqnow-muted uppercase tracking-wide">Latest Update</p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed line-clamp-2">{report.latestUpdate}</p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${getStatusStyle(report.status)}`}>{report.status}</span>
                    <span className={`text-[9px] font-semibold px-2 py-1 rounded-full border ${getPriorityStyle(report.priority)}`}>{report.priority}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-resqnow-muted shrink-0">
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
          <p className="text-sm font-semibold text-resqnow-primary">No reports found</p>
          <p className="text-[11px] text-resqnow-muted mt-1">Try changing your search or report filter.</p>
        </div>
      )}
    </div>
  );
}
