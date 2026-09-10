// src/components/resident/Register.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Shield,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Check,
  AlertCircle,
  Loader2,
  Home,
  PersonStanding,
  Baby,
  Accessibility,
  HeartPulse,
  CheckCircle,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { purokOptions } from '../../data/mockData';
import barangayPhoto from '../../assets/barangay/barangay-camunatan.jpg';

// ============ INITIAL FORM ============
// Starting values for the registration form
const INITIAL_FORM = {
  fullName: '',
  phoneNumber: '',
  address: '',
  purok: '',
  email: '',
  password: '',
  confirmPassword: '',
  householdCount: '',
  hasSeniorCitizen: false,
  hasChild: false,
  hasPWD: false,
  hasPregnantPerson: false,
  agreedToTerms: false,
};

// ============ REGISTER PAGE ============
// Account creation page for residents
export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const nameRef = useRef(null);

  // Registration form
  const [form, setForm] = useState(INITIAL_FORM);

  // Password options
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form validation and messages
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-focus the name input
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // ============ UPDATE FIELD ============
  // Update a form field and clear its error
  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [field]: '',
    }));

    setError('');
  };

  // ============ VALIDATION ============
  // Validate a single field
  const validate = (name, value) => {
    switch (name) {
      case 'fullName':
        return !value.trim()
          ? 'Full name is required'
          : value.trim().length < 2
          ? 'Name is too short'
          : '';

      case 'email':
        return !value.trim()
          ? 'Email is required'
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? 'Please enter a valid email'
          : '';

      case 'phoneNumber': {
        const cleanNumber = value.replace(/\s/g, '');

        if (!cleanNumber) {
          return 'Contact number is required';
        }

        if (!/^(09|\+639)\d{9}$/.test(cleanNumber)) {
          return 'Enter a valid PH mobile number (09XX XXX XXXX)';
        }

        return '';
      }

      case 'address':
        return !value.trim()
          ? 'Address is required'
          : '';

      case 'purok':
        return !value
          ? 'Please select your purok'
          : '';

      case 'password': {
        if (!value) {
          return 'Password is required';
        }

        if (value.length < 8) {
          return 'At least 8 characters';
        }

        if (!/[a-z]/.test(value)) {
          return 'Needs a lowercase letter';
        }

        if (!/[A-Z]/.test(value)) {
          return 'Needs an uppercase letter';
        }

        if (!/[0-9]/.test(value)) {
          return 'Needs a number';
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          return 'Needs a special character';
        }

        return '';
      }

      case 'confirmPassword':
        return !value
          ? 'Please confirm your password'
          : value !== form.password
          ? 'Passwords do not match'
          : '';

      case 'householdCount':
        if (!value) {
          return '';
        }

        if (
          Number(value) < 1 ||
          Number(value) > 100
        ) {
          return 'Enter a valid household count';
        }

        return '';

      default:
        return '';
    }
  };

  // Validate when user leaves a field
  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [field]: validate(
        field,
        form[field]
      ),
    }));

    setFocusedField(null);
  };

  // ============ PASSWORD STRENGTH ============
  // Calculate password strength for the visual meter
  const passwordStrength = useMemo(() => {
    let score = 0;

    if (form.password.length >= 8) score++;
    if (/[a-z]/.test(form.password)) score++;
    if (/[A-Z]/.test(form.password)) score++;
    if (/[0-9]/.test(form.password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) score++;

    return {
      score,

      label: [
        'Very Weak',
        'Weak',
        'Fair',
        'Good',
        'Strong',
        'Very Strong',
      ][score],

      color: [
        'bg-resqnow-critical',
        'bg-resqnow-critical',
        'bg-resqnow-pending',
        'bg-resqnow-caution',
        'bg-resqnow-safe',
        'bg-resqnow-safe',
      ][score],

      width: `${(score / 5) * 100}%`,
    };
  }, [form.password]);

  // ============ SUBMIT ============
  // Create the resident account through Laravel
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    const fieldsToValidate = [
      'fullName',
      'phoneNumber',
      'address',
      'purok',
      'email',
      'password',
      'confirmPassword',
      'householdCount',
    ];

    const errors = {};

    fieldsToValidate.forEach((field) => {
      const fieldError = validate(
        field,
        form[field]
      );

      if (fieldError) {
        errors[field] = fieldError;
      }
    });

    setFieldErrors(errors);

    setTouched(
      Object.fromEntries(
        fieldsToValidate.map((field) => [
          field,
          true,
        ])
      )
    );

    // Stop if form has validation errors
    if (Object.keys(errors).length > 0) {
      setError(
        'Please fix the highlighted fields before continuing.'
      );

      return;
    }

    // User must confirm information
    if (!form.agreedToTerms) {
      setError(
        'Please confirm that your information is correct.'
      );

      return;
    }

    setIsSubmitting(true);

    try {
      // Send registration data to Laravel
      await register({
        fullName: form.fullName.trim(),

        contactNumber:
          form.phoneNumber.replace(
            /\s/g,
            ''
          ),

        address: form.address.trim(),

        purok: form.purok,

        email: form.email
          .trim()
          .toLowerCase(),

        password: form.password,

        password_confirmation:
          form.confirmPassword,

        householdCount:
          form.householdCount
            ? Number(
                form.householdCount
              )
            : 1,

        householdProfile: {
          hasSeniorCitizen:
            form.hasSeniorCitizen,

          hasChild:
            form.hasChild,

          hasPWD:
            form.hasPWD,

          hasPregnantPerson:
            form.hasPregnantPerson,
        },
      });

      // Laravel registration succeeded
      setIsSuccess(true);
    } catch (registerError) {
      const backendErrors =
        registerError.errors || {};

      // Map Laravel field names
      // to our frontend field names
      const mappedErrors = {
        fullName:
          backendErrors.fullName?.[0],

        phoneNumber:
          backendErrors.contactNumber?.[0],

        address:
          backendErrors.address?.[0],

        purok:
          backendErrors.purok?.[0],

        email:
          backendErrors.email?.[0],

        password:
          backendErrors.password?.[0],

        confirmPassword:
          backendErrors
            .password_confirmation?.[0],

        householdCount:
          backendErrors
            .householdCount?.[0],
      };

      // Remove empty error values
      const cleanErrors =
        Object.fromEntries(
          Object.entries(
            mappedErrors
          ).filter(
            ([, value]) =>
              Boolean(value)
          )
        );

      setFieldErrors(cleanErrors);

      setTouched((prev) => ({
        ...prev,

        ...Object.fromEntries(
          Object.keys(
            cleanErrors
          ).map((field) => [
            field,
            true,
          ])
        ),
      }));

      setError(
        registerError.message ||
        'Unable to create your account. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============ SUCCESS SCREEN ============
  if (isSuccess) {
    return (
      <div
        className="relative min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center p-4"
        style={{
          backgroundImage:
            `url(${barangayPhoto})`,
        }}
      >
        {/* Background overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-resqnow-ivory/90 via-white/80 to-resqnow-mist/85 backdrop-blur-[2px]" />

        {/* Success card */}
        <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgba(31,29,71,0.10)] border border-white/60 px-7 sm:px-10 py-10 sm:py-12 w-full max-w-[440px] text-center">

          {/* Success icon */}
          <div className="w-[72px] h-[72px] bg-resqnow-safe/15 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-resqnow-safe" />
          </div>

          <h2 className="text-[22px] font-bold text-resqnow-primary mb-2">
            Account Created
          </h2>

          <p className="text-[13px] text-resqnow-muted mb-4 leading-relaxed">
            Your resident account has been created and is now waiting for barangay verification.
          </p>

          {/* Pending verification notice */}
          <div className="bg-resqnow-pending/10 border border-resqnow-pending/20 rounded-xl px-4 py-3.5 mb-6 text-left">

            <p className="text-[10px] font-bold text-resqnow-pending uppercase tracking-wide mb-1">
              Pending Verification
            </p>

            <p className="text-[11px] text-resqnow-secondary leading-relaxed">
              Barangay personnel will review your information. You will receive an update once your account has been verified.
            </p>
          </div>

          {/* Go to Login */}
          <button
            type="button"
            onClick={() =>
              navigate('/login')
            }
            className="w-full bg-brand-gradient text-white font-semibold py-3.5 rounded-xl transition-all text-[14px] shadow-[0_4px_16px_rgba(131,70,242,0.22)] active:scale-[0.98]"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ============ MAIN REGISTRATION FORM ============
  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center p-4 py-8"
      style={{
        backgroundImage:
          `url(${barangayPhoto})`,
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-resqnow-ivory/90 via-white/80 to-resqnow-mist/85 backdrop-blur-[2px]" />

      {/* Registration layout */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-center gap-5 w-full max-w-[880px]">

        {/* ============ BRANDING CARD ============ */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgba(31,29,71,0.09)] border border-white/60 px-8 py-9 flex flex-col items-center text-center w-full max-w-[250px] shrink-0">

          {/* Temporary ResQNow shield */}
          <div className="w-[72px] h-[72px] bg-brand-gradient rounded-2xl flex items-center justify-center mb-5 shadow-[0_8px_24px_rgba(131,70,242,0.22)]">
            <Shield
              className="w-[40px] h-[40px] text-white"
              strokeWidth={1.5}
            />
          </div>

          <h1 className="text-[27px] font-extrabold text-resqnow-primary tracking-tight">
            ResQNow
          </h1>

          <p className="text-[12px] text-resqnow-muted mt-2 leading-relaxed">
            Barangay Camunatan
            <br />
            City of Ilagan
          </p>

          {/* Secure registration */}
          <div className="mt-6 pt-5 border-t border-resqnow-border-soft w-full">

            <div className="flex items-center justify-center gap-1.5">

              <div className="w-1.5 h-1.5 rounded-full bg-resqnow-safe" />

              <span className="text-[9px] text-resqnow-muted font-medium uppercase tracking-wider">
                Secure Registration
              </span>
            </div>
          </div>
        </div>

        {/* ============ FORM CARD ============ */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgba(31,29,71,0.09)] border border-white/60 px-6 sm:px-10 py-8 sm:py-9 w-full max-w-[540px]">

          {/* Form heading */}
          <h2 className="text-[22px] font-bold text-resqnow-primary mb-1">
            Create Account
          </h2>

          <p className="text-[12px] text-resqnow-muted mb-7">
            Register to start reporting concerns.
          </p>

          {/* Global error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-resqnow-critical/10 border border-resqnow-critical/20 text-resqnow-crimson text-[12px] rounded-xl px-4 py-3 mb-5">

              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />

              <span>
                {error}
              </span>
            </div>
          )}

          {/* ============ REGISTRATION FORM ============ */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4"
          >

            {/* ============ PERSONAL INFORMATION ============ */}
            <SectionLabel title="Personal Information" />

            {/* Full Name */}
            <FieldWrapper
              label="Full Name *"
              error={
                touched.fullName &&
                fieldErrors.fullName
              }
            >
              <FieldIcon
                icon={User}
                active={
                  focusedField ===
                  'fullName'
                }
                error={
                  !!fieldErrors.fullName &&
                  touched.fullName
                }
              />

              <InputField
                ref={nameRef}
                type="text"
                value={form.fullName}
                onChange={(e) =>
                  update(
                    'fullName',
                    e.target.value
                  )
                }
                onFocus={() =>
                  setFocusedField(
                    'fullName'
                  )
                }
                onBlur={() =>
                  handleBlur(
                    'fullName'
                  )
                }
                placeholder="Enter your complete name"
                error={
                  !!fieldErrors.fullName &&
                  touched.fullName
                }
                autoComplete="name"
              />
            </FieldWrapper>

            {/* Contact Number + Purok */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Contact Number */}
              <FieldWrapper
                label="Contact Number *"
                error={
                  touched.phoneNumber &&
                  fieldErrors.phoneNumber
                }
              >
                <FieldIcon
                  icon={Phone}
                  active={
                    focusedField ===
                    'phoneNumber'
                  }
                  error={
                    !!fieldErrors.phoneNumber &&
                    touched.phoneNumber
                  }
                />

                <InputField
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) =>
                    update(
                      'phoneNumber',
                      e.target.value
                    )
                  }
                  onFocus={() =>
                    setFocusedField(
                      'phoneNumber'
                    )
                  }
                  onBlur={() =>
                    handleBlur(
                      'phoneNumber'
                    )
                  }
                  placeholder="09XX XXX XXXX"
                  error={
                    !!fieldErrors.phoneNumber &&
                    touched.phoneNumber
                  }
                  autoComplete="tel"
                />
              </FieldWrapper>

              {/* Purok */}
              <FieldWrapper
                label="Purok *"
                error={
                  touched.purok &&
                  fieldErrors.purok
                }
              >
                <select
                  value={form.purok}
                  onChange={(e) =>
                    update(
                      'purok',
                      e.target.value
                    )
                  }
                  onFocus={() =>
                    setFocusedField(
                      'purok'
                    )
                  }
                  onBlur={() =>
                    handleBlur(
                      'purok'
                    )
                  }
                  className={`w-full px-4 py-3 rounded-xl text-[14px] text-resqnow-primary outline-none transition-all appearance-none ${
                    touched.purok &&
                    fieldErrors.purok
                      ? 'ring-2 ring-resqnow-critical/30 bg-resqnow-critical/5'
                      : focusedField === 'purok'
                      ? 'ring-2 ring-resqnow-violet/25 bg-white'
                      : 'bg-resqnow-canvas ring-1 ring-resqnow-border'
                  }`}
                >
                  <option value="">
                    Select Purok
                  </option>

                  {purokOptions.map(
                    (purok) => (
                      <option
                        key={purok}
                        value={purok}
                      >
                        {purok}
                      </option>
                    )
                  )}
                </select>
              </FieldWrapper>
            </div>

            {/* Address */}
            <FieldWrapper
              label="Address *"
              error={
                touched.address &&
                fieldErrors.address
              }
            >
              <FieldIcon
                icon={MapPin}
                active={
                  focusedField ===
                  'address'
                }
                error={
                  !!fieldErrors.address &&
                  touched.address
                }
              />

              <InputField
                type="text"
                value={form.address}
                onChange={(e) =>
                  update(
                    'address',
                    e.target.value
                  )
                }
                onFocus={() =>
                  setFocusedField(
                    'address'
                  )
                }
                onBlur={() =>
                  handleBlur(
                    'address'
                  )
                }
                placeholder="Street, Barangay, City"
                error={
                  !!fieldErrors.address &&
                  touched.address
                }
                autoComplete="street-address"
              />
            </FieldWrapper>

            {/* ============ ACCOUNT CREDENTIALS ============ */}
            <SectionLabel title="Account Credentials" />

            {/* Email */}
            <FieldWrapper
              label="Email Address *"
              error={
                touched.email &&
                fieldErrors.email
              }
            >
              <FieldIcon
                icon={Mail}
                active={
                  focusedField ===
                  'email'
                }
                error={
                  !!fieldErrors.email &&
                  touched.email
                }
              />

              <InputField
                type="email"
                value={form.email}
                onChange={(e) =>
                  update(
                    'email',
                    e.target.value
                  )
                }
                onFocus={() =>
                  setFocusedField(
                    'email'
                  )
                }
                onBlur={() =>
                  handleBlur(
                    'email'
                  )
                }
                placeholder="you@example.com"
                error={
                  !!fieldErrors.email &&
                  touched.email
                }
                autoComplete="email"
                autoCapitalize="off"
              />
            </FieldWrapper>

            {/* Password */}
            <FieldWrapper
              label="Password *"
              error={
                touched.password &&
                fieldErrors.password
              }
            >
              <FieldIcon
                icon={Lock}
                active={
                  focusedField ===
                  'password'
                }
                error={
                  !!fieldErrors.password &&
                  touched.password
                }
              />

              <InputField
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={form.password}
                onChange={(e) =>
                  update(
                    'password',
                    e.target.value
                  )
                }
                onFocus={() =>
                  setFocusedField(
                    'password'
                  )
                }
                onBlur={() =>
                  handleBlur(
                    'password'
                  )
                }
                placeholder="Create a strong password"
                error={
                  !!fieldErrors.password &&
                  touched.password
                }
                autoComplete="new-password"
              />

              {/* Show password */}
              <button
                type="button"
                onMouseDown={(e) =>
                  e.preventDefault()
                }
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-resqnow-placeholder hover:text-resqnow-violet hover:bg-resqnow-violet/5 transition-colors"
                tabIndex={-1}
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPassword ? (
                  <EyeOff className="w-[18px] h-[18px]" />
                ) : (
                  <Eye className="w-[18px] h-[18px]" />
                )}
              </button>
            </FieldWrapper>

            {/* ============ PASSWORD STRENGTH ============ */}
            {form.password.length > 0 && (
              <div className="p-3 bg-resqnow-canvas rounded-xl border border-resqnow-border-soft">

                {/* Strength meter */}
                <div className="flex items-center gap-2 mb-2">

                  <div className="flex-1 h-1.5 bg-resqnow-border-soft rounded-full overflow-hidden">

                    <div
                      className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{
                        width:
                          passwordStrength.width ||
                          '0%',
                      }}
                    />
                  </div>

                  <span className="text-[11px] font-medium text-resqnow-muted">
                    {passwordStrength.label}
                  </span>
                </div>

                {/* Password requirements */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">

                  <PassIndicator
                    passed={
                      form.password.length >= 8
                    }
                    label="At least 8 characters"
                  />

                  <PassIndicator
                    passed={
                      /[a-z]/.test(
                        form.password
                      )
                    }
                    label="Lowercase letter"
                  />

                  <PassIndicator
                    passed={
                      /[A-Z]/.test(
                        form.password
                      )
                    }
                    label="Uppercase letter"
                  />

                  <PassIndicator
                    passed={
                      /[0-9]/.test(
                        form.password
                      )
                    }
                    label="One number"
                  />

                  <PassIndicator
                    passed={
                      /[!@#$%^&*(),.?":{}|<>]/.test(
                        form.password
                      )
                    }
                    label="Special character"
                  />
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <FieldWrapper
              label="Confirm Password *"
              error={
                touched.confirmPassword &&
                fieldErrors.confirmPassword
              }
            >
              <FieldIcon
                icon={Lock}
                active={
                  focusedField ===
                  'confirmPassword'
                }
                error={
                  !!fieldErrors.confirmPassword &&
                  touched.confirmPassword
                }
              />

              <InputField
                type={
                  showConfirm
                    ? 'text'
                    : 'password'
                }
                value={
                  form.confirmPassword
                }
                onChange={(e) =>
                  update(
                    'confirmPassword',
                    e.target.value
                  )
                }
                onFocus={() =>
                  setFocusedField(
                    'confirmPassword'
                  )
                }
                onBlur={() =>
                  handleBlur(
                    'confirmPassword'
                  )
                }
                placeholder="Re-enter your password"
                error={
                  !!fieldErrors.confirmPassword &&
                  touched.confirmPassword
                }
                autoComplete="new-password"
              />

              {/* Show confirm password */}
              <button
                type="button"
                onMouseDown={(e) =>
                  e.preventDefault()
                }
                onClick={() =>
                  setShowConfirm(
                    !showConfirm
                  )
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-resqnow-placeholder hover:text-resqnow-violet hover:bg-resqnow-violet/5 transition-colors"
                tabIndex={-1}
                aria-label={
                  showConfirm
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showConfirm ? (
                  <EyeOff className="w-[18px] h-[18px]" />
                ) : (
                  <Eye className="w-[18px] h-[18px]" />
                )}
              </button>
            </FieldWrapper>

            {/* ============ HOUSEHOLD INFORMATION ============ */}
            <SectionLabel title="Household Information" />

            {/* Household Count */}
            <FieldWrapper
              label="Household Count"
              error={
                touched.householdCount &&
                fieldErrors.householdCount
              }
            >
              <FieldIcon
                icon={Home}
                active={
                  focusedField ===
                  'householdCount'
                }
                error={
                  !!fieldErrors.householdCount &&
                  touched.householdCount
                }
              />

              <InputField
                type="number"
                min="1"
                max="100"
                value={
                  form.householdCount
                }
                onChange={(e) =>
                  update(
                    'householdCount',
                    e.target.value
                  )
                }
                onFocus={() =>
                  setFocusedField(
                    'householdCount'
                  )
                }
                onBlur={() =>
                  handleBlur(
                    'householdCount'
                  )
                }
                placeholder="Number of household members"
                error={
                  !!fieldErrors.householdCount &&
                  touched.householdCount
                }
              />
            </FieldWrapper>

            {/* Household Profile */}
            <div className="grid grid-cols-2 gap-2">

              {[
                {
                  key: 'hasSeniorCitizen',
                  label: 'Senior Citizen',
                  icon: PersonStanding,
                },
                {
                  key: 'hasChild',
                  label: 'Child',
                  icon: Baby,
                },
                {
                  key: 'hasPWD',
                  label: 'PWD',
                  icon: Accessibility,
                },
                {
                  key: 'hasPregnantPerson',
                  label: 'Pregnant Person',
                  icon: HeartPulse,
                },
              ].map(
                ({
                  key,
                  label,
                  icon: Icon,
                }) => (
                  <label
                    key={key}
                    onClick={() =>
                      update(
                        key,
                        !form[key]
                      )
                    }
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                      form[key]
                        ? 'border-resqnow-violet/30 bg-resqnow-violet/10 shadow-sm'
                        : 'border-resqnow-border-soft bg-white hover:border-resqnow-violet/20 hover:bg-resqnow-violet/5'
                    }`}
                  >

                    {/* Custom checkbox */}
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                        form[key]
                          ? 'bg-resqnow-violet border-resqnow-violet'
                          : 'border-resqnow-border'
                      }`}
                    >
                      {form[key] && (
                        <Check
                          className="w-3 h-3 text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>

                    {/* Household icon */}
                    <Icon
                      className={`w-[17px] h-[17px] shrink-0 ${
                        form[key]
                          ? 'text-resqnow-violet'
                          : 'text-resqnow-muted'
                      }`}
                    />

                    <span
                      className={`text-[11px] sm:text-[12px] font-medium leading-tight ${
                        form[key]
                          ? 'text-resqnow-violet'
                          : 'text-resqnow-secondary'
                      }`}
                    >
                      {label}
                    </span>
                  </label>
                )
              )}
            </div>

            {/* ============ HOME LOCATION ============ */}
            {/* Temporary location placeholder until map is connected */}
            <div>

              <label className="block text-[12px] font-semibold text-resqnow-secondary mb-1.5">
                Home Location
              </label>

              <div className="border-2 border-dashed border-resqnow-border-soft rounded-xl p-4 text-center bg-resqnow-canvas">

                <div className="w-10 h-10 bg-resqnow-violet/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-5 h-5 text-resqnow-violet" />
                </div>

                <p className="text-[12px] font-medium text-resqnow-secondary">
                  Home location pin
                </p>

                <p className="text-[10px] text-resqnow-muted mt-0.5">
                  Map integration will be connected later.
                </p>
              </div>
            </div>

            {/* ============ TERMS ============ */}
            <label className="flex items-start gap-3 cursor-pointer select-none pt-2 pb-1">

              <input
                type="checkbox"
                checked={
                  form.agreedToTerms
                }
                onChange={(e) =>
                  update(
                    'agreedToTerms',
                    e.target.checked
                  )
                }
                className="w-[18px] h-[18px] rounded-md border-resqnow-border accent-resqnow-violet mt-0.5 shrink-0"
              />

              <span className="text-[11px] text-resqnow-muted leading-relaxed">
                I confirm that the information I have provided is true and correct. I understand that my account will be subject to barangay verification.
              </span>
            </label>

            {/* ============ CREATE ACCOUNT ============ */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-gradient text-white font-semibold py-3.5 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 text-[14px] shadow-[0_4px_16px_rgba(131,70,242,0.22)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* ============ LOGIN LINK ============ */}
          <div className="mt-5 text-center">

            <p className="text-[12px] text-resqnow-muted">
              Already have an account?{' '}

              <Link
                to="/login"
                className="text-resqnow-violet font-semibold hover:text-resqnow-primary hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ SECTION LABEL ============
// Small label used between registration sections
function SectionLabel({ title }) {
  return (
    <div className="flex items-center gap-3 pt-2 pb-1">

      <span className="text-[10px] font-bold text-resqnow-muted uppercase tracking-widest">
        {title}
      </span>

      <div className="flex-1 h-px bg-resqnow-border-soft" />
    </div>
  );
}

// ============ FIELD WRAPPER ============
// Adds label and validation error around an input
function FieldWrapper({
  label,
  error,
  children,
}) {
  return (
    <div>

      {label && (
        <label className="block text-[12px] font-semibold text-resqnow-secondary mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        {children}
      </div>

      {error && (
        <p className="text-[11px] text-resqnow-critical mt-1 ml-1">
          {error}
        </p>
      )}
    </div>
  );
}

// ============ FIELD ICON ============
// Changes icon color depending on field state
function FieldIcon({
  icon: Icon,
  active,
  error,
}) {
  return (
    <Icon
      className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors pointer-events-none ${
        active
          ? 'text-resqnow-violet'
          : error
          ? 'text-resqnow-critical'
          : 'text-resqnow-placeholder'
      }`}
    />
  );
}

// ============ INPUT FIELD ============
// Shared input style for registration fields
const InputField = ({
  ref,
  type,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  error,
  ...rest
}) => {
  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`w-full pl-[46px] pr-4 py-3 rounded-xl text-[14px] text-resqnow-primary outline-none transition-all ${
        error
          ? 'ring-2 ring-resqnow-critical/30 bg-resqnow-critical/5'
          : 'bg-resqnow-canvas ring-1 ring-resqnow-border focus:ring-2 focus:ring-resqnow-violet/25 focus:bg-white'
      }`}
      {...rest}
    />
  );
};

// ============ PASSWORD REQUIREMENT ============
// Shows if one password requirement has been completed
function PassIndicator({
  passed,
  label,
}) {
  return (
    <div className="flex items-center gap-1.5">

      <div
        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          passed
            ? 'bg-resqnow-safe/15'
            : 'bg-resqnow-border-soft'
        }`}
      >
        {passed ? (
          <Check
            className="w-2 h-2 text-resqnow-safe"
            strokeWidth={3}
          />
        ) : (
          <div className="w-1 h-1 rounded-full bg-resqnow-placeholder" />
        )}
      </div>

      <span
        className={`text-[10px] transition-colors ${
          passed
            ? 'text-resqnow-safe'
            : 'text-resqnow-muted'
        }`}
      >
        {label}
      </span>
    </div>
  );
}