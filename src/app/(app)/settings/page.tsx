"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { Download, Upload, Moon, Sun, Monitor, Info, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getSettings, setSetting } from "@/lib/db/settings";
import { exportDatabase, importDatabase, clearDatabase } from "@/lib/db/backup";
import type { AppSettings } from "@/types";

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const {
    theme,
    setTheme,
    textSize,
    setTextSize,
    highContrast,
    setHighContrast,
  } = useTheme();
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    getSettings().then((s) => {
      setAppSettings(s);
      setLoading(false);
    });
  }, []);

  const handleUpdate = async (key: keyof AppSettings, value: any) => {
    if (!appSettings) return;
    const newSettings = { ...appSettings, [key]: value };
    setAppSettings(newSettings);
    await setSetting(key, value);
  };

  const handleExport = async () => {
    try {
      const data = await exportDatabase();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `swasthya-sathi-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      setMsg({ text: t("settings.exportSuccess"), type: "success" });
    } catch {
      setMsg({ text: t("common.error"), type: "error" });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importDatabase(text);
      setMsg({ text: t("settings.importSuccess"), type: "success" });
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setMsg({ text: t("settings.importError"), type: "error" });
    }
  };

  const handleClearData = async () => {
    if (confirm(language === "gu" ? "શું તમે ખાતરીપૂર્વક બધો ડેટા કાઢી નાખવા માંગો છો? આ પાછું લાવી શકાશે નહીં." : "Are you sure you want to clear all data? This cannot be undone.")) {
      try {
        await clearDatabase();
        setMsg({ text: language === "gu" ? "બધો ડેટા કાઢી નાખવામાં આવ્યો છે." : "All data cleared successfully.", type: "success" });
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        setMsg({ text: t("common.error"), type: "error" });
      }
    }
  };


  const inputCls =
    "w-full px-4 py-3 bg-base-50 dark:bg-dark-base-200 border-2 border-transparent focus:border-primary-500 dark:focus:border-dark-primary-500 rounded-xl text-sm font-medium outline-none transition-colors";
  const labelCls =
    "text-sm font-bold text-base-900 dark:text-dark-base-900 block mb-2";
  const cardCls =
    "bg-white dark:bg-dark-base-100 border-2 border-base-200 dark:border-dark-base-200 rounded-2xl p-5 space-y-5";

  if (loading)
    return (
      <AppShell title={t("settings.title")} showBack>
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );

  return (
    <AppShell title={t("settings.title")} showBack>
      <div className="space-y-6 pb-4">
        {msg && (
          <div
            className={`p-3 rounded-xl text-sm font-medium ${msg.type === "success" ? "bg-success-50 text-success-700" : "bg-danger-50 text-danger-700"}`}
          >
            {msg.text}
          </div>
        )}

        {/* Display & Language */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-base-500 dark:text-dark-base-500 uppercase tracking-wide">
            {language === "gu" ? "દેખાવ અને ભાષા" : "Display & Language"}
          </h2>

          <div className={cardCls}>
            <div>
              <label className={labelCls}>{t("settings.language")}</label>
              <div className="flex bg-base-100 dark:bg-dark-base-200 p-1 rounded-xl">
                <button
                  onClick={() => setLanguage("en")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${language === "en" ? "bg-white dark:bg-dark-base-100 shadow-sm text-primary-700" : "text-base-600 dark:text-dark-base-600"}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage("gu")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${language === "gu" ? "bg-white dark:bg-dark-base-100 shadow-sm text-primary-700" : "text-base-600 dark:text-dark-base-600"}`}
                >
                  ગુજરાતી
                </button>
              </div>
            </div>

            <div className="h-0.5 bg-base-100 dark:bg-dark-base-200" />

            <div>
              <label className={labelCls}>{t("settings.theme")}</label>
              <div className="flex bg-base-100 dark:bg-dark-base-200 p-1 rounded-xl">
                {(["light", "dark", "system"] as const).map((tOpt) => (
                  <button
                    key={tOpt}
                    onClick={() => setTheme(tOpt)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-colors flex flex-col items-center gap-1 ${theme === tOpt ? "bg-white dark:bg-dark-base-100 shadow-sm text-primary-700" : "text-base-600 dark:text-dark-base-600"}`}
                  >
                    {tOpt === "light" && <Sun size={18} />}
                    {tOpt === "dark" && <Moon size={18} />}
                    {tOpt === "system" && <Monitor size={18} />}
                    {t(`settings.${tOpt}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-0.5 bg-base-100 dark:bg-dark-base-200" />

            <div>
              <label className={labelCls}>{t("settings.textSize")}</label>
              <div className="flex bg-base-100 dark:bg-dark-base-200 p-1 rounded-xl">
                {(["normal", "large", "xlarge"] as const).map((sOpt) => (
                  <button
                    key={sOpt}
                    onClick={() => setTextSize(sOpt)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${textSize === sOpt ? "bg-white dark:bg-dark-base-100 shadow-sm text-primary-700" : "text-base-600 dark:text-dark-base-600"}`}
                  >
                    {t(`settings.${sOpt}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t-2 border-base-100 dark:border-dark-base-200">
              <label className="text-sm font-bold text-base-900 dark:text-dark-base-900">
                {t("settings.highContrast")}
              </label>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`w-14 h-8 rounded-full transition-colors relative border-2 ${highContrast ? "bg-primary-500 border-primary-600" : "bg-base-200 dark:bg-dark-base-300 border-base-300 dark:border-dark-base-400"}`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all ${highContrast ? "left-6" : "left-0.5"}`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Patient Info */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-base-500 dark:text-dark-base-500 uppercase tracking-wide">
            {t("settings.patientInfo")}
          </h2>
          <div className={`${cardCls} space-y-3!`}>
            <input
              type="text"
              placeholder={t("settings.patientName")}
              value={appSettings?.patientName || ""}
              onChange={(e) => handleUpdate("patientName", e.target.value)}
              className={inputCls}
            />
            <input
              type="text"
              placeholder={t("settings.patientAge")}
              value={appSettings?.patientAge || ""}
              onChange={(e) => handleUpdate("patientAge", e.target.value)}
              className={inputCls}
            />
            <input
              type="text"
              placeholder={t("settings.cancerType")}
              value={appSettings?.cancerType || ""}
              onChange={(e) => handleUpdate("cancerType", e.target.value)}
              className={inputCls}
            />
            <input
              type="text"
              placeholder={t("settings.doctorName")}
              value={appSettings?.doctorName || ""}
              onChange={(e) => handleUpdate("doctorName", e.target.value)}
              className={inputCls}
            />
            <input
              type="text"
              placeholder={t("settings.hospitalName")}
              value={appSettings?.hospitalName || ""}
              onChange={(e) => handleUpdate("hospitalName", e.target.value)}
              className={inputCls}
            />
            <input
              type="tel"
              placeholder={t("settings.emergencyContact")}
              value={appSettings?.emergencyContact || ""}
              onChange={(e) => handleUpdate("emergencyContact", e.target.value)}
              className={inputCls}
            />
          </div>
        </section>

        {/* Data Backup */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-base-500 dark:text-dark-base-500 uppercase tracking-wide">
            {t("settings.backup")}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExport}
              className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-dark-base-100 border-2 border-base-200 dark:border-dark-base-200 rounded-2xl hover:bg-base-50 dark:hover:bg-dark-base-200"
            >
              <Download size={28} className="text-primary-600" />
              <span className="text-sm font-bold text-base-900 dark:text-dark-base-900 text-center">
                {t("settings.export")}
              </span>
            </button>
            <label className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-dark-base-100 border-2 border-base-200 dark:border-dark-base-200 rounded-2xl hover:bg-base-50 dark:hover:bg-dark-base-200 cursor-pointer">
              <Upload size={28} className="text-secondary-600" />
              <span className="text-sm font-bold text-base-900 dark:text-dark-base-900 text-center">
                {t("settings.import")}
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          <button
            onClick={handleClearData}
            className="w-full flex items-center justify-center gap-2 p-4 bg-danger-50 dark:bg-dark-danger-100 text-danger-700 dark:text-dark-danger-700 font-bold rounded-xl border border-danger-200 dark:border-dark-danger-200 hover:bg-danger-100 transition-colors mt-2"
          >
            <Trash2 size={20} />
            {language === "gu" ? "બધો ડેટા કાઢી નાખો (Clear Data)" : "Clear All Data"}
          </button>
        </section>

        {/* About */}
        <section className="space-y-4 pb-8">
          <h2 className="text-sm font-semibold text-base-500 dark:text-dark-base-500 uppercase tracking-wide">
            {t("settings.about")}
          </h2>
          <div className="bg-white dark:bg-dark-base-100 border-2 border-base-200 dark:border-dark-base-200 rounded-2xl text-center py-8">
            <div className="w-16 h-16 mx-auto bg-primary-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <span className="text-white font-bold text-2xl">SS</span>
            </div>
            <h3 className="font-bold text-lg text-base-900 dark:text-dark-base-900">
              {t("app.name")}
            </h3>
            <p className="text-sm font-medium text-base-500 mt-1">
              {t("settings.version")}
            </p>
            <p className="text-sm font-medium text-base-700 dark:text-dark-base-700 mt-4 px-6">
              {t("settings.aboutText")}
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
