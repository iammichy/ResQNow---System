// src/components/resident/SafetyTips.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
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
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Safety Tips</h1>
            <p className="text-[10px] text-gray-500">What to do in every situation</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 pb-10">
        {/* Intro */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-4 mb-5 text-white flex items-start gap-3 shadow-sm">
          <ShieldCheck className="w-8 h-8 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold">Stay informed. Stay safe.</p>
            <p className="text-[12px] text-white/90 leading-relaxed mt-0.5">
              These quick guides help you respond correctly to every emergency
              and community concern covered by ResQNow.
            </p>
          </div>
        </div>

        {/* Groups */}
        {safetyTips.map((group) => (
          <section key={group.category} className="mb-6">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
              {group.category}
            </h2>
            <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              {group.items.map((item) => {
                const Icon = iconMap[item.id] || ShieldCheck;
                const isOpen = openId === item.id;
                const isEmergency = group.category === 'Emergency Safety';

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => toggle(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isEmergency ? 'bg-red-50' : 'bg-teal-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isEmergency ? 'text-red-500' : 'text-teal-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-800">{item.title}</p>
                        <p className="text-[11px] text-gray-400">{item.tips.length} reminders</p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <ul className="px-4 pb-4 space-y-2 bg-gray-50/50">
                        {item.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-[13px] text-gray-600 leading-relaxed">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
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
        <p className="text-[11px] text-gray-400 text-center leading-relaxed px-6">
          This system requires internet connection or mobile signal. If your
          emergency report cannot be sent, call the barangay hotline directly.
        </p>
      </main>
    </div>
  );
}
