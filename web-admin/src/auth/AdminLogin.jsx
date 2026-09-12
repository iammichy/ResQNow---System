import { useEffect, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  AlertCircle,
  Loader2,
} from "lucide-react";

import camunatanEntrance from "../assets/camunatan-entrance.png";
import salamatpo from "../assets/salamatpo.png";

function AdminLogin({ onLogin }) {
  const usernameRef = useRef(null);

  const [username, setUsername] = useState(() => {
    return localStorage.getItem("resqnow_admin_remembered_username") || "";
  });

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(() => {
    return Boolean(
      localStorage.getItem("resqnow_admin_remembered_username")
    );
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

    const rememberedUsername = localStorage.getItem(
      "resqnow_admin_remembered_username"
    );

    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }

  const handleFocus = (field) => {
    setFocusedField(field);

    setFieldErrors((current) => ({
      ...current,
      [field]: "",
    }));

    setError("");
  };

  const handleBlur = (field) => {
    if (field === "username" && !username.trim()) {
      setFieldErrors((current) => ({
        ...current,
        username: "Username is required",
      }));
    }

    if (field === "password" && !password.trim()) {
      setFieldErrors((current) => ({
        ...current,
        password: "Password is required",
      }));
    }

    setFocusedField(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    const errors = {
      username: !username.trim() ? "Username is required" : "",
      password: !password.trim() ? "Password is required" : "",
    };

    setFieldErrors(errors);

    if (errors.username || errors.password) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (rememberMe) {
        localStorage.setItem(
          "resqnow_admin_remembered_username",
          username.trim()
        );
      } else {
        localStorage.removeItem(
          "resqnow_admin_remembered_username"
        );
      }

      if (onLogin) {
        onLogin({
          username: username.trim(),
        });
      }

      setIsSubmitting(false);
    }, 700);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1F1D47] p-4 sm:p-6">
      
      {/* BACKGROUND */}
<div
  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: `url(${salamatpo})`,
  }}
/>

{/* CLEAN DARK OVERLAY FOR READABILITY */}
<div className="absolute inset-0 bg-[#1F1D47]/45" />

     {/* GRADIENT OVERLAY */}
<div className="absolute inset-0 bg-gradient-to-br from-[#1F1D47]/65 via-[#4F7DF3]/45 to-[#16BFA8]/40" />

