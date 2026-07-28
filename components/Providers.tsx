"use client";

import { SessionProvider } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference =
  | "light"
  | "dark"
  | "system";

type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  mounted: boolean;
  setTheme: (theme: ThemePreference) => void;
};

const themeStorageKey = "loop-theme";

const ThemeContext =
  createContext<ThemeContextValue | null>(null);

function isThemePreference(
  value: string | null,
): value is ThemePreference {
  return (
    value === "light" ||
    value === "dark" ||
    value === "system"
  );
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches
    ? "dark"
    : "light";
}

function applyTheme(
  theme: ThemePreference,
): ResolvedTheme {
  const resolvedTheme =
    theme === "system"
      ? getSystemTheme()
      : theme;

  const root = document.documentElement;

  root.classList.toggle(
    "dark",
    resolvedTheme === "dark",
  );

  root.dataset.theme = resolvedTheme;
  root.dataset.themePreference = theme;
  root.style.colorScheme = resolvedTheme;

  return resolvedTheme;
}

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<ThemePreference>("system");

  const [resolvedTheme, setResolvedTheme] =
    useState<ResolvedTheme>("light");

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    const savedTheme =
      window.localStorage.getItem(
        themeStorageKey,
      );

    const initialTheme =
      isThemePreference(savedTheme)
        ? savedTheme
        : "system";

    setThemeState(initialTheme);

    setResolvedTheme(
      applyTheme(initialTheme),
    );

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    window.localStorage.setItem(
      themeStorageKey,
      theme,
    );

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    function updateResolvedTheme() {
      setResolvedTheme(applyTheme(theme));
    }

    updateResolvedTheme();

    if (theme !== "system") {
      return;
    }

    mediaQuery.addEventListener(
      "change",
      updateResolvedTheme,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateResolvedTheme,
      );
    };
  }, [theme, mounted]);

  const setTheme = useCallback(
    (newTheme: ThemePreference) => {
      setThemeState(newTheme);
    },
    [],
  );

  const themeValue =
    useMemo<ThemeContextValue>(
      () => ({
        theme,
        resolvedTheme,
        mounted,
        setTheme,
      }),
      [
        theme,
        resolvedTheme,
        mounted,
        setTheme,
      ],
    );

  return (
    <SessionProvider>
      <ThemeContext.Provider
        value={themeValue}
      >
        {children}
      </ThemeContext.Provider>
    </SessionProvider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside Providers.",
    );
  }

  return context;
}