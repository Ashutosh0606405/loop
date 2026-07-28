"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import LoopShell from "../../components/LoopShell";

type SettingsTab =
  | "account"
  | "security"
  | "notifications";

type AccountData = {
  displayName: string;
  email: string;
  mobile: string;
  location: string;
  jobTitle: string;
  timeZone: string;
};

type NotificationPreferences = {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  weeklyDigest: boolean;
  feedbackAlerts: boolean;
  urgentIssueAlerts: boolean;
  reportReadyAlerts: boolean;
  quietHours: boolean;
};

const initialAccountData: AccountData = {
  displayName: "Lakshmipriya D",
  email: "lakshmipriyad219@gmail.com",
  mobile: "9677479492",
  location: "Theni, Tamil Nadu",
  jobTitle: "Frontend Contributor",
  timeZone: "Asia/Kolkata",
};

const initialNotificationPreferences: NotificationPreferences =
  {
    emailNotifications: true,
    inAppNotifications: true,
    weeklyDigest: true,
    feedbackAlerts: false,
    urgentIssueAlerts: true,
    reportReadyAlerts: true,
    quietHours: false,
  };

export default function SettingsPage() {
  const [activeTab, setActiveTab] =
    useState<SettingsTab>("account");

  const [account, setAccount] =
    useState<AccountData>(initialAccountData);

  const [draftAccount, setDraftAccount] =
    useState<AccountData>(initialAccountData);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [twoFactorEnabled, setTwoFactorEnabled] =
    useState(false);

  const [loginAlerts, setLoginAlerts] =
    useState(true);

  const [
    notificationPreferences,
    setNotificationPreferences,
  ] = useState<NotificationPreferences>(
    initialNotificationPreferences,
  );

  const [digestFrequency, setDigestFrequency] =
    useState("Weekly");

  const [quietHoursStart, setQuietHoursStart] =
    useState("22:00");

  const [quietHoursEnd, setQuietHoursEnd] =
    useState("07:00");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const profileInitials = useMemo(() => {
    const initials = account.displayName
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return initials || "LP";
  }, [account.displayName]);

  const accountCompletion = useMemo(() => {
    const values = Object.values(account);

    const completedFields = values.filter(
      (value) => value.trim().length > 0,
    ).length;

    return Math.round(
      (completedFields / values.length) * 100,
    );
  }, [account]);

  const hasAccountChanges = useMemo(() => {
    return (
      JSON.stringify(account) !==
      JSON.stringify(draftAccount)
    );
  }, [account, draftAccount]);

  const passwordStrength = useMemo(() => {
    let score = 0;

    if (newPassword.length >= 8) {
      score += 1;
    }

    if (/[A-Z]/.test(newPassword)) {
      score += 1;
    }

    if (/[a-z]/.test(newPassword)) {
      score += 1;
    }

    if (/\d/.test(newPassword)) {
      score += 1;
    }

    if (/[^A-Za-z0-9]/.test(newPassword)) {
      score += 1;
    }

    return score;
  }, [newPassword]);

  const activeNotificationCount = useMemo(() => {
    return Object.values(
      notificationPreferences,
    ).filter(Boolean).length;
  }, [notificationPreferences]);

  function clearMessages() {
    setSuccessMessage("");
    setErrorMessage("");
  }

  function showSuccess(message: string) {
    setErrorMessage("");
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }

  function showError(message: string) {
    setSuccessMessage("");
    setErrorMessage(message);
  }

  function changeTab(tab: SettingsTab) {
    setActiveTab(tab);
    clearMessages();
  }

  function updateAccountField(
    field: keyof AccountData,
    value: string,
  ) {
    setDraftAccount((previous) => ({
      ...previous,
      [field]: value,
    }));

    clearMessages();
  }

  function isValidEmail(emailValue: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      emailValue.trim(),
    );
  }

  function isValidMobile(mobileValue: string) {
    return /^[6-9]\d{9}$/.test(mobileValue);
  }

  function handleAccountSave() {
    clearMessages();

    if (
      !draftAccount.displayName.trim() ||
      !draftAccount.email.trim() ||
      !draftAccount.mobile.trim() ||
      !draftAccount.location.trim() ||
      !draftAccount.jobTitle.trim()
    ) {
      showError(
        "Please complete all required account fields.",
      );
      return;
    }

    if (
      draftAccount.displayName.trim().length < 3
    ) {
      showError(
        "Display name must contain at least 3 characters.",
      );
      return;
    }

    if (!isValidEmail(draftAccount.email)) {
      showError(
        "Please enter a valid email address.",
      );
      return;
    }

    if (!isValidMobile(draftAccount.mobile)) {
      showError(
        "Please enter a valid 10-digit Indian mobile number.",
      );
      return;
    }

    setIsSaving(true);

    window.setTimeout(() => {
      setAccount(draftAccount);
      setIsSaving(false);

      showSuccess(
        "Account information updated successfully.",
      );
    }, 700);
  }

  function resetAccountChanges() {
    setDraftAccount(account);
    clearMessages();
  }

  function handlePasswordUpdate() {
    clearMessages();

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      showError(
        "Please complete all password fields.",
      );
      return;
    }

    if (currentPassword.length < 8) {
      showError(
        "Current password must contain at least 8 characters.",
      );
      return;
    }

    if (newPassword.length < 8) {
      showError(
        "New password must contain at least 8 characters.",
      );
      return;
    }

    if (passwordStrength < 4) {
      showError(
        "Use uppercase, lowercase, number and symbol in the new password.",
      );
      return;
    }

    if (currentPassword === newPassword) {
      showError(
        "New password must be different from the current password.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showError(
        "New password and confirm password do not match.",
      );
      return;
    }

    setIsSaving(true);

    window.setTimeout(() => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsSaving(false);

      showSuccess(
        "Password updated successfully.",
      );
    }, 700);
  }

  function updateNotification(
    field: keyof NotificationPreferences,
    value: boolean,
  ) {
    setNotificationPreferences(
      (previous) => ({
        ...previous,
        [field]: value,
      }),
    );

    clearMessages();
  }

  function handleNotificationSave() {
    setIsSaving(true);

    window.setTimeout(() => {
      setIsSaving(false);

      showSuccess(
        "Notification preferences updated successfully.",
      );
    }, 600);
  }

  function handleTwoFactorChange(
    enabled: boolean,
  ) {
    setTwoFactorEnabled(enabled);

    showSuccess(
      enabled
        ? "Two-factor authentication enabled."
        : "Two-factor authentication disabled.",
    );
  }

  function handleSignOutOtherSessions() {
    showSuccess(
      "All other active sessions have been signed out.",
    );
  }

  return (
    <LoopShell
      title="Account Settings"
      description="Manage your account, security and notification preferences."
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Settings Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-6 text-white shadow-xl sm:p-8">
          <div className="absolute -left-20 top-4 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-2xl font-black text-white backdrop-blur">
                {profileInitials}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    Account Preferences
                  </h1>

                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />

                    Verified
                  </span>
                </div>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                  Manage your personal information,
                  account security and communication
                  preferences for Project LOOP.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/profile"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                <UserIcon />

                View Profile
              </Link>

              <span className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950">
                <ShieldCheckIcon />

                Account Secure
              </span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Settings Navigation */}
          <aside className="h-fit space-y-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="px-4 pb-4 pt-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Settings menu
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  Preferences
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your LOOP account.
                </p>
              </div>

              <div className="space-y-2">
                <SettingsTabButton
                  label="Account"
                  description="Personal information"
                  active={activeTab === "account"}
                  onClick={() =>
                    changeTab("account")
                  }
                  icon="user"
                />

                <SettingsTabButton
                  label="Security"
                  description="Password and sessions"
                  active={activeTab === "security"}
                  onClick={() =>
                    changeTab("security")
                  }
                  icon="security"
                />

                <SettingsTabButton
                  label="Notifications"
                  description="Alerts and updates"
                  active={
                    activeTab ===
                    "notifications"
                  }
                  onClick={() =>
                    changeTab("notifications")
                  }
                  icon="notification"
                  badge={activeNotificationCount}
                />
              </div>
            </div>

            {/* Account Health */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-950 to-indigo-950 p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
                  Account health
                </p>

                <span className="text-lg font-black">
                  {accountCompletion}%
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-400 transition-all"
                  style={{
                    width: `${accountCompletion}%`,
                  }}
                />
              </div>

              <div className="mt-5 space-y-3">
                <StatusRow
                  label="Email verified"
                  completed
                />

                <StatusRow
                  label="Mobile verified"
                  completed
                />

                <StatusRow
                  label="Two-factor authentication"
                  completed={twoFactorEnabled}
                />
              </div>
            </div>
          </aside>

          {/* Settings Content */}
          <section className="min-w-0 space-y-5">
            {successMessage && (
              <AlertMessage
                type="success"
                message={successMessage}
                onClose={() =>
                  setSuccessMessage("")
                }
              />
            )}

            {errorMessage && (
              <AlertMessage
                type="error"
                message={errorMessage}
                onClose={() =>
                  setErrorMessage("")
                }
              />
            )}

            {/* Account Tab */}
            {activeTab === "account" && (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 p-6 sm:p-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                        <UserIcon />
                      </span>

                      <div>
                        <h2 className="text-2xl font-bold text-slate-950">
                          Account Information
                        </h2>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                          Update your personal and
                          contact information for
                          Project LOOP.
                        </p>
                      </div>
                    </div>

                    {hasAccountChanges && (
                      <span className="w-fit rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
                        Unsaved changes
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
                  <SettingsInput
                    label="Display name"
                    value={
                      draftAccount.displayName
                    }
                    onChange={(value) =>
                      updateAccountField(
                        "displayName",
                        value,
                      )
                    }
                    placeholder="Enter display name"
                    required
                  />

                  <SettingsInput
                    label="Email address"
                    value={draftAccount.email}
                    onChange={(value) =>
                      updateAccountField(
                        "email",
                        value,
                      )
                    }
                    type="email"
                    placeholder="Enter email address"
                    required
                  />

                  <SettingsInput
                    label="Mobile number"
                    value={draftAccount.mobile}
                    onChange={(value) => {
                      const numbersOnly = value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                      updateAccountField(
                        "mobile",
                        numbersOnly,
                      );
                    }}
                    type="tel"
                    placeholder="Enter mobile number"
                    maxLength={10}
                    required
                  />

                  <SettingsInput
                    label="Location"
                    value={draftAccount.location}
                    onChange={(value) =>
                      updateAccountField(
                        "location",
                        value,
                      )
                    }
                    placeholder="Enter your location"
                    required
                  />

                  <SettingsInput
                    label="Job title"
                    value={draftAccount.jobTitle}
                    onChange={(value) =>
                      updateAccountField(
                        "jobTitle",
                        value,
                      )
                    }
                    placeholder="Enter job title"
                    required
                  />

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Time zone
                    </label>

                    <select
                      value={
                        draftAccount.timeZone
                      }
                      onChange={(event) =>
                        updateAccountField(
                          "timeZone",
                          event.target.value,
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="Asia/Kolkata">
                        India Standard Time
                      </option>

                      <option value="UTC">
                        Coordinated Universal Time
                      </option>

                      <option value="Asia/Singapore">
                        Singapore Time
                      </option>

                      <option value="Europe/London">
                        London Time
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Workspace role
                    </label>

                    <div className="mt-2 flex min-h-12 items-center justify-between rounded-xl border border-slate-200 bg-slate-100 px-4">
                      <span className="text-sm font-semibold text-slate-500">
                        Analyst
                      </span>

                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500">
                        Admin managed
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Workspace role cannot be changed
                      from account settings.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Connected workspace
                    </label>

                    <div className="mt-2 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-violet-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg font-black text-white shadow-lg shadow-blue-200">
                          L
                        </span>

                        <div>
                          <p className="font-bold text-slate-950">
                            Project LOOP
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Customer Feedback
                            Intelligence Platform
                          </p>
                        </div>
                      </div>

                      <span className="flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                        Connected
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-400">
                      Account information will remain
                      unchanged until you save.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={
                          resetAccountChanges
                        }
                        disabled={
                          !hasAccountChanges ||
                          isSaving
                        }
                        className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Reset Changes
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleAccountSave
                        }
                        disabled={
                          !hasAccountChanges ||
                          isSaving
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <LoadingSpinner />

                            Saving…
                          </>
                        ) : (
                          <>
                            <SaveIcon />

                            Save Account Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-rose-50 p-6 sm:p-8">
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
                        <SecurityIcon />
                      </span>

                      <div>
                        <h2 className="text-2xl font-bold text-slate-950">
                          Password Security
                        </h2>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                          Create a strong password and
                          protect your workspace
                          account.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 p-6 sm:p-8">
                    <PasswordInput
                      label="Current password"
                      value={currentPassword}
                      onChange={(value) => {
                        setCurrentPassword(value);
                        clearMessages();
                      }}
                      autoComplete="current-password"
                    />

                    <PasswordInput
                      label="New password"
                      value={newPassword}
                      onChange={(value) => {
                        setNewPassword(value);
                        clearMessages();
                      }}
                      autoComplete="new-password"
                    />

                    {newPassword && (
                      <PasswordStrength
                        score={passwordStrength}
                      />
                    )}

                    <PasswordInput
                      label="Confirm new password"
                      value={confirmPassword}
                      onChange={(value) => {
                        setConfirmPassword(value);
                        clearMessages();
                      }}
                      autoComplete="new-password"
                    />

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                          <InfoIcon />
                        </span>

                        <div>
                          <p className="text-sm font-bold text-amber-900">
                            Password recommendation
                          </p>

                          <p className="mt-1 text-sm leading-6 text-amber-800">
                            Use at least 8 characters
                            with uppercase, lowercase,
                            numbers and symbols.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={
                          handlePasswordUpdate
                        }
                        disabled={isSaving}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 disabled:opacity-50 sm:w-auto"
                      >
                        {isSaving ? (
                          <>
                            <LoadingSpinner />

                            Updating…
                          </>
                        ) : (
                          <>
                            <SecurityIcon />

                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security Controls */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">
                      Additional Security
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Add additional protection to
                      your account.
                    </p>
                  </div>

                  <div className="mt-6 divide-y divide-slate-100">
                    <ToggleSetting
                      title="Two-factor authentication"
                      description="Require an additional verification code when signing in."
                      enabled={twoFactorEnabled}
                      onChange={
                        handleTwoFactorChange
                      }
                      badge="Recommended"
                    />

                    <ToggleSetting
                      title="New login alerts"
                      description="Receive an alert when your account is accessed from a new device."
                      enabled={loginAlerts}
                      onChange={(value) => {
                        setLoginAlerts(value);
                        clearMessages();
                      }}
                    />
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">
                        Active Sessions
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Devices currently signed into
                        your account.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleSignOutOtherSessions
                      }
                      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                    >
                      Sign Out Other Sessions
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    <SessionCard
                      device="Windows · Chrome"
                      location="Theni, Tamil Nadu"
                      lastActive="Active now"
                      current
                    />

                    <SessionCard
                      device="Android Mobile"
                      location="Tamil Nadu, India"
                      lastActive="2 days ago"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-6 sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                          <NotificationIcon />
                        </span>

                        <div>
                          <h2 className="text-2xl font-bold text-slate-950">
                            Notification Preferences
                          </h2>

                          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                            Choose how and when you
                            receive workspace updates.
                          </p>
                        </div>
                      </div>

                      <span className="w-fit rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        {activeNotificationCount}{" "}
                        preferences enabled
                      </span>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    <NotificationSection
                      title="Delivery channels"
                      description="Choose where LOOP should send your updates."
                    >
                      <ToggleSetting
                        title="Email notifications"
                        description="Receive important account and workspace updates through email."
                        enabled={
                          notificationPreferences.emailNotifications
                        }
                        onChange={(value) =>
                          updateNotification(
                            "emailNotifications",
                            value,
                          )
                        }
                      />

                      <ToggleSetting
                        title="In-app notifications"
                        description="Display alerts inside your LOOP workspace."
                        enabled={
                          notificationPreferences.inAppNotifications
                        }
                        onChange={(value) =>
                          updateNotification(
                            "inAppNotifications",
                            value,
                          )
                        }
                      />
                    </NotificationSection>

                    <NotificationSection
                      title="Feedback intelligence"
                      description="Choose the feedback events that require an alert."
                    >
                      <ToggleSetting
                        title="New feedback alerts"
                        description="Receive an alert whenever new customer feedback is added."
                        enabled={
                          notificationPreferences.feedbackAlerts
                        }
                        onChange={(value) =>
                          updateNotification(
                            "feedbackAlerts",
                            value,
                          )
                        }
                      />

                      <ToggleSetting
                        title="Urgent issue alerts"
                        description="Receive immediate alerts for negative or high-priority customer issues."
                        enabled={
                          notificationPreferences.urgentIssueAlerts
                        }
                        onChange={(value) =>
                          updateNotification(
                            "urgentIssueAlerts",
                            value,
                          )
                        }
                        badge="Important"
                      />

                      <ToggleSetting
                        title="Report ready alerts"
                        description="Receive a notification when a generated report is ready."
                        enabled={
                          notificationPreferences.reportReadyAlerts
                        }
                        onChange={(value) =>
                          updateNotification(
                            "reportReadyAlerts",
                            value,
                          )
                        }
                      />
                    </NotificationSection>

                    <NotificationSection
                      title="Digest and quiet hours"
                      description="Control summary frequency and notification timing."
                    >
                      <ToggleSetting
                        title="Feedback digest"
                        description="Receive a scheduled summary of feedback, sentiment and themes."
                        enabled={
                          notificationPreferences.weeklyDigest
                        }
                        onChange={(value) =>
                          updateNotification(
                            "weeklyDigest",
                            value,
                          )
                        }
                      />

                      {notificationPreferences.weeklyDigest && (
                        <div className="pb-5">
                          <label className="text-sm font-semibold text-slate-700">
                            Digest frequency
                          </label>

                          <select
                            value={digestFrequency}
                            onChange={(event) => {
                              setDigestFrequency(
                                event.target.value,
                              );
                              clearMessages();
                            }}
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100 sm:max-w-sm"
                          >
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                          </select>
                        </div>
                      )}

                      <ToggleSetting
                        title="Quiet hours"
                        description="Pause non-urgent notifications during selected hours."
                        enabled={
                          notificationPreferences.quietHours
                        }
                        onChange={(value) =>
                          updateNotification(
                            "quietHours",
                            value,
                          )
                        }
                      />

                      {notificationPreferences.quietHours && (
                        <div className="grid gap-4 pb-5 sm:grid-cols-2">
                          <TimeInput
                            label="Quiet hours start"
                            value={quietHoursStart}
                            onChange={(value) => {
                              setQuietHoursStart(
                                value,
                              );
                              clearMessages();
                            }}
                          />

                          <TimeInput
                            label="Quiet hours end"
                            value={quietHoursEnd}
                            onChange={(value) => {
                              setQuietHoursEnd(
                                value,
                              );
                              clearMessages();
                            }}
                          />
                        </div>
                      )}
                    </NotificationSection>

                    <div className="flex justify-end border-t border-slate-100 pt-6">
                      <button
                        type="button"
                        onClick={
                          handleNotificationSave
                        }
                        disabled={isSaving}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 disabled:opacity-50 sm:w-auto"
                      >
                        {isSaving ? (
                          <>
                            <LoadingSpinner />

                            Saving…
                          </>
                        ) : (
                          <>
                            <SaveIcon />

                            Save Preferences
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </LoopShell>
  );
}

function SettingsTabButton({
  label,
  description,
  active,
  onClick,
  icon,
  badge,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
  icon:
    | "user"
    | "security"
    | "notification";
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={
        active ? "page" : undefined
      }
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
        active
          ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-200"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          active
            ? "bg-white/15 text-white"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {icon === "user" && <UserIcon />}

        {icon === "security" && (
          <SecurityIcon />
        )}

        {icon === "notification" && (
          <NotificationIcon />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">
          {label}
        </span>

        <span
          className={`mt-0.5 block truncate text-xs ${
            active
              ? "text-blue-100"
              : "text-slate-500"
          }`}
        >
          {description}
        </span>
      </span>

      {typeof badge === "number" && (
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-black ${
            active
              ? "bg-white/15 text-white"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function SettingsInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  maxLength,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-rose-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [showPassword, setShowPassword] =
    useState(false);

  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="mt-2 flex items-center rounded-xl border border-slate-300 bg-slate-50 px-4 transition focus-within:border-violet-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
        <input
          type={
            showPassword ? "text" : "password"
          }
          value={value}
          autoComplete={autoComplete}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder="Minimum 8 characters"
          className="min-w-0 flex-1 bg-transparent py-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400"
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword(
              (previous) => !previous,
            )
          }
          className="ml-3 shrink-0 text-xs font-bold text-violet-700 transition hover:text-violet-900"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

function PasswordStrength({
  score,
}: {
  score: number;
}) {
  const strength =
    score <= 1
      ? {
          label: "Weak",
          text: "text-rose-700",
          bar: "bg-rose-500",
        }
      : score <= 3
        ? {
            label: "Medium",
            text: "text-amber-700",
            bar: "bg-amber-500",
          }
        : {
            label: "Strong",
            text: "text-emerald-700",
            bar: "bg-emerald-500",
          };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-600">
          Password strength
        </p>

        <p
          className={`text-xs font-black ${strength.text}`}
        >
          {strength.label}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <span
              key={index}
              className={`h-2 rounded-full ${
                index < score
                  ? strength.bar
                  : "bg-slate-200"
              }`}
            />
          ),
        )}
      </div>

      <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
        <PasswordRule
          completed={new RegExp(
            ".{8,}",
          ).test("")}
          label="At least 8 characters"
          overrideCompleted={score >= 1}
        />

        <PasswordRule
          completed={score >= 2}
          label="Uppercase and lowercase"
        />

        <PasswordRule
          completed={score >= 4}
          label="Contains a number"
        />

        <PasswordRule
          completed={score >= 5}
          label="Contains a symbol"
        />
      </div>
    </div>
  );
}

function PasswordRule({
  completed,
  label,
  overrideCompleted,
}: {
  completed: boolean;
  label: string;
  overrideCompleted?: boolean;
}) {
  const isCompleted =
    overrideCompleted ?? completed;

  return (
    <span
      className={`flex items-center gap-2 ${
        isCompleted
          ? "text-emerald-700"
          : "text-slate-400"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
          isCompleted
            ? "bg-emerald-100"
            : "bg-slate-200"
        }`}
      >
        {isCompleted ? "✓" : "•"}
      </span>

      {label}
    </span>
  );
}

function ToggleSetting({
  title,
  description,
  enabled,
  onChange,
  badge,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5 first:pt-0">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-slate-950">
            {title}
          </h3>

          {badge && (
            <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-blue-700">
              {badge}
            </span>
          )}
        </div>

        <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled
            ? "bg-emerald-600"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled
              ? "translate-x-6"
              : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function NotificationSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-slate-100 py-6 first:pt-0 last:border-0">
      <div>
        <h3 className="font-bold text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="mt-5 divide-y divide-slate-100">
        {children}
      </div>
    </section>
  );
}

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type="time"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      />
    </div>
  );
}

function SessionCard({
  device,
  location,
  lastActive,
  current = false,
}: {
  device: string;
  location: string;
  lastActive: string;
  current?: boolean;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <DeviceIcon />
        </span>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-slate-950">
              {device}
            </p>

            {current && (
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                Current
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {location}
          </p>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-400">
        {lastActive}
      </p>
    </article>
  );
}

function StatusRow({
  label,
  completed,
}: {
  label: string;
  completed: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
          completed
            ? "bg-emerald-400/15 text-emerald-300"
            : "bg-white/10 text-slate-500"
        }`}
      >
        {completed ? "✓" : "–"}
      </span>
    </div>
  );
}

function AlertMessage({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  const success = type === "success";

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-semibold ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-rose-200 bg-rose-50 text-rose-800"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          success
            ? "bg-emerald-100"
            : "bg-rose-100"
        }`}
      >
        {success ? "✓" : "!"}
      </span>

      <span className="min-w-0 flex-1">
        {message}
      </span>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close message"
        className="text-current opacity-60 transition hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 21a7.5 7.5 0 0 1 15 0"
      />
    </svg>
  );
}

function SecurityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 12 2 2 4-4"
      />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8.5 12 2.2 2.2 4.8-4.8"
      />
    </svg>
  );
}

function NotificationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"
      />

      <path
        strokeLinecap="round"
        d="M10 21h4"
      />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 4h12l2 2v14H5V4Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 4v6h8V4M8 20v-6h8v6"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />

      <path
        strokeLinecap="round"
        d="M12 11v5M12 8h.01"
      />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="13"
        rx="2"
      />

      <path
        strokeLinecap="round"
        d="M8 21h8M12 17v4"
      />
    </svg>
  );
}