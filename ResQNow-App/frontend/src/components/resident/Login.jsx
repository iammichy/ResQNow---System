// src/components/resident/Login.jsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Radio,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import AuthAside from '../common/AuthAside';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REMEMBER_KEY = 'resqnow_remembered_email';

const inputBase =
  'h-11 w-full rounded-md border bg-white pl-9 text-sm outline-none transition-colors placeholder:text-slate-400';
const inputIdle =
  'border-slate-300 focus:border-[#1F5FA6] focus:ring-2 focus:ring-[#1F5FA6]/15';
const inputError =
  'border-[#FDA29B] focus:border-[#D92D20] focus:ring-2 focus:ring-[#D92D20]/15';

function readRemembered() {
  try {
    return localStorage.getItem(REMEMBER_KEY) || '';
  } catch {
    return '';
  }
}

function writeRemembered(email) {
  try {
    if (email) {
      localStorage.setItem(REMEMBER_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
  } catch {
    // Storage unavailable; nothing to remember.
  }
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const emailRef = useRef(null);

  const [remembered] = useState(readRemembered);
  const [email, setEmail] = useState(remembered);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(Boolean(remembered));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  function validate(field, value) {
    if (field === 'email') {
      if (!value.trim()) return 'Email is required';
      return EMAIL_PATTERN.test(value.trim())
        ? ''
        : 'Please enter a valid email address';
    }

    return value ? '' : 'Password is required';
  }

  function clear(field) {
    setFieldErrors((previous) => ({ ...previous, [field]: '' }));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    const nextErrors = {
      email: validate('email', email),
      password: validate('password', password),
    };

    setFieldErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) return;

    setIsSubmitting(true);
    setError('');

    try {
      const user = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      writeRemembered(rememberMe ? email.trim().toLowerCase() : '');

      navigate(
        user?.role === 'responder' ? '/responder/dashboard' : '/dashboard',
        { replace: true }
      );
    } catch (loginError) {
      setError(
        loginError.status === 0
          ? loginError.message
          : loginError.message || 'Unable to sign in. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <AuthAside
        eyebrow="Resident access"
        title="Fast help starts with the right information."
        text="Report emergencies, request barangay assistance and follow every update on your reports."
      />

      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          <p className="mb-8 text-lg font-bold tracking-tight text-[#101C2E] lg:hidden">
            ResQNow
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-[#101C2E]">
            Welcome back
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in to your ResQNow account.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-md border border-[#FECDCA] bg-[#FEF3F2] px-3.5 py-3 text-sm text-[#B42318]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  ref={emailRef}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clear('email');
                  }}
                  onBlur={() =>
                    email &&
                    setFieldErrors((previous) => ({
                      ...previous,
                      email: validate('email', email),
                    }))
                  }
                  placeholder="you@example.com"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  className={`${inputBase} pr-3 ${
                    fieldErrors.email ? inputError : inputIdle
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p id="email-error" className="mt-1.5 text-xs text-[#D92D20]">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#1F5FA6] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clear('password');
                  }}
                  placeholder="Enter your password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? 'password-error' : undefined
                  }
                  className={`${inputBase} pr-11 ${
                    fieldErrors.password ? inputError : inputIdle
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-2 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p
                  id="password-error"
                  className="mt-1.5 text-xs text-[#D92D20]"
                >
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <label className="flex cursor-pointer select-none items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#1F5FA6] focus:ring-[#1F5FA6] focus:ring-offset-0"
              />
              <span className="text-sm text-slate-600">Remember my email</span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1F5FA6] text-sm font-semibold text-white transition-colors hover:bg-[#174A86] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don’t have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#1F5FA6] hover:underline"
            >
              Create one
            </Link>
          </p>

          <div className="mt-8 flex items-start gap-3 border-t border-slate-200 pt-5">
            <Radio className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div className="text-xs leading-relaxed text-slate-500">
              <p>
                Emergency responder?{' '}
                <Link
                  to="/responder/login"
                  className="font-semibold text-[#1F5FA6] hover:underline"
                >
                  Responder access
                </Link>
              </p>
              <p className="mt-1">
                Your account is activated after barangay verification.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
