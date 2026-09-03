// src/components/resident/Settings.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserRound,
  Phone,
  Mail,
  MapPin,
  MapPinned,
  Users,
  ShieldCheck,
  LockKeyhole,
  Languages,
  Bell,
  FileText,
  Megaphone,
  Siren,
  ChevronDown,
  Pencil,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Minus,
  Plus,
  LogOut,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { purokOptions } from '../../data/mockData';

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const [openSection, setOpenSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

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

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    reportUpdates: true,
    announcements: true,
    emergencyAlerts: true,
  });

  const [preferencesSaved, setPreferencesSaved] = useState(false);

  // ============ ACCORDION ============
  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  // ============ LANGUAGE ============
  const handleLanguageChange = async (e) => {
    const newLanguage = e.target.value;

    await i18n.changeLanguage(newLanguage);
    localStorage.setItem('resqnow_language', newLanguage);
    document.documentElement.lang = newLanguage;

    setPreferencesSaved(false);
  };

  // ============ HOUSEHOLD ============
  const toggleHousehold = (key) => {
    if (!isEditing) return;

    setHouseholdProfile((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ============ PROFILE ============
  const handleProfileSave = () => {
    setProfileError('');
    setProfileSaved(false);

    if (!fullName.trim()) {
      setProfileError('Full name is required.');
      return;
    }

    if (!/^09\d{9}$/.test(contactNumber)) {
      setProfileError('Enter a valid 11-digit mobile number starting with 09.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileError('Enter a valid email address.');
      return;
    }

    if (!address.trim()) {
      setProfileError('Address is required.');
      return;
    }

    updateProfile({
      fullName,
      contactNumber,
      email,
      address,
      purok,
      householdCount,
      householdProfile,
    });

    setIsEditing(false);
    setProfileSaved(true);

    setTimeout(() => {
      setProfileSaved(false);
    }, 2500);
  };

  const handleCancelEdit = () => {
    setFullName(user?.fullName || '');
    setContactNumber(user?.contactNumber || '');
    setEmail(user?.email || '');
    setAddress(user?.address || '');
    setPurok(user?.purok || 'Purok 1');
    setHouseholdCount(user?.householdCount || 1);

    setHouseholdProfile({
      hasSeniorCitizen: user?.householdProfile?.hasSeniorCitizen || false,
      hasChild: user?.householdProfile?.hasChild || false,
      hasPWD: user?.householdProfile?.hasPWD || false,
      hasPregnantPerson: user?.householdProfile?.hasPregnantPerson || false,
    });

    setProfileError('');
    setIsEditing(false);
  };

  // ============ PASSWORD ============
  const validPassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  const handlePasswordSave = () => {
    setPasswordError('');
    setPasswordSaved(false);

    if (!currentPassword) {
      setPasswordError('Enter your current password.');
      return;
    }

    if (!validPassword(newPassword)) {
      setPasswordError(
        'New password must have 8 characters, an uppercase letter, number, and special character.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSaved(true);

    setTimeout(() => {
      setPasswordSaved(false);
    }, 2500);
  };

  // ============ NOTIFICATIONS ============
  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setPreferencesSaved(false);
  };

  const handlePreferencesSave = () => {
    setPreferencesSaved(true);

    setTimeout(() => {
      setPreferencesSaved(false);
    }, 2500);
  };

  // ============ LOGOUT ============
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const firstLetter = (user?.fullName || 'Resident').charAt(0).toUpperCase();

  return (
    <div className="px-4 pt-4 pb-28 min-h-screen bg-slate-50">
      {/* ============ HEADER ============ */}
      <div className="mb-3">
        <h1 className="text-lg font-bold text-slate-900">
          {t('settings.title')}
        </h1>

        <p className="text-[11px] text-slate-500 mt-0.5">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* ============ PROFILE SUMMARY ============ */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl p-4 text-white mb-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/20 border border-white/20 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold">{firstLetter}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[15px] font-bold truncate">
                {user?.fullName || 'Resident'}
              </p>

              {user?.accountStatus === 'Verified' && (
                <ShieldCheck className="w-4 h-4 text-white shrink-0" />
              )}
            </div>

            <p className="text-[10px] text-blue-50 mt-0.5">
              {user?.accountStatus === 'Verified'
                ? t('settings.verifiedResident')
                : user?.accountStatus || 'Resident'}
            </p>

            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-blue-100" />

              <p className="text-[10px] text-blue-50 truncate">
                {user?.purok || 'Barangay Camunatan'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setOpenSection('profile');
              setIsEditing(true);
            }}
            className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 hover:bg-white/30 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ============ PROFILE ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-3">
        <button
          type="button"
          onClick={() => toggleSection('profile')}
          className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UserRound className="w-4 h-4" />
          </div>

          <div className="flex-1">
            <p className="text-[13px] font-bold text-slate-900">
              {t('settings.personalHousehold')}
            </p>

            <p className="text-[9px] text-slate-400 mt-0.5">
              {t('settings.personalHouseholdHint')}
            </p>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              openSection === 'profile' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSection === 'profile' && (
          <div className="px-4 pb-4 border-t border-slate-100">
            <div className="flex items-center justify-between mt-4 mb-3">
              <p className="text-[11px] font-bold text-slate-700">
                {t('settings.residentInformation')}
              </p>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-[10px] font-bold text-blue-600"
                >
                  <Pencil className="w-3 h-3" />
                  {t('settings.edit')}
                </button>
              )}
            </div>

            {profileError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-red-700">{profileError}</p>
              </div>
            )}

            {profileSaved && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-600" />

                <p className="text-[10px] font-semibold text-green-700">
                  {t('settings.profileUpdated')}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <ProfileField
                icon={UserRound}
                label={t('settings.fullName')}
                value={fullName}
                editing={isEditing}
                onChange={setFullName}
              />

              <ProfileField
                icon={Phone}
                label={t('settings.contactNumber')}
                value={contactNumber}
                editing={isEditing}
                onChange={setContactNumber}
                type="tel"
              />

              <ProfileField
                icon={Mail}
                label={t('settings.email')}
                value={email}
                editing={isEditing}
                onChange={setEmail}
                type="email"
              />

              <ProfileField
                icon={MapPin}
                label={t('settings.address')}
                value={address}
                editing={isEditing}
                onChange={setAddress}
              />

              <div>
                <label className="text-[9px] font-semibold text-slate-400">
                  {t('settings.purok')}
                </label>

                {isEditing ? (
                  <select
                    value={purok}
                    onChange={(e) => setPurok(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  >
                    {purokOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[12px] font-semibold text-slate-800 mt-1">
                    {purok}
                  </p>
                )}
              </div>
            </div>

            {/* ============ HOME LOCATION ============ */}
            <div className="mt-4">
              <p className="text-[11px] font-bold text-slate-700 mb-2">
                {t('settings.homeLocation')}
              </p>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPinned className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-blue-800">
                    {t('settings.savedHomeLocation')}
                  </p>

                  <p className="text-[9px] text-blue-600 mt-0.5 truncate">
                    {address || purok}
                  </p>

                  <p className="text-[8px] text-slate-400 mt-0.5">
                    {t('settings.mapLater')}
                  </p>
                </div>
              </div>
            </div>

            {/* ============ HOUSEHOLD ============ */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-teal-500" />

                <p className="text-[11px] font-bold text-slate-700">
                  {t('settings.householdInformation')}
                </p>
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                <div>
                  <p className="text-[10px] font-semibold text-slate-700">
                    {t('settings.householdMembers')}
                  </p>

                  <p className="text-[9px] text-slate-400 mt-0.5">
                    {t('settings.householdMembersHint')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() =>
                        setHouseholdCount((prev) => Math.max(1, prev - 1))
                      }
                      className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3 text-slate-500" />
                    </button>
                  )}

                  <span className="w-7 text-center text-[13px] font-bold text-slate-900">
                    {householdCount}
                  </span>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setHouseholdCount((prev) => prev + 1)}
                      className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3 text-slate-500" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[9px] font-semibold text-slate-400 mt-3 mb-2">
                {t('settings.householdProfile')}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <HouseholdOption
                  label={t('settings.seniorCitizen')}
                  selected={householdProfile.hasSeniorCitizen}
                  disabled={!isEditing}
                  onClick={() => toggleHousehold('hasSeniorCitizen')}
                />

                <HouseholdOption
                  label={t('settings.child')}
                  selected={householdProfile.hasChild}
                  disabled={!isEditing}
                  onClick={() => toggleHousehold('hasChild')}
                />

                <HouseholdOption
                  label={t('settings.pwd')}
                  selected={householdProfile.hasPWD}
                  disabled={!isEditing}
                  onClick={() => toggleHousehold('hasPWD')}
                />

                <HouseholdOption
                  label={t('settings.pregnantPerson')}
                  selected={householdProfile.hasPregnantPerson}
                  disabled={!isEditing}
                  onClick={() => toggleHousehold('hasPregnantPerson')}
                />
              </div>
            </div>

            {isEditing && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-[11px] font-semibold hover:bg-slate-50"
                >
                  {t('settings.cancel')}
                </button>

                <button
                  type="button"
                  onClick={handleProfileSave}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white text-[11px] font-bold flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {t('settings.saveChanges')}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ============ SECURITY ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-3">
        <button
          type="button"
          onClick={() => toggleSection('security')}
          className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <LockKeyhole className="w-4 h-4" />
          </div>

          <div className="flex-1">
            <p className="text-[13px] font-bold text-slate-900">
              {t('settings.security')}
            </p>

            <p className="text-[9px] text-slate-400 mt-0.5">
              {t('settings.securityHint')}
            </p>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              openSection === 'security' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSection === 'security' && (
          <div className="px-4 pb-4 border-t border-slate-100">
            <div className="mt-4 space-y-3">
              {passwordError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-700">{passwordError}</p>
                </div>
              )}

              {passwordSaved && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />

                  <p className="text-[10px] font-semibold text-green-700">
                    {t('settings.passwordUpdated')}
                  </p>
                </div>
              )}

              <PasswordField
                label={t('settings.currentPassword')}
                value={currentPassword}
                onChange={setCurrentPassword}
                show={showPasswords}
              />

              <PasswordField
                label={t('settings.newPassword')}
                value={newPassword}
                onChange={setNewPassword}
                show={showPasswords}
              />

              <PasswordField
                label={t('settings.confirmPassword')}
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showPasswords}
              />

              <button
                type="button"
                onClick={() => setShowPasswords((prev) => !prev)}
                className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500"
              >
                {showPasswords ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}

                {showPasswords
                  ? t('settings.hidePasswords')
                  : t('settings.showPasswords')}
              </button>

              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[9px] font-bold text-slate-500">
                  {t('settings.passwordRequirements')}
                </p>

                <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">
                  {t('settings.passwordRequirementsText')}
                </p>
              </div>

              <button
                type="button"
                onClick={handlePasswordSave}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-[11px] font-bold"
              >
                {t('settings.changePassword')}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ============ PREFERENCES ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-3">
        <button
          type="button"
          onClick={() => toggleSection('preferences')}
          className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>

          <div className="flex-1">
            <p className="text-[13px] font-bold text-slate-900">
              {t('settings.preferences')}
            </p>

            <p className="text-[9px] text-slate-400 mt-0.5">
              {t('settings.preferencesHint')}
            </p>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              openSection === 'preferences' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSection === 'preferences' && (
          <div className="px-4 pb-4 border-t border-slate-100">
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Languages className="w-4 h-4 text-blue-500" />

                <p className="text-[11px] font-bold text-slate-700">
                  {t('settings.language')}
                </p>
              </div>

              <select
                value={i18n.resolvedLanguage || i18n.language || 'en'}
                onChange={handleLanguageChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              >
                <option value="en">{t('settings.languages.en')}</option>
                <option value="tl">{t('settings.languages.tl')}</option>
                <option value="ilo">{t('settings.languages.ilo')}</option>
                <option value="ibg">{t('settings.languages.ibg')}</option>
              </select>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-700 mb-2.5">
                {t('settings.notifications')}
              </p>

              <div className="space-y-2">
                <NotificationOption
                  icon={FileText}
                  title={t('settings.reportUpdates')}
                  description={t('settings.reportUpdatesHint')}
                  enabled={notifications.reportUpdates}
                  onClick={() => toggleNotification('reportUpdates')}
                />

                <NotificationOption
                  icon={Megaphone}
                  title={t('settings.announcements')}
                  description={t('settings.announcementsHint')}
                  enabled={notifications.announcements}
                  onClick={() => toggleNotification('announcements')}
                />

                <NotificationOption
                  icon={Siren}
                  title={t('settings.emergencyAlerts')}
                  description={t('settings.emergencyAlertsHint')}
                  enabled={notifications.emergencyAlerts}
                  onClick={() => toggleNotification('emergencyAlerts')}
                  important
                />
              </div>
            </div>

            {preferencesSaved && (
              <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" />

                <p className="text-[10px] font-semibold text-green-700">
                  {t('settings.preferencesSaved')}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handlePreferencesSave}
              className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white text-[11px] font-bold flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {t('settings.savePreferences')}
            </button>
          </div>
        )}
      </section>

      {/* ============ PRIVACY ============ */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-3">
        <button
          type="button"
          onClick={() => toggleSection('privacy')}
          className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>

          <div className="flex-1">
            <p className="text-[13px] font-bold text-slate-900">
              {t('settings.privacy')}
            </p>

            <p className="text-[9px] text-slate-400 mt-0.5">
              {t('settings.privacyHint')}
            </p>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              openSection === 'privacy' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSection === 'privacy' && (
          <div className="px-4 pb-4 border-t border-slate-100">
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />

                <div>
                  <p className="text-[10px] font-bold text-blue-800">
                    {t('settings.residentDataPrivacy')}
                  </p>

                  <p className="text-[9px] text-blue-700 mt-1 leading-relaxed">
                    {t('settings.privacyMessage')}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[9px] text-slate-500 mt-3 leading-relaxed">
              {t('settings.privacyDetails')}
            </p>
          </div>
        )}
      </section>

      {/* ============ SIGN OUT ============ */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        {t('settings.signOut')}
      </button>

      <p className="text-[9px] text-slate-400 text-center mt-2">
        {t('settings.residentId')}: {user?.id || 'Not available'}
      </p>
    </div>
  );
}

// ============ PROFILE FIELD ============
function ProfileField({
  icon: Icon,
  label,
  value,
  editing,
  onChange,
  type = 'text',
}) {
  return (
    <div>
      <label className="text-[9px] font-semibold text-slate-400">
        {label}
      </label>

      {editing ? (
        <div className="relative mt-1">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />

          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[11px] text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-1">
          <Icon className="w-3.5 h-3.5 text-slate-400" />

          <p className="text-[12px] font-semibold text-slate-800 break-words">
            {value || 'Not provided'}
          </p>
        </div>
      )}
    </div>
  );
}

// ============ HOUSEHOLD OPTION ============
function HouseholdOption({
  label,
  selected,
  disabled,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2.5 rounded-xl border text-[10px] font-semibold text-left transition-all ${
        selected
          ? 'bg-teal-50 border-teal-300 text-teal-700'
          : 'bg-white border-slate-200 text-slate-500'
      } ${disabled ? 'cursor-default' : 'hover:border-teal-300'}`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
            selected
              ? 'bg-teal-500 border-teal-500'
              : 'border-slate-300'
          }`}
        >
          {selected && (
            <CheckCircle2 className="w-3 h-3 text-white" />
          )}
        </div>

        {label}
      </div>
    </button>
  );
}

// ============ PASSWORD FIELD ============
function PasswordField({
  label,
  value,
  onChange,
  show,
}) {
  return (
    <div>
      <label className="block text-[9px] font-semibold text-slate-500 mb-1">
        {label}
      </label>

      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

// ============ NOTIFICATION OPTION ============
function NotificationOption({
  icon: Icon,
  title,
  description,
  enabled,
  onClick,
  important = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-left"
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          important
            ? 'bg-red-100 text-red-600'
            : 'bg-blue-100 text-blue-600'
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1">
        <p className="text-[11px] font-bold text-slate-800">
          {title}
        </p>

        <p className="text-[9px] text-slate-400 mt-0.5">
          {description}
        </p>
      </div>

      <div
        className={`w-10 h-5 rounded-full relative transition-colors ${
          enabled ? 'bg-teal-500' : 'bg-slate-300'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
            enabled ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </div>
    </button>
  );
}