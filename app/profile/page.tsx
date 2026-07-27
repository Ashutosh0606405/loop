"use client";

import { useMemo, useState } from "react";
import LoopShell from "../../components/LoopShell";

type ProfileData = {
  fullName: string;
  role: string;
  email: string;
  mobile: string;
  location: string;
  bio: string;
};

const initialProfile: ProfileData = {
  fullName: "Lakshmipriya D",
  role: "Analyst",
  email: "lakshmipriyad219@gmail.com",
  mobile: "+91 96774 79492",
  location: "Theni, Tamil Nadu",
  bio: "Frontend contributor working on customer feedback interfaces, authentication screens and responsive user experiences for Project LOOP.",
};

const skills = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Git",
  "Frontend Development",
];

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<ProfileData>(initialProfile);

  const [draftProfile, setDraftProfile] =
    useState<ProfileData>(initialProfile);

  const [isEditing, setIsEditing] =
    useState(false);

  const [savedMessage, setSavedMessage] =
    useState("");

  const profileCompletion = useMemo(() => {
    const values = Object.values(profile);
    const completedValues = values.filter(
      (value) => value.trim().length > 0,
    );

    return Math.round(
      (completedValues.length / values.length) * 100,
    );
  }, [profile]);

  function handleEditProfile() {
    setDraftProfile(profile);
    setSavedMessage("");
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setDraftProfile(profile);
    setSavedMessage("");
    setIsEditing(false);
  }

  function handleSaveProfile() {
    setProfile(draftProfile);
    setIsEditing(false);
    setSavedMessage(
      "Profile details updated successfully.",
    );

    window.setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  }

  function updateDraft(
    field: keyof ProfileData,
    value: string,
  ) {
    setDraftProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  return (
    <LoopShell
      title="My Profile"
      description="View and manage your personal information."
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Profile Hero */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-40 overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 sm:h-48">
            <div className="absolute -left-16 top-4 h-52 w-52 rounded-full bg-white/10 blur-2xl" />

            <div className="absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />

            <div className="absolute right-8 top-8 hidden rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur sm:block">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-100">
                Workspace
              </p>

              <p className="mt-1 font-bold">
                Project LOOP
              </p>
            </div>
          </div>

          <div className="relative px-6 pb-7 sm:px-8">
            <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-blue-600 to-violet-600 text-4xl font-black text-white shadow-xl sm:h-32 sm:w-32">
                  LP
                </div>

                <div className="pb-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
                      {profile.fullName}
                    </h2>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      Active
                    </span>
                  </div>

                  <p className="mt-1 text-base font-medium text-slate-500">
                    {profile.role} · Project LOOP
                  </p>

                  <p className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-500 sm:justify-start">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
                      />

                      <circle
                        cx="12"
                        cy="10"
                        r="2.5"
                      />
                    </svg>

                    {profile.location}
                  </p>
                </div>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={handleEditProfile}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14 5 5 5M4 20l4.5-1 10-10a2 2 0 0 0-5-5l-10 10L4 20Z"
                    />
                  </svg>

                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </section>

        {savedMessage && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
              ✓
            </span>

            {savedMessage}
          </div>
        )}

        {/* Profile Summary */}
        <section className="grid gap-5 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 21a7.5 7.5 0 0 1 15 0"
                  />
                </svg>
              </span>

              <span className="text-2xl font-black text-slate-950">
                {profileCompletion}%
              </span>
            </div>

            <h3 className="mt-5 font-bold text-slate-950">
              Profile completion
            </h3>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600"
                style={{
                  width: `${profileCompletion}%`,
                }}
              />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h16v13H4zM8 7V4h8v3"
                />

                <path
                  strokeLinecap="round"
                  d="M4 12h16"
                />
              </svg>
            </span>

            <p className="mt-5 text-sm font-semibold text-slate-500">
              Workspace role
            </p>

            <p className="mt-1 text-xl font-bold text-slate-950">
              {profile.role}
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m5 12 4 4L19 6"
                />
              </svg>
            </span>

            <p className="mt-5 text-sm font-semibold text-slate-500">
              Account status
            </p>

            <p className="mt-1 text-xl font-bold text-emerald-700">
              Verified
            </p>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          {/* Personal Information */}
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-950">
                  Personal Information
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your profile and contact
                  details.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                Personal
              </span>
            </div>

            {isEditing ? (
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <ProfileInput
                  label="Full name"
                  value={draftProfile.fullName}
                  onChange={(value) =>
                    updateDraft("fullName", value)
                  }
                />

                <ProfileInput
                  label="Role"
                  value={draftProfile.role}
                  onChange={(value) =>
                    updateDraft("role", value)
                  }
                />

                <ProfileInput
                  label="Email address"
                  type="email"
                  value={draftProfile.email}
                  onChange={(value) =>
                    updateDraft("email", value)
                  }
                />

                <ProfileInput
                  label="Mobile number"
                  value={draftProfile.mobile}
                  onChange={(value) =>
                    updateDraft("mobile", value)
                  }
                />

                <div className="sm:col-span-2">
                  <ProfileInput
                    label="Location"
                    value={draftProfile.location}
                    onChange={(value) =>
                      updateDraft("location", value)
                    }
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">
                    About
                  </label>

                  <textarea
                    rows={4}
                    value={draftProfile.bio}
                    onChange={(event) =>
                      updateDraft(
                        "bio",
                        event.target.value,
                      )
                    }
                    className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <InformationCard
                  label="Full name"
                  value={profile.fullName}
                />

                <InformationCard
                  label="Role"
                  value={profile.role}
                />

                <InformationCard
                  label="Email address"
                  value={profile.email}
                />

                <InformationCard
                  label="Mobile number"
                  value={profile.mobile}
                />

                <InformationCard
                  label="Location"
                  value={profile.location}
                  fullWidth
                />

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    About
                  </p>

                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    {profile.bio}
                  </p>
                </div>
              </div>
            )}
          </article>

          {/* Skills */}
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-xl font-bold text-slate-950">
              Skills & Expertise
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Technologies used in Project LOOP.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950 p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
                Current Project
              </p>

              <h4 className="mt-3 text-lg font-bold">
                Project LOOP
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                AI-powered customer feedback
                intelligence platform.
              </p>
            </div>
          </article>
        </section>
      </div>
    </LoopShell>
  );
}

function ProfileInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function InformationCard({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-slate-50 p-5 ${
        fullWidth ? "sm:col-span-2" : ""
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}