// src/components/resident/Updates.jsx
import { useState } from 'react';
import { Bell, Megaphone, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { mockAnnouncements, mockNotifications } from '../../data/mockData';
import { getAllUpdates, isUpdateExpired } from '../../utils/updateUtils';
import { formatDate } from '../../utils/dateUtils';

// ============ FILTER TABS ============
const filters = [
  { id: 'all', label: 'All' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'reports', label: 'My Reports' },
];

// ============ CARD STYLING ============
// Returns icon, colors, and label based on update type and priority
function getCardStyle(update) {
  if (update.priority === 'critical') {
    return { icon: AlertTriangle, iconBox: 'bg-resqnow-critical/15 text-resqnow-critical', label: 'Critical Alert', labelColor: 'text-resqnow-critical', bg: 'bg-resqnow-critical/5 hover:bg-resqnow-critical/10' };
  }
  if (update.updateCategory === 'report') {
    return { icon: FileText, iconBox: 'bg-resqnow-mint/15 text-resqnow-mint', label: update.priority === 'important' ? 'Report Update' : 'Update', labelColor: 'text-resqnow-mint', bg: 'bg-white hover:bg-slate-50' };
  }
  if (update.updateSource === 'announcement') {
    return { icon: Megaphone, iconBox: 'bg-resqnow-violet/10 text-resqnow-violet', label: 'Announcement', labelColor: 'text-resqnow-violet', bg: 'bg-white hover:bg-slate-50' };
  }
  return { icon: Bell, iconBox: 'bg-slate-100 text-resqnow-muted', label: 'Update', labelColor: 'text-resqnow-muted', bg: 'bg-white hover:bg-slate-50' };
}

// ============ UPDATES PAGE ============
export default function Updates() {
  const [filter, setFilter] = useState('all');

  const updates = getAllUpdates(mockAnnouncements, mockNotifications);

  // Filter updates based on the selected tab
  const filteredUpdates = updates.filter((update) => {
    if (filter === 'all') return true;
    if (filter === 'alerts') return update.priority === 'critical' || update.updateCategory === 'alert';
    if (filter === 'announcements') return update.updateSource === 'announcement';
    if (filter === 'reports') return update.updateCategory === 'report';
    return true;
  });

  const unreadCount = updates.filter((u) => !u.isRead).length;

  return (
    <div className="px-4 pt-5 pb-10 min-h-screen">

      {/* Heading */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-resqnow-primary">Updates</h1>
        <p className="text-xs text-resqnow-muted mt-1">Barangay announcements, emergency alerts, and your report updates.</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-4 px-4">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold transition-colors ${
              filter === f.id
                ? 'bg-brand-gradient text-white shadow-sm'
                : 'bg-white text-resqnow-muted border border-slate-200 hover:border-slate-300'
            }`}
          >
            {f.label}
            {f.id === 'all' && unreadCount > 0 && (
              <span className="ml-1.5 inline-block bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Updates list */}
      {filteredUpdates.length > 0 ? (
        <div className="space-y-2.5">
          {filteredUpdates.map((update) => {
            const style = getCardStyle(update);
            const Icon = style.icon;
            const expired = isUpdateExpired(update);

            return (
              <div
                key={update.id}
                className={`rounded-2xl border p-4 transition-colors ${
                  expired ? 'border-slate-100 bg-slate-50 opacity-60' :
                  update.priority === 'critical' ? 'border-resqnow-critical/20 bg-resqnow-critical/5' :
                  'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.iconBox}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`text-[9px] font-bold uppercase tracking-wide ${style.labelColor}`}>{style.label}</span>
                      {!update.isRead && <span className="w-1.5 h-1.5 bg-resqnow-critical rounded-full" />}
                      {expired && <span className="text-[9px] font-semibold text-resqnow-muted uppercase tracking-wide">Expired</span>}
                    </div>

                    <p className="text-[13px] font-semibold text-resqnow-primary leading-snug">{update.title}</p>
                    <p className="text-[12px] text-resqnow-muted mt-1 leading-relaxed">{update.message}</p>

                    <div className="flex items-center gap-x-3 gap-y-1 mt-2 flex-wrap">
                      <span className="text-[10px] text-resqnow-muted">{formatDate(update.createdAt)}</span>
                      {update.expiresAt && <span className="text-[10px] text-resqnow-muted">Until {formatDate(update.expiresAt)}</span>}
                    </div>
                  </div>

                  {update.relatedReportId && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-1" />}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-resqnow-primary">Nothing here yet</p>
          <p className="text-[12px] text-resqnow-muted mt-1">No {filter === 'all' ? 'updates' : filter} to show.</p>
        </div>
      )}
    </div>
  );
}