{/* SOFT DARK OVERLAY */}
<div className="absolute inset-0 bg-black/10" />

      {/* LOGIN CONTAINER */}
      <div className="relative z-10 flex w-full max-w-[820px] flex-col items-center justify-center gap-5 md:flex-row md:items-stretch">

        {/* BRANDING CARD */}
        <div className="flex w-full max-w-[250px] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/95 text-center shadow-[0_8px_30px_rgb(0,0,0,0.12)]">

          {/* CAMUNATAN IMAGE */}
          <div className="relative h-[150px] w-full overflow-hidden">
            <img
              src={camunatanEntrance}
              alt="Barangay Camunatan"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#1F1D47]/70 via-transparent to-transparent" />

            <div className="absolute bottom-3 left-0 right-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                Barangay Camunatan
              </p>
            </div>
          </div>

          {/* BRAND INFORMATION */}
          <div className="flex flex-1 flex-col items-center px-7 py-7">

            <h1 className="text-[28px] font-extrabold tracking-tight text-[#1F1D47]">
              ResQNow
            </h1>

            <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
              Barangay Camunatan
              <br />
              City of Ilagan
            </p>

            <div className="my-6 w-full border-t border-slate-100" />

            <p className="text-[12px] leading-relaxed text-slate-500">
              Hazard Reporting, Triage, and Emergency Response Coordination System
            </p>

            <div className="mt-auto pt-6">
              <div className="flex items-center justify-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Secure Admin Access
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LOGIN FORM CARD */}
        <div className="w-full max-w-[450px] rounded-2xl border border-white/50 bg-white/95 px-8 py-9 shadow-[0_8px_30px_rgb(0,0,0,0.12)] sm:px-10">

          {/* HEADER */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8346F2]">
              Authorized Personnel Access
            </p>

            <h2 className="mt-2 text-[24px] font-bold text-[#1F1D47]">
              Barangay Web Admin
            </h2>

            <p className="mt-1 text-[13px] text-slate-500">
              Sign in to access the emergency response dashboard
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{error}</span>
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-7 space-y-5"
          >

            {/* USERNAME */}
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-[13px] font-semibold text-slate-700"
              >
                Username
              </label>

              <div
                className={`relative rounded-xl transition-all duration-200 ${
                  fieldErrors.username
                    ? "ring-2 ring-red-300"
                    : focusedField === "username"
                    ? "ring-2 ring-[#8346F2]/30"
                    : "ring-1 ring-slate-200"
                }`}
              >
                <User
                  className={`absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-colors ${
                    focusedField === "username"
                      ? "text-[#8346F2]"
                      : fieldErrors.username
                      ? "text-red-400"
                      : "text-slate-400"
                  }`}
                />

                <input
                  ref={usernameRef}
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);

                    setFieldErrors((current) => ({
                      ...current,
                      username: "",
                    }));

                    setError("");
                  }}
                  onFocus={() => handleFocus("username")}
                  onBlur={() => handleBlur("username")}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className={`w-full rounded-xl py-3 pl-[46px] pr-4 text-[14px] text-[#1F1D47] outline-none transition-colors ${
                    fieldErrors.username
                      ? "bg-red-50/50"
                      : "bg-slate-50"
                  }`}
                />
              </div>

              {fieldErrors.username && (
                <p className="ml-1 mt-1.5 text-[11px] text-red-500">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[13px] font-semibold text-slate-700"
              >
                Password
              </label>

              <div
                className={`relative rounded-xl transition-all duration-200 ${
                  fieldErrors.password
                    ? "ring-2 ring-red-300"
                    : focusedField === "password"
                    ? "ring-2 ring-[#8346F2]/30"
                    : "ring-1 ring-slate-200"
                }`}
              >
                <Lock
                  className={`absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-colors ${
                    focusedField === "password"
                      ? "text-[#8346F2]"
                      : fieldErrors.password
                      ? "text-red-400"
                      : "text-slate-400"
                  }`}
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);

                    setFieldErrors((current) => ({
                      ...current,
                      password: "",
                    }));

                    setError("");
                  }}
                  onFocus={() => handleFocus("password")}
                  onBlur={() => handleBlur("password")}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full rounded-xl py-3 pl-[46px] pr-12 text-[14px] text-[#1F1D47] outline-none transition-colors ${
                    fieldErrors.password
                      ? "bg-red-50/50"
                      : "bg-slate-50"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>

              {fieldErrors.password && (
                <p className="ml-1 mt-1.5 text-[11px] text-red-500">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* REMEMBER ME */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#8346F2] focus:ring-[#8346F2] focus:ring-offset-0"
                />

                <span className="text-[12px] text-slate-500">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                className="text-[12px] font-medium text-[#8346F2] transition-colors hover:text-[#4F7DF3]"
              >
                Forgot password?
              </button>
            </div>

            {/* SIGN IN */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8346F2] via-[#4F7DF3] to-[#16BFA8] py-3 text-[14px] font-semibold text-white shadow-[0_4px_16px_rgba(79,125,243,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(79,125,243,0.35)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* AUTHORIZED ACCESS NOTICE */}
          <div className="mt-8 border-t border-slate-200 pt-6">

            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Authorized Barangay Personnel Only
            </p>

            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
              This portal is intended for authorized barangay administrators
              and emergency response personnel responsible for report
              verification, prioritization, and response coordination.
            </p>

            <div className="mt-4 flex items-center justify-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Secure System Access
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;