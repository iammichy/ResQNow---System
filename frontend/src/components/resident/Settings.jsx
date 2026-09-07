// src/components/resident/Settings.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserRound, Phone, Mail, MapPin, MapPinned, Users, ShieldCheck, LockKeyhole, Languages,
  Bell, FileText, Megaphone, Siren, ChevronDown, Pencil, Save, Eye, EyeOff,
  CheckCircle2, AlertCircle, Minus, Plus, LogOut,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { purokOptions } from '../../data/mockData';

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { t, i18n } = useTranslation();

  // Accordion state
  const [openSection, setOpenSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Profile form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [contactNumber, setContactNumber] = useState(user?.contactNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [purok, setPurok] = useState(user?.purok || 'Purok 1');
  const [householdCount, setHouseholdCount] = useState(user?.householdCount || 1);
  const [householdProfile, setHouseholdProfile] = useState({
    hasSeniorCitizen: user?.householdProfile?.hasSeniorCitizen || false,
    hasChild: user?.householdProfile?.hasChild || false,
    hasPWD: user?.householdProfile?.hasPWD || false,
    hasPregnantPerson: user?.householdProfile?.hasPregnantPerson || false,
  });
  const [profileError, setProfileError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({ reportUpdates: true, announcements: true, emergencyAlerts: true });
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  const toggleSection = (section) => setOpenSection((prev) => (prev === section ? null : section));

  // Language change handler
  const handleLanguageChange = async (e) => {
    const newLanguage = e.target.value;
    await i18n.changeLanguage(newLanguage);
    localStorage.setItem('resqnow_language', newLanguage);
    document.documentElement.lang = newLanguage;
    setPreferencesSaved(false);
  };

  const toggleHousehold = (key) => { if (!isEditing) return; setHouseholdProfile((prev) => ({ ...prev, [key]: !prev[key] })); };

  // Save profile changes
  const handleProfileSave = () => {
    setProfileError(''); setProfileSaved(false);
    if (!fullName.trim()) { setProfileError('Full name is required.'); return; }
    if (!/^09\d{9}$/.test(contactNumber)) { setProfileError('Enter a valid 11-digit mobile number starting with 09.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setProfileError('Enter a valid email address.'); return; }
    if (!address.trim()) { setProfileError('Address is required.'); return; }
    updateProfile({ fullName, contactNumber, email, address, purok, householdCount, householdProfile });
    setIsEditing(false); setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleCancelEdit = () => {
    setFullName(user?.fullName || ''); setContactNumber(user?.contactNumber || ''); setEmail(user?.email || '');
    setAddress(user?.address || ''); setPurok(user?.purok || 'Purok 1'); setHouseholdCount(user?.householdCount || 1);
    setHouseholdProfile({ hasSeniorCitizen: user?.householdProfile?.hasSeniorCitizen || false, hasChild: user?.householdProfile?.hasChild || false, hasPWD: user?.householdProfile?.hasPWD || false, hasPregnantPerson: user?.householdProfile?.hasPregnantPerson || false });
    setProfileError(''); setIsEditing(false);
  };

  const validPassword = (p) => p.length >= 8 && /[A-Z]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9]/.test(p);

  const handlePasswordSave = () => {
    setPasswordError(''); setPasswordSaved(false);
    if (!currentPassword) { setPasswordError('Enter your current password.'); return; }
    if (!validPassword(newPassword)) { setPasswordError('New password must have 8 characters, an uppercase letter, number, and special character.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match.'); return; }
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2500);
  };

  const toggleNotification = (key) => { setNotifications((prev) => ({ ...prev, [key]: !prev[key] })); setPreferencesSaved(false); };
  const handlePreferencesSave = () => { setPreferencesSaved(true); setTimeout(() => setPreferencesSaved(false), 2500); };
  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const firstLetter = (user?.fullName || 'Resident').charAt(0).toUpperCase();

  return (
    <div className="px-4 pt-4 pb-28 min-h-screen">

      {/* ============ HEADER ============ */}
      <div className="mb-3">
        <h1 className="text-lg font-bold text-resqnow-primary">{t('settings.title')}</h1>
        <p className="text-[11px] text-resqnow-muted mt-0.5">{t('settings.subtitle')}</p>
      </div>

      {/* ============ PROFILE SUMMARY ============ */}
      <section className="bg-brand-gradient rounded-2xl p-4 text-white mb-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/20 border border-white/20 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold">{firstLetter}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[15px] font-bold truncate">{user?.fullName || 'Resident'}</p>
              {user?.accountStatus === 'Verified' && <ShieldCheck className="w-4 h-4 text-white shrink-0" />}
            </div>
            <p className="text-[10px] text-white/70 mt-0.5">{user?.accountStatus === 'Verified' ? t('settings.verifiedResident') : user?.accountStatus || 'Resident'}</p>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-white/60" />
              <p className="text-[10px] text-white/70 truncate">{user?.purok || 'Barangay Camunatan'}</p>
            </div>
          </div>
          <button type="button" onClick={() => { setOpenSection('profile'); setIsEditing(true); }} className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 hover:bg-white/30 transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ============ PROFILE SECTION ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-3">
        <button type="button" onClick={() => toggleSection('profile')} className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-resqnow-violet/10 text-resqnow-violet flex items-center justify-center shrink-0"><UserRound className="w-4 h-4" /></div>
          <div className="flex-1"><p className="text-[13px] font-bold text-resqnow-primary">{t('settings.personalHousehold')}</p><p className="text-[9px] text-resqnow-muted mt-0.5">{t('settings.personalHouseholdHint')}</p></div>
          <ChevronDown className={`w-4 h-4 text-resqnow-muted transition-transform ${openSection === 'profile' ? 'rotate-180' : ''}`} />
        </button>

        {openSection === 'profile' && (
          <div className="px-4 pb-4 border-t border-slate-100">
            <div className="flex items-center justify-between mt-4 mb-3">
              <p className="text-[11px] font-bold text-resqnow-primary">{t('settings.residentInformation')}</p>
              {!isEditing && <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-[10px] font-bold text-resqnow-violet"><Pencil className="w-3 h-3" />{t('settings.edit')}</button>}
            </div>

            {profileError && <div className="flex items-start gap-2 bg-resqnow-critical/10 border border-resqnow-critical/20 rounded-xl px-3 py-2.5 mb-3"><AlertCircle className="w-4 h-4 text-resqnow-critical shrink-0 mt-0.5" /><p className="text-[10px] text-resqnow-critical">{profileError}</p></div>}
            {profileSaved && <div className="flex items-center gap-2 bg-resqnow-safe/10 border border-resqnow-safe/20 rounded-xl px-3 py-2.5 mb-3"><CheckCircle2 className="w-4 h-4 text-resqnow-safe" /><p className="text-[10px] font-semibold text-resqnow-safe">{t('settings.profileUpdated')}</p></div>}

            <div className="space-y-3">
              <ProfileField icon={UserRound} label={t('settings.fullName')} value={fullName} editing={isEditing} onChange={setFullName} />
              <ProfileField icon={Phone} label={t('settings.contactNumber')} value={contactNumber} editing={isEditing} onChange={setContactNumber} type="tel" />
              <ProfileField icon={Mail} label={t('settings.email')} value={email} editing={isEditing} onChange={setEmail} type="email" />
              <ProfileField icon={MapPin} label={t('settings.address')} value={address} editing={isEditing} onChange={setAddress} />
              <div>
                <label className="text-[9px] font-semibold text-resqnow-muted">{t('settings.purok')}</label>
                {isEditing ? (
                  <select value={purok} onChange={(e) => setPurok(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] text-resqnow-primary outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10">
                    {purokOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                ) : <p className="text-[12px] font-semibold text-resqnow-primary mt-1">{purok}</p>}
              </div>
            </div>

            {/* Home location */}
            <div className="mt-4">
              <p className="text-[11px] font-bold text-resqnow-primary mb-2">{t('settings.homeLocation')}</p>
              <div className="bg-resqnow-violet/5 border border-resqnow-violet/10 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-resqnow-violet/10 text-resqnow-violet flex items-center justify-center shrink-0"><MapPinned className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-resqnow-primary">{t('settings.savedHomeLocation')}</p>
                  <p className="text-[9px] text-resqnow-muted mt-0.5 truncate">{address || purok}</p>
                  <p className="text-[8px] text-resqnow-muted mt-0.5">{t('settings.mapLater')}</p>
                </div>
              </div>
            </div>

            {/* Household */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-resqnow-mint" /><p className="text-[11px] font-bold text-resqnow-primary">{t('settings.householdInformation')}</p></div>
              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                <div><p className="text-[10px] font-semibold text-resqnow-primary">{t('settings.householdMembers')}</p><p className="text-[9px] text-resqnow-muted mt-0.5">{t('settings.householdMembersHint')}</p></div>
                <div className="flex items-center gap-2">
                  {isEditing && <button type="button" onClick={() => setHouseholdCount((prev) => Math.max(1, prev - 1))} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-resqnow-muted"><Minus className="w-3 h-3" /></button>}
                  <span className="text-sm font-bold text-resqnow-primary w-6 text-center">{householdCount}</span>
                  {isEditing && <button type="button" onClick={() => setHouseholdCount((prev) => prev + 1)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-resqnow-muted"><Plus className="w-3 h-3" /></button>}
                </div>
              </div>
              {isEditing && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {[{ key: 'hasSeniorCitizen', icon: PersonStanding, label: t('settings.senior') }, { key: 'hasChild', icon: Baby, label: t('settings.child') }, { key: 'hasPWD', icon: Accessibility, label: t('settings.pwd') }, { key: 'hasPregnantPerson', icon: HeartPulse, label: t('settings.pregnant') }].map(({ key, icon: HIcon, label }) => (
                    <button key={key} type="button" onClick={() => toggleHousehold(key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium border transition-all ${householdProfile[key] ? 'bg-resqnow-mint/10 border-resqnow-mint text-resqnow-mint' : 'bg-white border-slate-200 text-resqnow-muted'}`}>
                      <HIcon className="w-3 h-3" />{label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2 mt-5">
                <button type="button" onClick={handleCancelEdit} className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-resqnow-muted text-[12px] font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="button" onClick={handleProfileSave} className="flex-1 py-2.5 rounded-xl bg-brand-gradient text-white text-[12px] font-semibold flex items-center justify-center gap-1.5"><Save className="w-4 h-4" />{t('settings.saveChanges')}</button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ============ PASSWORD ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-3">
        <button type="button" onClick={() => toggleSection('password')} className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-resqnow-caution/10 text-resqnow-caution flex items-center justify-center shrink-0"><LockKeyhole className="w-4 h-4" /></div>
          <div className="flex-1"><p className="text-[13px] font-bold text-resqnow-primary">{t('settings.changePassword')}</p><p className="text-[9px] text-resqnow-muted mt-0.5">{t('settings.changePasswordHint')}</p></div>
          <ChevronDown className={`w-4 h-4 text-resqnow-muted transition-transform ${openSection === 'password' ? 'rotate-180' : ''}`} />
        </button>
        {openSection === 'password' && (
          <div className="px-4 pb-4 border-t border-slate-100">
            {passwordError && <div className="flex items-start gap-2 bg-resqnow-critical/10 border border-resqnow-critical/20 rounded-xl px-3 py-2.5 mt-4 mb-3"><AlertCircle className="w-4 h-4 text-resqnow-critical shrink-0 mt-0.5" /><p className="text-[10px] text-resqnow-crimson">{passwordError}</p></div>}
            {passwordSaved && <div className="flex items-center gap-2 bg-resqnow-safe/10 border border-resqnow-safe/20 rounded-xl px-3 py-2.5 mt-4 mb-3"><CheckCircle2 className="w-4 h-4 text-resqnow-safe" /><p className="text-[10px] font-semibold text-resqnow-safe">{t('settings.passwordUpdated')}</p></div>}
            <div className="space-y-3 mt-4">
              <PasswordField icon={LockKeyhole} label={t('settings.currentPassword')} value={currentPassword} onChange={setCurrentPassword} show={showPasswords} placeholder="Enter current password" />
              <PasswordField icon={LockKeyhole} label={t('settings.newPassword')} value={newPassword} onChange={setNewPassword} show={showPasswords} placeholder="Create new password" />
              <PasswordField icon={LockKeyhole} label={t('settings.confirmPassword')} value={confirmPassword} onChange={setConfirmPassword} show={showPasswords} placeholder="Confirm new password" />
            </div>
            <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="mt-2 text-[10px] font-semibold text-resqnow-violet flex items-center gap-1">{showPasswords ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}{showPasswords ? 'Hide' : 'Show'} passwords</button>
            <button type="button" onClick={handlePasswordSave} className="w-full mt-4 py-2.5 rounded-xl bg-resqnow-caution text-white text-[12px] font-semibold flex items-center justify-center gap-1.5"><Save className="w-4 h-4" />{t('settings.updatePassword')}</button>
          </div>
        )}
      </section>

      {/* ============ NOTIFICATIONS ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-3">
        <button type="button" onClick={() => toggleSection('notifications')} className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-resqnow-info/10 text-resqnow-info flex items-center justify-center shrink-0"><Bell className="w-4 h-4" /></div>
          <div className="flex-1"><p className="text-[13px] font-bold text-resqnow-primary">{t('settings.notifications')}</p><p className="text-[9px] text-resqnow-muted mt-0.5">{t('settings.notificationsHint')}</p></div>
          <ChevronDown className={`w-4 h-4 text-resqnow-muted transition-transform ${openSection === 'notifications' ? 'rotate-180' : ''}`} />
        </button>
        {openSection === 'notifications' && (
          <div className="px-4 pb-4 border-t border-slate-100">
            {preferencesSaved && <div className="flex items-center gap-2 bg-resqnow-safe/10 border border-resqnow-safe/20 rounded-xl px-3 py-2.5 mt-4 mb-3"><CheckCircle2 className="w-4 h-4 text-resqnow-safe" /><p className="text-[10px] font-semibold text-resqnow-safe">{t('settings.preferencesSaved')}</p></div>}
            <div className="space-y-3 mt-4">
              <ToggleRow icon={FileText} label={t('settings.reportUpdates')} checked={notifications.reportUpdates} onChange={() => toggleNotification('reportUpdates')} />
              <ToggleRow icon={Megaphone} label={t('settings.announcements')} checked={notifications.announcements} onChange={() => toggleNotification('announcements')} />
              <ToggleRow icon={Siren} label={t('settings.emergencyAlerts')} checked={notifications.emergencyAlerts} onChange={() => toggleNotification('emergencyAlerts')} />
            </div>
            <button type="button" onClick={handlePreferencesSave} className="w-full mt-4 py-2.5 rounded-xl bg-resqnow-info/10 text-resqnow-info text-[12px] font-semibold hover:bg-resqnow-info/20 transition-colors">Save Preferences</button>
          </div>
        )}
      </section>

      {/* ============ LANGUAGE ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-3">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-resqnow-mint/10 text-resqnow-mint flex items-center justify-center shrink-0"><Languages className="w-4 h-4" /></div>
          <div className="flex-1"><p className="text-[13px] font-bold text-resqnow-primary">{t('settings.language')}</p><p className="text-[9px] text-resqnow-muted mt-0.5">{t('settings.languageHint')}</p></div>
          <select value={i18n.language} onChange={handleLanguageChange} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-resqnow-primary outline-none">
            <option value="en">English</option>
            <option value="tl">Filipino</option>
          </select>
        </div>
      </section>

      {/* ============ LOGOUT ============ */}
      <section className="mb-3">
        <button type="button" onClick={handleLogout} className="w-full p-3.5 rounded-2xl border border-resqnow-critical/20 bg-resqnow-critical/5 flex items-center gap-3 text-left hover:bg-resqnow-critical/10 transition-all">
          <div className="w-9 h-9 rounded-xl bg-resqnow-critical/10 text-resqnow-critical flex items-center justify-center shrink-0"><LogOut className="w-4 h-4" /></div>
          <div className="flex-1"><p className="text-[13px] font-bold text-resqnow-crimson">{t('settings.logout')}</p><p className="text-[10px] text-resqnow-critical mt-0.5">{t('settings.logoutHint')}</p></div>
        </button>
      </section>
    </div>
  );
}

// ============ SMALL COMPONENTS ============
function ProfileField({ icon: Icon, label, value, editing, onChange, type }) {
  return (
    <div>
      <label className="text-[9px] font-semibold text-resqnow-muted">{label}</label>
      {editing ? (
        <input type={type || 'text'} value={value} onChange={(e) => onChange(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] text-resqnow-primary outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10" />
      ) : (
        <div className="flex items-center gap-2 mt-1">
          {Icon && <Icon className="w-3.5 h-3.5 text-resqnow-muted shrink-0" />}
          <p className="text-[12px] font-semibold text-resqnow-primary">{value || 'Not provided'}</p>
        </div>
      )}
    </div>
  );
}

function PasswordField({ icon: Icon, label, value, onChange, show, placeholder }) {
  return (
    <div>
      <label className="text-[9px] font-semibold text-resqnow-muted">{label}</label>
      <div className="relative mt-1">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-resqnow-muted" />}
        <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-resqnow-primary outline-none focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10" />
      </div>
    </div>
  );
}

function ToggleRow({ icon: Icon, label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2"><Icon className="w-4 h-4 text-resqnow-muted" /><span className="text-[12px] text-resqnow-primary">{label}</span></div>
      <button type="button" onClick={onChange} className={`w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-resqnow-mint' : 'bg-slate-300'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}
