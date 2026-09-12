// src/components/resident/EmergencyContacts.jsx
import { useEffect, useState } from 'react';
import {
  Phone, MapPin, Building2, Flame, Shield, Stethoscope, LifeBuoy,
  Navigation, UserRound, Users, ChevronDown, Search, ExternalLink,
  Globe, MessageCircle, Zap, Droplets, Wrench, Tent, Megaphone,
  RefreshCw, Loader2, Info, Mail, X,
} from 'lucide-react';
import { getContactDirectory } from '../../services/contactService';
import { contactLogos } from '../../data/contactLogos';

const contactStyle = {
  Fire: { icon: Flame, colors: 'bg-resqnow-critical/5 border-resqnow-critical/20', iconColor: 'text-resqnow-critical', iconBg: 'bg-resqnow-critical/10' },
  Police: { icon: Shield, colors: 'bg-resqnow-violet/5 border-resqnow-violet/20', iconColor: 'text-resqnow-violet', iconBg: 'bg-resqnow-violet/10' },
  Medical: { icon: Stethoscope, colors: 'bg-resqnow-mint/5 border-resqnow-mint/20', iconColor: 'text-resqnow-primary', iconBg: 'bg-resqnow-mint/15' },
  Rescue: { icon: LifeBuoy, colors: 'bg-resqnow-insight/5 border-resqnow-insight/20', iconColor: 'text-resqnow-primary', iconBg: 'bg-resqnow-insight/15' },
  Hotline: { icon: Phone, colors: 'bg-resqnow-critical/5 border-resqnow-critical/20', iconColor: 'text-resqnow-critical', iconBg: 'bg-resqnow-critical/10' },
  Electricity: { icon: Zap, colors: 'bg-resqnow-caution/5 border-resqnow-caution/30', iconColor: 'text-resqnow-primary', iconBg: 'bg-resqnow-caution/20' },
  Water: { icon: Droplets, colors: 'bg-resqnow-info/5 border-resqnow-info/20', iconColor: 'text-resqnow-primary', iconBg: 'bg-resqnow-info/15' },
  Maintenance: { icon: Wrench, colors: 'bg-resqnow-pending/5 border-resqnow-pending/20', iconColor: 'text-resqnow-primary', iconBg: 'bg-resqnow-pending/15' },
};

const filters = [
  { id: 'all', label: 'All' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'health', label: 'Health' },
  { id: 'community', label: 'Community' },
];

const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-resqnow-violet focus-visible:ring-offset-2';

// Never make a call link from a missing or malformed phone number.
function phoneHref(number) {
  if (typeof number !== 'string') return null;
  const cleaned = number.replace(/[\s().-]/g, '');
  if (/^09\d{9}$/.test(cleaned)) return `tel:+63${cleaned.slice(1)}`;
  if (/^0\d{9,10}$/.test(cleaned)) return `tel:+63${cleaned.slice(1)}`;
  if (/^\+[1-9]\d{6,14}$/.test(cleaned) || /^\d{3,6}$/.test(cleaned)) return `tel:${cleaned}`;
  return null;
}

