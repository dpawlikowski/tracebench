import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "Tracebench — Agent Ops Workbench",
  description:
    "HITL control room for AI agents. Timeline, risk-tiered approvals, audit, cost & eval gates. Demo mode: zero API keys.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Tracebench — Agent Ops Workbench",
    description:
      "HITL control plane for irreversible agent tools. Fixtures-first demo — no API keys.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tracebench — Agent Ops Workbench",
    description: "HITL · timeline · evals · nested agents — demo mode by default.",
  },
};

/** Inline before paint — density + dark bg to avoid flash. */
const PREFS_BOOT = `(function(){try{var d=localStorage.getItem('tb.density');var n=localStorage.getItem('tb.navCollapsed');document.documentElement.dataset.density=d==='dense'?'dense':'comfortable';document.documentElement.dataset.nav=n==='1'?'collapsed':'expanded';document.documentElement.style.colorScheme='dark';document.documentElement.style.background='#09090b';}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#09090b" />
        <script dangerouslySetInnerHTML={{ __html: PREFS_BOOT }} />
      </head>
      <body
        className={`${GeistSans.className} bg-tb-bg text-tb-text antialiased`}
        style={
          {
            ["--tb-font-sans" as string]: `var(--font-geist-sans), "Inter", system-ui, sans-serif`,
            ["--tb-font-mono" as string]: `var(--font-geist-mono), "IBM Plex Mono", ui-monospace, monospace`,
          } as React.CSSProperties
        }
      >
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
