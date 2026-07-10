"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { getEntitiesByType } from "@/lib/db/knowledge";
import { seedNutritionData } from "@/lib/db/seed";
import type { MedicalEntity } from "@/types";
import { Plus } from "lucide-react";
import Link from "next/link";

const FILTERS: {
  key: string;
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
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [foods, setFoods] = useState<MedicalEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        await seedNutritionData();
        const foodEntities = await getEntitiesByType("food");
        setFoods(foodEntities);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered =
    filter === "all"
      ? foods
      : foods.filter((n) => n.tags && n.tags.includes(filter));

  return (
    <AppShell title={t("nutrition.title")}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-base-500 dark:text-dark-base-500">
          {t("nutrition.subtitle")}
        </p>
        <Link
          href="/nutrition/add"
          className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
        >
          <Plus size={16} />
          {language === "gu" ? "ખોરાક ઉમેરો" : "Add Food"}
        </Link>
      </div>

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
        {loading ? (
          <div className="p-8 text-center text-base-500 animate-pulse">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center bg-base-50 dark:bg-dark-base-200 rounded-xl text-base-500">
            No foods found for this category.
          </div>
        ) : (
          filtered.map((item) => {
            const englishPrep = item.detailedDescription || "";
            const gujPrep = item.detailedDescriptionGu || englishPrep;
            
            const englishBen = item.simpleMeaning || "";
            const gujBen = item.simpleMeaningGu || englishBen;
            
            const englishTime = item.metadata?.bestTimeToEat || "";
            const gujTime = item.metadata?.bestTimeToEatGu || englishTime;
            
            const engTitle = item.name;
            const gujTitle = item.nameGu || engTitle;
            
            return (
              <div key={item.id} className="card-elevated">
                <button
                  className="w-full flex items-center gap-3 text-left"
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                >
                  <span className="text-3xl flex items-center justify-center shrink-0">🍲</span>
                  <div className="flex-1">
                    <p className="font-semibold text-base-900 dark:text-dark-base-900">
                      {language === "gu" ? gujTitle : engTitle}
                    </p>
                    <p className="text-xs text-base-400 dark:text-dark-base-400 mt-0.5 line-clamp-1">
                      {language === "gu" ? gujBen : englishBen}
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
                        {language === "gu" ? gujBen : englishBen}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-primary-600 mb-1">
                        👩‍🍳 {t("nutrition.preparation")}
                      </p>
                      <p className="text-sm text-base-700 dark:text-dark-base-700 whitespace-pre-wrap">
                        {language === "gu" ? gujPrep : englishPrep}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-secondary-600 mb-1">
                        🕐 {t("nutrition.whenToEat")}
                      </p>
                      <p className="text-sm text-base-700 dark:text-dark-base-700">
                        {language === "gu" ? gujTime : englishTime}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 p-3 bg-base-100 dark:bg-dark-base-200 rounded-xl">
        <p className="text-xs text-base-500 dark:text-dark-base-500">
          {t("nutrition.disclaimer")}
        </p>
      </div>
    </AppShell>
  );
}
