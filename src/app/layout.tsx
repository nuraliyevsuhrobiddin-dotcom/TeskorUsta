import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TezkorUsta | Toshkent bo'yicha usta topish",
  description: "Toshkent bo'yicha eng ishonchli va tezkor santexnik va boshqa ustalar platformasi.",
};

import { LanguageProvider } from "@/contexts/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const theme = localStorage.getItem('tezkor_theme');
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else if (theme === 'light') {
              document.documentElement.classList.remove('dark');
            }
          } catch (_) {}
        `}} />
      </head>
      <body
        className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200"
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
