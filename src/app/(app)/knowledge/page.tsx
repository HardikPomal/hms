"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { Plus, BookOpen, ChevronRight, Search, BrainCircuit, Play } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  getAllParameters, 
  getKnowledgeByParameterId,
  updateParameter,
  updateKnowledgeEntry,
  addRelationship
} from "@/lib/db/knowledge";
import { analyzeUserKnowledgeNotes } from "@/app/actions/ai";
import type { ParameterDef, EntityType, RelationType } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  medical_report: "📋",
  lab_parameter: "🧪",
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
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState({ current: 0, total: 0 });

  const loadData = () => {
    getAllParameters().then((k) => {
      setEntries(k);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = entries.filter((e) => {
    const matchesCat = filterCat === "ALL" || e.category === filterCat;
    const matchesQ =
      !query ||
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.alternativeNames.some(a => a.toLowerCase().includes(query.toLowerCase()));
    return matchesCat && matchesQ;
  });

  const categories = ["medical_report", "lab_parameter", "medical_term", "medicine", "cancer_info", "treatment", "nutrition", "exercise", "doctor_advice", "general", "Hematology"];

  const pendingItems = entries.filter((e) => e.knowledgeStatus === "needs_analysis");

  const handleAnalyzeAll = async () => {
    if (pendingItems.length === 0 || analyzing) return;
    setAnalyzing(true);
    setAnalyzeProgress({ current: 0, total: pendingItems.length });

    for (let i = 0; i < pendingItems.length; i++) {
      const param = pendingItems[i];
      setAnalyzeProgress({ current: i + 1, total: pendingItems.length });

      try {
        const kb = await getKnowledgeByParameterId(param.id);
        if (!kb) continue;

        const aiExtraction = await analyzeUserKnowledgeNotes(
          param.name,
          param.category,
          kb.detailedDescription
        );

        if (aiExtraction && !("error" in aiExtraction)) {
          // Safeguard structured Form Mode nutrition entries
          const isStructuredNutrition = param.category === "nutrition" && kb.simpleMeaning !== param.name;

          // Update KB
          await updateKnowledgeEntry(kb.id, {
            simpleMeaning: isStructuredNutrition ? kb.simpleMeaning : (aiExtraction.simpleMeaning || kb.simpleMeaning),
            whyImportant: isStructuredNutrition ? kb.whyImportant : (aiExtraction.whyImportant || ""),
            normalRangeText: aiExtraction.normalRange || "",
            tags: aiExtraction.tags
              ? aiExtraction.tags.split(",").map((t) => t.trim()).filter(Boolean)
              : [],
          });

          // Process Relations
          const processRelations = async (
            csv: string | undefined,
            targetType: EntityType,
            relType: RelationType
          ) => {
            if (!csv) return;
            const items = csv.split(",").map((item) => item.trim()).filter(Boolean);
            for (const item of items) {
              const safeId = `ext_${targetType}_${item.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
              await addRelationship(param.id, "parameter", safeId, targetType, relType);
            }
          };

          await processRelations(aiExtraction.relatedSymptoms, "symptom", "causes");
          await processRelations(aiExtraction.relatedMedicines, "medicine", "treats");
          await processRelations(aiExtraction.relatedFoods, "food", "improves");

          // Update Param Status
          await updateParameter(param.id, { knowledgeStatus: "advanced" });
        }
      } catch (err) {
        console.error(`Failed to analyze ${param.name}`, err);
        // Continue to the next one even if this one fails
      }

      // Safe Rate Limiting: 20 seconds delay
      if (i < pendingItems.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 20000));
      }
    }

    setAnalyzing(false);
    loadData();
  };

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
      {/* Analyze Pending Button */}
      {pendingItems.length > 0 && (
        <div className="mb-4">
          <button
            onClick={handleAnalyzeAll}
            disabled={analyzing}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              analyzing
                ? "bg-base-200 dark:bg-dark-base-200 text-base-500 cursor-not-allowed"
                : "bg-secondary-500 hover:bg-secondary-600 text-white shadow-lg shadow-secondary-500/30"
            }`}
          >
            {analyzing ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="animate-pulse" size={18} />
                  <span>
                    Processing {analyzeProgress.current} of {analyzeProgress.total}...
                  </span>
                </div>
                <span className="text-xs font-medium opacity-80">
                  Estimated time left: {Math.floor(((analyzeProgress.total - analyzeProgress.current + 1) * 20) / 60)}m {((analyzeProgress.total - analyzeProgress.current + 1) * 20) % 60}s
                </span>
              </div>
            ) : (
              <>
                <Play size={18} className="fill-current" />
                Analyze {pendingItems.length} Pending Items
              </>
            )}
          </button>
        </div>
      )}

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
