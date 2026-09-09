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
// Colors for each emergency service category
const contactStyle = {
  Fire: {
    icon: Flame,
    iconBg: 'bg-resqnow-critical/15',
    iconColor: 'text-resqnow-critical',
    card: 'bg-resqnow-critical/5 border-resqnow-critical/20',
  },

  Police: {
    icon: Shield,
    iconBg: 'bg-resqnow-violet/15',
    iconColor: 'text-resqnow-violet',
    card: 'bg-resqnow-violet/5 border-resqnow-violet/20',
  },

  Medical: {
    icon: Stethoscope,
    iconBg: 'bg-resqnow-mint/15',
    iconColor: 'text-resqnow-mint',
    card: 'bg-resqnow-mint/5 border-resqnow-mint/20',
  },

  Rescue: {
    icon: LifeBuoy,
    iconBg: 'bg-resqnow-insight/15',
    iconColor: 'text-resqnow-insight',
    card: 'bg-resqnow-insight/5 border-resqnow-insight/20',
  },
};

// ============ LOCATIONS ============
// Map contact IDs to readable location names
const contactLocations = {
  'CT-001': 'Barangay Camunatan Hall',
  'CT-002': 'BFP Fire Station',
  'CT-003': 'Ilagan City Police Station',
  'CT-004': 'Ilagan City Health Office',
  'CT-005': 'CDRRMO Office',
  'CT-007': 'Barangay Camunatan Evacuation Center',
};

