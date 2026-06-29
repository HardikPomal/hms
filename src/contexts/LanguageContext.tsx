"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import "../i18n/config";
import { getSettings, setSetting } from "@/lib/db/settings";

type Language = "en" | "gu";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
  isGujarati: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Load language from settings on mount
    getSettings().then((settings) => {
      const lang = settings.language ?? "en";
      setLanguageState(lang);
      i18n.changeLanguage(lang);
      document.documentElement.lang = lang;
    }).catch(() => {
      // Default to en if DB not ready
    });
  }, [i18n]);

  const setLanguage = useCallback(
    async (lang: Language) => {
      setLanguageState(lang);
      i18n.changeLanguage(lang);
      document.documentElement.lang = lang;
      try {
        await setSetting("language", lang);
      } catch {
        // Ignore DB errors
      }
    },
    [i18n]
  );

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, isGujarati: language === "gu" }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
