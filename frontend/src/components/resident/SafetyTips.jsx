// src/components/resident/SafetyTips.jsx
import { useState } from 'react';
import {
  ChevronDown,
  ShieldCheck,
  HeartPulse,
  Flame,
  Stethoscope,
  ShieldAlert,
  Waves,
  Car,
  Tent,
  Users,
  HandHeart,
  TreePine,
  Wrench,
  Broom,
  MessageSquare,
  CircleHelp,
} from 'lucide-react';
import { safetyTips } from '../../data/mockData';

// Map each safety tip ID to an icon
const iconMap = {
  'life-death': HeartPulse,
  fire: Flame,
  medical: Stethoscope,
  violence: ShieldAlert,
  flood: Waves,
  accident: Car,
  evacuation: Tent,
  'evac-assistance': Tent,
  'bhw-assistance': HandHeart,
  'road-obstruction': TreePine,
  'damaged-facility': Wrench,
  cleanup: Broom,
  'community-concern': Users,
  'other-assistance': CircleHelp,
};

export default function SafetyTips() {
  const [openId, setOpenId] = useState(null);

  // Toggle a tip accordion open or closed
  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen">
      <main className="max-w-lg mx-auto px-4 py-5 pb-10">
        {/* Intro banner */}
        <div className="bg-brand-gradient rounded-2xl p-4 mb-5 text-white flex items-start gap-3 shadow-sm">
          <ShieldCheck className="w-8 h-8 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold">Stay informed. Stay safe.</p>
            <p className="text-[12px] text-white/90 leading-relaxed mt-0.5">
              These quick guides help you respond correctly to every emergency
              and community concern covered by ResQNow.
            </p>
          </div>
        </div>

        {/* Tip groups by category */}
        {safetyTips.map((group) => (
          <section key={group.category} className="mb-6">
            <h2 className="text-[11px] font-bold text-resqnow-muted uppercase tracking-widest mb-2 px-1">
              {group.category}
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {group.items.map((item) => {
                const Icon = iconMap[item.id] || ShieldCheck;
                const isOpen = openId === item.id;
                const isEmergency = group.category === 'Emergency Safety';

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => toggle(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isEmergency ? 'bg-resqnow-critical/10' : 'bg-resqnow-mint/10'
                      }`}>
                        <Icon className={`w-5 h-5 ${isEmergency ? 'text-resqnow-critical' : 'text-resqnow-mint'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-resqnow-primary">{item.title}</p>
                        <p className="text-[11px] text-resqnow-muted">{item.tips.length} reminders</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-resqnow-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <ul className="px-4 pb-4 space-y-2 bg-slate-50/50">
                        {item.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-600 leading-relaxed">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-resqnow-mint shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Footer note */}
        <p className="text-[11px] text-resqnow-muted text-center leading-relaxed px-6">
          This system requires internet connection or mobile signal. If your
          emergency report cannot be sent, call the barangay hotline directly.
        </p>
      </main>
    </div>
  );
}