// ============ EMERGENCY CONTACTS ============
// Barangay contacts, personnel, emergency services, and locations
export default function EmergencyContacts() {
  // Barangay hotline
  const hotline = mockBarangayContacts.find(
    (contact) => contact.group === 'Hotline'
  );

  // Barangay officials and personnel
  const personnel = mockBarangayContacts.filter(
    (contact) => contact.group !== 'Hotline'
  );

  // Main LGU and emergency services
  const lguContacts = mockEmergencyContacts.filter(
    (contact) =>
      ['CT-002', 'CT-003', 'CT-004', 'CT-005'].includes(contact.id)
  );

  // Locations shown in the temporary map selector
  const mapContacts = mockEmergencyContacts.filter(
    (contact) =>
      ['CT-001', 'CT-002', 'CT-003', 'CT-004', 'CT-005', 'CT-007'].includes(
        contact.id
      )
  );

  // Page states
  const [showPersonnel, setShowPersonnel] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div className="px-4 pt-4 pb-28 min-h-screen">

      {/* ============ HEADER ============ */}
      <div className="mb-3">
        <h1 className="text-lg font-bold text-resqnow-primary">
          Emergency Contacts
        </h1>

        <p className="text-[11px] text-resqnow-muted mt-0.5">
          Barangay contacts, emergency services, and important locations.
        </p>
      </div>

      {/* ============ BARANGAY HOTLINE ============ */}
      <section className="bg-brand-gradient rounded-2xl p-4 mb-3 text-white shadow-[0_8px_20px_rgba(131,70,242,0.20)]">

        <div className="flex items-center gap-3">

          {/* Barangay icon */}
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>

          {/* Hotline information */}
          <div className="flex-1 min-w-0">

            <p className="text-[9px] text-white/70 font-bold uppercase tracking-wide">
              Barangay Hotline
            </p>

            <p className="text-[13px] font-bold mt-0.5">
              Barangay Camunatan
            </p>

            <p className="text-[16px] font-bold mt-0.5 tracking-wide">
              {hotline?.phoneNumber}
            </p>
          </div>
        </div>

        {/* Call hotline */}
        <a
          href={`tel:${(hotline?.phoneNumber || '').replace(/[^0-9+]/g, '')}`}
          className="mt-3 min-h-[44px] w-full py-2.5 rounded-xl bg-white text-resqnow-violet text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
        >
          <Phone className="w-3.5 h-3.5" />
          Call Barangay Hotline
        </a>
      </section>

      {/* ============ BARANGAY PERSONNEL ============ */}
      <section className="mb-3">

        {/* Personnel accordion */}
        <button
          type="button"
          onClick={() => setShowPersonnel((prev) => !prev)}
          aria-expanded={showPersonnel}
          className={`w-full min-h-[58px] p-3.5 rounded-2xl border flex items-center gap-3 text-left active:scale-[0.99] transition-all ${
            showPersonnel
              ? 'bg-resqnow-violet/10 border-resqnow-violet/30'
              : 'bg-resqnow-violet/5 border-resqnow-violet/20 hover:bg-resqnow-violet/10'
          }`}
        >
          {/* Personnel icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-resqnow-violet/10 text-resqnow-violet">
            <Users className="w-5 h-5" />
          </div>

          <div className="flex-1">

            <p className="text-[14px] font-bold text-resqnow-primary">
              Barangay Officials & Personnel
            </p>

            <p className="text-[10px] text-resqnow-violet mt-0.5">
              Captain, Kagawads, SK, Secretary, Treasurer and personnel
            </p>
          </div>

          {/* Accordion arrow */}
          <ChevronDown
            className={`w-4 h-4 text-resqnow-violet/70 shrink-0 transition-transform ${
              showPersonnel ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Personnel directory */}
        {showPersonnel && (
          <div className="mt-2 bg-white border border-resqnow-border-soft rounded-2xl p-3">

            {/* Directory heading */}
            <div className="flex items-center justify-between px-0.5 mb-2.5">

              <p className="text-[11px] font-bold text-resqnow-primary">
                Contact Directory
              </p>

              <p className="text-[9px] text-resqnow-muted">
                Tap a card to call
              </p>
            </div>

            {/* Personnel cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">

              {personnel.map((person) => (
                <a
                  key={person.id}
                  href={`tel:${person.phoneNumber.replace(/[^0-9+]/g, '')}`}
                  className="min-h-[110px] border border-resqnow-border-soft rounded-xl p-3 bg-white hover:bg-resqnow-violet/5 hover:border-resqnow-violet/20 active:scale-[0.98] transition-all"
                >
                  {/* Person icon */}
                  <div className="w-8 h-8 rounded-lg bg-resqnow-violet/10 text-resqnow-violet flex items-center justify-center mb-2">
                    <UserRound className="w-4 h-4" />
                  </div>

                  {/* Role */}
                  <p className="text-[8px] font-bold text-resqnow-violet/70 uppercase tracking-wide leading-tight">
                    {person.role}
                  </p>

                  {/* Name */}
                  <p className="text-[11px] font-bold text-resqnow-primary mt-1 leading-snug">
                    {person.name}
                  </p>

                  {/* Phone */}
                  <div className="flex items-center gap-1 mt-2">

                    <Phone className="w-3 h-3 text-resqnow-muted shrink-0" />

                    <p className="text-[10px] font-bold text-resqnow-primary">
                      {person.phoneNumber}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ============ EMERGENCY LOCATIONS ============ */}
      <section className="bg-white border border-resqnow-border-soft rounded-2xl overflow-hidden mb-3">

        {/* Location heading */}
        <div className="px-3.5 py-3 border-b border-resqnow-border-soft flex items-center gap-2">

          <MapPin className="w-4 h-4 text-resqnow-violet" />

          <div>
            <h2 className="text-[13px] font-bold text-resqnow-primary">
              Emergency Locations
            </h2>

            <p className="text-[9px] text-resqnow-muted mt-0.5">
              Barangay and nearby emergency facilities.
            </p>
          </div>
        </div>

        <div className="p-3">

          {/* Temporary map area */}
          <div className="h-[125px] bg-resqnow-mist/50 border border-dashed border-resqnow-violet/20 rounded-xl flex flex-col items-center justify-center text-center px-4">

            <Navigation className="w-6 h-6 text-resqnow-violet" />

            {selectedLocation ? (
              <>
                <p className="text-[11px] font-bold text-resqnow-primary mt-1.5">
                  {contactLocations[selectedLocation.id]}
                </p>

                <p className="text-[9px] text-resqnow-violet mt-0.5">
                  {selectedLocation.name}
                </p>

                <p className="text-[8px] text-resqnow-muted mt-1">
                  Map integration will be connected later.
                </p>
              </>
            ) : (
              <>
                <p className="text-[11px] font-semibold text-resqnow-primary mt-1.5">
                  Select a location
                </p>

                <p className="text-[9px] text-resqnow-violet mt-0.5">
                  Tap one of the locations below.
                </p>
              </>
            )}
          </div>

          {/* Location options */}
          <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1">

            {mapContacts.map((contact) => {
              const selected =
                selectedLocation?.id === contact.id;

              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setSelectedLocation(contact)}
                  className={`shrink-0 min-h-[36px] px-3 py-1.5 rounded-full text-[9px] font-semibold border active:scale-95 transition-all ${
                    selected
                      ? 'bg-resqnow-violet border-resqnow-violet text-white'
                      : 'bg-white border-resqnow-border-soft text-resqnow-muted hover:border-resqnow-violet/30 hover:text-resqnow-violet'
                  }`}
                >
                  {contactLocations[contact.id]}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ LGU CONTACTS ============ */}
      <section className="mb-3">

        {/* Section heading */}
        <div className="px-1 mb-2">

          <h2 className="text-[13px] font-bold text-resqnow-primary">
            LGU & Emergency Services
          </h2>

          <p className="text-[10px] text-resqnow-muted mt-0.5">
            Tap a service to call.
          </p>
        </div>

        {/* Emergency service cards */}
        <div className="grid grid-cols-2 gap-2">

          {lguContacts.map((contact) => {
            const style =
              contactStyle[contact.category] ||
              contactStyle.Rescue;

            const Icon = style.icon;

            return (
              <a
                key={contact.id}
                href={`tel:${contact.phoneNumber.replace(/[^0-9+]/g, '')}`}
                className={`min-h-[125px] rounded-xl p-3 border transition-all hover:shadow-[0_4px_12px_rgba(31,29,71,0.06)] active:scale-[0.98] ${style.card}`}
              >
                {/* Service icon */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${style.iconBg}`}
                >
                  <Icon
                    className={`w-4 h-4 ${style.iconColor}`}
                  />
                </div>

                {/* Service category */}
                <p
                  className={`text-[9px] font-bold uppercase tracking-wide mt-2 ${style.iconColor}`}
                >
                  {contact.category}
                </p>

                {/* Service name */}
                <p className="text-[12px] font-bold text-resqnow-primary mt-1 leading-snug">
                  {contact.name}
                </p>

                {/* Phone number */}
                <div className="flex items-center gap-1 mt-2">

                  <Phone className="w-3 h-3 text-resqnow-muted shrink-0" />

                  <p className="text-[10px] font-bold text-resqnow-primary">
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