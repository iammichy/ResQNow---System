// src/components/resident/EmergencyContacts.jsx
import { useState } from 'react';
import {
  Phone,
  MapPin,
  Building2,
  Flame,
  Shield,
  Stethoscope,
  LifeBuoy,
  Navigation,
  UserRound,
  Users,
  ChevronDown,
} from 'lucide-react';

import {
  mockBarangayContacts,
  mockEmergencyContacts,
} from '../../data/mockData';

// ============ SERVICE STYLE ============
const contactStyle = {
  Fire: {
    icon: Flame,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    card: 'bg-red-50 border-red-200',
  },
  Police: {
    icon: Shield,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    card: 'bg-indigo-50 border-indigo-200',
  },
  Medical: {
    icon: Stethoscope,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    card: 'bg-teal-50 border-teal-200',
  },
  Rescue: {
    icon: LifeBuoy,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    card: 'bg-orange-50 border-orange-200',
  },
};

// ============ LOCATIONS ============
const contactLocations = {
  'CT-001': 'Barangay Camunatan Hall',
  'CT-002': 'BFP Fire Station',
  'CT-003': 'Ilagan City Police Station',
  'CT-004': 'Ilagan City Health Office',
  'CT-005': 'CDRRMO Office',
  'CT-007': 'Barangay Camunatan Evacuation Center',
};

