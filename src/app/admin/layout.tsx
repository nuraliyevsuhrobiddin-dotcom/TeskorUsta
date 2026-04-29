"use client";

import { Toaster } from "react-hot-toast";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Toaster position="top-right" />
      {children}
    </div>
  );
}
