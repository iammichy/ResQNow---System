// src/components/resident/Login.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Mail, Lock, ExternalLink, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockTestAccount, mockResident } from '../../data/mockData';

// Random barangay photo for the login background
const barangayPhotos = [
  '[images.unsplash.com](https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=1200&q=80)',
  '[images.unsplash.com](https://images.unsplash.com/photo-1569098644584-14d4e88337b6?w=1200&q=80)',
  '[images.unsplash.com](https://images.unsplash.com/photo-1523741543316-b31d63fcd6be?w=1200&q=80)',
];

const randomPhoto = barangayPhotos[Math.floor(Math.random() * barangayPhotos.length)];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const emailRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // Auto-focus the email input when the page loads
  useEffect(() => { emailRef.current?.focus(); }, []);

  // Check if a single field is valid
  const validateField = (name, value) => {
    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    if (name === 'password' && touched.password && !value) {
      return 'Password is required';
    }
    return '';
  };

  // When the user leaves a field, mark it as touched and validate
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldErrors((prev) => ({ ...prev, [field]: validateField(field, field === 'email' ? email : password) }));
  };

  // Clear the error for a field when the user focuses it
  const handleFocus = (field) => {
    setFocusedField(field);
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    setError('');
  };

  // Check credentials and log in
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const errors = {
      email: !email.trim() ? 'Email is required' : validateField('email', email),
      password: !password.trim() ? 'Password is required' : '',
    };
    setFieldErrors(errors);
    setTouched({ email: true, password: true });

    if (errors.email || errors.password) return;

    setIsSubmitting(true);
    setTimeout(() => {
      if (email === mockTestAccount.email && password === mockTestAccount.password) {
        if (rememberMe) {
          localStorage.setItem('resqnow_remembered_email', email);
        } else {
          localStorage.removeItem('resqnow_remembered_email');
        }
        login(mockResident);
        navigate('/dashboard', { replace: true });
      } else {
        setError('The email or password you entered is incorrect. Please try again.');
        setFieldErrors({ email: ' ', password: ' ' });
      }
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundImage: `url('${randomPhoto}')` }}
    >
      {/* Overlay — lighter so cards stay readable */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/50 to-white/40 backdrop-blur-[2px]" />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-center gap-5 w-full max-w-[820px]">

        {/* ========== BRANDING CARD ========== */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 px-8 py-10 flex flex-col items-center text-center w-full max-w-[250px] shrink-0">
          <div className="w-[76px] h-[76px] bg-brand-gradient rounded-2xl flex items-center justify-center mb-5 shadow-[0_8px_24px_rgba(131,70,242,0.25)]">
            <Shield className="w-[42px] h-[42px] text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-[28px] font-extrabold text-resqnow-primary tracking-tight">ResQNow</h1>
          <p className="text-[13px] text-resqnow-muted mt-2 leading-relaxed">
            Barangay Camunatan<br />City of Ilagan
          </p>
          <div className="mt-6 pt-5 border-t border-slate-100 w-full">
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-resqnow-safe" />
              <span className="text-[10px] text-resqnow-muted font-medium uppercase tracking-wider">Secure Connection</span>
            </div>
          </div>
        </div>

        {/* ========== LOGIN FORM CARD ========== */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 px-8 sm:px-10 py-9 w-full max-w-[450px]">
          <h2 className="text-[22px] font-bold text-resqnow-primary mb-1">Resident Login</h2>
          <p className="text-[13px] text-resqnow-muted mb-7">Sign in to access your account</p>

          {/* Global error banner */}
          {error && (
            <div className="flex items-start gap-2.5 bg-resqnow-critical/10 border border-resqnow-critical/20 text-resqnow-critical text-[13px] rounded-xl px-4 py-3 mb-5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[13px] font-semibold text-resqnow-primary mb-1.5">Email Address</label>
              <div className={`relative rounded-xl transition-all duration-200 ${
                fieldErrors.email ? 'ring-2 ring-resqnow-critical/30' : focusedField === 'email' ? 'ring-2 ring-resqnow-mint/40' : 'ring-1 ring-slate-200'
              }`}>
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors ${
                  focusedField === 'email' ? 'text-resqnow-mint' : fieldErrors.email ? 'text-resqnow-critical' : 'text-resqnow-muted'
                }`} />
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: '' })); setError(''); }}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@example.com"
                  className={`w-full pl-[46px] pr-4 py-3 rounded-xl text-[14px] outline-none transition-colors ${
                    fieldErrors.email ? 'bg-resqnow-critical/5' : 'bg-slate-50'
                  }`}
                  autoComplete="email"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </div>
              {fieldErrors.email && fieldErrors.email !== ' ' && (
                <p className="text-[11px] text-resqnow-critical mt-1.5 ml-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-semibold text-resqnow-primary mb-1.5">Password</label>
              <div className={`relative rounded-xl transition-all duration-200 ${
                fieldErrors.password && touched.password ? 'ring-2 ring-resqnow-critical/30' : focusedField === 'password' ? 'ring-2 ring-resqnow-mint/40' : 'ring-1 ring-slate-200'
              }`}>
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors ${
                  focusedField === 'password' ? 'text-resqnow-mint' : fieldErrors.password && touched.password ? 'text-resqnow-critical' : 'text-resqnow-muted'
                }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '' })); setError(''); }}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`w-full pl-[46px] pr-12 py-3 rounded-xl text-[14px] outline-none transition-colors ${
                    fieldErrors.password && touched.password ? 'bg-resqnow-critical/5' : 'bg-slate-50'
                  }`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-resqnow-muted hover:text-resqnow-primary hover:bg-slate-100 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-resqnow-mint focus:ring-resqnow-mint focus:ring-offset-0"
                />
                <span className="text-[12px] text-resqnow-muted">Remember me</span>
              </label>
              <button type="button" className="text-[12px] font-medium text-resqnow-mint hover:text-resqnow-mint/80 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-gradient text-white font-semibold py-3 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 text-[14px] shadow-[0_4px_16px_rgba(131,70,242,0.25)] hover:shadow-[0_6px_24px_rgba(131,70,242,0.35)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[13px] text-resqnow-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-resqnow-mint font-semibold hover:text-resqnow-mint/80 hover:underline transition-colors">
                Create one
              </Link>
            </p>
          </div>

          {/* Personnel Portal Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-[11px] font-bold text-resqnow-muted uppercase tracking-wider mb-3">
              Authorized Barangay Personnel
            </p>
            <p className="text-[11px] text-resqnow-muted mb-4 leading-relaxed">
              For report verification, triage confirmation, personnel assignment, and response coordination.
            </p>
            <button
              type="button"
              className="w-full border border-slate-300 text-resqnow-muted font-medium py-2.5 rounded-xl text-[13px] hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-2"
            >
              Personnel Portal Login
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-resqnow-muted mt-4 text-center leading-relaxed">
              This system is intended for verified residents of Barangay Camunatan and authorized emergency personnel only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
