"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  Calendar,
  AlertTriangle,
  TrendingUp,
  FileText,
  Pill,
  Syringe,
  ChevronRight,
  Plus,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllReports } from "@/lib/db/reports";
import { getNextChemoAppointment } from "@/lib/db/chemo";
import { generateTodaySchedule } from "@/lib/db/medicines";
import { getSettings } from "@/lib/db/settings";
import type {
  MedicalReport,
  ChemoSession,
  MedicineLog,
  AppSettings,
} from "@/types";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";
import {
  getActionPlanState,
  saveActionPlanState,
  markActionPlanFood,
  ActionPlanState,
} from "@/lib/db/actionPlan";
import {
  getAllParameters,
  getKnowledgeByParameterId,
} from "@/lib/db/knowledge";
import { seedNutritionData } from "@/lib/db/seed";
import type { ParameterDef, KnowledgeEntry } from "@/types";

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [nextChemo, setNextChemo] = useState<ChemoSession | null>(null);
  const [todayMeds, setTodayMeds] = useState<MedicineLog[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Good Morning");

  const [actionPlan, setActionPlan] = useState<ActionPlanState | null>(null);
  const [selectedFood, setSelectedFood] = useState<{
    param: ParameterDef;
    kb: KnowledgeEntry;
  } | null>(null);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<
    { param: ParameterDef; kb: KnowledgeEntry; status: string }[]
  >([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    async function load() {
      try {
        const today = new Date().toISOString().split("T")[0];
        // Ensure seed has run
        await seedNutritionData();

        const [r, c, m, s, planState, allParams] = await Promise.all([
          getAllReports(),
          getNextChemoAppointment(),
          generateTodaySchedule(today),
          getSettings(),
          getActionPlanState(),
          getAllParameters(),
        ]);
        setReports(r.slice(0, 3));
        setNextChemo(c ?? null);
        setTodayMeds(m);
        setSettings(s);

        // --- Action Plan Logic ---
        if (r.length === 0) {
          setActionPlan(null);
        } else {
          const latestReportId = r[0].id;
          let currentPlan = planState;
          let needsRegeneration = false;

          if (!currentPlan) {
            needsRegeneration = true;
          } else {
            const daysOld =
              (new Date().getTime() -
                new Date(currentPlan.generatedAt).getTime()) /
              (1000 * 60 * 60 * 24);
            if (daysOld >= 3) needsRegeneration = true;
            if (latestReportId !== currentPlan.latestReportId)
              needsRegeneration = true;
          }

          if (needsRegeneration) {
            const allAlertFields = r.flatMap((rep) =>
              (rep.numericFields || []).filter(
                (f) => f.status === "high" || f.status === "low",
              ),
            );
            const neededCategories = new Set<string>();
            if (allAlertFields.length === 0) neededCategories.add("recovery");

            allAlertFields.forEach((f) => {
              const name = f.parameterId.toLowerCase();
              if (f.status === "low") {
                if (
                  name.includes("hemoglobin") ||
                  name === "hb" ||
                  name.includes("rbc") ||
                  name.includes("iron")
                ) {
                  neededCategories.add("lowHemoglobin");
                  neededCategories.add("fatigue");
                }
                if (name.includes("protein") || name.includes("albumin"))
                  neededCategories.add("protein");
                if (
                  name.includes("wbc") ||
                  name.includes("lymphocyte") ||
                  name.includes("neutrophil")
                )
                  neededCategories.add("protein");
                if (name.includes("platelet")) neededCategories.add("recovery");
                if (name.includes("sodium") || name.includes("potassium"))
                  neededCategories.add("hydration");
              }
              if (f.status === "high") {
                if (
                  name.includes("creatinine") ||
                  name.includes("urea") ||
                  name.includes("bun") ||
                  name.includes("uric")
                )
                  neededCategories.add("hydration");
                if (name.includes("sugar") || name.includes("glucose"))
                  neededCategories.add("hydration");
                if (
                  name.includes("sgpt") ||
                  name.includes("sgot") ||
                  name.includes("ast") ||
                  name.includes("alt") ||
                  name.includes("bilirubin")
                ) {
                  neededCategories.add("recovery");
                  neededCategories.add("hydration");
                }
              }
            });

            const nutritionParams = allParams.filter(
              (p) => p.category === "nutrition" || p.category === "food",
            );
            const nutritionItems: {
              param: ParameterDef;
              kb: KnowledgeEntry;
            }[] = [];

            for (const np of nutritionParams) {
              const kb = await getKnowledgeByParameterId(np.id);
              if (kb) nutritionItems.push({ param: np, kb });
            }

            const matchedItems = nutritionItems.filter((item) => {
              if (!item.kb.tags || item.kb.tags.length === 0) return false;
              return item.kb.tags.some((tag) =>
                neededCategories.has(tag as any),
              );
            });

            // Fallback to random nutrition items if no specific match
            let suggestions = matchedItems;
            if (suggestions.length === 0) {
              suggestions = nutritionItems;
            }

            // Pick max 2 suggestions
            suggestions = suggestions.slice(0, 2);

            currentPlan = {
              generatedAt: new Date().toISOString(),
              latestReportId,
              trackingDate: today,
              foodStatuses: suggestions.map((sug) => ({
                foodId: sug.param.id,
                status: "pending",
              })),
            };
            await saveActionPlanState(currentPlan);
          } else if (currentPlan && currentPlan.trackingDate !== today) {
            currentPlan.trackingDate = today;
            currentPlan.foodStatuses.forEach((f) => (f.status = "pending"));
            await saveActionPlanState(currentPlan);
          }

          // Hydrate the daily suggestions
          if (currentPlan) {
            const hydrated = [];
            for (const fs of currentPlan.foodStatuses) {
              const param = allParams.find((p) => p.id === fs.foodId);
              if (param) {
                const kb = await getKnowledgeByParameterId(param.id);
                if (kb) {
                  hydrated.push({ param, kb, status: fs.status });
                }
              }
            }
            setDynamicSuggestions(hydrated);
          }

          setActionPlan(currentPlan);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleFoodAction = async (
    foodId: string,
    status: "taken" | "declined",
  ) => {
    const newState = await markActionPlanFood(foodId, status);
    if (newState) {
      setActionPlan(newState);
      setDynamicSuggestions((prev) =>
        prev.map((s) => (s.param.id === foodId ? { ...s, status } : s)),
      );
    }
    setSelectedFood(null);
  };

  const allAlertFields = reports.flatMap((r) =>
    (r.numericFields || []).filter(
      (f) => f.status === "high" || f.status === "low",
    ),
  );
  const hasAbnormalities = allAlertFields.length > 0;

  const isHydration = dynamicSuggestions.some((s) =>
    s.kb.tags.includes("hydration"),
  );
  const isHb = dynamicSuggestions.some((s) =>
    s.kb.tags.includes("lowHemoglobin"),
  );

  let actionSummaryEn =
    "Your latest reports look stable. Here is a general healthy tip for today:";
  let actionSummaryGu =
    "તમારા નવીનતમ રિપોર્ટ સામાન્ય છે. આજ માટે અહીં એક સ્વાસ્થ્યવર્ધક સૂચન છે:";

  if (isHb) {
    actionSummaryEn =
      "Based on your recent reports, your hemoglobin is low. Try adding these to your diet today:";
    actionSummaryGu =
      "તમારા રિપોર્ટના આધારે, તમારું હિમોગ્લોબિન ઓછું છે. આજે આહારમાં આનો સમાવેશ કરવાનો પ્રયાસ કરો:";
  } else if (isHydration) {
    actionSummaryEn =
      "Your recent tests suggest you need better hydration and digestion support. Try these today:";
    actionSummaryGu =
      "તમારા રિપોર્ટ મુજબ તમારે શરીરમાં પાણીનું સ્તર સુધારવાની જરૂર છે. આજે આનો પ્રયાસ કરો:";
  } else if (hasAbnormalities) {
    actionSummaryEn =
      "We noticed some abnormal values in your recent reports. Eating these might help you recover:";
    actionSummaryGu =
      "તમારા રિપોર્ટમાં કેટલાક અસામાન્ય મૂલ્યો નોંધાયા છે. આ ખોરાક તમને જલ્દી સાજા થવામાં મદદ કરી શકે છે:";
  }

  const pendingMeds = todayMeds.filter((m) => m.status === "pending");
  const takenMeds = todayMeds.filter((m) => m.status === "taken");

  const formatChemoDate = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return t("dashboard.today");
    if (isTomorrow(d)) return t("dashboard.tomorrow");
    return format(d, "d MMM yyyy");
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 animate-fade-in">
        <p className="text-base-500 dark:text-dark-base-500 text-sm font-medium">
          {language === "gu" ? "નમસ્કાર" : greeting}
        </p>
        <h1 className="text-2xl font-bold text-base-900 dark:text-dark-base-900">
          {settings?.patientName ? settings.patientName : t("app.name")}
        </h1>
        <p className="text-sm text-base-500 dark:text-dark-base-500 mt-0.5">
          {format(new Date(), "EEEE, d MMMM yyyy")}
        </p>
      </div>

      <div className="space-y-4">
        {actionPlan && dynamicSuggestions.length > 0 && (
          <div className="animate-slide-up rounded-2xl bg-primary-50 dark:bg-dark-primary-100 border border-primary-200 dark:border-dark-primary-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary-200 dark:bg-dark-primary-200 rounded-xl flex items-center justify-center">
                <TrendingUp
                  size={16}
                  className="text-primary-700 dark:text-dark-primary-700"
                />
              </div>
              <h2 className="font-semibold text-primary-800 dark:text-dark-primary-800 text-lg">
                {language === "gu" ? "આજનો એક્શન પ્લાન" : "Today's Action Plan"}
              </h2>
            </div>

            <p className="text-sm font-medium text-primary-800 dark:text-dark-primary-800 mb-4 leading-relaxed">
              {language === "gu" ? actionSummaryGu : actionSummaryEn}
            </p>

            <div className="space-y-3">
              {dynamicSuggestions.map((sug) => (
                <button
                  key={sug.param.id}
                  onClick={() =>
                    sug.status === "pending" && setSelectedFood(sug)
                  }
                  className={`w-full text-left rounded-xl p-3 shadow-sm border flex items-start gap-3 transition-colors ${
                    sug.status === "taken"
                      ? "bg-success-50 dark:bg-dark-success-100 border-success-200"
                      : sug.status === "declined"
                        ? "bg-base-100 dark:bg-dark-base-200 border-base-200 opacity-60"
                        : "bg-white dark:bg-dark-base-100 border-primary-100 hover:border-primary-300"
                  }`}
                >
                  <div className="relative">
                    <span
                      className={`text-3xl p-2 rounded-xl shrink-0 flex items-center justify-center ${sug.status === "taken" ? "bg-success-100" : "bg-base-50 dark:bg-dark-base-200"}`}
                    >
                      🍲
                    </span>
                    {sug.status === "taken" && (
                      <CheckCircle2
                        className="absolute -bottom-1 -right-1 text-success-600 bg-white rounded-full"
                        size={16}
                      />
                    )}
                    {sug.status === "declined" && (
                      <XCircle
                        className="absolute -bottom-1 -right-1 text-base-400 bg-white rounded-full"
                        size={16}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-bold text-sm truncate ${sug.status === "taken" ? "text-success-800 dark:text-success-600" : "text-base-900 dark:text-dark-base-900"}`}
                    >
                      {language === "gu" &&
                      sug.param.alternativeNames.length > 0
                        ? sug.param.alternativeNames[0]
                        : sug.param.name}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Today's Medicines */}
        <div
          className="card-elevated animate-slide-up"
          style={{ animationDelay: "50ms" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 dark:bg-dark-primary-100 rounded-xl flex items-center justify-center">
                <Pill
                  size={16}
                  className="text-primary-600 dark:text-dark-primary-600"
                />
              </div>
              <h2 className="font-semibold text-base-900 dark:text-dark-base-900">
                {t("dashboard.todayMeds")}
              </h2>
            </div>
            <Link
              href="/medicines/schedule"
              className="text-xs text-primary-500 dark:text-dark-primary-500 font-medium hover:underline"
            >
              {t("dashboard.viewAll")}
            </Link>
          </div>

          {todayMeds.length === 0 ? (
            <p className="text-sm text-base-400 dark:text-dark-base-400 text-center py-3">
              {t("dashboard.noMeds")}
            </p>
          ) : (
            <div className="space-y-2">
              {/* Progress bar */}
              <div className="flex items-center gap-2 text-sm mb-3">
                <div className="flex-1 bg-base-100 dark:bg-dark-base-200 rounded-full h-2">
                  <div
                    className="bg-success-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${todayMeds.length > 0 ? (takenMeds.length / todayMeds.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-base-500 dark:text-dark-base-500 whitespace-nowrap">
                  {takenMeds.length}/{todayMeds.length}
                </span>
              </div>
              {pendingMeds.slice(0, 3).map((med) => (
                <div
                  key={med.id}
                  className="flex items-center justify-between bg-base-50 dark:bg-dark-base-200 rounded-xl p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-base-900 dark:text-dark-base-900">
                      {med.medicineName}
                    </p>
                    <p className="text-xs text-base-400 dark:text-dark-base-400 capitalize">
                      {t(`medicines.${med.scheduledTime}`)}
                    </p>
                  </div>
                  <Link href="/medicines/schedule">
                    <span className="text-xs bg-primary-100 dark:bg-dark-primary-100 text-primary-600 dark:text-dark-primary-600 px-3 py-1.5 rounded-full font-medium">
                      {t("medicines.markTaken")}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Chemo */}
        <div
          className="card-elevated animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-secondary-100 dark:bg-dark-secondary-100 rounded-xl flex items-center justify-center">
              <Syringe
                size={16}
                className="text-secondary-600 dark:text-dark-secondary-600"
              />
            </div>
            <h2 className="font-semibold text-base-900 dark:text-dark-base-900">
              {t("dashboard.nextChemo")}
            </h2>
          </div>

          {nextChemo?.nextAppointmentDate ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-base-900 dark:text-dark-base-900">
                  {formatChemoDate(nextChemo.nextAppointmentDate)}
                </p>
                <p className="text-sm text-base-500 dark:text-dark-base-500">
                  {nextChemo.hospital}
                </p>
              </div>
              <Link href={`/chemo/${nextChemo.id}`}>
                <ChevronRight size={20} className="text-base-400" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-base-400 dark:text-dark-base-400">
                {t("dashboard.noChemo")}
              </p>
              <Link
                href="/chemo/add"
                className="text-xs text-primary-500 font-medium"
              >
                + {t("chemo.addSession")}
              </Link>
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div
          className="card-elevated animate-slide-up"
          style={{ animationDelay: "150ms" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-success-100 dark:bg-dark-success-100 rounded-xl flex items-center justify-center">
                <FileText
                  size={16}
                  className="text-success-600 dark:text-dark-success-600"
                />
              </div>
              <h2 className="font-semibold text-base-900 dark:text-dark-base-900">
                {t("dashboard.recentReports")}
              </h2>
            </div>
            <Link
              href="/reports"
              className="text-xs text-primary-500 dark:text-dark-primary-500 font-medium hover:underline"
            >
              {t("dashboard.viewAll")}
            </Link>
          </div>

          {reports.length === 0 ? (
            <p className="text-sm text-base-400 dark:text-dark-base-400 text-center py-3">
              {t("dashboard.noReports")}
            </p>
          ) : (
            <div className="space-y-2">
              {reports.map((r) => {
                const abnormal = (r.numericFields || []).filter(
                  (f) => f.status === "high" || f.status === "low",
                ).length;
                return (
                  <Link
                    key={r.id}
                    href={`/reports/${r.id}`}
                    className="flex items-center justify-between bg-base-50 dark:bg-dark-base-200 rounded-xl p-3 hover:bg-base-100 dark:hover:bg-dark-base-300 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-base-900 dark:text-dark-base-900">
                        {r.templateId}
                      </p>
                      <p className="text-xs text-base-400 dark:text-dark-base-400">
                        {r.reportDate} · {r.hospitalName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {abnormal > 0 && (
                        <span className="text-xs badge-high px-2 py-0.5 rounded-full">
                          {abnormal}{" "}
                          {language === "gu" ? "અસામાન્ય" : "abnormal"}
                        </span>
                      )}
                      <ChevronRight size={16} className="text-base-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div
          className="grid grid-cols-2 gap-3 animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          <Link
            href="/reports/add"
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-primary-50 dark:bg-dark-primary-100 border border-primary-200 dark:border-dark-primary-200 hover:bg-primary-100 dark:hover:bg-dark-primary-200 transition-colors"
          >
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Plus size={20} className="text-white" />
            </div>
            <span className="text-sm font-medium text-primary-700 dark:text-dark-primary-700 text-center">
              {t("reports.add")}
            </span>
          </Link>

          <Link
            href="/knowledge"
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-base-100 dark:bg-dark-base-200 border border-base-200 dark:border-dark-base-200 hover:bg-base-200 dark:hover:bg-dark-base-300 transition-colors"
          >
            <div className="w-10 h-10 bg-base-800 dark:bg-dark-base-800 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="text-sm font-medium text-base-700 dark:text-dark-base-700 text-center">
              {t("nav.knowledge")}
            </span>
          </Link>
        </div>
      </div>

      {/* Food Action Modal */}
      {selectedFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white dark:bg-dark-base-100 rounded-2xl w-full max-w-sm overflow-hidden animate-slide-up shadow-xl">
            <div className="p-4 border-b border-base-100 dark:border-dark-base-200 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-100 dark:bg-dark-primary-200 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                  🍲
                </div>
                <div>
                  <h3 className="text-xl font-bold text-base-900 dark:text-dark-base-900">
                    {language === "gu" &&
                    selectedFood.param.alternativeNames.length > 0
                      ? selectedFood.param.alternativeNames[0]
                      : selectedFood.param.name}
                  </h3>
                  <p className="text-sm text-base-500 dark:text-dark-base-500 mt-1">
                    {selectedFood.kb.simpleMeaning}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFood(null)}
                className="p-2 text-base-400 hover:text-base-600 dark:hover:text-dark-base-400 bg-base-50 dark:bg-dark-base-200 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="p-4 bg-base-50 dark:bg-dark-base-200 rounded-xl">
                <p className="text-xs font-bold text-base-500 dark:text-dark-base-500 uppercase tracking-wider mb-2">
                  {language === "gu" ? "કેવી રીતે લેવું" : "Details"}
                </p>
                <p className="text-sm text-base-700 dark:text-dark-base-400 whitespace-pre-wrap">
                  {selectedFood.kb.detailedDescription}
                </p>
              </div>

              <div className="p-4 bg-primary-50 dark:bg-dark-primary-300 rounded-xl border border-primary-100 dark:border-dark-primary-400">
                <p className="text-xs font-bold text-primary-600 dark:text-dark-primary-700 uppercase tracking-wider mb-2">
                  {language === "gu"
                    ? "ક્યારે ખાવું શ્રેષ્ઠ છે"
                    : "Why Important"}
                </p>
                <p className="text-sm text-primary-900 dark:text-dark-primary-800">
                  {selectedFood.kb.whyImportant}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-base-100 dark:border-dark-base-200 flex gap-3">
              <button
                onClick={() =>
                  handleFoodAction(selectedFood.param.id, "declined")
                }
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-danger-600 bg-danger-50 dark:bg-dark-danger-100 hover:bg-danger-100 transition-colors"
              >
                {language === "gu" ? "મારે નથી લેવું" : "Decline"}
              </button>
              <button
                onClick={() => handleFoodAction(selectedFood.param.id, "taken")}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-success-500 hover:bg-success-600 transition-colors shadow-sm"
              >
                {language === "gu" ? "મેં લઈ લીધું છે" : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
