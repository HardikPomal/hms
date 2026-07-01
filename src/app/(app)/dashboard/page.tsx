"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { Plus, ChevronRight, FileText, CheckCircle2, X, Activity, Pill, Syringe, BookOpen } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllReports } from "@/lib/db/reports";
import { getNextChemoAppointment } from "@/lib/db/chemo";
import { generateTodaySchedule } from "@/lib/db/medicines";
import { getSettings } from "@/lib/db/settings";
import { getKnowledgeByParameterId, getRelationshipsForSource, getRelationshipsForTarget, getAllParameters } from "@/lib/db/knowledge";
import { getDB } from "@/lib/db/db";
import { getActionPlanState, saveActionPlanState, markActionPlanItem } from "@/lib/db/actionPlan";
import type { MedicalReport, ChemoSession, MedicineLog, AppSettings, KnowledgeEntry, ParameterDef } from "@/types";
import { format, isToday, isTomorrow } from "date-fns";
import { formatDate } from "@/lib/format";

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [nextChemo, setNextChemo] = useState<ChemoSession | null>(null);
  const [todayMeds, setTodayMeds] = useState<MedicineLog[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [greeting, setGreeting] = useState("Good Morning");
  const [loading, setLoading] = useState(true);

  const [actionItems, setActionItems] = useState<{
    param: ParameterDef;
    kb: KnowledgeEntry;
    status: "pending" | "taken" | "declined";
  }[]>([]);
  
  const [selectedActionItem, setSelectedActionItem] = useState<{
    param: ParameterDef;
    kb: KnowledgeEntry;
  } | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    async function loadDashboard() {
      const today = new Date().toISOString().split("T")[0];
      const [sortedReports, nextChemoData, medsData, settingsData] = await Promise.all([
        getAllReports(),
        getNextChemoAppointment(),
        generateTodaySchedule(today),
        getSettings(),
      ]);
      setReports(sortedReports.slice(0, 3));
      setNextChemo(nextChemoData ?? null);
      setTodayMeds(medsData);
      setSettings(settingsData);

      if (sortedReports.length > 0) {
        const latestReport = sortedReports[0];
        const abnormalParams = (latestReport.numericFields || []).filter(
          (f) => f.status === "high" || f.status === "low"
        );

        let actionPlan = await getActionPlanState();
        const db = await getDB();
        const PLAN_VERSION = "v2_graph";

        if (
          !actionPlan ||
          actionPlan.trackingDate !== today ||
          actionPlan.latestReportId !== latestReport.id ||
          actionPlan.version !== PLAN_VERSION
        ) {
          const newPlan: typeof actionPlan = {
            generatedAt: new Date().toISOString(),
            latestReportId: latestReport.id,
            items: [],
            trackingDate: today,
            version: PLAN_VERSION
          };
          
          const foundItems = new Set<string>();
          const allParams = await getAllParameters();

          for (const reportParam of abnormalParams) {
            if (!reportParam.parameterId) continue;

            const paramNameLower = reportParam.parameterId.toLowerCase().trim();
            const dbParam = allParams.find(p => 
               p.name.toLowerCase().trim() === paramNameLower || 
               p.alternativeNames?.some((alt: string) => alt.toLowerCase().trim() === paramNameLower)
            );

            if (!dbParam) continue;

            // What treats/improves this parameter?
            const directTreatments = await getRelationshipsForTarget(dbParam.id);
            for (const treatRel of directTreatments) {
              if (["food", "exercise", "treatment", "medicine", "nutrition"].includes(treatRel.sourceType) && (treatRel.relationType === "improves" || treatRel.relationType === "treats")) {
                if (!foundItems.has(treatRel.sourceId)) {
                  foundItems.add(treatRel.sourceId);
                  newPlan.items.push({
                    itemId: treatRel.sourceId,
                    category: treatRel.sourceType,
                    status: "pending"
                  });
                }
              }
            }

            // What causes this abnormal parameter? (e.g. Iron Deficiency)
            const causesRels = await getRelationshipsForSource(dbParam.id);
            for (const causeRel of causesRels.filter(r => r.relationType === "causes")) {
              const indirectTreatments = await getRelationshipsForTarget(causeRel.targetId);
              for (const treatRel of indirectTreatments) {
                 if (["food", "exercise", "treatment", "medicine", "nutrition"].includes(treatRel.sourceType) && (treatRel.relationType === "improves" || treatRel.relationType === "treats")) {
                    if (!foundItems.has(treatRel.sourceId)) {
                      foundItems.add(treatRel.sourceId);
                      newPlan.items.push({
                        itemId: treatRel.sourceId,
                        category: treatRel.sourceType,
                        status: "pending"
                      });
                    }
                 }
              }
            }
          }

          await saveActionPlanState(newPlan);
          actionPlan = newPlan;
        }

        const hydratedItems = [];
        for (const itemStatus of actionPlan!.items) {
          let param = await db.get("parameters", itemStatus.itemId);
          
          if (!param) {
            const nameParts = itemStatus.itemId.split("_").slice(2);
            const name = nameParts.length > 0 ? nameParts.join(" ") : itemStatus.itemId;
            param = {
              id: itemStatus.itemId,
              name: name.charAt(0).toUpperCase() + name.slice(1),
              nameGu: undefined,
              alternativeNames: [],
              category: itemStatus.category,
              isNumeric: false,
              knowledgeStatus: "basic" as const,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as ParameterDef;
          }

          let kb = await getKnowledgeByParameterId(itemStatus.itemId);
          if (!kb) {
            kb = {
              id: 'kb_' + itemStatus.itemId,
              parameterId: itemStatus.itemId,
              detailedDescription: "Extracted automatically from AI knowledge graph.",
              simpleMeaning: 'Recommended ' + itemStatus.category,
              whyImportant: "Helps improve abnormal lab results.",
              normalRangeText: "",
              tags: [],
              source: "Graph DB",
              doctorNotes: "",
              personalNotes: "",
              references: [],
              versionHistory: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } as KnowledgeEntry;
          }

          if (param && kb) {
            hydratedItems.push({
              param,
              kb,
              status: itemStatus.status
            });
          }
        }
        setActionItems(
          hydratedItems.filter(
            (item): item is { param: ParameterDef; kb: KnowledgeEntry; status: "pending" | "taken" | "declined" } =>
              item.kb !== undefined && item.param !== undefined
          )
        );
      }

      setLoading(false);
    }
    loadDashboard();
  }, []);

  const handleItemAction = async (itemId: string, status: "pending" | "taken" | "declined") => {
    await markActionPlanItem(itemId, status);
    setActionItems(prev => prev.map(item => 
      item.param.id === itemId ? { ...item, status } : item
    ));
    setSelectedActionItem(null);
  };

  const pendingItems = actionItems.filter(f => f.status === "pending");
  const pendingMeds = todayMeds.filter((m) => m.status === "pending");
  const takenMeds = todayMeds.filter((m) => m.status === "taken");

  const formatChemoDate = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return t("dashboard.today");
    if (isTomorrow(d)) return t("dashboard.tomorrow");
    return format(d, "d MMM yyyy");
  };

  return (
    <AppShell>
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Greeting Header */}
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
          
          {/* Daily Action Plan */}
          <div className="bg-linear-to-br from-primary-600 to-primary-800 rounded-3xl p-5 text-white shadow-xl shadow-primary-500/20 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Daily Action Plan</h2>
                  <p className="text-primary-100 text-sm mt-0.5">Based on latest report</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Activity size={24} className="text-white" />
                </div>
              </div>

              {actionItems.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
                  <Activity size={24} className="text-primary-200" />
                  <div>
                    <p className="font-semibold text-white">No actions generated yet</p>
                    <p className="text-xs text-primary-200">
                      Add and link foods, medicines, or treatments to your Brain to see suggestions here!
                    </p>
                  </div>
                </div>
              ) : pendingItems.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-success-300" />
                  <div>
                    <p className="font-semibold text-success-50">All caught up!</p>
                    <p className="text-xs text-primary-200">You've completed all actions for today.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                    {pendingItems.map((item) => (
                      <button
                        key={item.param.id}
                        onClick={() => setSelectedActionItem(item)}
                        className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-lg">
                            {["food", "nutrition"].includes(item.param.category) ? "🍲" : 
                             item.param.category === "exercise" ? "🧘" : 
                             item.param.category === "medicine" ? "💊" : "💡"}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {language === "gu" && item.param.nameGu
                                ? item.param.nameGu
                                : item.param.name}
                            </p>
                            <p className="text-xs text-primary-200">
                               Recommended {item.param.category}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-white/60" />
                      </button>
                    ))}
                  </div>
              )}
            </div>
          </div>

          {/* Today's Medicines */}
          <div className="card-elevated animate-slide-up" style={{ animationDelay: "50ms" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 dark:bg-dark-primary-100 rounded-xl flex items-center justify-center">
                  <Pill size={16} className="text-primary-600 dark:text-dark-primary-600" />
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
                <div className="flex items-center gap-2 text-sm mb-3">
                  <div className="flex-1 bg-base-100 dark:bg-dark-base-200 rounded-full h-2">
                    <div
                      className="bg-success-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${todayMeds.length > 0 ? (takenMeds.length / todayMeds.length) * 100 : 0}%` }}
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
          <div className="card-elevated animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-secondary-100 dark:bg-dark-secondary-100 rounded-xl flex items-center justify-center">
                <Syringe size={16} className="text-secondary-600 dark:text-dark-secondary-600" />
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
                <Link href="/chemo/add" className="text-xs text-primary-500 font-medium">
                  + {t("chemo.addSession")}
                </Link>
              </div>
            )}
          </div>

          {/* Recent Reports */}
          <div className="card-elevated animate-slide-up" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-success-100 dark:bg-dark-success-100 rounded-xl flex items-center justify-center">
                  <FileText size={16} className="text-success-600 dark:text-dark-success-600" />
                </div>
                <h2 className="font-semibold text-base-900 dark:text-dark-base-900">
                  {t("dashboard.recentReports")}
                </h2>
              </div>
              <Link href="/reports" className="text-xs text-primary-500 dark:text-dark-primary-500 font-medium hover:underline">
                {t("dashboard.viewAll")}
              </Link>
            </div>

            {reports.length === 0 ? (
              <p className="text-sm text-base-400 dark:text-dark-base-400 text-center py-3">
                {t("dashboard.noReports")}
              </p>
            ) : (
              <div className="space-y-2">
                {reports.slice(0, 3).map((r) => {
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
                          {formatDate(r.reportDate)} • {r.hospitalName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {abnormal > 0 && (
                          <span className="text-xs badge-high px-2 py-0.5 rounded-full">
                            {abnormal} {language === "gu" ? "અસામાન્ય" : "abnormal"}
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

          <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: "200ms" }}>
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
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-primary-50 dark:bg-dark-primary-100 border border-primary-200 dark:border-dark-primary-200 hover:bg-primary-100 dark:hover:bg-dark-primary-200 transition-colors"
            >
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <span className="text-sm font-medium text-primary-700 dark:text-dark-primary-700 text-center">
                {t("nav.knowledge")}
              </span>
            </Link>
          </div>
        </div>
      )}

      {selectedActionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white dark:bg-dark-base-100 rounded-2xl w-full max-w-sm overflow-hidden animate-slide-up shadow-xl">
            <div className="p-4 border-b border-base-100 dark:border-dark-base-200 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-100 dark:bg-dark-primary-200 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                  {["food", "nutrition"].includes(selectedActionItem.param.category) ? "🍲" : 
                   selectedActionItem.param.category === "exercise" ? "🧘" : 
                   selectedActionItem.param.category === "medicine" ? "💊" : "💡"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-base-900 dark:text-dark-base-900">
                    {language === "gu" && selectedActionItem.param.nameGu
                      ? selectedActionItem.param.nameGu
                      : selectedActionItem.param.name}
                  </h3>
                  <p className="text-sm text-base-500 dark:text-dark-base-500 mt-1">
                    {selectedActionItem.kb.simpleMeaning}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedActionItem(null)}
                className="p-2 text-base-400 hover:text-base-600 dark:hover:text-dark-base-400 bg-base-50 dark:bg-dark-base-200 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="p-4 bg-base-50 dark:bg-dark-base-200 rounded-xl">
                <p className="text-xs font-bold text-base-500 dark:text-dark-base-500 uppercase tracking-wider mb-2">
                  {language === "gu" ? "વિગતો" : "Details"}
                </p>
                <p className="text-sm text-base-700 dark:text-dark-base-400 whitespace-pre-wrap">
                  {selectedActionItem.kb.detailedDescription}
                </p>
              </div>

              <div className="p-4 bg-primary-50 dark:bg-dark-primary-300 rounded-xl border border-primary-100 dark:border-dark-primary-400">
                <p className="text-xs font-bold text-primary-600 dark:text-dark-primary-700 uppercase tracking-wider mb-2">
                  {language === "gu" ? "શા માટે મહત્વપૂર્ણ" : "Why Important"}
                </p>
                <p className="text-sm text-primary-900 dark:text-dark-primary-800">
                  {selectedActionItem.kb.whyImportant}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-base-100 dark:border-dark-base-200 flex gap-3">
              <button
                onClick={() => handleItemAction(selectedActionItem.param.id, "declined")}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-danger-600 bg-danger-50 dark:bg-dark-danger-100 hover:bg-danger-100 transition-colors"
              >
                {language === "gu" ? "મારે નથી લેવું" : "Decline"}
              </button>
              <button
                onClick={() => handleItemAction(selectedActionItem.param.id, "taken")}
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
