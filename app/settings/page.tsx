"use client";

import { useState } from "react";
import LoopShell from "../../components/LoopShell";

type SettingsTab =
  | "account"
  | "security"
  | "notifications";

export default function SettingsPage() {
  const [activeTab, setActiveTab] =
    useState<SettingsTab>("account");

  const [displayName, setDisplayName] =
    useState("Lakshmipriya D");

  const [email, setEmail] = useState(
    "lakshmipriyad219@gmail.com",
  );

  const [mobile, setMobile] =
    useState("9677479492");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [weeklyDigest, setWeeklyDigest] =
    useState(true);

  const [feedbackAlerts, setFeedbackAlerts] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

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

  function changeTab(tab: SettingsTab) {
    setActiveTab(tab);
    clearMessages();
  }

  function isValidEmail(emailValue: string) {
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(emailValue.trim());
  }

  function isValidMobile(mobileValue: string) {
    const mobilePattern = /^[6-9]\d{9}$/;

    return mobilePattern.test(mobileValue);
  }

  function handleAccountSave() {
    clearMessages();

    if (
      !displayName.trim() ||
      !email.trim() ||
      !mobile.trim()
    ) {
      setErrorMessage(
        "Please complete all account fields.",
      );
      return;
    }

    if (displayName.trim().length < 3) {
      setErrorMessage(
        "Display name must contain at least 3 characters.",
      );
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage(
        "Please enter a valid email address.",
      );
      return;
    }

    if (!isValidMobile(mobile)) {
      setErrorMessage(
        "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    showSuccess(
      "Account information updated successfully.",
    );
  }

  function handlePasswordUpdate() {
    clearMessages();

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setErrorMessage(
        "Please complete all password fields.",
      );
      return;
    }

    if (currentPassword.length < 8) {
      setErrorMessage(
        "Current password must contain at least 8 characters.",
      );
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage(
        "New password must contain at least 8 characters.",
      );
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage(
        "New password must be different from the current password.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        "New password and confirm password do not match.",
      );
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    showSuccess(
      "Password updated successfully.",
    );
  }

  function handleNotificationSave() {
    showSuccess(
      "Notification preferences updated successfully.",
    );
  }

  return (
    <LoopShell
      title="Account Settings"
      description="Manage your account, security and notification preferences."
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Left Settings Navigation */}
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="px-4 pb-4 pt-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Preferences
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-950">
                Settings
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
                onClick={() => changeTab("account")}
                icon="user"
              />

              <SettingsTabButton
                label="Security"
                description="Password and access"
                active={activeTab === "security"}
                onClick={() => changeTab("security")}
                icon="security"
              />

              <SettingsTabButton
                label="Notifications"
                description="Alerts and updates"
                active={activeTab === "notifications"}
                onClick={() =>
                  changeTab("notifications")
                }
                icon="notification"
              />
            </div>

            {/* Account Status */}
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950 p-4 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
                Account status
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

                <span className="text-sm font-bold">
                  Active and verified
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Your LOOP workspace account is active.
              </p>
            </div>
          </aside>

          {/* Right Settings Content */}
          <section className="space-y-5">
            {/* Success Message */}
            {successMessage && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  ✓
                </span>

                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100">
                  !
                </span>

                {errorMessage}
              </div>
            )}

            {/* Account Tab */}
            {activeTab === "account" && (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {/* Account Header */}
                <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 p-6 sm:p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                    <UserIcon />
                  </span>

                  <h2 className="mt-5 text-2xl font-bold text-slate-950">
                    Account Information
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    Update your personal and contact
                    information for Project LOOP.
                  </p>
                </div>

                {/* Account Form */}
                <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
                  <SettingsInput
                    label="Display name"
                    value={displayName}
                    onChange={(value) => {
                      setDisplayName(value);
                      clearMessages();
                    }}
                    placeholder="Enter display name"
                  />

                  <SettingsInput
                    label="Email address"
                    value={email}
                    onChange={(value) => {
                      setEmail(value);
                      clearMessages();
                    }}
                    type="email"
                    placeholder="Enter email address"
                  />

                  <SettingsInput
                    label="Mobile number"
                    value={mobile}
                    onChange={(value) => {
                      const numbersOnly = value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                      setMobile(numbersOnly);
                      clearMessages();
                    }}
                    type="tel"
                    placeholder="Enter mobile number"
                    maxLength={10}
                  />

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Workspace role
                    </label>

                    <div className="mt-2 flex min-h-12 items-center rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-500">
                      Analyst
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Workspace role is managed by the administrator.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Workspace
                    </label>

                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 font-black text-white">
                        L
                      </span>

                      <div>
                        <p className="font-bold text-slate-950">
                          Project LOOP
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Customer Feedback Intelligence
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAccountSave}
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                    >
                      Save Account Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {/* Security Header */}
                <div className="border-b border-slate-200 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-rose-50 p-6 sm:p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
                    <SecurityIcon />
                  </span>

                  <h2 className="mt-5 text-2xl font-bold text-slate-950">
                    Security Settings
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    Update your password and protect
                    your workspace account.
                  </p>
                </div>

                {/* Security Form */}
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

                  <PasswordInput
                    label="Confirm new password"
                    value={confirmPassword}
                    onChange={(value) => {
                      setConfirmPassword(value);
                      clearMessages();
                    }}
                    autoComplete="new-password"
                  />

                  {/* Password Recommendation */}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 font-bold text-amber-700">
                        !
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

                  {/* Security Status */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SecurityStatusCard
                      title="Email verified"
                      description="Your email address is verified."
                    />

                    <SecurityStatusCard
                      title="Mobile verified"
                      description="Your mobile number is verified."
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handlePasswordUpdate}
                      className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {/* Notifications Header */}
                <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-6 sm:p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                    <NotificationIcon />
                  </span>

                  <h2 className="mt-5 text-2xl font-bold text-slate-950">
                    Notification Preferences
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    Choose the account and feedback
                    updates you want to receive.
                  </p>
                </div>

                {/* Notification Settings */}
                <div className="divide-y divide-slate-100 p-6 sm:p-8">
                  <ToggleSetting
                    title="Email notifications"
                    description="Receive important account and workspace updates through email."
                    enabled={emailNotifications}
                    onChange={(value) => {
                      setEmailNotifications(value);
                      clearMessages();
                    }}
                  />

                  <ToggleSetting
                    title="Weekly feedback digest"
                    description="Receive a weekly summary of feedback, sentiment and customer trends."
                    enabled={weeklyDigest}
                    onChange={(value) => {
                      setWeeklyDigest(value);
                      clearMessages();
                    }}
                  />

                  <ToggleSetting
                    title="New feedback alerts"
                    description="Receive an alert whenever new customer feedback is added."
                    enabled={feedbackAlerts}
                    onChange={(value) => {
                      setFeedbackAlerts(value);
                      clearMessages();
                    }}
                  />

                  <div className="flex justify-end pt-6">
                    <button
                      type="button"
                      onClick={handleNotificationSave}
                      className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                    >
                      Save Preferences
                    </button>
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
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
  icon: "user" | "security" | "notification";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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

      <span className="min-w-0">
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label}
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

function ToggleSetting({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5 first:pt-0">
      <div>
        <h3 className="text-sm font-bold text-slate-950">
          {title}
        </h3>

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

function SecurityStatusCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-700">
        ✓
      </span>

      <div>
        <p className="text-sm font-bold text-emerald-900">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-emerald-700">
          {description}
        </p>
      </div>
    </div>
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