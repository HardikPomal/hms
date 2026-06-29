"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { getSettings, setSetting } from "@/lib/db/settings";
import type { AppSettings } from "@/types";

type Theme = "light" | "dark" | "system";
type TextSize = "normal" | "large" | "xlarge";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  textSize: TextSize;
  setTextSize: (s: TextSize) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [textSize, setTextSizeState] = useState<TextSize>("normal");
  const [highContrast, setHighContrastState] = useState(false);
  const [systemDark, setSystemDark] = useState(false);

  // Listen to system dark mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Load from settings
  useEffect(() => {
    getSettings().then((settings) => {
      setThemeState(settings.theme ?? "light");
      setTextSizeState(settings.textSize ?? "normal");
      setHighContrastState(settings.highContrast ?? false);
    }).catch(() => {});
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === "dark" || (theme === "system" && systemDark);

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Text size
    root.classList.remove("text-size-large", "text-size-xlarge");
    if (textSize === "large") root.classList.add("text-size-large");
    if (textSize === "xlarge") root.classList.add("text-size-xlarge");
  }, [theme, systemDark, highContrast, textSize]);

  const setTheme = useCallback(async (t: Theme) => {
    setThemeState(t);
    try { await setSetting("theme", t); } catch {}
  }, []);

  const setTextSize = useCallback(async (s: TextSize) => {
    setTextSizeState(s);
    try { await setSetting("textSize", s); } catch {}
  }, []);

  const setHighContrast = useCallback(async (v: boolean) => {
    setHighContrastState(v);
    try { await setSetting("highContrast", v as AppSettings["highContrast"]); } catch {}
  }, []);

  const isDark = theme === "dark" || (theme === "system" && systemDark);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, textSize, setTextSize, highContrast, setHighContrast, isDark }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
