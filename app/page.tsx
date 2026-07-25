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

  // Quick Demo Login Presets
  const handleDemoLogin = async (email: string) => {
    setLoginEmail(email);
    setLoginPassword("password123");
    setLoginLoading(true);
    setLoginError("");

    const res = await signIn("credentials", {
      email,
      password: "password123",
      redirect: false,
    });

    setLoginLoading(false);
    if (res?.error) {
      setLoginError(res.error);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    const res = await signIn("credentials", {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    });

    setLoginLoading(false);
    if (res?.error) {
      setLoginError("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard");
      router.refresh();
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
          name: regName,
          email: regEmail,
          password: regPassword,
          workspaceName: regWorkspace,
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
        email: regEmail,
        password: regPassword,
        redirect: false,
      });

      setRegLoading(false);
      if (loginRes?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setActiveTab("login");
        setLoginEmail(regEmail);
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

              {regError && (
                <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  ⚠️ {regError}
                </div>
              )}

              {regSuccess && (
                <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  ✅ {regSuccess}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
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

            <p className="mt-6 text-center text-xs text-slate-500">
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