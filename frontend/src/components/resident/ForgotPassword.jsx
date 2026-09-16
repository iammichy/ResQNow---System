// src/components/resident/ForgotPassword.jsx

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  MailCheck,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

import {
  apiRequest,
  getCsrfCookie,
} from '../../services/api';

// ============ HELPERS ============

// Hide part of the email while still showing
// the resident which address they entered.
function maskEmail(email) {
  const [
    localPart = '',
    domain = '',
  ] = email.split('@');

  if (
    !localPart ||
    !domain
  ) {
    return email;
  }

  if (
    localPart.length <= 2
  ) {
    return `${localPart[0] || '*'}***@${domain}`;
  }

  const first =
    localPart[0];

  const last =
    localPart[
      localPart.length - 1
    ];

  return `${first}${'*'.repeat(
    Math.min(
      localPart.length - 2,
      8
    )
  )}${last}@${domain}`;
}

// ============ FORGOT PASSWORD ============

export default function ForgotPassword() {
  const emailRef =
    useRef(null);

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    submittedEmail,
    setSubmittedEmail,
  ] = useState('');

  const [
    fieldError,
    setFieldError,
  ] = useState('');

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    isSuccess,
    setIsSuccess,
  ] = useState(false);

  const [
    resendSeconds,
    setResendSeconds,
  ] = useState(0);

  const [
    resendMessage,
    setResendMessage,
  ] = useState('');

  // ============ RESEND TIMER ============

  useEffect(() => {
    if (
      resendSeconds <= 0
    ) {
      return undefined;
    }

    const timer =
      window.setInterval(
        () => {
          setResendSeconds(
            (current) =>
              Math.max(
                current - 1,
                0
              )
          );
        },
        1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    resendSeconds,
  ]);

  // ============ VALIDATION ============

  const validateEmail =
    (value) => {
      const normalized =
        value.trim();

      if (!normalized) {
        return 'Email address is required.';
      }

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          normalized
        )
      ) {
        return 'Enter a valid email address.';
      }

      return '';
    };

  // ============ SEND RESET REQUEST ============

  const sendResetRequest =
    async (
      normalizedEmail
    ) => {
      await getCsrfCookie();

      await apiRequest(
        '/api/forgot-password',
        {
          method: 'POST',

          body:
            JSON.stringify({
              email:
                normalizedEmail,
            }),
        }
      );
    };

  // ============ SUBMIT ============

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      setErrorMessage('');
      setFieldError('');
      setResendMessage('');

      const validationError =
        validateEmail(
          email
        );

      if (validationError) {
        setFieldError(
          validationError
        );

        emailRef.current?.focus();

        return;
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      setIsSubmitting(true);

      try {
        await sendResetRequest(
          normalizedEmail
        );

        setSubmittedEmail(
          normalizedEmail
        );

        setIsSuccess(true);

        // Common-app pattern:
        // wait before another resend.
        setResendSeconds(60);
      } catch (error) {
        const backendEmailError =
          error?.errors
            ?.email?.[0];

        if (
          backendEmailError
        ) {
          setFieldError(
            backendEmailError
          );
        } else {
          setErrorMessage(
            error?.message ||
              'Unable to request password reset instructions. Please try again.'
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    };

  // ============ RESEND ============

  const handleResend =
    async () => {
      if (
        isSubmitting ||
        resendSeconds > 0 ||
        !submittedEmail
      ) {
        return;
      }

      setErrorMessage('');
      setResendMessage('');
      setIsSubmitting(true);

      try {
        await sendResetRequest(
          submittedEmail
        );

        setResendSeconds(60);

        setResendMessage(
          'A new reset request has been sent.'
        );
      } catch (error) {
        setErrorMessage(
          error?.message ||
            'Unable to resend reset instructions. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  // ============ CHANGE EMAIL ============

  const handleDifferentEmail =
    () => {
      setIsSuccess(false);
      setEmail(
        submittedEmail
      );
      setSubmittedEmail('');
      setErrorMessage('');
      setFieldError('');
      setResendMessage('');
      setResendSeconds(0);

      window.setTimeout(
        () => {
          emailRef.current?.focus();
        },
        0
      );
    };

  // ============ SUCCESS SCREEN ============

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-resqnow-canvas px-4 py-8 flex items-center justify-center">

        <div className="w-full max-w-md">

          <div className="bg-white border border-resqnow-border-soft rounded-3xl p-6 shadow-[0_10px_30px_rgba(31,29,71,0.06)]">

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-resqnow-safe/10 flex items-center justify-center mx-auto">

              <MailCheck className="w-8 h-8 text-resqnow-safe" />
            </div>

            {/* Heading */}
            <div className="text-center mt-5">

              <h1 className="text-[22px] font-bold text-resqnow-primary">
                Check your inbox
              </h1>

              <p className="text-[13px] text-resqnow-muted mt-2 leading-relaxed">
                We&apos;ve processed your password reset request for:
              </p>
            </div>

            {/* Masked email */}
            <div className="bg-resqnow-canvas border border-resqnow-border-soft rounded-xl px-4 py-3 mt-4 text-center">

              <p className="text-[13px] font-semibold text-resqnow-primary break-all">
                {
                  maskEmail(
                    submittedEmail
                  )
                }
              </p>
            </div>

            {/* Security-safe message */}
            <p className="text-[12px] text-resqnow-muted text-center mt-4 leading-relaxed">
              If a resident account exists for this email,
              you&apos;ll receive a password reset link shortly.
            </p>

            {/* Helpful instruction */}
            <div className="bg-resqnow-violet/5 border border-resqnow-violet/10 rounded-xl p-3 mt-4">

              <p className="text-[12px] text-resqnow-secondary leading-relaxed text-center">
                Didn&apos;t receive anything? Check your
                <span className="font-semibold">
                  {' '}Spam or Junk folder
                </span>
                {' '}before requesting another link.
              </p>
            </div>

            {/* Resend success */}
            {resendMessage && (
              <div
                role="status"
                className="mt-3 bg-resqnow-safe/10 border border-resqnow-safe/20 rounded-xl p-3"
              >
                <div className="flex items-start gap-2">

                  <CheckCircle2 className="w-4 h-4 text-resqnow-safe mt-0.5 shrink-0" />

                  <p className="text-[12px] text-resqnow-safe">
                    {resendMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-3 bg-resqnow-critical/10 border border-resqnow-critical/20 rounded-xl p-3"
              >
                <div className="flex items-start gap-2">

                  <AlertCircle className="w-4 h-4 text-resqnow-critical mt-0.5 shrink-0" />

                  <p className="text-[12px] text-resqnow-crimson leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Resend button */}
            <button
              type="button"
              onClick={
                handleResend
              }
              disabled={
                isSubmitting ||
                resendSeconds > 0
              }
              className="w-full min-h-[48px] mt-5 rounded-xl bg-brand-gradient text-white text-[13px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />

                  Sending...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />

                  {resendSeconds >
                  0
                    ? `Resend in ${resendSeconds}s`
                    : 'Resend Email'}
                </>
              )}
            </button>

            {/* Different email */}
            <button
              type="button"
              onClick={
                handleDifferentEmail
              }
              className="w-full min-h-[44px] mt-2 text-[12px] font-semibold text-resqnow-violet flex items-center justify-center hover:underline"
            >
              Use a different email
            </button>

            {/* Sign in */}
            <Link
              to="/login"
              className="w-full min-h-[44px] mt-1 text-[12px] font-medium text-resqnow-muted flex items-center justify-center hover:text-resqnow-violet"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============ REQUEST FORM ============

  return (
    <div className="min-h-screen bg-resqnow-canvas px-4 py-8 flex items-center justify-center">

      <div className="w-full max-w-md">

        {/* Back */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-resqnow-muted hover:text-resqnow-violet mb-5"
        >
          <ArrowLeft className="w-4 h-4" />

          Back to Sign In
        </Link>

        {/* Header */}
        <div className="text-center mb-5">

          <div className="w-14 h-14 rounded-2xl bg-resqnow-violet/10 text-resqnow-violet flex items-center justify-center mx-auto">

            <KeyRound className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-bold text-resqnow-primary mt-4">
            Forgot Password?
          </h1>

          <p className="text-[13px] text-resqnow-muted mt-2 leading-relaxed">
            Enter the email associated with your resident account
            and we&apos;ll send password reset instructions.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={
            handleSubmit
          }
          noValidate
          className="bg-white border border-resqnow-border-soft rounded-3xl p-5 shadow-[0_10px_30px_rgba(31,29,71,0.05)]"
        >

          {/* General error */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 bg-resqnow-critical/10 border border-resqnow-critical/20 rounded-xl p-3"
            >
              <div className="flex items-start gap-2.5">

                <AlertCircle className="w-4 h-4 text-resqnow-critical mt-0.5 shrink-0" />

                <p className="text-[12px] text-resqnow-crimson leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Email */}
          <div>

            <label
              htmlFor="forgotEmail"
              className="text-[12px] font-semibold text-resqnow-primary"
            >
              Email Address
            </label>

            <div className="relative mt-1.5">

              <Mail
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  fieldError
                    ? 'text-resqnow-critical'
                    : 'text-resqnow-muted'
                }`}
              />

              <input
                ref={
                  emailRef
                }
                id="forgotEmail"
                type="email"
                value={
                  email
                }
                onChange={(
                  event
                ) => {
                  setEmail(
                    event.target.value
                  );

                  setFieldError('');
                  setErrorMessage('');
                }}
                autoComplete="email"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="you@example.com"
                className={`w-full min-h-[48px] rounded-xl border bg-white pl-10 pr-4 py-3 text-[13px] text-resqnow-primary outline-none transition-all ${
                  fieldError
                    ? 'border-resqnow-critical focus:ring-2 focus:ring-resqnow-critical/10'
                    : 'border-resqnow-border focus:border-resqnow-violet/40 focus:ring-2 focus:ring-resqnow-violet/10'
                }`}
              />
            </div>

            {fieldError && (
              <p className="text-[11px] text-resqnow-critical mt-1.5">
                {fieldError}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="w-full min-h-[48px] mt-5 rounded-xl bg-brand-gradient text-white text-[13px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />

                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />

                Send Reset Link
              </>
            )}
          </button>
        </form>

        {/* Security explanation */}
        <p className="text-[11px] text-resqnow-muted text-center mt-4 px-4 leading-relaxed">
          For security, ResQNow will not confirm whether
          an email address is registered.
        </p>
      </div>
    </div>
  );
}