// src/components/resident/Register.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Mail, Lock, User, Phone, MapPin, Check, X, AlertCircle, Loader2, ChevronLeft, ChevronRight, Home, PersonStanding, Baby, Accessibility, HeartPulse } from 'lucide-react';
import { purokOptions } from '../../data/mockData';

const barangayPhotos = [
  '[images.unsplash.com](https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=1200&q=80)',
  '[images.unsplash.com](https://images.unsplash.com/photo-1569098644584-14d4e88337b6?w=1200&q=80)',
  '[images.unsplash.com](https://images.unsplash.com/photo-1523741543316-b31d63fcd6be?w=1200&q=80)',
];

const randomPhoto = barangayPhotos[Math.floor(Math.random() * barangayPhotos.length)];

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

export default function Register() {
  const navigate = useNavigate();
  const nameRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    setError('');
  };

  const validate = (name, value) => {
    switch (name) {
      case 'fullName': return !value.trim() ? 'Full name is required' : value.trim().length < 2 ? 'Name is too short' : '';
      case 'email': return !value.trim() ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Please enter a valid email' : '';
      case 'phoneNumber': return value && !/^(09|\+639)\d{9}$/.test(value.replace(/\s/g, '')) && value.length > 0 ? 'Enter a valid PH mobile number (09XX XXX XXXX)' : '';
      case 'address': return !value.trim() ? 'Address is required' : '';
      case 'purok': return !value ? 'Please select your purok' : '';
      case 'password': {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'At least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Needs an uppercase letter';
        if (!/[0-9]/.test(value)) return 'Needs a number';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Needs a special character';
        return '';
      }
      case 'confirmPassword': return !value ? 'Please confirm your password' : value !== form.password ? 'Passwords do not match' : '';
      default: return '';
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldErrors((prev) => ({ ...prev, [field]: validate(field, form[field]) }));
  };

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (form.password.length >= 8) score++;
    if (/[A-Z]/.test(form.password)) score++;
    if (/[0-9]/.test(form.password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) score++;
    if (form.password.length >= 12) score++;
    return { score, label: ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][score], color: ['bg-red-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600'][score], width: `${(score / 5) * 100}%` };
  }, [form.password]);

  const requiredFields = Object.entries({
    fullName: form.fullName, email: form.email, password: form.password,
    confirmPassword: form.confirmPassword, address: form.address, purok: form.purok,
  }).filter(([, v]) => !v).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const fieldsToValidate = ['fullName', 'email', 'password', 'confirmPassword', 'address', 'purok'];
    const errors = {};
    fieldsToValidate.forEach((f) => { const err = validate(f, form[f]); if (err) errors[f] = err; });
    if (form.phoneNumber && validate('phoneNumber', form.phoneNumber)) errors.phoneNumber = validate('phoneNumber', form.phoneNumber);
    setFieldErrors(errors);
    setTouched(Object.fromEntries(fieldsToValidate.map((f) => [f, true])));
    if (Object.keys(errors).length > 0) { setError('Please fix the highlighted fields before continuing.'); return; }
    if (!form.agreedToTerms) { setError('Please confirm that your information is correct.'); return; }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1800);
  };

  // ===== SUCCESS SCREEN =====
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center p-4" style={{ backgroundImage: `url('${randomPhoto}')` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/50 to-white/40 backdrop-blur-[2px]" />
        <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 px-10 py-12 w-full max-w-[440px] text-center">
          <div className="w-[72px] h-[72px] bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-[22px] font-bold text-slate-800 mb-2">Account Created</h2>
          <p className="text-[13px] text-slate-500 mb-3 leading-relaxed">
            Your account has been created and is waiting for barangay verification.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-left">
            <p className="text-[12px] text-amber-700 font-medium mb-1">What happens next?</p>
            <p className="text-[11px] text-amber-600 leading-relaxed">
              A barangay personnel will verify your information. You will receive a notification once your account has been approved. This usually takes 1–2 business days.
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all text-[14px] shadow-[0_4px_16px_rgba(20,184,166,0.25)] active:scale-[0.98]"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ===== MAIN REGISTRATION FORM =====
  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center p-4 py-8" style={{ backgroundImage: `url('${randomPhoto}')` }}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/50 to-white/40 backdrop-blur-[2px]" />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-center gap-5 w-full max-w-[880px]">

        {/* BRANDING CARD */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 px-8 py-10 flex flex-col items-center text-center w-full max-w-[250px] shrink-0">
          <div className="w-[76px] h-[76px] bg-gradient-to-br from-teal-400 to-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-[0_8px_24px_rgba(20,184,166,0.25)]">
            <Shield className="w-[42px] h-[42px] text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-[28px] font-extrabold text-slate-800 tracking-tight">ResQNow</h1>
          <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
            Barangay Camunatan<br />City of Ilagan
          </p>
          <div className="mt-6 pt-5 border-t border-slate-100 w-full">
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Secure Registration</span>
            </div>
          </div>
        </div>

        {/* FORM CARD */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 px-8 sm:px-10 py-9 w-full max-w-[540px]">
          <h2 className="text-[22px] font-bold text-slate-800 mb-1">Create Account</h2>
          <p className="text-[13px] text-slate-500 mb-7">Register to start reporting concerns</p>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* ============ PERSONAL INFO SECTION ============ */}
            <SectionLabel title="Personal Information" />

            {/* Full Name */}
            <FieldWrapper label="Full Name" error={touched.fullName && fieldErrors.fullName}>
              <FieldIcon icon={User} active={focusedField === 'fullName'} error={!!fieldErrors.fullName && touched.fullName} />
              <InputField
                ref={nameRef}
                type="text"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => handleBlur('fullName')}
                placeholder="Enter your complete name"
                error={!!fieldErrors.fullName && touched.fullName}
                autoComplete="name"
              />
            </FieldWrapper>

            {/* Phone + Purok row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldWrapper label="Contact Number" error={touched.phoneNumber && fieldErrors.phoneNumber}>
                <FieldIcon icon={Phone} active={focusedField === 'phoneNumber'} error={!!fieldErrors.phoneNumber && touched.phoneNumber} />
                <InputField
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => update('phoneNumber', e.target.value)}
                  onFocus={() => setFocusedField('phoneNumber')}
                  onBlur={() => handleBlur('phoneNumber')}
                  placeholder="09XX XXX XXXX"
                  error={!!fieldErrors.phoneNumber && touched.phoneNumber}
                  autoComplete="tel"
                />
              </FieldWrapper>
              <FieldWrapper label="Purok *" error={touched.purok && fieldErrors.purok}>
                <select
                  value={form.purok}
                  onChange={(e) => update('purok', e.target.value)}
                  onFocus={() => setFocusedField('purok')}
                  onBlur={() => handleBlur('purok')}
                  className={`w-full pl-4 pr-10 py-3 rounded-xl text-[14px] outline-none transition-all appearance-none bg-slate-50 ${touched.purok && fieldErrors.purok ? 'ring-2 ring-red-300 bg-red-50/50' : focusedField === 'purok' ? 'ring-2 ring-teal-400/40 bg-white' : 'ring-1 ring-slate-200'}`}
                >
                  <option value="">Select Purok</option>
                  {purokOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </FieldWrapper>
            </div>

            {/* Address */}
            <FieldWrapper label="Address *" error={touched.address && fieldErrors.address}>
              <FieldIcon icon={MapPin} active={focusedField === 'address'} error={!!fieldErrors.address && touched.address} />
              <InputField
                type="text"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                onFocus={() => setFocusedField('address')}
                onBlur={() => handleBlur('address')}
                placeholder="Street, Barangay, City"
                error={!!fieldErrors.address && touched.address}
                autoComplete="street-address"
              />
            </FieldWrapper>

            {/* ============ ACCOUNT SECTION ============ */}
            <SectionLabel title="Account Credentials" />

            {/* Email */}
            <FieldWrapper label="Email Address *" error={touched.email && fieldErrors.email}>
              <FieldIcon icon={Mail} active={focusedField === 'email'} error={!!fieldErrors.email && touched.email} />
              <InputField
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                error={!!fieldErrors.email && touched.email}
                autoComplete="email"
                autoCapitalize="off"
              />
            </FieldWrapper>

            {/* Password */}
            <FieldWrapper label="Password *" error={touched.password && fieldErrors.password}>
              <FieldIcon icon={Lock} active={focusedField === 'password'} error={!!fieldErrors.password && touched.password} />
              <InputField
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => handleBlur('password')}
                placeholder="Create a strong password"
                error={!!fieldErrors.password && touched.password}
                autoComplete="new-password"
              />
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" tabIndex={-1}>
                {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </FieldWrapper>

            {/* Password strength meter */}
            {form.password.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: passwordStrength.width || '0%' }} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">{passwordStrength.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <PassIndicator passed={form.password.length >= 8} label="At least 8 characters" />
                  <PassIndicator passed={/[A-Z]/.test(form.password)} label="Uppercase letter" />
                  <PassIndicator passed={/[0-9]/.test(form.password)} label="One number" />
                  <PassIndicator passed={/[!@#$%^&*(),.?":{}|<>]/.test(form.password)} label="Special character" />
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <FieldWrapper label="Confirm Password *" error={touched.confirmPassword && fieldErrors.confirmPassword}>
              <FieldIcon icon={Lock} active={focusedField === 'confirmPassword'} error={!!fieldErrors.confirmPassword && touched.confirmPassword} />
              <InputField
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Re-enter your password"
                error={!!fieldErrors.confirmPassword && touched.confirmPassword}
                autoComplete="new-password"
              />
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" tabIndex={-1}>
                {showConfirm ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </FieldWrapper>

            {/* ============ HOUSEHOLD SECTION ============ */}
            <SectionLabel title="Household Information" />

            {/* Household Count */}
            <FieldWrapper label="Household Count">
              <FieldIcon icon={Home} active={focusedField === 'householdCount'} />
              <InputField
                type="number" min="1"
                value={form.householdCount}
                onChange={(e) => update('householdCount', e.target.value)}
                onFocus={() => setFocusedField('householdCount')}
                onBlur={() => setFocusedField(null)}
                placeholder="Number of household members"
              />
            </FieldWrapper>

            {/* Household Profile */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'hasSeniorCitizen', label: 'Senior Citizen', icon: PersonStanding },
                { key: 'hasChild', label: 'Child', icon: Baby },
                { key: 'hasPWD', label: 'PWD', icon: Accessibility },
                { key: 'hasPregnantPerson', label: 'Pregnant Person', icon: HeartPulse },
              ].map(({ key, label, icon: Icon }) => (
                <label
                  key={key}
                  onClick={() => update(key, !form[key])}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                    form[key]
                      ? 'border-teal-300 bg-teal-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    form[key] ? 'bg-teal-500 border-teal-500' : 'border-slate-300'
                  }`}>
                    {form[key] && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <Icon className={`w-[18px] h-[18px] ${form[key] ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className={`text-[13px] font-medium ${form[key] ? 'text-teal-800' : 'text-slate-600'}`}>{label}</span>
                </label>
              ))}
            </div>


            {/* Location Placeholder */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Home Location</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-teal-300 hover:bg-teal-50/30 transition-all group">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-teal-100 transition-colors">
                  <MapPin className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                </div>
                <p className="text-[13px] font-medium text-slate-500 group-hover:text-teal-600 transition-colors">Pin your home location</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Map integration coming soon</p>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer select-none pt-2 pb-1">
              <input
                type="checkbox"
                checked={form.agreedToTerms}
                onChange={(e) => update('agreedToTerms', e.target.checked)}
                className="w-[18px] h-[18px] rounded-md border-slate-300 text-teal-600 focus:ring-teal-500 focus:ring-offset-0 mt-0.5 shrink-0"
              />
              <span className="text-[12px] text-slate-500 leading-relaxed">
                I confirm that the information I have provided is true and correct. I understand that my account will be subject to barangay verification.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-teal-600 hover:to-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 text-[14px] shadow-[0_4px_16px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_24px_rgba(20,184,166,0.35)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-[13px] text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700 hover:underline transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ HELPER COMPONENTS ============

function SectionLabel({ title }) {
  return (
    <div className="flex items-center gap-3 pt-2 pb-1">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function FieldWrapper({ label, error, children }) {
  return (
    <div>
      {label && <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">{label}</label>}
      <div className="relative">{children}</div>
      {error && <p className="text-[11px] text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
}

function FieldIcon({ icon: Icon, active, error }) {
  return (
    <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors pointer-events-none ${
      active ? 'text-teal-500' : error ? 'text-red-400' : 'text-slate-400'
    }`} />
  );
}

const InputField = ({ ref, type, value, onChange, onFocus, onBlur, placeholder, error, ...rest }) => {
  const Tag = type === 'select' ? 'select' : 'input';
  return (
    <Tag
      ref={ref}
      type={type}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`w-full py-3 rounded-xl text-[14px] outline-none transition-all ${
        type === 'select' ? 'pl-4 pr-10' : 'pl-[46px] pr-4'
      } ${
        error ? 'ring-2 ring-red-300 bg-red-50/50' : 'bg-slate-50 ring-1 ring-slate-200'
      }`}
      {...rest}
    />
  );
};

function PassIndicator({ passed, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
        passed ? 'bg-emerald-100' : 'bg-slate-200'
      }`}>
        {passed ? <Check className="w-2 h-2 text-emerald-600" strokeWidth={3} /> : <div className="w-1 h-1 rounded-full bg-slate-400" />}
      </div>
      <span className={`text-[11px] transition-colors ${passed ? 'text-emerald-700' : 'text-slate-400'}`}>{label}</span>
    </div>
  );
}
