"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => registration.update())
        .catch(console.error);
    }

    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      void trackEvent("pwa_install_prompt");
      // Wait a bit before showing the prompt to not overwhelm the user
      setTimeout(() => setShowPrompt(true), 3000);
    };

    const handleAppInstalled = () => {
      void trackEvent("pwa_installed");
      setShowPrompt(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
      void trackEvent("pwa_installed", { source: "prompt_choice" });
    }
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xl z-[9999] flex items-center justify-between gap-4"
        >
          <div className="flex flex-col gap-1 flex-1 pr-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              Ilovani o'rnatish
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              TezkorUsta ilovasini o'rnating va ustalarni 2 daqiqada toping!
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-xl shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
              aria-label="Ilovani o'rnatish"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="absolute -top-3 -right-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-full p-1.5 shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            aria-label="Yopish"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
