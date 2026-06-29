"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { Plus, BookOpen, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllParameters } from "@/lib/db/knowledge";
import type { ParameterDef } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  medical_term: "🔬",
  medicine: "💊",
  cancer_info: "🎗️",
  treatment: "🏥",
  nutrition: "🥗",
  exercise: "🧘",
  doctor_advice: "👨‍⚕️",
  general: "📝",
  Hematology: "🩸",
};

export default function KnowledgePage() {
  const { t, language } = useLanguage();
  const [entries, setEntries] = useState<ParameterDef[]>([]);
  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllParameters().then((k) => {
      setEntries(k);
      setLoading(false);
    });
  }, []);

  const filtered = entries.filter((e) => {
    const matchesCat = filterCat === "ALL" || e.category === filterCat;
    const matchesQ =
      !query ||
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.alternativeNames.some(a => a.toLowerCase().includes(query.toLowerCase()));
    return matchesCat && matchesQ;
  });

  const categories = ["medical_term", "medicine", "cancer_info", "treatment", "nutrition", "exercise", "doctor_advice", "general", "Hematology"];

  return (
    <AppShell
      title={t("knowledge.title")}
      rightAction={
        <Link
          href="/knowledge/add"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 transition-colors"
        >
          <Plus size={20} className="text-white" />
        </Link>
      }
    >
      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-400"
        />
        <input
          type="search"
          placeholder={
            language === "gu" ? "જ્ઞાન શોધો..." : "Search knowledge..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-base-100 border border-base-200 dark:border-dark-base-200 rounded-xl text-sm outline-none focus:border-primary-400 transition-colors"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        <button
          onClick={() => setFilterCat("ALL")}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterCat === "ALL" ? "bg-primary-500 text-white" : "bg-base-100 dark:bg-dark-base-200 text-base-600 dark:text-dark-base-600"}`}
        >
          {language === "gu" ? "બધા" : "All"}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat === filterCat ? "ALL" : cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${filterCat === cat ? "bg-primary-500 text-white" : "bg-base-100 dark:bg-dark-base-200 text-base-600 dark:text-dark-base-600"}`}
          >
            {CATEGORY_ICONS[cat] || "📝"} {t(`knowledge.categories.${cat}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-base-100 dark:bg-dark-base-200 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-base-300" />
          </div>
          <p className="text-base-500 text-sm mb-4">
            {t("knowledge.noEntries")}
          </p>
          <Link
            href="/knowledge/add"
            className="px-6 py-3 gradient-primary text-white rounded-xl font-medium text-sm"
          >
            + {t("knowledge.add")}
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry, i) => (
            <Link
              key={entry.id}
              href={`/knowledge/${entry.id}`}
              className="block card-elevated hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-base-100 dark:bg-dark-base-200 rounded-xl flex items-center justify-center text-xl shrink-0">
                  {CATEGORY_ICONS[entry.category] || "📝"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base-900 dark:text-dark-base-900 truncate">
                    {language === "gu" && entry.alternativeNames.length > 0
                      ? entry.alternativeNames[0]
                      : entry.name}
                  </p>
                  <p className="text-xs text-base-400 mt-0.5 line-clamp-1">
                    Status: {entry.knowledgeStatus}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <span className="text-xs bg-base-100 dark:bg-dark-base-200 text-base-500 px-1.5 py-0.5 rounded-full">
                      {t(`knowledge.categories.${entry.category}`)}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-base-400 shrink-0 mt-1"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