// Only HTTPS external links are allowed. Facebook and Messenger destinations
// also need to match their actual hosts; an API value is never executed.
function safeExternalUrl(value, type = 'website') {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    if (type === 'facebook' && host !== 'facebook.com' && !host.endsWith('.facebook.com')) return null;
    if (type === 'messenger' && !['m.me', 'messenger.com', 'www.messenger.com'].includes(host)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function mapsUrl(contact) {
  if (!contact?.address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${contact.name}, ${contact.address}`)}`;
}

function ExternalButton({ url, type, icon: Icon, children, label }) {
  const href = safeExternalUrl(url, type);
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label || children} (opens externally)`}
      className={`min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg border border-resqnow-border-soft bg-white px-2 py-2 text-[11px] font-semibold text-resqnow-violet hover:bg-resqnow-violet/5 ${focusClass}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
    </a>
  );
}

function PhoneLinks({ phones = [], name }) {
  const callable = phones.filter((phone) => phoneHref(phone.number));
  if (!callable.length) return <p className="text-[11px] text-resqnow-muted">Contact number not yet provided.</p>;
  return (
    <div className="space-y-1.5">
      {callable.map((phone) => (
        <a key={phone.id} href={phoneHref(phone.number)} aria-label={`Call ${name}, ${phone.label}: ${phone.displayNumber || phone.number}`}
          className={`flex min-h-[44px] items-center gap-2 rounded-lg border border-resqnow-border-soft bg-white px-2.5 py-2 hover:border-resqnow-violet/40 ${focusClass}`}>
          <Phone className="h-3.5 w-3.5 shrink-0 text-resqnow-violet" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-[9px] font-medium text-resqnow-muted">Call · {phone.label}</span>
            <span className="block break-words text-[11px] font-bold text-resqnow-primary">{phone.displayNumber || phone.number}</span>
          </span>
        </a>
      ))}
    </div>
  );
}

function ContactLogo({ logo, style }) {
  const [imageState, setImageState] = useState('loading');
  const Icon = style.icon;
  const loaded = Boolean(logo) && imageState === 'loaded';
  return (
    <div data-logo-state={logo ? imageState : 'unavailable'}
      className={`relative mb-2 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl ${logo ? 'border border-resqnow-border-soft bg-white' : style.iconBg}`}>
      {!loaded && <Icon className={`h-5 w-5 ${style.iconColor}`} aria-hidden="true" />}
      {logo && imageState !== 'error' && (
        <img src={logo.src} alt={logo.alt} width={44} height={44}
          loading="lazy" decoding="async" referrerPolicy="no-referrer"
          onLoad={() => setImageState('loaded')}
          onError={() => setImageState('error')}
          className={`absolute h-11 w-11 object-contain ${loaded ? 'opacity-100' : 'opacity-0'}`} />
      )}
    </div>
  );
}

function ServiceCard({ contact }) {
  const style = contactStyle[contact.category] || contactStyle.Rescue;
  const logo = contactLogos[contact.id];
  return (
    <article data-contact-id={contact.id} className={`min-w-0 rounded-xl border p-3 ${style.colors}`}>
      <ContactLogo key={logo?.src || contact.category} logo={logo} style={style} />
      <p className={`text-[9px] font-bold uppercase tracking-wide ${style.iconColor}`}>{contact.category}</p>
      <h3 className="mt-1 text-[12px] font-bold leading-snug text-resqnow-primary">{contact.name}</h3>
      {contact.role && <p className="mt-1 text-[10px] leading-relaxed text-resqnow-muted">{contact.role}</p>}
      {contact.address && <p className="mt-2 text-[10px] leading-relaxed text-resqnow-secondary">{contact.address}</p>}
      <div className="mt-3"><PhoneLinks phones={contact.phoneNumbers} name={contact.name} /></div>
      <div className="mt-2 space-y-1.5">
        <ExternalButton url={contact.facebookUrl} type="facebook" icon={Globe} label={`View ${contact.name} on Facebook`}>Facebook</ExternalButton>
        <ExternalButton url={contact.messengerUrl} type="messenger" icon={MessageCircle} label={`Message ${contact.name} on Messenger`}>Messenger</ExternalButton>
        <ExternalButton url={contact.websiteUrl} icon={Globe} label={`Visit ${contact.name} website`}>Website</ExternalButton>
        {typeof contact.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) && (
          <a href={`mailto:${contact.email}`} aria-label={`Email ${contact.name}`} className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-white text-[11px] font-semibold text-resqnow-violet ${focusClass}`}>
            <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Email
          </a>
        )}
      </div>
    </article>
  );
}

export default function EmergencyContacts() {
  const [directory, setDirectory] = useState(null);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [showPersonnel, setShowPersonnel] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedLocationId, setSelectedLocationId] = useState('ilagan-cdrrmo');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    getContactDirectory().then((result) => {
      if (ignore) return;
      setDirectory(result.directory);
      setSource(result.source);
    }).catch(() => {
      if (ignore) return;
      setDirectory(null);
      setError('Unable to access contacts. Please check your sign-in and try again.');
    }).finally(() => {
      if (!ignore) setLoading(false);
    });
    return () => { ignore = true; };
  }, [retry]);

  if (!directory) {
    return (
      <div className="min-h-screen px-4 pb-28 pt-4">
        <h1 className="text-lg font-bold text-resqnow-primary">Emergency & Community Contacts</h1>
        <div className="mt-4 rounded-2xl border border-resqnow-border-soft bg-white p-5" role="status">
          {loading ? <p className="flex items-center gap-2 text-sm text-resqnow-muted"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading contacts…</p> : (
            <><p className="text-sm text-resqnow-secondary">{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)} className={`mt-3 min-h-[44px] rounded-lg bg-resqnow-violet px-4 text-sm font-semibold text-white ${focusClass}`}>Try again</button></>
          )}
        </div>
      </div>
    );
  }

  const hotline = directory.contacts.find((contact) => contact.id === 'barangay-emergency-hotline');
  const personnel = directory.contacts.filter((contact) => contact.group === 'barangay' && contact.id !== hotline?.id);
  const agencies = directory.contacts.filter((contact) => contact.group !== 'barangay');
  const locations = agencies.filter((contact) => contact.address);
  const selectedLocation = locations.find((contact) => contact.id === selectedLocationId) || locations[0];
  const term = query.trim().toLowerCase();
  const digits = term.replace(/\D/g, '');
  const visibleAgencies = agencies.filter((contact) => {
    const groupMatches = filter === 'all' || contact.group === filter;
    const text = [contact.name, contact.role, contact.category, contact.address, ...contact.phoneNumbers.map((phone) => `${phone.number} ${phone.displayNumber}`)].filter(Boolean).join(' ').toLowerCase();
    const numberMatches = digits.length >= 3 && contact.phoneNumbers.some((phone) => phone.number.includes(digits));
    return groupMatches && (!term || text.includes(term) || numberMatches);
  });
  const evacuation = directory.evacuationInformation;
  const services = directory.barangayServices;
  const communication = directory.communicationProcedure;
  const primaryPhone = hotline?.phoneNumbers.find((phone) => phoneHref(phone.number));

  return (
    <div className="min-h-screen px-4 pb-32 pt-4">
      <div className="mb-3">
        <h1 className="text-lg font-bold leading-snug text-resqnow-primary">Emergency & Community Contacts</h1>
        <p className="mt-1 text-[11px] leading-relaxed text-resqnow-muted">Barangay contacts and services for Camunatan and Ilagan.</p>
      </div>

      {/* Barangay hotline */}
      <section aria-label="Barangay hotline" className="bg-brand-gradient mb-3 rounded-2xl p-4 text-white shadow-[0_8px_20px_rgba(131,70,242,0.20)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20"><Building2 className="h-5 w-5" aria-hidden="true" /></div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wide">Barangay Hotline</p>
            <p className="mt-0.5 text-[13px] font-bold">{directory.meta.barangayName}</p>
            <p className="mt-0.5 text-lg font-bold tracking-wide">{primaryPhone?.displayNumber || 'Number not yet provided'}</p>
          </div>
        </div>
        {primaryPhone && <a href={phoneHref(primaryPhone.number)} className={`mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-[12px] font-bold text-resqnow-violet ${focusClass}`}><Phone className="h-4 w-4" aria-hidden="true" /> Call Barangay Hotline</a>}
      </section>

      {source === 'saved' && <div role="status" className="mb-3 flex items-center gap-2 rounded-xl border border-resqnow-border-soft bg-white px-3 py-2">
        <Info className="h-4 w-4 shrink-0 text-resqnow-muted" aria-hidden="true" />
        <p className="flex-1 text-[10px] leading-relaxed text-resqnow-muted">Showing saved contact details. Check for updates when connected.</p>
        <button type="button" disabled={loading} onClick={() => setRetry((value) => value + 1)} aria-label="Refresh contact directory" className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-resqnow-violet disabled:opacity-50 ${focusClass}`}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" /></button>
      </div>}

      {/* Officials: missing numbers render ordinary cards, never empty tel links. */}
      <section className="mb-3">
        <button type="button" onClick={() => setShowPersonnel((value) => !value)} aria-expanded={showPersonnel} aria-controls="barangay-directory"
          className={`flex min-h-[64px] w-full items-center gap-3 rounded-2xl border border-resqnow-violet/20 bg-resqnow-violet/5 p-3.5 text-left ${focusClass}`}>
          <Users className="h-5 w-5 shrink-0 text-resqnow-violet" aria-hidden="true" />
          <span className="flex-1"><span className="block text-[13px] font-bold text-resqnow-primary">Barangay Officials & Personnel</span><span className="mt-0.5 block text-[10px] text-resqnow-muted">Captain, Kagawads, SK, Secretary, Treasurer & response contact</span></span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-resqnow-violet transition-transform ${showPersonnel ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {showPersonnel && <div id="barangay-directory" className="mt-2 rounded-2xl border border-resqnow-border-soft bg-white p-3">
          <p className="mb-3 text-[11px] font-bold text-resqnow-primary">Contact Directory · {personnel.length} entries</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {personnel.map((person) => <article key={person.id} data-contact-id={person.id} className="min-w-0 rounded-xl border border-resqnow-border-soft p-2.5">
              <UserRound className="mb-2 h-5 w-5 text-resqnow-violet" aria-hidden="true" />
              <p className="text-[9px] font-bold uppercase leading-relaxed text-resqnow-violet">{person.role}</p>
              <h3 className="mb-2 mt-1 text-[12px] font-bold leading-snug text-resqnow-primary">{person.name}</h3>
              <PhoneLinks phones={person.phoneNumbers} name={person.name} />
              {person.notes && <p className="mt-2 text-[10px] leading-relaxed text-resqnow-muted">{person.notes}</p>}
            </article>)}
          </div>
        </div>}
      </section>

      {/* Addresses open a map search; no invented coordinates or map pins. */}
      <section className="mb-4 overflow-hidden rounded-2xl border border-resqnow-border-soft bg-white">
        <div className="flex items-center gap-2 border-b border-resqnow-border-soft px-3.5 py-3"><MapPin className="h-4 w-4 text-resqnow-violet" aria-hidden="true" /><h2 className="text-[13px] font-bold text-resqnow-primary">Emergency & Service Locations</h2></div>
        <div className="p-3">
          <label htmlFor="contact-location" className="mb-1.5 block text-[10px] font-semibold text-resqnow-muted">Choose an office or facility</label>
          <select id="contact-location" value={selectedLocation?.id || ''} onChange={(event) => setSelectedLocationId(event.target.value)} className={`min-h-[44px] w-full min-w-0 rounded-lg border border-resqnow-border bg-white px-2 text-[11px] text-resqnow-primary ${focusClass}`}>
            {locations.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
          </select>
          {selectedLocation ? <div className="mt-2.5 rounded-xl border border-resqnow-violet/10 bg-resqnow-mist/50 p-3">
            <p className="text-[12px] font-bold text-resqnow-primary">{selectedLocation.name}</p>
            <p className="mb-2 mt-1 text-[11px] leading-relaxed text-resqnow-muted">{selectedLocation.address}</p>
            <ExternalButton url={mapsUrl(selectedLocation)} icon={Navigation} label={`Find ${selectedLocation.name} on Google Maps`}>Find on Google Maps</ExternalButton>
          </div> : <p className="mt-2 text-[11px] text-resqnow-muted">Location details are not yet available.</p>}
        </div>
      </section>

      {/* City directory */}
      <section className="mb-4" aria-labelledby="city-directory-heading">
        <h2 id="city-directory-heading" className="text-[14px] font-bold text-resqnow-primary">Ilagan Emergency & Community Services</h2>
        <p className="mt-1 text-[10px] leading-relaxed text-resqnow-muted">Tap a number to call. Facebook and website links open externally.</p>
        <div className="relative mb-2 mt-3">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-resqnow-muted" aria-hidden="true" />
          <input type="text" role="searchbox" enterKeyHint="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services, place, or number" aria-label="Search city contacts" className={`min-h-[44px] w-full rounded-xl border border-resqnow-border-soft bg-white py-2 pl-9 pr-10 text-[12px] text-resqnow-primary ${focusClass}`} />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear contact search" className={`absolute right-0 top-0 flex h-11 w-10 items-center justify-center text-resqnow-muted ${focusClass}`}><X className="h-4 w-4" aria-hidden="true" /></button>}
        </div>
        <div className="mb-2 flex flex-wrap gap-1.5" role="group" aria-label="Filter city contacts">
          {filters.map((item) => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)} style={{ fontSize: '11px' }} className={`min-h-[44px] rounded-full border px-3 py-2 text-[11px] font-semibold ${filter === item.id ? 'border-resqnow-violet bg-resqnow-violet text-white' : 'border-resqnow-border-soft bg-white text-resqnow-muted'} ${focusClass}`}>{item.label}</button>)}
        </div>
        <p role="status" aria-live="polite" className="mb-2 text-[10px] text-resqnow-muted">{visibleAgencies.length} {visibleAgencies.length === 1 ? 'service' : 'services'}</p>
        <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 lg:grid-cols-3">
          {visibleAgencies.map((contact) => <ServiceCard key={contact.id} contact={contact} />)}
        </div>
        {!visibleAgencies.length && <div className="rounded-xl border border-resqnow-border-soft bg-white p-4 text-center"><p className="text-[12px] text-resqnow-muted">No contacts match this search.</p><button type="button" onClick={() => { setQuery(''); setFilter('all'); }} className={`mt-2 min-h-[44px] rounded-lg px-3 text-[12px] font-semibold text-resqnow-violet ${focusClass}`}>Show all services</button></div>}
      </section>

      {/* The supplied center wording is retained until its details are confirmed. */}
      <section className="mb-3 rounded-2xl border border-resqnow-caution/30 bg-white p-3.5" aria-labelledby="evacuation-heading">
        <div className="mb-2 flex items-center gap-2"><Tent className="h-5 w-5 text-resqnow-violet" aria-hidden="true" /><h2 id="evacuation-heading" className="text-[13px] font-bold text-resqnow-primary">Evacuation Information</h2></div>
        <p className="text-[12px] font-semibold text-resqnow-primary">{evacuation.nameAsProvided}</p>
        <p className="mt-1 text-[11px] text-resqnow-secondary">Reported capacity: {evacuation.capacityAsProvided || 'Not yet provided'}</p>
        <p className="my-2 text-[11px] leading-relaxed text-resqnow-muted">{evacuation.notes}</p>
        <PhoneLinks phones={evacuation.phoneNumbers} name="barangay evacuation contact" />
      </section>

      <section className="mb-4 overflow-hidden rounded-2xl border border-resqnow-border-soft bg-white">
        <button type="button" onClick={() => setShowServices((value) => !value)} aria-expanded={showServices} aria-controls="barangay-service-details" className={`flex min-h-[60px] w-full items-center gap-2.5 p-3.5 text-left ${focusClass}`}>
          <Megaphone className="h-5 w-5 shrink-0 text-resqnow-violet" aria-hidden="true" /><span className="flex-1 text-[13px] font-bold text-resqnow-primary">Barangay Services & Preparedness</span><ChevronDown className={`h-4 w-4 text-resqnow-violet ${showServices ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {showServices && <div id="barangay-service-details" className="space-y-4 border-t border-resqnow-border-soft p-3.5">
          {[{ title: 'Emergency support', items: services.emergency }, { title: 'Non-emergency concerns', items: services.nonEmergency }].map((section) => <div key={section.title}>
            <h3 className="mb-2 text-[12px] font-bold text-resqnow-primary">{section.title}</h3>
            <ul className="list-disc space-y-2 pl-4 text-[11px] leading-relaxed text-resqnow-secondary">{section.items.map((item) => <li key={item.title}><strong>{item.title}:</strong> {item.description}</li>)}</ul>
          </div>)}
          <div><h3 className="mb-1 text-[12px] font-bold text-resqnow-primary">{communication.title}</h3><p className="text-[11px] leading-relaxed text-resqnow-secondary">{communication.description}</p><ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-resqnow-secondary">{communication.channels.map((channel) => <li key={channel}>{channel}</li>)}</ul></div>
        </div>}
      </section>

      <div className="text-[10px] leading-relaxed text-resqnow-muted">
        <p>Barangay details supplied by the project team. City contacts checked against the city directory on {directory.meta.citySourceCheckedOn || 'the listed source date'}.</p>
        {safeExternalUrl(directory.meta.citySourceUrl) && <a href={safeExternalUrl(directory.meta.citySourceUrl)} target="_blank" rel="noopener noreferrer" className={`mt-1 inline-flex min-h-[44px] items-center gap-1 font-semibold text-resqnow-violet underline ${focusClass}`}>View City of Ilagan contact directory <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>}
      </div>
    </div>
  );
}
