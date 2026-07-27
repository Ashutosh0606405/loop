"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Sign Up Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regWorkspace, setRegWorkspace] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  // Instant Google / Demo OAuth Button Handler
  const handleGoogleAuth = async () => {
    setLoginEmail("admin@acme.com");
    setLoginPassword("password123");
    setLoginLoading(true);
    setLoginError("");

    const res = await signIn("credentials", {
      email: "admin@acme.com",
      password: "password123",
      redirect: false,
    });

    setLoginLoading(false);
    if (res?.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setLoginError("Failed to sign in. Please try again.");
    }
  };

  // Quick Demo Login Presets
  const handleDemoLogin = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = "password123";
    setLoginEmail(cleanEmail);
    setLoginPassword(cleanPassword);
    setLoginLoading(true);
    setLoginError("");

    const res = await signIn("credentials", {
      email: cleanEmail,
      password: cleanPassword,
      redirect: false,
    });

    setLoginLoading(false);
    if (res?.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setLoginError("Failed to authenticate demo account.");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPassword = loginPassword.trim();

    if (!cleanEmail || !cleanPassword) {
      setLoginLoading(false);
      setLoginError("Please enter email and password.");
      return;
    }

    const res = await signIn("credentials", {
      email: cleanEmail,
      password: cleanPassword,
      redirect: false,
    });

    setLoginLoading(false);
    if (res?.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setLoginError("Invalid email or password. Please try again.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");
    setRegSuccess("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          password: regPassword.trim(),
          workspaceName: regWorkspace.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegLoading(false);
        setRegError(data.error || "Registration failed. Please check inputs.");
        return;
      }

      setRegSuccess("Account & Workspace created successfully! Signing you in...");

      // Automatically sign in after registration
      const loginRes = await signIn("credentials", {
        email: regEmail.trim().toLowerCase(),
        password: regPassword.trim(),
        redirect: false,
      });

      setRegLoading(false);
      if (loginRes?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setActiveTab("login");
        setLoginEmail(regEmail.trim().toLowerCase());
      }
    } catch (err) {
      setRegLoading(false);
      setRegError("An unexpected error occurred during registration.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/20">
              L
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white">Project LOOP</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
                AI Customer-Feedback Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 lg:hidden">
            <button
              onClick={() => setActiveTab("login")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === "login" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === "register" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Auth Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col items-center justify-center">
        {/* Banner Title */}
        <div className="text-center max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Multi-Tenant Enterprise Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Turn Scattered Feedback into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">Actionable Intelligence</span>
          </h1>
          <p className="mt-4 text-slate-400 text-base md:text-lg">
            Sign in to your team workspace or register a new account to experience AI-powered auto-classification, vector RAG search, and Voice-of-Customer reports.
          </p>
        </div>

        {/* Two Boxes Container (Side-by-side on LG screens, Tabbed on Mobile) */}
        <div className="w-full grid gap-8 lg:grid-cols-2 max-w-5xl">
          {/* BOX 1: SIGN IN FORM */}
          <div
            className={`rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur flex flex-col justify-between transition-all ${
              activeTab === "login" ? "block" : "hidden lg:flex"
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Sign In to Workspace</h2>
                  <p className="text-xs text-slate-400 mt-1">Existing team members and administrators</p>
                </div>
                <span className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">
                  🔑
                </span>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full mb-6 flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 hover:border-slate-700 shadow-sm"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign In with Google
              </button>

              <div className="relative flex items-center justify-center mb-6">
                <div className="w-full border-t border-slate-800" />
                <span className="absolute bg-slate-900 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Or email credentials
                </span>
              </div>

              {loginError && (
                <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  ⚠️ {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:from-blue-500 hover:to-violet-500 disabled:opacity-50"
                >
                  {loginLoading ? "Authenticating..." : "Sign In to Workspace →"}
                </button>
              </form>
            </div>

            {/* Quick Demo Credentials Assistant */}
            <div className="mt-8 border-t border-slate-800/80 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                ⚡ Quick Demo Presets (1-Click Login)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDemoLogin("admin@acme.com")}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left transition hover:border-blue-500/50 hover:bg-slate-950"
                >
                  <p className="text-xs font-bold text-blue-400">Admin Account</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">admin@acme.com</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin("analyst@acme.com")}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left transition hover:border-violet-500/50 hover:bg-slate-950"
                >
                  <p className="text-xs font-bold text-violet-400">Analyst Account</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">analyst@acme.com</p>
                </button>
              </div>
            </div>
          </div>

          {/* BOX 2: SIGN UP / REGISTER FORM */}
          <div
            className={`rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur flex flex-col justify-between transition-all ${
              activeTab === "register" ? "block" : "hidden lg:flex"
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Create New Workspace</h2>
                  <p className="text-xs text-slate-400 mt-1">Register a new company workspace & admin account</p>
                </div>
                <span className="h-9 w-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-sm font-bold">
                  ✨
                </span>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full mb-5 flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 hover:border-slate-700 shadow-sm"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign Up with Google
              </button>

              <div className="relative flex items-center justify-center mb-5">
                <div className="w-full border-t border-slate-800" />
                <span className="absolute bg-slate-900 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Or register via form
                </span>
              </div>

              {regError && (
                <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  ⚠️ {regError}
                </div>
              )}

              {regSuccess && (
                <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  ✅ {regSuccess}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ashutosh Soni"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regWorkspace}
                    onChange={(e) => setRegWorkspace(e.target.value)}
                    placeholder="Acme Corp Intelligence"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ashutosh@company.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Create Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/30 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 mt-2"
                >
                  {regLoading ? "Provisioning Workspace..." : "Create Workspace & Sign Up ✨"}
                </button>
              </form>
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              Strict multi-tenant workspace isolation guaranteed.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        Project LOOP • AI Customer Feedback Intelligence Platform
      </footer>
    </div>
  );
}