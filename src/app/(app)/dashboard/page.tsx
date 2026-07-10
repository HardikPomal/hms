"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  Plus,
  ChevronRight,
  FileText,
  CheckCircle2,
  X,
  Activity,
  Pill,
  Syringe,
  BookOpen,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllReports } from "@/lib/db/reports";
import { getNextChemoAppointment } from "@/lib/db/chemo";
import { generateTodaySchedule } from "@/lib/db/medicines";
import { getSettings } from "@/lib/db/settings";
import {
  getKnowledgeByParameterId,
  getRelationshipsForSource,
  getRelationshipsForTarget,
  getAllParameters,
} from "@/lib/db/knowledge";
import { getDB } from "@/lib/db/db";
import {
  getActionPlanState,
  saveActionPlanState,
  markActionPlanItem,
} from "@/lib/db/actionPlan";
import { seedComprehensiveKnowledge } from "@/lib/db/seedData/seeder";
import { seedAllPendingLabParameters } from "@/lib/db/seedLabParameters";
import RichDescription from "@/components/ui/RichDescription";
import type {
  MedicalReport,
  ChemoSession,
  MedicineLog,
  AppSettings,
  KnowledgeEntry,
  ParameterDef,
} from "@/types";
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

  const [actionItems, setActionItems] = useState<
    {
      param: ParameterDef;
      kb: KnowledgeEntry;
      status: "pending" | "taken" | "declined";
    }[]
  >([]);

  const [selectedActionItem, setSelectedActionItem] = useState<{
    param: ParameterDef;
    kb: KnowledgeEntry;
  } | null>(null);

  // "nutrition" | "food" | null — which group card is open
  const [activeGroup, setActiveGroup] = useState<"nutrition" | "food" | null>(
    null,
  );

  const [speaking, setSpeaking] = useState(false);

  // Stop speech when the item modal is CLOSED (item becomes null)
  const prevSelectedItemRef = React.useRef(selectedActionItem);
  useEffect(() => {
    const wasOpen = prevSelectedItemRef.current !== null;
    const isNowClosed = selectedActionItem === null;
    if (wasOpen && isNowClosed) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      // Also clear the keepalive interval
      if (keepaliveRef.current !== null) {
        clearInterval(keepaliveRef.current);
        keepaliveRef.current = null;
      }
      setSpeaking(false);
    }
    prevSelectedItemRef.current = selectedActionItem;
  }, [selectedActionItem]);

  // Cleanup speech on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (keepaliveRef.current !== null) {
        clearInterval(keepaliveRef.current);
        keepaliveRef.current = null;
      }
    };
  }, []);

  const cleanTextForSpeech = (raw: string, lang: string): string => {
    const tag = lang === "gu" ? "gu" : "en";
    const match = raw.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
    let text = match ? match[1].trim() : raw;

    if (!match) {
      const fallbackMatch = raw.match(/<en>([\s\S]*?)<\/en>/i);
      text = fallbackMatch ? fallbackMatch[1].trim() : raw;
    }

    text = text.replace(/<[^>]+>/g, "");

    return text
      .split("\n")
      .map((line) => {
        let l = line.trim();
        if (l.startsWith("### ")) l = l.replace(/^###\s+/, "") + ". ";
        else if (l.startsWith("## ")) l = l.replace(/^##\s+/, "") + ". ";
        else if (l.startsWith("- ")) l = l.replace(/^-\s+/, "");
        return l;
      })
      .filter((l) => l.length > 0)
      .join(" ");
  };

  const getSpeakText = () => {
    if (!selectedActionItem) return "";

    const title =
      language === "gu" && selectedActionItem.param.nameGu
        ? selectedActionItem.param.nameGu
        : selectedActionItem.param.name;

    const rawDesc = selectedActionItem.kb.detailedDescription;
    const descCleaned = cleanTextForSpeech(rawDesc, language);

    const rawWhy = selectedActionItem.kb.whyImportant;
    const whyCleaned = rawWhy ? cleanTextForSpeech(rawWhy, language) : "";

    const simpleMeaning =
      language === "gu" && selectedActionItem.kb.simpleMeaningGu
        ? selectedActionItem.kb.simpleMeaningGu
        : selectedActionItem.kb.simpleMeaning;

    let speakText = title + ". ";
    if (simpleMeaning) speakText += simpleMeaning + ". ";
    speakText += descCleaned;
    if (whyCleaned) {
      speakText +=
        (language === "gu" ? " શા માટે મહત્વપૂર્ણ. " : " Why Important. ") +
        whyCleaned;
    }

    return speakText;
  };

  const getVoicesAsync = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }
      const onVoicesChanged = () => {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          onVoicesChanged,
        );
        resolve(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
      setTimeout(() => {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          onVoicesChanged,
        );
        resolve(window.speechSynthesis.getVoices());
      }, 1000);
    });
  };

  // Splits text into short chunks at sentence/comma boundaries to avoid
  // the browser TTS freeze bug that occurs with long non-Latin strings.
  const chunkText = (text: string, maxLen = 150): string[] => {
    const chunks: string[] = [];
    // Split on sentence-ending punctuation (Gujarati । and Latin . ! ?)
    const sentences = text.split(/(?<=[.!?।])\s+/);
    let current = "";
    for (const sentence of sentences) {
      if ((current + " " + sentence).trim().length <= maxLen) {
        current = (current + " " + sentence).trim();
      } else {
        if (current) chunks.push(current);
        // If a single sentence is still too long, hard-split it
        if (sentence.length > maxLen) {
          const words = sentence.split(" ");
          let sub = "";
          for (const w of words) {
            if ((sub + " " + w).trim().length <= maxLen) {
              sub = (sub + " " + w).trim();
            } else {
              if (sub) chunks.push(sub);
              sub = w;
            }
          }
          current = sub;
        } else {
          current = sentence;
        }
      }
    }
    if (current) chunks.push(current);
    return chunks.filter((c) => c.trim().length > 0);
  };

  const keepaliveRef = React.useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const stopKeepalive = () => {
    if (keepaliveRef.current !== null) {
      clearInterval(keepaliveRef.current);
      keepaliveRef.current = null;
    }
  };

  const handleSpeak = async (textToSpeak: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      stopKeepalive();
      setSpeaking(false);
      return;
    }

    if (!textToSpeak.trim()) return;

    const voices = await getVoicesAsync();
    const voiceLang = language === "gu" ? "gu" : "en";
    const langTag = language === "gu" ? "gu-IN" : "en-US";
    const matchingVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(voiceLang),
    );

    // Gujarati voice not installed on this device — tell the user
    if (language === "gu" && !matchingVoice) {
      alert(
        "તમારા ઉપકરણ પર ગુજરાતી અવાજ ઇન્સ્ટોલ નથી.\nDevice Settings > Language & Input > Text-to-Speech માં Google TTS સક્ષમ કરો.",
      );
      return;
    }

    const chunks = chunkText(textToSpeak);
    if (chunks.length === 0) return;

    setSpeaking(true);

    // Chrome TTS freeze workaround: pause+resume every 10 seconds
    keepaliveRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);

    let index = 0;

    const speakNext = () => {
      if (index >= chunks.length || !window.speechSynthesis) {
        stopKeepalive();
        setSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = langTag;
      utterance.rate = 0.85;
      utterance.pitch = 1;
      if (matchingVoice) utterance.voice = matchingVoice;

      utterance.onend = () => {
        index++;
        speakNext();
      };

      utterance.onerror = (e) => {
        // "interrupted" fires when we cancel intentionally — not an error
        if ((e as SpeechSynthesisErrorEvent).error !== "interrupted") {
          stopKeepalive();
          setSpeaking(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    async function loadDashboard() {
      const today = new Date().toISOString().split("T")[0];

      // Ensure knowledge graph is seeded before generating action plan
      await seedComprehensiveKnowledge();
      await seedAllPendingLabParameters();

      const [sortedReports, nextChemoData, medsData, settingsData] =
        await Promise.all([
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
          (f) => f.status === "high" || f.status === "low",
        );

        let actionPlan = await getActionPlanState();
        const db = await getDB();
        const PLAN_VERSION = "v7_graph";

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
            version: PLAN_VERSION,
          };

          const foundItems = new Set<string>();
          const allParams = await getAllParameters();

          for (const reportParam of abnormalParams) {
            if (!reportParam.parameterId) continue;

            const paramNameLower = reportParam.parameterId.toLowerCase().trim();
            const dbParam = allParams.find(
              (p) =>
                p.name.toLowerCase().trim() === paramNameLower ||
                p.alternativeNames?.some(
                  (alt: string) => alt.toLowerCase().trim() === paramNameLower,
                ),
            );

            if (!dbParam) continue;

            // What treats/improves this parameter?
            const directTreatments = await getRelationshipsForTarget(
              dbParam.id,
            );
            for (const treatRel of directTreatments) {
              if (
                [
                  "food",
                  "exercise",
                  "treatment",
                  "medicine",
                  "nutrition",
                ].includes(treatRel.sourceType) &&
                (treatRel.relationType === "improves" ||
                  treatRel.relationType === "treats")
              ) {
                if (!foundItems.has(treatRel.sourceId)) {
                  foundItems.add(treatRel.sourceId);
                  newPlan.items.push({
                    itemId: treatRel.sourceId,
                    category: treatRel.sourceType,
                    status: "pending",
                  });
                }
              }
            }

            // What causes this abnormal parameter? (e.g. Iron Deficiency)
            const causesRels = await getRelationshipsForSource(dbParam.id);
            for (const causeRel of causesRels.filter(
              (r) => r.relationType === "causes",
            )) {
              const indirectTreatments = await getRelationshipsForTarget(
                causeRel.targetId,
              );
              for (const treatRel of indirectTreatments) {
                if (
                  [
                    "food",
                    "exercise",
                    "treatment",
                    "medicine",
                    "nutrition",
                  ].includes(treatRel.sourceType) &&
                  (treatRel.relationType === "improves" ||
                    treatRel.relationType === "treats")
                ) {
                  if (!foundItems.has(treatRel.sourceId)) {
                    foundItems.add(treatRel.sourceId);
                    newPlan.items.push({
                      itemId: treatRel.sourceId,
                      category: treatRel.sourceType,
                      status: "pending",
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
          // Use 'medical_entities' store (v4) — 'parameters' store was deleted in migration
          let entity = await db.get("medical_entities", itemStatus.itemId);

          let paramCategory = itemStatus.category;
          if (entity) {
            const entityType = entity.type as string;
            if (
              entityType === "food" ||
              entityType === "exercise" ||
              entityType === "nutrition" ||
              entityType === "treatment"
            ) {
              paramCategory = entityType;
            } else if (entityType === "medication") {
              paramCategory = "medicine";
            } else if (entity.category) {
              paramCategory = entity.category;
            }
          }

          // Fallback: build a minimal display object if entity not found
          const param: ParameterDef = entity
            ? ({
                id: entity.id,
                name: entity.name,
                nameGu: entity.nameGu,
                alternativeNames: entity.alternativeNames || [],
                category: paramCategory,
                isNumeric: false,
                knowledgeStatus: (entity.knowledgeStatus as any) || "advanced",
                createdAt: entity.createdAt,
                updatedAt: entity.updatedAt,
              } as ParameterDef)
            : ({
                id: itemStatus.itemId,
                name: itemStatus.itemId,
                nameGu: undefined,
                alternativeNames: [],
                category: itemStatus.category,
                isNumeric: false,
                knowledgeStatus: "basic" as const,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as ParameterDef);

          const kb: KnowledgeEntry = {
            id: "kb_" + itemStatus.itemId,
            parameterId: itemStatus.itemId,
            // Store raw description WITH <en>/<gu> tags — RichDescription extracts the right language at render time
            detailedDescription:
              entity?.detailedDescription ||
              "Recommended based on your latest report.",
            simpleMeaning:
              entity?.simpleMeaning || "Recommended " + itemStatus.category,
            simpleMeaningGu: entity?.simpleMeaningGu,
            whyImportant:
              entity?.whyImportant || "Helps improve abnormal lab results.",
            normalRangeText: "",
            tags: entity?.tags || [],
            source: entity?.source || "Graph DB",
            doctorNotes: "",
            personalNotes: "",
            references: [],
            versionHistory: [],
            createdAt: entity?.createdAt || new Date().toISOString(),
            updatedAt: entity?.updatedAt || new Date().toISOString(),
          } as KnowledgeEntry;

          hydratedItems.push({
            param,
            kb,
            status: itemStatus.status,
          });
        }
        setActionItems(
          hydratedItems.filter(
            (
              item,
            ): item is {
              param: ParameterDef;
              kb: KnowledgeEntry;
              status: "pending" | "taken" | "declined";
            } => item.kb !== undefined && item.param !== undefined,
          ),
        );
      }

      setLoading(false);
    }
    loadDashboard();
  }, []);

  const handleItemAction = async (
    itemId: string,
    status: "pending" | "taken" | "declined",
  ) => {
    await markActionPlanItem(itemId, status);
    setActionItems((prev) =>
      prev.map((item) =>
        item.param.id === itemId ? { ...item, status } : item,
      ),
    );
    setSelectedActionItem(null);
  };

  // All items always shown — never removed. Status is just a badge.
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
                  <p className="text-primary-100 text-sm mt-0.5">
                    Based on latest report
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Activity size={24} className="text-white" />
                </div>
              </div>

              {actionItems.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
                  <Activity size={24} className="text-primary-200" />
                  <div>
                    <p className="font-semibold text-white">
                      {language === "gu"
                        ? "કોઈ કાર્યયોજના જન઻રાત નથી"
                        : "No actions generated yet"}
                    </p>
                    <p className="text-xs text-primary-200">
                      {language === "gu"
                        ? "ફૂડ, દવા કે પોષણ ને Brain પર ઉમેરો"
                        : "Add and link foods or nutrition to your Brain to see suggestions!"}
                    </p>
                  </div>
                </div>
              ) : (
                (() => {
                  const nutritionItems = actionItems.filter(
                    (i) => i.param.category === "nutrition",
                  );
                  const foodItems = actionItems.filter(
                    (i) => i.param.category !== "nutrition",
                  );
                  const nutritionDone = nutritionItems.filter(
                    (i) => i.status === "taken",
                  ).length;
                  const foodDone = foodItems.filter(
                    (i) => i.status === "taken",
                  ).length;

                  return (
                    <div className="grid grid-cols-2 gap-3">
                      {/* Nutrition Tips Card */}
                      {nutritionItems.length > 0 && (
                        <button
                          onClick={() => setActiveGroup("nutrition")}
                          className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-4 flex flex-col items-start gap-2 transition-colors text-left"
                        >
                          <span className="text-3xl">💡</span>
                          <div>
                            <p className="font-bold text-white text-sm leading-tight">
                              {language === "gu"
                                ? "પોષણ સૂચનો"
                                : "Nutrition Tips"}
                            </p>
                            <p className="text-xs text-primary-200 mt-0.5">
                              {nutritionDone}/{nutritionItems.length}{" "}
                              {language === "gu" ? "જોયા" : "reviewed"}
                            </p>
                          </div>
                          {nutritionDone === nutritionItems.length && (
                            <span className="text-[10px] font-bold uppercase bg-success-500/30 text-success-100 px-2 py-0.5 rounded-full">
                              {language === "gu" ? "પૂર્ણ" : "All done"}
                            </span>
                          )}
                        </button>
                      )}

                      {/* Food to Eat Card */}
                      {foodItems.length > 0 && (
                        <button
                          onClick={() => setActiveGroup("food")}
                          className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-4 flex flex-col items-start gap-2 transition-colors text-left"
                        >
                          <span className="text-3xl">🍲</span>
                          <div>
                            <p className="font-bold text-white text-sm leading-tight">
                              {language === "gu" ? "આજનો ખોરાક" : "Food to Eat"}
                            </p>
                            <p className="text-xs text-primary-200 mt-0.5">
                              {foodDone}/{foodItems.length}{" "}
                              {language === "gu" ? "ખાધું" : "eaten today"}
                            </p>
                          </div>
                          {foodDone === foodItems.length && (
                            <span className="text-[10px] font-bold uppercase bg-success-500/30 text-success-100 px-2 py-0.5 rounded-full">
                              {language === "gu" ? "પૂર્ણ" : "All done"}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          </div>

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
            <div className="flex items-center justify-between mb-4">
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
        <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/60 animate-fade-in">
          <div className="bg-white dark:bg-dark-base-100 rounded-t-3xl w-full max-w-lg overflow-hidden animate-slide-up shadow-2xl flex flex-col max-h-[92vh]">
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-base-200 dark:bg-dark-base-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 pt-2 pb-4 border-b border-base-100 dark:border-dark-base-200 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-dark-primary-200 rounded-2xl flex items-center justify-center text-2xl shrink-0 mt-0.5">
                    {selectedActionItem.param.category === "nutrition"
                      ? "💡"
                      : selectedActionItem.param.category === "food"
                        ? "🍲"
                        : selectedActionItem.param.category === "exercise"
                          ? "🧘"
                          : selectedActionItem.param.category === "medicine"
                            ? "💊"
                            : "📝"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-base-900 dark:text-dark-base-900 leading-snug flex-1">
                        {language === "gu" && selectedActionItem.param.nameGu
                          ? selectedActionItem.param.nameGu
                          : selectedActionItem.param.name}
                      </h3>
                      <button
                        onClick={() => handleSpeak(getSpeakText())}
                        className={`p-2 rounded-full shrink-0 transition-colors flex items-center justify-center ${
                          speaking
                            ? "bg-danger-100 text-danger-600"
                            : "bg-primary-100 dark:bg-dark-primary-100/30 text-primary-600"
                        }`}
                        title={speaking ? "Stop" : "Read Aloud"}
                      >
                        {speaking ? (
                          <VolumeX size={15} />
                        ) : (
                          <Volume2 size={15} />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-base-500 dark:text-dark-base-500 mt-1 leading-snug">
                      {language === "gu" &&
                      selectedActionItem.kb.simpleMeaningGu
                        ? selectedActionItem.kb.simpleMeaningGu
                        : selectedActionItem.kb.simpleMeaning}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedActionItem(null)}
                  className="p-1.5 text-base-400 bg-base-100 dark:bg-dark-base-200 rounded-full flex items-center justify-center shrink-0"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="px-4 py-4 space-y-3 overflow-y-auto flex-1">
              <div className="p-3 bg-base-50 dark:bg-dark-base-200 rounded-xl">
                <p className="text-[11px] font-bold text-base-500 dark:text-dark-base-500 uppercase tracking-wider mb-2">
                  {language === "gu" ? "વિગતો" : "Details"}
                </p>
                <RichDescription
                  text={selectedActionItem.kb.detailedDescription}
                  language={language}
                />
              </div>

              <div className="p-3 bg-primary-50 dark:bg-dark-primary-300 rounded-xl border border-primary-100 dark:border-dark-primary-400">
                <p className="text-[11px] font-bold text-primary-600 dark:text-dark-primary-700 uppercase tracking-wider mb-2">
                  {language === "gu" ? "શા માટે મહત્વપૂર્ણ" : "Why Important"}
                </p>
                <RichDescription
                  text={selectedActionItem.kb.whyImportant}
                  language={language}
                />
              </div>
            </div>

            {/* Action footer */}
            <div className="px-4 py-4 border-t border-base-100 dark:border-dark-base-200 flex gap-2 shrink-0 pb-safe">
              {selectedActionItem.param.category === "nutrition" ? (
                <button
                  onClick={() =>
                    handleItemAction(selectedActionItem.param.id, "taken")
                  }
                  className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-white bg-primary-600 active:bg-primary-700 transition-colors text-sm"
                >
                  {language === "gu" ? "સમજ્યા, બંધ કરો" : "Got it, Close"}
                </button>
              ) : (
                <>
                  <button
                    onClick={() =>
                      handleItemAction(selectedActionItem.param.id, "declined")
                    }
                    className="flex-1 py-3.5 px-3 rounded-2xl font-bold text-danger-600 bg-danger-50 dark:bg-dark-danger-100 active:bg-danger-100 transition-colors text-sm"
                  >
                    {language === "gu" ? "આજે નહીં" : "Skip"}
                  </button>
                  <button
                    onClick={() =>
                      handleItemAction(selectedActionItem.param.id, "taken")
                    }
                    className="flex-1 py-3.5 px-3 rounded-2xl font-bold text-white bg-success-500 active:bg-success-600 transition-colors shadow-sm text-sm"
                  >
                    {language === "gu" ? "મેં ખાધું" : "Done ✓"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeGroup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in">
          <div className="bg-white dark:bg-dark-base-100 rounded-t-3xl w-full max-w-lg overflow-hidden animate-slide-up shadow-2xl flex flex-col max-h-[88vh]">
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-base-200 dark:bg-dark-base-300 rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="px-4 pt-2 pb-3 border-b border-base-100 dark:border-dark-base-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">
                  {activeGroup === "nutrition" ? "💡" : "🍲"}
                </span>
                <div>
                  <h3 className="text-base font-bold text-base-900 dark:text-dark-base-900">
                    {activeGroup === "nutrition"
                      ? language === "gu"
                        ? "પોષણ સૂચનો"
                        : "Nutrition Tips"
                      : language === "gu"
                        ? "આજનો ખોરાક"
                        : "Food to Eat"}
                  </h3>
                  <p className="text-xs text-base-500 dark:text-dark-base-500">
                    {activeGroup === "nutrition"
                      ? `${actionItems.filter((i) => i.param.category === "nutrition" && i.status === "taken").length}/${actionItems.filter((i) => i.param.category === "nutrition").length} ` +
                        (language === "gu" ? "જોયા" : "reviewed")
                      : `${actionItems.filter((i) => i.param.category === "food" && i.status === "taken").length}/${actionItems.filter((i) => i.param.category === "food").length} ` +
                        (language === "gu" ? "ખાધું" : "completed")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveGroup(null)}
                className="p-1.5 text-base-400 bg-base-100 dark:bg-dark-base-200 rounded-full flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content - List of Items */}
            <div className="px-3 py-3 overflow-y-auto space-y-2 flex-1">
              {actionItems
                .filter((i) =>
                  activeGroup === "nutrition"
                    ? i.param.category === "nutrition"
                    : i.param.category === "food",
                )
                .map((item) => {
                  const isCompleted = item.status === "taken";
                  const isDeclined = item.status === "declined";
                  return (
                    <div
                      key={item.param.id}
                      onClick={() => setSelectedActionItem(item)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${
                        isCompleted
                          ? "border-success-200 dark:border-dark-success-300 bg-success-50/50 dark:bg-dark-success-100/10"
                          : "border-base-100 dark:border-dark-base-200 bg-white dark:bg-dark-base-100"
                      }`}
                    >
                      {/* Status dot */}
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isCompleted
                            ? "bg-success-500"
                            : isDeclined
                              ? "bg-danger-400"
                              : "bg-base-300"
                        }`}
                      />

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold text-sm leading-snug ${
                            isCompleted
                              ? "text-base-400 dark:text-dark-base-400 line-through"
                              : "text-base-900 dark:text-dark-base-900"
                          }`}
                        >
                          {language === "gu" && item.param.nameGu
                            ? item.param.nameGu
                            : item.param.name}
                        </p>
                        <p className="text-xs text-base-400 dark:text-dark-base-400 mt-0.5 line-clamp-1">
                          {language === "gu" && item.kb.simpleMeaningGu
                            ? item.kb.simpleMeaningGu
                            : item.kb.simpleMeaning}
                        </p>
                      </div>

                      {/* Action buttons - stop propagation so row click still opens detail */}
                      <div
                        className="flex items-center gap-1.5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {activeGroup === "nutrition" ? (
                          <button
                            onClick={() =>
                              handleItemAction(
                                item.param.id,
                                isCompleted ? "pending" : "taken",
                              )
                            }
                            className={`p-2 rounded-xl transition-colors flex items-center justify-center ${
                              isCompleted
                                ? "bg-success-100 text-success-600"
                                : "bg-base-100 dark:bg-dark-base-200 text-base-400"
                            }`}
                          >
                            <CheckCircle2 size={17} />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                handleItemAction(
                                  item.param.id,
                                  isDeclined ? "pending" : "declined",
                                )
                              }
                              className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${
                                isDeclined
                                  ? "bg-danger-100 text-danger-600"
                                  : "bg-base-100 dark:bg-dark-base-200 text-base-500"
                              }`}
                            >
                              {language === "gu" ? "નહીં" : "Skip"}
                            </button>
                            <button
                              onClick={() =>
                                handleItemAction(
                                  item.param.id,
                                  isCompleted ? "pending" : "taken",
                                )
                              }
                              className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${
                                isCompleted
                                  ? "bg-success-100 text-success-600"
                                  : "bg-primary-600 text-white"
                              }`}
                            >
                              {isCompleted
                                ? "✓"
                                : language === "gu"
                                  ? "ખાધું"
                                  : "Eat"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="px-4 pt-2 pb-5 border-t border-base-100 dark:border-dark-base-200 shrink-0">
              <button
                onClick={() => setActiveGroup(null)}
                className="w-full py-3.5 rounded-2xl font-bold text-base-700 dark:text-dark-base-700 bg-base-100 dark:bg-dark-base-200 active:bg-base-200 transition-colors text-sm"
              >
                {language === "gu" ? "બંધ કરો" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
