// src/components/responder/ResponderLogin.jsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import AuthAside from '../common/AuthAside';
import { ADMIN_URL } from '../../services/api';

const REMEMBER_KEY = 'resqnow_responder_email';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export default function ResponderLogin() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const emailRef = useRef(null);

  const [remembered] = useState(readRemembered);
  const [email, setEmail] = useState(remembered);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(Boolean(remembered));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [adminPortal, setAdminPortal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    const cleanEmail = email.trim().toLowerCase();
    const nextErrors = {
      email: !cleanEmail
        ? 'Email is required'
        : EMAIL_PATTERN.test(cleanEmail)
        ? ''
        : 'Please enter a valid email address',
      password: password ? '' : 'Password is required',
    };

    setFieldErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) return;

    setIsSubmitting(true);
    setError('');
    setAdminPortal(false);

    try {
      const account = await login({ email: cleanEmail, password });

      if (account?.role !== 'responder') {
        await logout();
        setError('This portal is for verified responder accounts only.');
        return;
      }

      writeRemembered(remember ? cleanEmail : '');
      navigate('/responder/dashboard', { replace: true });
    } catch (loginError) {
      setAdminPortal(Boolean(loginError?.data?.adminPortal));
      setError(
        loginError?.message || 'Unable to sign in to the responder portal.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <AuthAside
        eyebrow="Responder field access"
        title="Assigned incidents, one coordinated response."
        text="Open the reports assigned to you, call the reporter, navigate to the incident and log every field update."
      />

      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          <p className="mb-8 text-lg font-bold tracking-tight text-[#101C2E] lg:hidden">
            ResQNow
          </p>

          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#1F5FA6]"
          >
            <ArrowLeft className="h-4 w-4" />
            Resident sign in
          </Link>

          <h2 className="text-2xl font-semibold tracking-tight text-[#101C2E]">
            Responder sign in
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Use the account the barangay created for you.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-md border border-[#FECDCA] bg-[#FEF3F2] px-3.5 py-3 text-sm text-[#B42318]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {error}
                {adminPortal && (
                  <>
                    {' '}
                    <a
                      href={ADMIN_URL}
                      className="font-semibold underline"
                    >
                      Go to the web admin
                    </a>
                  </>
                )}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="responder-email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="responder-email"
                  ref={emailRef}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setFieldErrors((previous) => ({ ...previous, email: '' }));
                    setError('');
                  }}
                  placeholder="responder@example.com"
                  aria-invalid={Boolean(fieldErrors.email)}
                  className={`${inputBase} pr-3 ${
                    fieldErrors.email ? inputError : inputIdle
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-[#D92D20]">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="responder-password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="responder-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setFieldErrors((previous) => ({ ...previous, password: '' }));
                    setError('');
                  }}
                  placeholder="Enter your password"
                  aria-invalid={Boolean(fieldErrors.password)}
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
                <p className="mt-1.5 text-xs text-[#D92D20]">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <label className="flex cursor-pointer select-none items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
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

          <p className="mt-8 border-t border-slate-200 pt-5 text-xs leading-relaxed text-slate-500">
            Responder accounts are created by barangay personnel. Cannot sign
            in? Contact the barangay operations desk.
          </p>
        </div>
      </main>
    </div>
  );
}
