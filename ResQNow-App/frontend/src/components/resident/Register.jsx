// src/components/resident/Register.jsx
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Accessibility,
  AlertCircle,
  Baby,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartPulse,
  Home,
  Loader2,
  Lock,
  Mail,
  Phone,
  PersonStanding,
  ShieldCheck,
  User,
  UserRound,
  Users,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { reverseGeocode, searchAddress } from '../../services/geocodeService';
import { purokOptions } from '../../data/mockData';
import barangayPhoto from '../../assets/barangay/barangay-camunatan.jpg';

// The map (Leaflet) is only needed on this screen; load it on demand.
const LocationPicker = lazy(() => import('../common/LocationPicker'));

// ============ CONSTANTS ============

const PHONE_PATTERN = /^(09|\+639)\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM = {
  fullName: '',
  phoneNumber: '',
  email: '',
  address: '',
  purok: '',
  householdCount: '',
  hasSeniorCitizen: false,
  hasChild: false,
  hasPWD: false,
  hasPregnantPerson: false,
  emergencyContactName: '',
  emergencyContactNumber: '',
  password: '',
  confirmPassword: '',
  agreedToTerms: false,
};

const FIELDS_TO_VALIDATE = [
  'fullName',
  'phoneNumber',
  'email',
  'address',
  'purok',
  'householdCount',
  'emergencyContactNumber',
  'password',
  'confirmPassword',
];

