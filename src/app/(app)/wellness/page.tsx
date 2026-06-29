"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";

interface Exercise {
  id: string; emoji: string; name: string; nameGu: string;
  duration: string; durationGu: string; level: "low" | "medium" | "high";
  description: string; descriptionGu: string; safety: string; safetyGu: string;
}

const EXERCISES: Exercise[] = [
  { id: "1", emoji: "🚶", name: "Gentle Walking", nameGu: "ધીમી ચાલ", duration: "10–15 min", durationGu: "10–15 મિ", level: "low", description: "Slow, gentle walk indoors or in the garden. No steep hills. Focus on breathing.", descriptionGu: "ઘરમાં અથવા બગીચામાં ધીમી ચાલ. ઊંચા ઢોળાવ ટાળો.", safety: "Stop if you feel dizzy or very tired. Always walk with someone nearby.", safetyGu: "ચક્કર આવે તો રોકો. કોઈ સાથે ચાલો." },
  { id: "2", emoji: "🧘", name: "Seated Yoga", nameGu: "બેઠા યોગ", duration: "10–20 min", durationGu: "10–20 મિ", level: "low", description: "Gentle stretches while seated in a chair. No bending or twisting that causes pain.", descriptionGu: "ખુરશીમાં બેઠા બેઠા ખેંચ. દર્દ થાય ત્યારે ના.", safety: "Do not do any pose that causes pain or discomfort.", safetyGu: "કોઈ એવો વ્યાયામ ન કરો જેનાથી દર્દ થાય." },
  { id: "3", emoji: "🫁", name: "Deep Breathing", nameGu: "ઊંડા શ્વાસ", duration: "5–10 min", durationGu: "5–10 મિ", level: "low", description: "Slow, deep belly breathing. Inhale for 4 counts, hold for 2, exhale for 6. Reduces anxiety and helps oxygenate blood.", descriptionGu: "ધીરે ઊંડા પેટ-શ્વાસ. 4 ગણ-ભર, 2 ગણ-પ, 6 ગણ-ઉ. ચિંતા ઘટે.", safety: "Stop if breathing becomes difficult. Sit upright while doing this.", safetyGu: "શ્વાસ લેવામાં તકલીફ પડે તો રોકો. સીધા બેસો." },
  { id: "4", emoji: "🧘‍♀️", name: "Meditation", nameGu: "ધ્યાન", duration: "10–15 min", durationGu: "10–15 મિ", level: "low", description: "Sit quietly. Focus on your breath. Let thoughts pass without holding on. Use guided meditation audio if helpful.", descriptionGu: "શાંત બેસો. શ્વાસ પર ધ્યાન આપો. વિચારો આવવા અને જવા દો.", safety: "Can be done lying down if sitting is difficult.", safetyGu: "બેસવામાં તકલીફ હોય તો સૂતા સૂતા પણ કરી શકાય." },
  { id: "5", emoji: "🤸", name: "Gentle Stretching", nameGu: "હળવો ખેંચાણ", duration: "10–15 min", durationGu: "10–15 મિ", level: "medium", description: "Light stretches for arms, legs, and neck. Helps reduce stiffness from lying in bed.", descriptionGu: "હાથ, પગ અને ગરદન માટે હળવો ખેંચાણ. પથારીમાં સૂવાથી થતી જડતા ઘટાડે છે.", safety: "Never stretch to the point of pain. Hold each stretch for 15–30 seconds.", safetyGu: "દુખાવો થાય ત્યાં સુધી ખેંચશો નહીં. 15-30 સેકન્ડ પકડી રાખો." },
  { id: "6", emoji: "🏊", name: "Hand & Foot Exercises", nameGu: "હાથ અને પગનો વ્યાયામ", duration: "5–10 min", durationGu: "5–10 મિ", level: "low", description: "Circular movements of wrists and ankles. Helps prevent swelling and improves circulation.", descriptionGu: "કાંડા અને પગની ઘૂંટીઓને ગોળાકાર ફેરવો. સોજો અટકાવે છે અને રક્ત પરિભ્રમણ સુધારે છે.", safety: "Very gentle. Can be done in bed.", safetyGu: "ખૂબ હળવો. પથારીમાં પણ કરી શકાય." },
  { id: "7", emoji: "🌬️", name: "Alternate Nostril Breathing", nameGu: "અનુલોમ વિલોમ", duration: "5–10 min", durationGu: "5–10 મિ", level: "medium", description: "Pranayama breathing technique. Close one nostril, breathe through the other, alternate. Calms the nervous system.", descriptionGu: "પ્રાણાયામ તકનીક. એક નસકોરું બંધ કરી બીજાથી શ્વાસ લો અને છોડો. જ્ઞાનતંતુઓને શાંત કરે છે.", safety: "Do not do if breathing is already labored. Sit comfortably upright.", safetyGu: "જો શ્વાસ લેવામાં તકલીફ હોય તો ન કરો. સીધા આરામથી બેસો." },
];

