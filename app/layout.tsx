import type { Metadata } from "next";
import type { ReactNode } from "react";

import Providers from "../components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Project LOOP",
    template: "%s | Project LOOP",
  },
  description:
    "AI-powered customer feedback intelligence platform.",
};

const themeInitializationScript = `
(function () {
  try {
    var savedTheme =
      window.localStorage.getItem("loop-theme") ||
      "system";

    var prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    var shouldUseDark =
      savedTheme === "dark" ||
      (savedTheme === "system" &&
        prefersDark);

    document.documentElement.classList.toggle(
      "dark",
      shouldUseDark,
    );

    document.documentElement.style.colorScheme =
      shouldUseDark ? "dark" : "light";
  } catch (error) {
    document.documentElement.classList.remove(
      "dark",
    );

    document.documentElement.style.colorScheme =
      "light";
  }
})();
`;

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitializationScript,
          }}
        />
      </head>

      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}