import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { KnowledgeProvider } from "@/contexts/KnowledgeContext";

export const metadata: Metadata = {
  title: "Swasthya Sathi | સ્વાસ્થ્ય સાથી",
  description:
    "Your family health companion for cancer care — manage reports, medicines, chemotherapy, and health records completely offline.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Swasthya Sathi",
  },
  formatDetection: { telephone: false },
  keywords: ["cancer care", "health tracker", "medical reports", "PWA", "offline"],
};

export const viewport: Viewport = {
  themeColor: "#f5a300",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-base-50 dark:bg-dark-base-50 text-base-950 dark:text-dark-base-950 antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <KnowledgeProvider>{children}</KnowledgeProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