export default function EmergencyContacts() {
  const hotline = mockBarangayContacts.find((contact) => contact.group === 'Hotline');
  const personnel = mockBarangayContacts.filter((contact) => contact.group !== 'Hotline');

  const lguContacts = mockEmergencyContacts.filter((contact) =>
    ['CT-002', 'CT-003', 'CT-004', 'CT-005'].includes(contact.id)
  );

  const mapContacts = mockEmergencyContacts.filter((contact) =>
    ['CT-001', 'CT-002', 'CT-003', 'CT-004', 'CT-005', 'CT-007'].includes(contact.id)
  );

  const [showPersonnel, setShowPersonnel] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div className="px-4 pt-4 pb-28 min-h-screen bg-slate-50">
      {/* ============ HEADER ============ */}
      <div className="mb-3">
        <h1 className="text-lg font-bold text-slate-900">Emergency Contacts</h1>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Barangay contacts, emergency services, and important locations.
        </p>
      </div>

      {/* ============ BARANGAY HOTLINE ============ */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 mb-3 text-white shadow-[0_8px_20px_rgba(37,99,235,0.20)]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-blue-100 font-bold uppercase tracking-wide">
              Barangay Hotline
            </p>
            <p className="text-[13px] font-bold mt-0.5">Barangay Camunatan</p>
            <p className="text-[16px] font-bold mt-0.5 tracking-wide">
              {hotline?.phoneNumber}
            </p>
          </div>
        </div>

        <a
          href={`tel:${(hotline?.phoneNumber || '').replace(/[^0-9+]/g, '')}`}
          className="mt-3 w-full py-2.5 rounded-xl bg-white text-blue-700 text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all"
        >
          <Phone className="w-3.5 h-3.5" />
          Call Barangay Hotline
        </a>
      </section>

      {/* ============ BARANGAY PERSONNEL BANNER ============ */}
      <section className="mb-3">
        <button
          type="button"
          onClick={() => setShowPersonnel((prev) => !prev)}
          className={`w-full p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all ${
            showPersonnel
              ? 'bg-blue-100 border-blue-300'
              : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
          }`}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-100 text-blue-600">
            <Users className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <p className="text-[14px] font-bold text-blue-900">
              Barangay Officials & Personnel
            </p>

            <p className="text-[10px] text-blue-600 mt-0.5">
              Captain, Kagawads, SK, Secretary, Treasurer and personnel
            </p>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-blue-500 shrink-0 transition-transform ${
              showPersonnel ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Personnel Contacts */}
        {showPersonnel && (
          <div className="mt-2 bg-white border border-slate-200 rounded-2xl p-3">
            <div className="flex items-center justify-between px-0.5 mb-2.5">
              <p className="text-[11px] font-bold text-slate-700">
                Contact Directory
              </p>
              <p className="text-[9px] text-slate-400">
                Tap a card to call
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {personnel.map((person) => (
                <a
                  key={person.id}
                  href={`tel:${person.phoneNumber.replace(/[^0-9+]/g, '')}`}
                  className="min-h-[110px] border border-slate-200 rounded-xl p-3 bg-white hover:bg-blue-50 hover:border-blue-200 active:scale-[0.98] transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <UserRound className="w-4 h-4" />
                  </div>

                  <p className="text-[8px] font-bold text-blue-500 uppercase tracking-wide leading-tight">
                    {person.role}
                  </p>

                  <p className="text-[11px] font-bold text-slate-900 mt-1 leading-snug">
                    {person.name}
                  </p>

                  <div className="flex items-center gap-1 mt-2">
                    <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                    <p className="text-[10px] font-bold text-slate-700">
                      {person.phoneNumber}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ============ MAP ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-3">
        <div className="px-3.5 py-3 border-b border-slate-100 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" />

          <div>
            <h2 className="text-[13px] font-bold text-slate-900">
              Emergency Locations
            </h2>

            <p className="text-[9px] text-slate-400 mt-0.5">
              Barangay and nearby emergency facilities.
            </p>
          </div>
        </div>

        <div className="p-3">
          <div className="h-[125px] bg-blue-50 border border-dashed border-blue-200 rounded-xl flex flex-col items-center justify-center text-center px-4">
            <Navigation className="w-6 h-6 text-blue-500" />

            {selectedLocation ? (
              <>
                <p className="text-[11px] font-bold text-blue-800 mt-1.5">
                  {contactLocations[selectedLocation.id]}
                </p>

                <p className="text-[9px] text-blue-500 mt-0.5">
                  {selectedLocation.name}
                </p>

                <p className="text-[8px] text-slate-400 mt-1">
                  Map integration will be connected later.
                </p>
              </>
            ) : (
              <>
                <p className="text-[11px] font-semibold text-blue-700 mt-1.5">
                  Select a location
                </p>

                <p className="text-[9px] text-blue-500 mt-0.5">
                  Tap one of the locations below.
                </p>
              </>
            )}
          </div>

          <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1">
            {mapContacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => setSelectedLocation(contact)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[9px] font-semibold border transition-all ${
                  selectedLocation?.id === contact.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
                }`}
              >
                {contactLocations[contact.id]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LGU CONTACTS ============ */}
      <section className="mb-3">
        <div className="px-1 mb-2">
          <h2 className="text-[13px] font-bold text-slate-900">
            LGU & Emergency Services
          </h2>

          <p className="text-[10px] text-slate-400 mt-0.5">
            Tap a service to call.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {lguContacts.map((contact) => {
            const style = contactStyle[contact.category] || contactStyle.Rescue;
            const Icon = style.icon;

            return (
              <a
                key={contact.id}
                href={`tel:${contact.phoneNumber.replace(/[^0-9+]/g, '')}`}
                className={`min-h-[125px] rounded-xl p-3 border transition-all hover:shadow-sm active:scale-[0.98] ${style.card}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${style.iconBg}`}>
                  <Icon className={`w-4 h-4 ${style.iconColor}`} />
                </div>

                <p className={`text-[9px] font-bold uppercase tracking-wide mt-2 ${style.iconColor}`}>
                  {contact.category}
                </p>

                <p className="text-[12px] font-bold text-slate-900 mt-1 leading-snug">
                  {contact.name}
                </p>

                <div className="flex items-center gap-1 mt-2">
                  <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                  <p className="text-[10px] font-bold text-slate-700">
                    {contact.phoneNumber}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}