const LEVEL_LABELS = { low: { en: "Low Effort", gu: "ઓછી મહેનત" }, medium: { en: "Medium", gu: "સાધારણ" }, high: { en: "Active", gu: "સક્રિય" } };
const LEVEL_COLORS = { low: "bg-success-100 text-success-700", medium: "bg-primary-100 text-primary-700", high: "bg-secondary-100 text-secondary-700" };

export default function WellnessPage() {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === "all" ? EXERCISES : EXERCISES.filter((e) => e.level === filter);

  return (
    <AppShell title={t("wellness.title")}>
      <p className="text-sm text-base-500 dark:text-dark-base-500 mb-4">{t("wellness.subtitle")}</p>

      <div className="flex gap-2 mb-4">
        {(["all", "low", "medium"] as const).map((lv) => (
          <button key={lv} onClick={() => setFilter(lv)} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${filter === lv ? "bg-primary-500 text-white" : "bg-base-100 dark:bg-dark-base-200 text-base-600 dark:text-dark-base-600"}`}>
            {lv === "all" ? (language === "gu" ? "બધા" : "All") : language === "gu" ? LEVEL_LABELS[lv].gu : LEVEL_LABELS[lv].en}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((ex) => (
          <div key={ex.id} className="card-elevated">
            <button className="w-full flex items-center gap-3 text-left" onClick={() => setExpanded(expanded === ex.id ? null : ex.id)}>
              <span className="text-3xl">{ex.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-base-900 dark:text-dark-base-900">{language === "gu" ? ex.nameGu : ex.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[ex.level]}`}>{LEVEL_LABELS[ex.level][language === "gu" ? "gu" : "en"]}</span>
                </div>
                <p className="text-xs text-base-400">⏱ {language === "gu" ? ex.durationGu : ex.duration}</p>
              </div>
              <span className="text-base-400">{expanded === ex.id ? "▲" : "▼"}</span>
            </button>

            {expanded === ex.id && (
              <div className="mt-3 space-y-3 border-t border-base-100 dark:border-dark-base-200 pt-3 animate-fade-in">
                <div>
                  <p className="text-xs font-semibold text-primary-600 mb-1">📋 {language === "gu" ? "કેવી રીતે કરવું" : "How to do it"}</p>
                  <p className="text-sm text-base-700 dark:text-dark-base-700">{language === "gu" ? ex.descriptionGu : ex.description}</p>
                </div>
                <div className="p-3 bg-danger-50 dark:bg-dark-danger-100 rounded-xl">
                  <p className="text-xs font-semibold text-danger-600 mb-1">⚠️ {t("wellness.safetyNotes")}</p>
                  <p className="text-sm text-danger-700 dark:text-dark-danger-700">{language === "gu" ? ex.safetyGu : ex.safety}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-base-100 dark:bg-dark-base-200 rounded-xl">
        <p className="text-xs text-base-500 dark:text-dark-base-500">{t("wellness.disclaimer")}</p>
      </div>
    </AppShell>
  );
}
