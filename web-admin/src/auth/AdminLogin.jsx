import { useState } from "react";

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      return;
    }

    if (onLogin) {
      onLogin({
        username: username.trim(),
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8ED] p-3 sm:p-4 lg:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1600px] overflow-hidden rounded-[30px] bg-white shadow-2xl sm:min-h-[calc(100vh-32px)] lg:min-h-[calc(100vh-48px)]">
        {/* LEFT PANEL */}
        <section className="relative hidden w-1/2 overflow-hidden lg:flex">
          {/* MAIN GRADIENT BACKGROUND */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#8346F2] via-[#4F7DF3] to-[#16BFA8]" />

          {/* SOFT OVERLAY */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.02))]" />

          {/* ABSTRACT SHAPES */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-32 -top-48 h-[520px] w-[720px] rounded-full bg-white/10" />

            <div className="absolute -left-48 bottom-[-320px] h-[620px] w-[720px] rounded-full bg-[#1F1D47]/10" />

            <div className="absolute right-[-240px] top-[-180px] h-[420px] w-[480px] rounded-full bg-white/10" />

            <div className="absolute bottom-[18%] left-[18%] h-40 w-40 rounded-full border border-white/10" />

            <div className="absolute right-[15%] top-[22%] h-24 w-24 rounded-full border border-white/15" />
          </div>

          {/* LOGO AREA */}
          <div className="relative z-10 flex h-full w-full items-center justify-center">
            <div className="relative flex h-[260px] w-[260px] items-center justify-center rounded-[52px] border border-white/20 bg-white/15 shadow-[0_30px_70px_rgba(31,29,71,0.25)] backdrop-blur-md xl:h-[280px] xl:w-[280px]">
              {/* INNER GRADIENT */}
              <div className="absolute inset-3 rounded-[42px] bg-gradient-to-br from-[#8346F2] via-[#4F7DF3] to-[#16BFA8] opacity-80" />

              {/* SHIELD */}
              <svg
                viewBox="0 0 120 140"
                className="relative z-10 h-[135px] w-[135px] xl:h-[150px] xl:w-[150px]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M60 8C45 22 32 29 14 31V68C14 99 32 120 60 134C88 120 106 99 106 68V31C88 29 75 22 60 8Z"
                  stroke="white"
                  strokeWidth="9"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="relative flex min-h-full w-full flex-col bg-white lg:w-1/2">
          {/* SUBTLE TOP GRADIENT */}
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#8346F2] via-[#4F7DF3] to-[#16BFA8]" />

          {/* TOP CONTROLS */}
          <div className="absolute right-6 top-6 z-20 flex gap-3 sm:right-8 sm:top-8">
            <button
              type="button"
              aria-label="Toggle theme"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D0D5DD] bg-white text-[#1F1D47] transition hover:border-[#8346F2] hover:text-[#8346F2]"
            >
              ◐
            </button>

            <button
              type="button"
              className="flex h-11 items-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-4 text-sm font-semibold text-[#1F1D47] transition hover:border-[#8346F2] hover:text-[#8346F2]"
            >
              <span>English</span>

              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 9 6 6 6-6"
                />
              </svg>
            </button>
          </div>

          {/* LOGIN CONTENT */}
          <div className="flex min-h-full flex-1 items-center justify-center px-6 py-20 sm:px-10 lg:px-14 xl:px-20">
            <div className="w-full max-w-[490px]">
              {/* HEADER */}
              <div className="text-center">
                <p className="text-xl font-medium text-[#667085]">Welcome to</p>

                <h1 className="mt-1 text-5xl font-extrabold tracking-tight sm:text-6xl">
                  <span className="text-[#1F1D47]">Res</span>

                  <span className="bg-gradient-to-r from-[#8346F2] via-[#4F7DF3] to-[#16BFA8] bg-clip-text text-transparent">
                    QNow
                  </span>
                </h1>

                <p className="mt-1 text-2xl font-bold text-[#1F1D47]">
                  Barangay Web Admin
                </p>

                <p className="mt-5 text-sm text-[#667085]">
                  Sign in to access the admin dashboard
                </p>
              </div>

              {/* LOGIN FORM */}
              <form onSubmit={handleSubmit} className="mt-12 space-y-6">
                {/* USERNAME */}
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-semibold text-[#1F1D47]"
                  >
                    Username
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg text-[#4F7DF3]">
                      ♟
                    </span>

                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Enter your username"
                      autoComplete="username"
                      className="h-[58px] w-full rounded-2xl border border-[#D0D5DD] bg-[#FCFCFD] pl-14 pr-5 text-sm text-[#1F1D47] outline-none transition placeholder:text-[#98A2B3] hover:border-[#4F7DF3] focus:border-[#4F7DF3] focus:bg-white focus:ring-4 focus:ring-[#4F7DF3]/10"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#1F1D47]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg">
                      🔒
                    </span>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-[58px] w-full rounded-2xl border border-[#D0D5DD] bg-[#FCFCFD] pl-14 pr-14 text-sm text-[#1F1D47] outline-none transition placeholder:text-[#98A2B3] hover:border-[#4F7DF3] focus:border-[#4F7DF3] focus:bg-white focus:ring-4 focus:ring-[#4F7DF3]/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#667085] transition hover:text-[#4F7DF3]"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "◉" : "◌"}
                    </button>
                  </div>
                </div>

                {/* SIGN IN */}
                <button
                  type="submit"
                  className="flex h-[58px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#8346F2] via-[#4F7DF3] to-[#16BFA8] text-sm font-bold text-white shadow-lg shadow-[#4F7DF3]/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#4F7DF3]/30 active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#4F7DF3]/20"
                >
                  <span>Sign In</span>
                  <span className="text-lg">→</span>
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminLogin;
