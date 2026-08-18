"use client";

import { SessionProvider } from "next-auth/react";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ThemePreference =
  | "light"
  | "dark"
  | "system";

export type ResolvedTheme =
  | "light"
  | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  mounted: boolean;
  setTheme: (
    theme: ThemePreference,
  ) => void;
};

type ProvidersProps = {
  children: ReactNode;
};

const THEME_STORAGE_KEY =
  "loop-theme";

const THEME_CHANGE_EVENT =
  "loop-theme-change";

const DARK_MODE_QUERY =
  "(prefers-color-scheme: dark)";

const DEFAULT_THEME: ThemePreference =
  "light";

const ThemeContext =
  createContext<
    ThemeContextValue | undefined
  >(undefined);

function isThemePreference(
  value: string | null,
): value is ThemePreference {
  return (
    value === "light" ||
    value === "dark" ||
    value === "system"
  );
}

function getStoredTheme(): ThemePreference {
  if (
    typeof window ===
    "undefined"
  ) {
    return DEFAULT_THEME;
  }

  try {
    const storedTheme =
      window.localStorage.getItem(
        THEME_STORAGE_KEY,
      );

    return isThemePreference(
      storedTheme,
    )
      ? storedTheme
      : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function getSystemTheme(): ResolvedTheme {
  if (
    typeof window ===
    "undefined"
  ) {
    return "light";
  }

  return window.matchMedia(
    DARK_MODE_QUERY,
  ).matches
    ? "dark"
    : "light";
}

function resolveTheme(
  theme: ThemePreference,
  systemTheme: ResolvedTheme,
): ResolvedTheme {
  if (
    theme === "system"
  ) {
    return systemTheme;
  }

  return theme;
}

function applyResolvedTheme(
  resolvedTheme: ResolvedTheme,
) {
  if (
    typeof document ===
    "undefined"
  ) {
    return;
  }

  const root =
    document.documentElement;

  const isDark =
    resolvedTheme ===
    "dark";

  root.classList.toggle(
    "dark",
    isDark,
  );

  root.style.colorScheme =
    isDark
      ? "dark"
      : "light";
}

function subscribeTheme(
  onStoreChange: () => void,
) {
  function handleStorage(
    event: StorageEvent,
  ) {
    if (
      event.key ===
        THEME_STORAGE_KEY ||
      event.key === null
    ) {
      onStoreChange();
    }
  }

  function handleThemeChange() {
    onStoreChange();
  }

  window.addEventListener(
    "storage",
    handleStorage,
  );

  window.addEventListener(
    THEME_CHANGE_EVENT,
    handleThemeChange,
  );

  return () => {
    window.removeEventListener(
      "storage",
      handleStorage,
    );

    window.removeEventListener(
      THEME_CHANGE_EVENT,
      handleThemeChange,
    );
  };
}

function subscribeSystemTheme(
  onStoreChange: () => void,
) {
  const mediaQuery =
    window.matchMedia(
      DARK_MODE_QUERY,
    );

  function handleChange() {
    onStoreChange();
  }

  mediaQuery.addEventListener(
    "change",
    handleChange,
  );

  return () => {
    mediaQuery.removeEventListener(
      "change",
      handleChange,
    );
  };
}

function subscribeMounted() {
  return () => {};
}

function getMountedSnapshot() {
  return true;
}

function getServerMountedSnapshot() {
  return false;
}

function getServerThemeSnapshot(): ThemePreference {
  return DEFAULT_THEME;
}

function getServerSystemThemeSnapshot(): ResolvedTheme {
  return "light";
}

function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const theme =
    useSyncExternalStore(
      subscribeTheme,
      getStoredTheme,
      getServerThemeSnapshot,
    );

  const systemTheme =
    useSyncExternalStore(
      subscribeSystemTheme,
      getSystemTheme,
      getServerSystemThemeSnapshot,
    );

  const mounted =
    useSyncExternalStore(
      subscribeMounted,
      getMountedSnapshot,
      getServerMountedSnapshot,
    );

  const resolvedTheme =
    resolveTheme(
      theme,
      systemTheme,
    );

  useEffect(() => {
    applyResolvedTheme(
      resolvedTheme,
    );
  }, [resolvedTheme]);

  const setTheme =
    useCallback(
      (
        nextTheme: ThemePreference,
      ) => {
        try {
          window.localStorage.setItem(
            THEME_STORAGE_KEY,
            nextTheme,
          );
        } catch {
          // The selected theme still
          // applies for the current
          // session if storage is
          // unavailable.
        }

        const nextResolvedTheme =
          resolveTheme(
            nextTheme,
            getSystemTheme(),
          );

        applyResolvedTheme(
          nextResolvedTheme,
        );

        window.dispatchEvent(
          new Event(
            THEME_CHANGE_EVENT,
          ),
        );
      },
      [],
    );

  const contextValue =
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
    <ThemeContext.Provider
      value={
        contextValue
      }
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(
      ThemeContext,
    );

  if (!context) {
    throw new Error(
      "useTheme must be used inside Providers.",
    );
  }

  return context;
}

export default function Providers({
  children,
}: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}