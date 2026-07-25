"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

const CAPTCHA_CHARACTERS =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function createCaptchaCode() {
  let code = "";

  for (let index = 0; index < 5; index += 1) {
    const randomIndex = Math.floor(
      Math.random() * CAPTCHA_CHARACTERS.length,
    );

    code += CAPTCHA_CHARACTERS[randomIndex];
  }

  return code;
}

export default function LoginPage() {
  const router = useRouter();

  const [loginIdentifier, setLoginIdentifier] =
    useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [captchaCode, setCaptchaCode] =
    useState("ABCDE");

  const [captchaAnswer, setCaptchaAnswer] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    setCaptchaCode(createCaptchaCode());
  }, []);

  function generateCaptcha(
    clearCurrentError = true,
  ) {
    setCaptchaCode(createCaptchaCode());
    setCaptchaAnswer("");

    if (clearCurrentError) {
      setErrorMessage("");
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setErrorMessage("");

    const identifier = loginIdentifier.trim();

    if (!identifier) {
      setErrorMessage(
        "Please enter your email address or mobile number.",
      );
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const mobilePattern =
      /^[6-9]\d{9}$/;

    const containsOnlyNumbers =
      /^\d+$/.test(identifier);

    if (containsOnlyNumbers) {
      if (!mobilePattern.test(identifier)) {
        setErrorMessage(
          "Please enter a valid 10-digit mobile number.",
        );
        return;
      }
    } else {
      if (!emailPattern.test(identifier)) {
        setErrorMessage(
          "Please enter a valid email address or mobile number.",
        );
        return;
      }
    }

    if (!password.trim()) {
      setErrorMessage(
        "Please enter your password.",
      );
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (!captchaAnswer.trim()) {
      setErrorMessage(
        "Please enter the CAPTCHA code.",
      );
      return;
    }

    if (
      captchaAnswer.trim().toUpperCase() !==
      captchaCode
    ) {
      generateCaptcha(false);

      setErrorMessage(
        "Incorrect CAPTCHA code. Please try again.",
      );
      return;
    }

    // Frontend navigation only
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[36%_64%]">
        {/* Left Section */}
        <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

          {/* Logo */}
          <Link
            href="/login"
            className="relative z-10 inline-flex items-center gap-3"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg font-bold text-white">
              L
            </span>

            <span>
              <span className="block text-xl font-bold text-white">
                LOOP
              </span>

              <span className="block text-sm text-slate-400">
                Feedback Intelligence
              </span>
            </span>
          </Link>

          {/* Information */}
          <div className="relative z-10">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100">
              AI-powered customer intelligence
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-white">
              Understand every customer voice.
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-300">
              Analyse feedback, understand sentiment
              and discover meaningful customer
              insights.
            </p>

            <div className="mt-8 space-y-4">
              <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20 text-lg text-blue-300">
                  ✦
                </span>

                <h2 className="mt-4 text-base font-bold text-white">
                  AI Insights
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Discover customer sentiment,
                  themes and important feedback
                  trends.
                </p>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/20 text-lg text-violet-300">
                  ◉
                </span>

                <h2 className="mt-4 text-base font-bold text-white">
                  Secure Workspace
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Access dashboards, reports and
                  insights from one workspace.
                </p>
              </article>
            </div>
          </div>

          <p className="relative z-10 text-sm text-slate-500">
            © 2026 Project LOOP
          </p>
        </section>

        {/* Login Form Section */}
        <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-xl">
            {/* Mobile Logo */}
            <Link
              href="/login"
              className="mb-8 inline-flex items-center gap-3 lg:hidden"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg font-bold text-white">
                L
              </span>

              <span>
                <span className="block text-xl font-bold text-slate-950">
                  LOOP
                </span>

                <span className="block text-sm text-slate-600">
                  Feedback Intelligence
                </span>
              </span>
            </Link>

            {/* Login Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
                Welcome back
              </p>

              <h1 className="mt-3 text-4xl font-bold text-slate-950">
                Sign in to LOOP
              </h1>

              <p className="mt-3 text-base leading-7 text-slate-600">
                Enter your account details to access
                your workspace.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-9 space-y-6"
              >
                {/* Email or Mobile Number */}
                <div>
                  <label
                    htmlFor="loginIdentifier"
                    className="text-base font-semibold text-slate-800"
                  >
                    Email or Mobile Number
                  </label>

                  <input
                    id="loginIdentifier"
                    type="text"
                    value={loginIdentifier}
                    onChange={(event) => {
                      setLoginIdentifier(
                        event.target.value,
                      );
                      setErrorMessage("");
                    }}
                    placeholder="Enter email or 10-digit mobile number"
                    autoComplete="username"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-5 py-4 text-base font-medium text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-500 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="loginPassword"
                    className="text-base font-semibold text-slate-800"
                  >
                    Password
                  </label>

                  <div className="mt-2 flex items-center rounded-xl border border-slate-300 bg-slate-50 px-5 transition focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                    <input
                      id="loginPassword"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) => {
                        setPassword(
                          event.target.value,
                        );
                        setErrorMessage("");
                      }}
                      placeholder="Minimum 8 characters"
                      autoComplete="current-password"
                      className="w-full bg-transparent py-4 text-base font-medium text-slate-950 outline-none placeholder:font-normal placeholder:text-slate-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous,
                        )
                      }
                      className="ml-3 shrink-0 text-sm font-bold text-blue-700 transition hover:text-blue-900"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div className="mt-3 text-right">
                    <button
                      type="button"
                      className="text-sm font-bold text-blue-700 transition hover:text-blue-900"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {/* CAPTCHA */}
                <div>
                  <label
                    htmlFor="captcha"
                    className="text-base font-semibold text-slate-800"
                  >
                    CAPTCHA
                  </label>

                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {/* Left - CAPTCHA Code */}
                    <div className="flex min-w-0 items-stretch gap-2">
                      <div className="relative flex min-h-14 min-w-0 flex-1 select-none items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-gradient-to-r from-slate-100 via-blue-50 to-violet-50 px-3">
                        <div className="absolute left-0 top-1/3 h-px w-full rotate-6 bg-blue-300" />

                        <div className="absolute left-0 top-2/3 h-px w-full -rotate-6 bg-violet-300" />

                        <div className="absolute left-1/3 top-0 h-full w-px rotate-12 bg-slate-300" />

                        <div className="absolute left-4 top-2 h-1.5 w-1.5 rounded-full bg-blue-400" />

                        <div className="absolute bottom-2 right-5 h-1.5 w-1.5 rounded-full bg-violet-400" />

                        <span className="relative z-10 -rotate-2 whitespace-nowrap text-xl font-black tracking-[0.25em] text-slate-800">
                          {captchaCode}
                        </span>
                      </div>

                      {/* Refresh CAPTCHA */}
                      <button
                        type="button"
                        onClick={() =>
                          generateCaptcha()
                        }
                        aria-label="Refresh CAPTCHA"
                        title="Refresh CAPTCHA"
                        className="flex w-14 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20 7v5h-5"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 17v-5h5"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.1 9A7 7 0 0 1 18 6.5L20 9"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.9 15A7 7 0 0 1 6 17.5L4 15"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Right - CAPTCHA Input */}
                    <input
                      id="captcha"
                      type="text"
                      value={captchaAnswer}
                      maxLength={5}
                      onChange={(event) => {
                        const value =
                          event.target.value
                            .replace(
                              /[^a-zA-Z0-9]/g,
                              "",
                            )
                            .toUpperCase();

                        setCaptchaAnswer(value);
                        setErrorMessage("");
                      }}
                      placeholder="Enter CAPTCHA"
                      autoComplete="off"
                      spellCheck={false}
                      className="min-h-14 min-w-0 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base font-bold uppercase tracking-[0.12em] text-slate-950 outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-500 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Remember Me */}
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(
                        event.target.checked,
                      )
                    }
                    className="h-5 w-5 accent-blue-600"
                  />

                  <span className="text-base font-medium text-slate-700">
                    Remember me on this device
                  </span>
                </label>

                {/* Error Message */}
                {errorMessage && (
                  <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-base font-medium text-rose-800">
                    {errorMessage}
                  </div>
                )}

                {/* Sign In Button */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Sign In
                </button>
              </form>

              {/* Signup Link */}
              <p className="mt-8 text-center text-base text-slate-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-blue-700 transition hover:text-blue-900"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}