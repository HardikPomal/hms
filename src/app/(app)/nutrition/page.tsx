"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { NUTRITION_DATA, type NutritionCategory } from "@/data/nutrition";

const FILTERS: {
  key: NutritionCategory | "all";
  labelEn: string;
  labelGu: string;
  emoji: string;
}[] = [
  { key: "all", labelEn: "All", labelGu: "બધા", emoji: "🍽️" },
  {
    key: "lowHemoglobin",
    labelEn: "Low Hemoglobin",
    labelGu: "ઓછું હિ.",
    emoji: "🩸",
  },
  { key: "fatigue", labelEn: "Fatigue", labelGu: "થાક", emoji: "😴" },
  {
    key: "lowAppetite",
    labelEn: "Low Appetite",
    labelGu: "ભૂખ ઓછી",
    emoji: "🤢",
  },
  { key: "hydration", labelEn: "Hydration", labelGu: "પ્રવાહી", emoji: "💧" },
  { key: "recovery", labelEn: "Recovery", labelGu: "સ્વસ્થ", emoji: "💪" },
  { key: "protein", labelEn: "Protein", labelGu: "પ્રોટીન", emoji: "🥜" },
];

export default function NutritionPage() {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<NutritionCategory | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered =
    filter === "all"
      ? NUTRITION_DATA
      : NUTRITION_DATA.filter((n) => n.categories.includes(filter));

  return (
    <AppShell title={t("nutrition.title")}>
      <p className="text-sm text-base-500 dark:text-dark-base-500 mb-4">
        {t("nutrition.subtitle")}
      </p>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-primary-500 text-white"
                : "bg-base-100 dark:bg-dark-base-200 text-base-600 dark:text-dark-base-600"
            }`}
          >
            {f.emoji} {language === "gu" ? f.labelGu : f.labelEn}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="card-elevated">
            <button
              className="w-full flex items-center gap-3 text-left"
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <span className="text-3xl">{item.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-base-900 dark:text-dark-base-900">
                  {language === "gu" ? item.nameGu : item.name}
                </p>
                <p className="text-xs text-base-400 dark:text-dark-base-400 mt-0.5 line-clamp-1">
                  {language === "gu" ? item.benefitsGu : item.benefits}
                </p>
              </div>
              <span className="text-base-400 text-lg">
                {expanded === item.id ? "▲" : "▼"}
              </span>
            </button>

            {expanded === item.id && (
              <div className="mt-3 space-y-3 border-t border-base-100 dark:border-dark-base-200 pt-3 animate-fade-in">
                <div>
                  <p className="text-xs font-semibold text-success-600 mb-1">
                    ✓ {t("nutrition.benefits")}
                  </p>
                  <p className="text-sm text-base-700 dark:text-dark-base-700">
                    {language === "gu" ? item.benefitsGu : item.benefits}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-600 mb-1">
                    👩‍🍳 {t("nutrition.preparation")}
                  </p>
                  <p className="text-sm text-base-700 dark:text-dark-base-700">
                    {language === "gu" ? item.preparationGu : item.preparation}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-secondary-600 mb-1">
                    🕐 {t("nutrition.whenToEat")}
                  </p>
                  <p className="text-sm text-base-700 dark:text-dark-base-700">
                    {language === "gu" ? item.whenToEatGu : item.whenToEat}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-base-100 dark:bg-dark-base-200 rounded-xl">
        <p className="text-xs text-base-500 dark:text-dark-base-500">
          {t("nutrition.disclaimer")}
        </p>
      </div>
    </AppShell>
  );
}
