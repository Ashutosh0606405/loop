"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] =
    useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [agreeTerms, setAgreeTerms] =
    useState(false);

  /* Email OTP States */
  const [emailOtpSent, setEmailOtpSent] =
    useState(false);

  const [emailOtp, setEmailOtp] = useState("");

  const [isEmailVerified, setIsEmailVerified] =
    useState(false);

  const [
    emailResendSeconds,
    setEmailResendSeconds,
  ] = useState(0);

  /* Mobile OTP States */
  const [mobileOtpSent, setMobileOtpSent] =
    useState(false);

  const [mobileOtp, setMobileOtp] = useState("");

  const [
    isMobileVerified,
    setIsMobileVerified,
  ] = useState(false);

  const [
    mobileResendSeconds,
    setMobileResendSeconds,
  ] = useState(0);

  const [errorMessage, setErrorMessage] =
    useState("");

  /* Email OTP Timer */
  useEffect(() => {
    if (
      !emailOtpSent ||
      emailResendSeconds <= 0 ||
      isEmailVerified
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setEmailResendSeconds(
        (previous) => previous - 1,
      );
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    emailOtpSent,
    emailResendSeconds,
    isEmailVerified,
  ]);

  /* Mobile OTP Timer */
  useEffect(() => {
    if (
      !mobileOtpSent ||
      mobileResendSeconds <= 0 ||
      isMobileVerified
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setMobileResendSeconds(
        (previous) => previous - 1,
      );
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    mobileOtpSent,
    mobileResendSeconds,
    isMobileVerified,
  ]);

  function clearError() {
    setErrorMessage("");
  }

  function isValidEmail(emailValue: string) {
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(
      emailValue.trim(),
    );
  }

  function isValidMobile(
    mobileValue: string,
  ) {
    const mobilePattern = /^[6-9]\d{9}$/;

    return mobilePattern.test(mobileValue);
  }

  function formatTimer(seconds: number) {
    return `00:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  /* Reset Email Verification */
  function resetEmailVerification() {
    setEmailOtp("");
    setEmailOtpSent(false);
    setIsEmailVerified(false);
    setEmailResendSeconds(0);
  }

  /* Send Email OTP */
  function handleSendEmailOtp() {
    clearError();

    if (!email.trim()) {
      setErrorMessage(
        "Please enter your email address.",
      );
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage(
        "Please enter a valid email address.",
      );
      return;
    }

    setEmailOtp("");
    setEmailOtpSent(true);
    setIsEmailVerified(false);
    setEmailResendSeconds(30);
  }

  /* Verify Email OTP */
  function handleVerifyEmailOtp() {
    clearError();

    if (!emailOtp.trim()) {
      setErrorMessage(
        "Please enter the email OTP.",
      );
      return;
    }

    if (!/^\d{6}$/.test(emailOtp)) {
      setErrorMessage(
        "Email OTP must contain exactly 6 digits.",
      );
      return;
    }

    setIsEmailVerified(true);
    setEmailResendSeconds(0);
  }

  /* Resend Email OTP */
  function handleResendEmailOtp() {
    if (emailResendSeconds > 0) {
      return;
    }

    clearError();
    setEmailOtp("");
    setEmailOtpSent(true);
    setIsEmailVerified(false);
    setEmailResendSeconds(30);
  }

  /* Reset Mobile Verification */
  function resetMobileVerification() {
    setMobileOtp("");
    setMobileOtpSent(false);
    setIsMobileVerified(false);
    setMobileResendSeconds(0);
  }

  /* Send Mobile OTP */
  function handleSendMobileOtp() {
    clearError();

    if (!mobileNumber.trim()) {
      setErrorMessage(
        "Please enter your mobile number.",
      );
      return;
    }

    if (!isValidMobile(mobileNumber)) {
      setErrorMessage(
        "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    setMobileOtp("");
    setMobileOtpSent(true);
    setIsMobileVerified(false);
    setMobileResendSeconds(30);
  }

  /* Verify Mobile OTP */
  function handleVerifyMobileOtp() {
    clearError();

    if (!mobileOtp.trim()) {
      setErrorMessage(
        "Please enter the mobile OTP.",
      );
      return;
    }

    if (!/^\d{6}$/.test(mobileOtp)) {
      setErrorMessage(
        "Mobile OTP must contain exactly 6 digits.",
      );
      return;
    }

    setIsMobileVerified(true);
    setMobileResendSeconds(0);
  }

  /* Resend Mobile OTP */
  function handleResendMobileOtp() {
    if (mobileResendSeconds > 0) {
      return;
    }

    clearError();
    setMobileOtp("");
    setMobileOtpSent(true);
    setIsMobileVerified(false);
    setMobileResendSeconds(30);
  }

  /* Create Account */
  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    clearError();

    if (
      !fullName.trim() ||
      !email.trim() ||
      !mobileNumber.trim() ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage(
        "Please complete all required fields.",
      );
      return;
    }

    if (fullName.trim().length < 3) {
      setErrorMessage(
        "Full name must contain at least 3 characters.",
      );
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage(
        "Please enter a valid email address.",
      );
      return;
    }

    if (!isEmailVerified) {
      setErrorMessage(
        "Please verify your email address.",
      );
      return;
    }

    if (!isValidMobile(mobileNumber)) {
      setErrorMessage(
        "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    if (!isMobileVerified) {
      setErrorMessage(
        "Please verify your mobile number.",
      );
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "Password and confirm password do not match.",
      );
      return;
    }

    if (!agreeTerms) {
      setErrorMessage(
        "Please accept the Terms and Privacy Policy.",
      );
      return;
    }

    router.replace("/login");
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
              Create your LOOP account.
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-300">
              Verify your contact details and
              access customer feedback insights.
            </p>

            <div className="mt-8 space-y-4">
              <article className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 font-bold text-blue-300">
                  01
                </span>

                <div>
                  <h2 className="font-bold text-white">
                    Verify your email
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Complete email OTP verification.
                  </p>
                </div>
              </article>

              <article className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 font-bold text-violet-300">
                  02
                </span>

                <div>
                  <h2 className="font-bold text-white">
                    Verify your mobile
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Complete mobile OTP verification.
                  </p>
                </div>
              </article>

              <article className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 font-bold text-emerald-300">
                  03
                </span>

                <div>
                  <h2 className="font-bold text-white">
                    Create your account
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Set your password and continue.
                  </p>
                </div>
              </article>
            </div>
          </div>

          <p className="relative z-10 text-sm text-slate-500">
            © 2026 Project LOOP
          </p>
        </section>

        {/* Signup Form Section */}
        <section className="flex items-start justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-2xl">
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

            {/* Signup Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
                Get started
              </p>

              <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                Create your account
              </h1>

              <p className="mt-3 text-base leading-7 text-slate-600">
                Enter and verify your details to
                create a LOOP account.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-9 space-y-6"
              >
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="text-base font-semibold text-slate-800"
                  >
                    Full name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);
                      clearError();
                    }}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-5 py-4 text-base font-medium text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="signupEmail"
                    className="text-base font-semibold text-slate-800"
                  >
                    Email address
                  </label>

                  <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <input
                      id="signupEmail"
                      type="email"
                      value={email}
                      disabled={isEmailVerified}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        resetEmailVerification();
                        clearError();
                      }}
                      placeholder="name@example.com"
                      autoComplete="email"
                      className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-5 py-4 text-base font-medium text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />

                    {!emailOtpSent &&
                      !isEmailVerified && (
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          className="shrink-0 rounded-xl bg-slate-950 px-6 py-4 text-base font-bold text-white transition hover:bg-slate-800"
                        >
                          Send OTP
                        </button>
                      )}
                  </div>

                  {isEmailVerified && (
                    <p className="mt-3 font-semibold text-emerald-700">
                      ✓ Email verified
                    </p>
                  )}
                </div>

                {/* Email OTP */}
                {emailOtpSent &&
                  !isEmailVerified && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                      <label
                        htmlFor="emailOtp"
                        className="text-base font-semibold text-slate-800"
                      >
                        Email verification code
                      </label>

                      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <input
                          id="emailOtp"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={emailOtp}
                          onChange={(event) => {
                            setEmailOtp(
                              event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6),
                            );

                            clearError();
                          }}
                          placeholder="Enter 6-digit OTP"
                          className="min-w-0 flex-1 rounded-xl border border-blue-200 bg-white px-5 py-4 text-center text-base font-bold tracking-[0.2em] text-slate-950 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                        />

                        <button
                          type="button"
                          onClick={
                            handleVerifyEmailOtp
                          }
                          className="rounded-xl bg-blue-700 px-6 py-4 font-bold text-white hover:bg-blue-800"
                        >
                          Verify
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm text-slate-600">
                          Didn&apos;t receive the code?
                        </span>

                        {emailResendSeconds > 0 ? (
                          <span className="text-sm font-semibold text-slate-500">
                            Resend in{" "}
                            {formatTimer(
                              emailResendSeconds,
                            )}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={
                              handleResendEmailOtp
                            }
                            className="text-sm font-bold text-blue-700"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                {/* Mobile Number */}
                <div>
                  <label
                    htmlFor="mobileNumber"
                    className="text-base font-semibold text-slate-800"
                  >
                    Mobile number
                  </label>

                  <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <div className="flex min-w-0 flex-1 items-center rounded-xl border border-slate-300 bg-slate-50 transition focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                      <span className="border-r border-slate-300 px-4 py-4 font-bold text-slate-700">
                        +91
                      </span>

                      <input
                        id="mobileNumber"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={mobileNumber}
                        disabled={isMobileVerified}
                        onChange={(event) => {
                          const numberValue =
                            event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10);

                          setMobileNumber(numberValue);
                          resetMobileVerification();
                          clearError();
                        }}
                        placeholder="Enter 10-digit number"
                        autoComplete="tel"
                        className="min-w-0 flex-1 bg-transparent px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
                      />
                    </div>

                    {!mobileOtpSent &&
                      !isMobileVerified && (
                        <button
                          type="button"
                          onClick={
                            handleSendMobileOtp
                          }
                          className="shrink-0 rounded-xl bg-slate-950 px-6 py-4 text-base font-bold text-white transition hover:bg-slate-800"
                        >
                          Send OTP
                        </button>
                      )}
                  </div>

                  {isMobileVerified && (
                    <p className="mt-3 font-semibold text-emerald-700">
                      ✓ Mobile number verified
                    </p>
                  )}
                </div>

                {/* Mobile OTP */}
                {mobileOtpSent &&
                  !isMobileVerified && (
                    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
                      <label
                        htmlFor="mobileOtp"
                        className="text-base font-semibold text-slate-800"
                      >
                        Mobile verification code
                      </label>

                      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <input
                          id="mobileOtp"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={mobileOtp}
                          onChange={(event) => {
                            setMobileOtp(
                              event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6),
                            );

                            clearError();
                          }}
                          placeholder="Enter 6-digit OTP"
                          className="min-w-0 flex-1 rounded-xl border border-violet-200 bg-white px-5 py-4 text-center text-base font-bold tracking-[0.2em] text-slate-950 outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-100"
                        />

                        <button
                          type="button"
                          onClick={
                            handleVerifyMobileOtp
                          }
                          className="rounded-xl bg-violet-700 px-6 py-4 font-bold text-white hover:bg-violet-800"
                        >
                          Verify
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm text-slate-600">
                          Didn&apos;t receive the code?
                        </span>

                        {mobileResendSeconds > 0 ? (
                          <span className="text-sm font-semibold text-slate-500">
                            Resend in{" "}
                            {formatTimer(
                              mobileResendSeconds,
                            )}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={
                              handleResendMobileOtp
                            }
                            className="text-sm font-bold text-violet-700"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                {/* Password */}
                <div>
                  <label
                    htmlFor="signupPassword"
                    className="text-base font-semibold text-slate-800"
                  >
                    Password
                  </label>

                  <div className="mt-2 flex items-center rounded-xl border border-slate-300 bg-slate-50 px-5 transition focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                    <input
                      id="signupPassword"
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
                        clearError();
                      }}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      className="w-full bg-transparent py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous,
                        )
                      }
                      className="ml-3 text-sm font-bold text-blue-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="text-base font-semibold text-slate-800"
                  >
                    Confirm password
                  </label>

                  <div className="mt-2 flex items-center rounded-xl border border-slate-300 bg-slate-50 px-5 transition focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(
                          event.target.value,
                        );
                        clearError();
                      }}
                      placeholder="Enter password again"
                      autoComplete="new-password"
                      className="w-full bg-transparent py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) => !previous,
                        )
                      }
                      className="ml-3 text-sm font-bold text-blue-700"
                    >
                      {showConfirmPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(event) => {
                      setAgreeTerms(
                        event.target.checked,
                      );
                      clearError();
                    }}
                    className="mt-1 h-5 w-5 accent-blue-600"
                  />

                  <span className="text-base leading-7 text-slate-700">
                    I agree to the{" "}
                    <span className="font-bold text-blue-700">
                      Terms
                    </span>{" "}
                    and{" "}
                    <span className="font-bold text-blue-700">
                      Privacy Policy
                    </span>
                    .
                  </span>
                </label>

                {/* Error */}
                {errorMessage && (
                  <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 font-medium text-rose-800">
                    {errorMessage}
                  </div>
                )}

                {/* Create Account */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5"
                >
                  Create Account
                </button>
              </form>

              <p className="mt-8 text-center text-base text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-blue-700 hover:text-blue-900"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}