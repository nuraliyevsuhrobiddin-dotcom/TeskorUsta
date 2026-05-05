"use client";

import { useEffect } from "react";

export default function ThemeInitializer() {
  useEffect(() => {
    const theme = window.localStorage.getItem("tezkor_theme");
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      return;
    }

    root.classList.remove("dark");
  }, []);

  return null;
}