// ============ PAGE ============

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation();

  const [form, setForm] = useState(INITIAL_FORM);
  const [homeLocation, setHomeLocation] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const submitting = useRef(false);

  // Address text <-> map pin.
  const [addressNote, setAddressNote] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const addressRef = useRef('');
  const purokRef = useRef('');
  const addressAuto = useRef(false); // address text was filled in from the pin
  const skipLookup = useRef(false); // don't geocode text we just filled in
  const pinLookup = useRef(null);

  useEffect(() => {
    addressRef.current = form.address;
    purokRef.current = form.purok;
  });

  // Typing an address moves the pin (debounced; Nominatim allows ~1 req/s).
  useEffect(() => {
    if (skipLookup.current) {
      skipLookup.current = false;
      return undefined;
    }

    const query = form.address.trim();

    if (query.length < 8) return undefined;

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setAddressNote('searching');

      try {
        const hit = await searchAddress(
          `${query}, Ilagan, Isabela`,
          controller.signal
        );

        if (!hit) {
          setAddressNote('notfound');
          return;
        }

        setHomeLocation({
          latitude: hit.latitude,
          longitude: hit.longitude,
          focus: true,
        });
        setSuggestion('');
        setAddressNote('found');

        const purok = /purok\s*([1-3])/i.exec(query);

        if (purok && !purokRef.current) {
          setForm((previous) => ({ ...previous, purok: `Purok ${purok[1]}` }));
        }
      } catch (lookupError) {
        if (lookupError.name !== 'AbortError') setAddressNote('');
      }
    }, 900);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [form.address]);

  // Moving the pin fills in the address.
  async function handlePin(next) {
    setHomeLocation(next);
    pinLookup.current?.abort();

    if (!next) {
      setAddressNote('');
      setSuggestion('');
      return;
    }

    const controller = new AbortController();
    pinLookup.current = controller;

    try {
      const label = await reverseGeocode(
        next.latitude,
        next.longitude,
        controller.signal
      );

      if (!label) return;

      const current = addressRef.current.trim();

      if (!current || addressAuto.current) {
        if (label !== addressRef.current) skipLookup.current = true;

        addressAuto.current = true;
        update('address', label);
        setSuggestion('');
        setAddressNote('frompin');
      } else if (label !== current) {
        setSuggestion(label);
      }

      const purok = /purok\s*([1-3])/i.exec(label);

      if (purok && !purokRef.current) {
        update('purok', `Purok ${purok[1]}`);
      }
    } catch (lookupError) {
      if (lookupError.name !== 'AbortError') setAddressNote('');
    }
  }

  function useSuggestedAddress() {
    skipLookup.current = suggestion !== form.address;
    addressAuto.current = true;
    update('address', suggestion);
    setSuggestion('');
    setAddressNote('frompin');
  }

  // ---------- validation ----------

  function validate(name, value, values = form) {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return t('register.fullNameRequired');
        return value.trim().length < 2 ? t('register.nameTooShort') : '';

      case 'phoneNumber': {
        const number = value.replace(/[\s-]/g, '');
        if (!number) return t('register.contactRequired');
        return PHONE_PATTERN.test(number) ? '' : t('register.invalidPhone');
      }

      case 'email':
        if (!value.trim()) return t('register.emailRequired');
        return EMAIL_PATTERN.test(value) ? '' : t('register.invalidEmail');

      case 'address':
        return value.trim() ? '' : t('register.addressRequired');

      case 'purok':
        return value ? '' : t('register.purokRequired');

      case 'householdCount':
        if (!value) return '';
        return Number(value) >= 1 && Number(value) <= 100
          ? ''
          : t('register.householdInvalid', 'Enter a number from 1 to 100');

      case 'emergencyContactNumber': {
        const number = value.replace(/[\s-]/g, '');
        if (!number) return '';
        return PHONE_PATTERN.test(number) ? '' : t('register.invalidPhone');
      }

      case 'password':
        if (!value) return t('register.passwordRequired');
        if (value.length < 8) return t('register.passwordLength');
        if (!/[a-z]/.test(value)) return t('register.passwordLowercase');
        if (!/[A-Z]/.test(value)) return t('register.passwordUppercase');
        if (!/[0-9]/.test(value)) return t('register.passwordNumber');
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          return t('register.passwordSpecial');
        }
        return '';

      case 'confirmPassword':
        if (!value) return t('register.confirmRequired');
        return value === values.password ? '' : t('register.passwordsDontMatch');

      default:
        return '';
    }
  }

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: '' }));
    setFormError('');
  }

  function blur(field) {
    if (!FIELDS_TO_VALIDATE.includes(field)) return;

    setErrors((previous) => ({
      ...previous,
      [field]: validate(field, form[field]),
    }));
  }

  // ---------- password strength ----------

  const checks = useMemo(
    () => [
      { passed: form.password.length >= 8, label: t('register.atLeast8') },
      { passed: /[A-Z]/.test(form.password), label: t('register.uppercaseLetter') },
      { passed: /[a-z]/.test(form.password), label: t('register.lowercaseLetter') },
      { passed: /[0-9]/.test(form.password), label: t('register.oneNumber') },
      {
        passed: /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
        label: t('register.specialCharacter'),
      },
    ],
    [form.password, t]
  );

  const score = checks.filter((check) => check.passed).length;
  const strengthLabels = [
    t('register.veryWeak'),
    t('register.weak'),
    t('register.fair'),
    t('register.good'),
    t('register.strong'),
    t('register.veryStrong'),
  ];
  const strengthColor =
    score <= 1 ? 'bg-[#D92D20]' : score <= 3 ? 'bg-[#F79009]' : 'bg-[#16A34A]';

  // ---------- submit ----------

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting.current) return;

    const nextErrors = Object.fromEntries(
      FIELDS_TO_VALIDATE.map((field) => [field, validate(field, form[field])])
    );

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      setFormError(t('register.fixFields'));
      document
        .querySelector('[aria-invalid="true"]')
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    if (!form.agreedToTerms) {
      setFormError(t('register.confirmInfoError'));
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);
    setFormError('');

    try {
      await register({
        fullName: form.fullName.trim(),
        contactNumber: form.phoneNumber.replace(/[\s-]/g, ''),
        email: form.email.trim().toLowerCase(),
        address: form.address.trim(),
        purok: form.purok,
        password: form.password,
        password_confirmation: form.confirmPassword,
        householdCount: form.householdCount ? Number(form.householdCount) : 1,
        householdProfile: {
          hasSeniorCitizen: form.hasSeniorCitizen,
          hasChild: form.hasChild,
          hasPWD: form.hasPWD,
          hasPregnantPerson: form.hasPregnantPerson,
        },
        emergencyContactName: form.emergencyContactName.trim() || undefined,
        emergencyContactNumber:
          form.emergencyContactNumber.replace(/[\s-]/g, '') || undefined,
        homeLatitude: homeLocation?.latitude,
        homeLongitude: homeLocation?.longitude,
      });

      setIsSuccess(true);
    } catch (registerError) {
      const backend = registerError?.errors || {};

      setErrors({
        fullName: backend.fullName?.[0],
        phoneNumber: backend.contactNumber?.[0],
        email: backend.email?.[0],
        address: backend.address?.[0],
        purok: backend.purok?.[0],
        householdCount: backend.householdCount?.[0],
        emergencyContactNumber: backend.emergencyContactNumber?.[0],
        password: backend.password?.[0],
        confirmPassword: backend.password_confirmation?.[0],
      });

      setFormError(registerError?.message || t('register.fixFields'));
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return <SuccessScreen onContinue={() => navigate('/login')} t={t} />;
  }

  const householdOptions = [
    { key: 'hasSeniorCitizen', label: t('register.seniorCitizen'), icon: PersonStanding },
    { key: 'hasChild', label: t('register.child'), icon: Baby },
    { key: 'hasPWD', label: t('register.pwd'), icon: Accessibility },
    { key: 'hasPregnantPerson', label: t('register.pregnantPerson'), icon: HeartPulse },
  ];

  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <Aside t={t} />

      <main className="px-5 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-xl">
          <p className="mb-8 text-lg font-bold tracking-tight text-[#101C2E] lg:hidden">
            ResQNow
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-[#101C2E]">
            {t('register.createAccount')}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            {t('register.registerMessage')}
          </p>

          {formError && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-md border border-[#FECDCA] bg-[#FEF3F2] px-3.5 py-3 text-sm text-[#B42318]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-10">
            {/* 1. PERSONAL */}
            <Section
              number={1}
              title={t('register.personalInformation')}
              description={t(
                'register.personalHint',
                'Use your real name. Barangay personnel match it against household records.'
              )}
            >
              <Field
                id="fullName"
                label={t('register.fullName')}
                required
                error={errors.fullName}
              >
                <TextInput
                  id="fullName"
                  icon={User}
                  value={form.fullName}
                  onChange={(value) => update('fullName', value)}
                  onBlur={() => blur('fullName')}
                  placeholder={t('register.namePlaceholder')}
                  error={errors.fullName}
                  autoComplete="name"
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="phoneNumber"
                  label={t('register.contactNumber')}
                  required
                  error={errors.phoneNumber}
                >
                  <TextInput
                    id="phoneNumber"
                    icon={Phone}
                    type="tel"
                    inputMode="tel"
                    value={form.phoneNumber}
                    onChange={(value) => update('phoneNumber', value)}
                    onBlur={() => blur('phoneNumber')}
                    placeholder={t('register.phonePlaceholder')}
                    error={errors.phoneNumber}
                    autoComplete="tel"
                  />
                </Field>

                <Field
                  id="email"
                  label={t('register.emailAddress')}
                  required
                  error={errors.email}
                >
                  <TextInput
                    id="email"
                    icon={Mail}
                    type="email"
                    inputMode="email"
                    value={form.email}
                    onChange={(value) => update('email', value)}
                    onBlur={() => blur('email')}
                    placeholder={t('register.emailPlaceholder')}
                    error={errors.email}
                    autoComplete="email"
                  />
                </Field>
              </div>
            </Section>

            {/* 2. ADDRESS + MAP */}
            <Section
              number={2}
              title={t('register.homeLocation')}
              description={t(
                'register.locationHint',
                'Your pin helps responders find your home quickly. You can adjust it later.'
              )}
            >
              <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,11rem)]">
                <Field
                  id="address"
                  label={t('register.address')}
                  required
                  error={errors.address}
                >
                  <TextInput
                    id="address"
                    icon={Home}
                    value={form.address}
                    onChange={(value) => {
                      addressAuto.current = false;
                      setSuggestion('');
                      update('address', value);
                    }}
                    onBlur={() => blur('address')}
                    placeholder={t('register.addressPlaceholder')}
                    error={errors.address}
                    autoComplete="street-address"
                  />

                  <AddressNote
                    note={addressNote}
                    suggestion={suggestion}
                    onUseSuggestion={useSuggestedAddress}
                    t={t}
                  />
                </Field>

                <Field
                  id="purok"
                  label={t('register.purok')}
                  required
                  error={errors.purok}
                >
                  <select
                    id="purok"
                    value={form.purok}
                    onChange={(event) => update('purok', event.target.value)}
                    onBlur={() => blur('purok')}
                    aria-invalid={Boolean(errors.purok)}
                    className={`${inputBase} px-3 ${
                      errors.purok ? inputError : inputIdle
                    } ${form.purok ? 'text-[#101C2E]' : 'text-slate-400'}`}
                  >
                    <option value="">{t('register.selectPurok')}</option>
                    {purokOptions.map((purok) => (
                      <option key={purok} value={purok}>
                        {purok}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-700">
                  {t('register.homeLocationPin')}{' '}
                  <span className="font-normal text-slate-400">
                    ({t('register.optional', 'optional')})
                  </span>
                </p>

                <Suspense
                  fallback={
                    <div className="flex h-64 items-center justify-center rounded-md border border-slate-300 bg-slate-50 text-sm text-slate-400 sm:h-72">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('register.loadingMap', 'Loading map…')}
                    </div>
                  }
                >
                  <LocationPicker
                    value={homeLocation}
                    onChange={handlePin}
                    labels={{
                      locate: t('register.useMyLocation', 'Use my current location'),
                      locating: t('register.locating', 'Finding you…'),
                      remove: t('register.removePin', 'Remove pin'),
                      hint: t(
                        'register.mapHint',
                        'Tap the map to drop a pin, then drag it to your exact home.'
                      ),
                      unavailable: t(
                        'register.locationUnavailable',
                        'Location is not available on this device.'
                      ),
                      denied: t(
                        'register.locationDenied',
                        'We could not get your location. Tap the map to place the pin instead.'
                      ),
                    }}
                  />
                </Suspense>
              </div>
            </Section>

            {/* 3. HOUSEHOLD */}
            <Section
              number={3}
              title={t('register.householdInformation')}
              description={t(
                'register.householdHint',
                'Helps the barangay prepare the right assistance during an emergency.'
              )}
            >
              <div className="grid gap-5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
                <Field
                  id="householdCount"
                  label={t('register.householdCount')}
                  error={errors.householdCount}
                >
                  <TextInput
                    id="householdCount"
                    icon={Users}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="100"
                    value={form.householdCount}
                    onChange={(value) => update('householdCount', value)}
                    onBlur={() => blur('householdCount')}
                    placeholder="1"
                    error={errors.householdCount}
                  />
                </Field>
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-slate-700">
                  {t('register.householdProfile', 'Anyone in your household who is…')}
                </legend>

                <div className="grid grid-cols-2 gap-2.5">
                  {householdOptions.map(({ key, label, icon: Icon }) => {
                    const checked = form[key];

                    return (
                      <label
                        key={key}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-sm transition-colors ${
                          checked
                            ? 'border-[#1F5FA6] bg-[#EEF4FA] text-[#173f73]'
                            : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => update(key, event.target.checked)}
                          className="sr-only"
                        />
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{label}</span>
                        {checked && <Check className="h-4 w-4 shrink-0" />}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </Section>

            {/* 4. EMERGENCY CONTACT */}
            <Section
              number={4}
              title={t('register.emergencyContact', 'Emergency contact')}
              description={t(
                'register.emergencyContactHint',
                'Someone we can call if we cannot reach you. Optional, but recommended.'
              )}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="emergencyContactName" label={t('register.contactName', 'Contact name')}>
                  <TextInput
                    id="emergencyContactName"
                    icon={UserRound}
                    value={form.emergencyContactName}
                    onChange={(value) => update('emergencyContactName', value)}
                    placeholder={t('register.contactNamePlaceholder', 'Family member or neighbor')}
                    autoComplete="off"
                    maxLength={150}
                  />
                </Field>

                <Field
                  id="emergencyContactNumber"
                  label={t('register.contactNumber')}
                  error={errors.emergencyContactNumber}
                >
                  <TextInput
                    id="emergencyContactNumber"
                    icon={Phone}
                    type="tel"
                    inputMode="tel"
                    value={form.emergencyContactNumber}
                    onChange={(value) => update('emergencyContactNumber', value)}
                    onBlur={() => blur('emergencyContactNumber')}
                    placeholder={t('register.phonePlaceholder')}
                    error={errors.emergencyContactNumber}
                    autoComplete="off"
                  />
                </Field>
              </div>
            </Section>

            {/* 5. ACCOUNT */}
            <Section
              number={5}
              title={t('register.accountCredentials')}
              description={t(
                'register.accountHint',
                'You will sign in with your email and this password.'
              )}
            >
              <Field
                id="password"
                label={t('register.password')}
                required
                error={errors.password}
              >
                <TextInput
                  id="password"
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(value) => update('password', value)}
                  onBlur={() => blur('password')}
                  placeholder={t('register.passwordPlaceholder')}
                  error={errors.password}
                  autoComplete="new-password"
                  trailing={
                    <VisibilityToggle
                      visible={showPassword}
                      onToggle={() => setShowPassword((value) => !value)}
                      show={t('register.showPassword')}
                      hide={t('register.hidePassword')}
                    />
                  }
                />

                {form.password && (
                  <div className="mt-3">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                          style={{ width: `${(score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="w-20 text-right text-xs font-medium text-slate-500">
                        {strengthLabels[score]}
                      </span>
                    </div>

                    <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1">
                      {checks.map((check) => (
                        <li
                          key={check.label}
                          className={`flex items-center gap-1.5 text-xs ${
                            check.passed ? 'text-[#16A34A]' : 'text-slate-400'
                          }`}
                        >
                          <Check
                            className={`h-3 w-3 ${check.passed ? '' : 'opacity-30'}`}
                            strokeWidth={3}
                          />
                          {check.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Field>

              <Field
                id="confirmPassword"
                label={t('register.confirmPassword')}
                required
                error={errors.confirmPassword}
              >
                <TextInput
                  id="confirmPassword"
                  icon={Lock}
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(value) => update('confirmPassword', value)}
                  onBlur={() => blur('confirmPassword')}
                  placeholder={t('register.confirmPasswordPlaceholder')}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                  trailing={
                    <VisibilityToggle
                      visible={showConfirm}
                      onToggle={() => setShowConfirm((value) => !value)}
                      show={t('register.showPassword')}
                      hide={t('register.hidePassword')}
                    />
                  }
                />
              </Field>
            </Section>

            {/* SUBMIT */}
            <div className="space-y-5 border-t border-slate-200 pt-6">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.agreedToTerms}
                  onChange={(event) => update('agreedToTerms', event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#1F5FA6] focus:ring-[#1F5FA6] focus:ring-offset-0"
                />
                <span className="text-sm leading-relaxed text-slate-600">
                  {t('register.confirmInformation')}
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1F5FA6] text-sm font-semibold text-white transition-colors hover:bg-[#174A86] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('register.creating')}
                  </>
                ) : (
                  t('register.createAccount')
                )}
              </button>

              <p className="text-center text-sm text-slate-500">
                {t('register.haveAccount', 'Already registered?')}{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[#1F5FA6] hover:underline"
                >
                  {t('login.signIn')}
                </Link>
              </p>

              <p className="border-t border-slate-200 pt-5 text-xs leading-relaxed text-slate-500">
                {t(
                  'register.privacy',
                  'Your details are used only by barangay personnel to verify your account and respond to your reports. They are never shown publicly.'
                )}
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// ============ ADDRESS <-> PIN STATUS ============

function AddressNote({ note, suggestion, onUseSuggestion, t }) {
  const messages = {
    searching: t('register.addressSearching', 'Looking for this address on the map…'),
    found: t('register.addressFound', 'Pin moved to match your address. Drag it to fine-tune.'),
    notfound: t(
      'register.addressNotFound',
      'We could not find that address. Tap the map to place your pin.'
    ),
    frompin: t('register.addressFromPin', 'Address filled in from your pin. You can edit it.'),
  };

  return (
    <div aria-live="polite" className="mt-1.5 space-y-1">
      {messages[note] && (
        <p
          className={`flex items-center gap-1.5 text-xs ${
            note === 'notfound' ? 'text-[#B54708]' : 'text-slate-500'
          }`}
        >
          {note === 'searching' && <Loader2 className="h-3 w-3 animate-spin" />}
          {messages[note]}
        </p>
      )}

      {suggestion && (
        <button
          type="button"
          onClick={onUseSuggestion}
          className="text-left text-xs text-[#1F5FA6] hover:underline"
        >
          {t('register.useSuggestion', 'Use this address from your pin:')}{' '}
          <span className="font-semibold">{suggestion}</span>
        </button>
      )}
    </div>
  );
}

// ============ LEFT PANEL ============

function Aside({ t }) {
  const steps = [
    {
      title: t('register.stepCreate', 'Create your account'),
      text: t('register.stepCreateText', 'Add your household details and pin your home on the map.'),
    },
    {
      title: t('register.stepVerify', 'Barangay verification'),
      text: t('register.stepVerifyText', 'Barangay personnel review your details before you can sign in.'),
    },
    {
      title: t('register.stepReport', 'Start reporting'),
      text: t('register.stepReportText', 'Send an SOS or a report and follow every update in real time.'),
    },
  ];

  return (
    <aside className="relative hidden overflow-hidden bg-[#101C2E] text-white lg:block">
      <div className="sticky top-0 flex h-dvh flex-col justify-between">
        <img
          src={barangayPhoto}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[#101C2E]/75" />

        <div className="relative z-10 flex items-center gap-2.5 p-12">
          <ShieldCheck className="h-6 w-6" strokeWidth={1.75} />
          <p className="text-xl font-bold tracking-tight">ResQNow</p>
        </div>

        <div className="relative z-10 max-w-md p-12">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            {t('register.heroTitle', 'Your barangay’s emergency response, in your pocket.')}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            {t(
              'register.heroText',
              'Register once to report incidents, send an SOS and receive announcements from Barangay Camunatan.'
            )}
          </p>

          <ol className="mt-10 space-y-6">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/30 text-xs font-semibold">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/60">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="relative z-10 p-12 text-xs text-white/50">
          Barangay Camunatan · City of Ilagan
        </p>
      </div>
    </aside>
  );
}

// ============ SUCCESS ============

function SuccessScreen({ onContinue, t }) {
  const steps = [
    { label: t('register.stepCreate', 'Create your account'), state: 'done' },
    { label: t('register.stepVerify', 'Barangay verification'), state: 'current' },
    { label: t('register.stepReport', 'Start reporting'), state: 'todo' },
  ];

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#F3F5F8] px-5 py-10">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF3]">
          <CheckCircle2 className="h-6 w-6 text-[#16A34A]" />
        </div>

        <h2 className="mt-5 text-xl font-semibold tracking-tight text-[#101C2E]">
          {t('register.accountCreated')}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          {t('register.accountCreatedMessage')}
        </p>

        <ol className="mt-6 space-y-3 border-t border-slate-200 pt-6">
          {steps.map((step) => (
            <li key={step.label} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                  step.state === 'done'
                    ? 'bg-[#16A34A] text-white'
                    : step.state === 'current'
                    ? 'border-2 border-[#1F5FA6] text-[#1F5FA6]'
                    : 'border border-slate-300 text-slate-300'
                }`}
              >
                {step.state === 'done' ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : ''}
              </span>
              <span
                className={
                  step.state === 'todo' ? 'text-slate-400' : 'font-medium text-[#101C2E]'
                }
              >
                {step.label}
              </span>
              {step.state === 'current' && (
                <span className="ml-auto rounded-full bg-[#FEF0C7] px-2 py-0.5 text-[11px] font-medium text-[#B54708]">
                  {t('register.pendingVerification')}
                </span>
              )}
            </li>
          ))}
        </ol>

        <p className="mt-6 text-sm leading-relaxed text-slate-500">
          {t('register.verificationNote')}
        </p>

        <button
          type="button"
          onClick={onContinue}
          className="mt-7 flex h-11 w-full items-center justify-center rounded-md bg-[#1F5FA6] text-sm font-semibold text-white transition-colors hover:bg-[#174A86]"
        >
          {t('register.goToLogin')}
        </button>
      </div>
    </div>
  );
}

// ============ FORM PIECES ============

const inputBase =
  'h-11 w-full rounded-md border bg-white text-sm outline-none transition-colors placeholder:text-slate-400';
const inputIdle =
  'border-slate-300 focus:border-[#1F5FA6] focus:ring-2 focus:ring-[#1F5FA6]/15';
const inputError =
  'border-[#FDA29B] focus:border-[#D92D20] focus:ring-2 focus:ring-[#D92D20]/15';

function Section({ number, title, description, children }) {
  return (
    <section className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF4FA] text-xs font-semibold text-[#1F5FA6]">
          {number}
        </span>
        <div>
          <h3 className="text-base font-semibold text-[#101C2E]">{title}</h3>
          {description && (
            <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-5 sm:pl-9">{children}</div>
    </section>
  );
}

function Field({ id, label, required, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-[#D92D20]">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-[#D92D20]">
          {error}
        </p>
      )}
    </div>
  );
}

function TextInput({
  id,
  icon: Icon,
  value,
  onChange,
  onBlur,
  error,
  trailing,
  type = 'text',
  ...rest
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputBase} ${Icon ? 'pl-9' : 'pl-3'} ${trailing ? 'pr-11' : 'pr-3'} ${
          error ? inputError : inputIdle
        }`}
        {...rest}
      />
      {trailing}
    </div>
  );
}

function VisibilityToggle({ visible, onToggle, show, hide }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? hide : show}
      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-2 text-slate-400 transition-colors hover:text-slate-600"
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}
