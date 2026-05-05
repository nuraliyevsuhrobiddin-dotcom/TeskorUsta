import type { Metadata, Viewport } from "next";
import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import ThemeInitializer from "@/components/ThemeInitializer";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "TezkorUsta | Toshkent bo'yicha usta topish",
  description: "Toshkent bo'yicha eng ishonchli va tezkor santexnik va boshqa ustalar platformasi.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TezkorUsta",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body
        className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200"
      >
        <LanguageProvider>
          <ThemeInitializer />
          <AnalyticsTracker />
          {children}
          <InstallPrompt />
        </LanguageProvider>
      </body>
    </html>
  );
}
