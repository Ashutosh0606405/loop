import type { Metadata } from "next";
import type { ReactNode } from "react";

import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "Project LOOP | AI Customer-Feedback Intelligence Platform",
  description:
    "Multi-tenant AI Customer-Feedback Intelligence Platform",
};

const themeScript = `
(function () {
  try {
    var storageKey = "loop-theme";
    var savedTheme = localStorage.getItem(storageKey);

    var theme =
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
        ? savedTheme
        : "system";

    var resolvedTheme =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    var root = document.documentElement;

    root.classList.toggle(
      "dark",
      resolvedTheme === "dark"
    );

    root.dataset.theme = resolvedTheme;
    root.dataset.themePreference = theme;
    root.style.colorScheme = resolvedTheme;
  } catch (error) {
    console.error("Unable to load theme:", error);
  }
})();
`;

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />
      </head>

      <body className="flex min-h-full flex-col bg-slate-100 font-sans text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}