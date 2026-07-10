"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { Plus, BookOpen, BrainCircuit, Play, Search } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  getAllEntities, 
  updateEntity,
  addRelationship,
  findEntityByNameAndType,
  addEntity
} from "@/lib/db/knowledge";
import { seedAllPendingLabParameters } from "@/lib/db/seedLabParameters";
import { seedComprehensiveKnowledge } from "@/lib/db/seedData/seeder";
import { analyzeUserKnowledgeNotes } from "@/app/actions/ai";
import type { EntityType, RelationType, MedicalEntity } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  medical_report: "📋",
  lab_parameter: "🧪",
  medical_term: "🔬",
  medicine: "💊",
  cancer_info: "🎗️",
  treatment: "🏥",
  nutrition: "🥗",
  food: "🍎",
  exercise: "🧘",
  doctor_advice: "👨‍⚕️",
  general: "📝",
  Hematology: "🩸",
};

export default function KnowledgePage() {
  const { t, language } = useLanguage();
  const [entries, setEntries] = useState<MedicalEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState({ current: 0, total: 0 });

  const loadData = async () => {
    await seedComprehensiveKnowledge();
    await seedAllPendingLabParameters();
    getAllEntities().then(async (k) => {
      let needsRefresh = false;
      for (const param of k) {
        if (param.knowledgeStatus === "basic") {
          await updateEntity(param.id, { knowledgeStatus: "needs_analysis" });
          needsRefresh = true;
        }
      }
      
      if (needsRefresh) {
        const updatedK = await getAllEntities();
        setEntries(updatedK as any);
      } else {
        setEntries(k as any);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = ["medical_report", "lab_parameter", "medical_term", "medicine", "cancer_info", "treatment", "nutrition", "food", "exercise", "doctor_advice", "general", "Hematology"];
  const pendingItems = entries.filter((e) => e.knowledgeStatus === "needs_analysis");

  const handleAnalyzeAll = async () => {
    if (pendingItems.length === 0 || analyzing) return;
    setAnalyzing(true);
    setAnalyzeProgress({ current: 0, total: pendingItems.length });

    for (let i = 0; i < pendingItems.length; i++) {
      const param = pendingItems[i];
      setAnalyzeProgress({ current: i + 1, total: pendingItems.length });

      try {
        const aiExtraction = await analyzeUserKnowledgeNotes(
          param.name,
          param.category || "general",
          param.detailedDescription || ""
        );

        if (aiExtraction && !("error" in aiExtraction)) {
          // Safeguard structured Form Mode entries
          const isManualStructured = param.source?.includes("Manual Entry") || (param.category === "nutrition" && param.simpleMeaning !== param.name);

          // Update Param
          await updateEntity(param.id, {
            simpleMeaning: isManualStructured ? param.simpleMeaning : (aiExtraction.simpleMeaning || param.simpleMeaning),
            whyImportant: isManualStructured ? param.whyImportant : (aiExtraction.whyImportant || ""),
            normalRangeText: aiExtraction.normalRange || "",
            tags: aiExtraction.tags
              ? aiExtraction.tags.split(",").map((t) => t.trim()).filter(Boolean)
              : [],
            knowledgeStatus: "advanced"
          });

          // Build Diagnostic Sub-Graph
          if (aiExtraction.findings && Array.isArray(aiExtraction.findings)) {
            for (const finding of aiExtraction.findings) {
              const findingName = `${param.name} ${finding.state.charAt(0).toUpperCase() + finding.state.slice(1)}`;
              
              // 1. Get or Create Finding
              let findingEntity = await findEntityByNameAndType(findingName, "finding");
              if (!findingEntity) {
                findingEntity = await addEntity({
                  type: "finding",
                  name: findingName,
                  tags: [param.name, finding.state],
                  metadata: { parameterId: param.id, state: finding.state }
                });
              }

              for (const condition of finding.conditions) {
                // 2. Get or Create Condition
                let conditionEntity = await findEntityByNameAndType(condition.name, "condition");
                if (!conditionEntity) {
                  conditionEntity = await addEntity({
                    type: "condition",
                    name: condition.name,
                    tags: ["condition", finding.state],
                    metadata: { severity: "moderate" }
                  });
                }

                // Link Finding -> Condition
                await addRelationship(findingEntity.id, "finding", conditionEntity.id, "condition", "associated_with", condition.strength);

                for (const intervention of condition.interventions) {
                   // 3. Get or Create Intervention (Food/Diet/Supplement)
                   let interventionEntity = await findEntityByNameAndType(intervention.name, intervention.type as any);
                   if (!interventionEntity) {
                     interventionEntity = await addEntity({
                       type: intervention.type as any,
                       name: intervention.name,
                       tags: [intervention.type, condition.name],
                     });
                     
                     // If it's a food, optionally trigger the autoFill background task (omitted here to save time, but it exists in DB now!)
                   }

                   // Link Condition -> Intervention
                   await addRelationship(conditionEntity.id, "condition", interventionEntity.id, intervention.type as any, intervention.relationType as any);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error(`Failed to analyze ${param.name}`, err);
      }

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
        <div className="mb-6">
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

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold text-base-500 uppercase tracking-wider mb-4">Categories</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => {
                const count = entries.filter((e) => e.category === cat).length;
                return (
                  <Link
                    key={cat}
                    href={`/knowledge/category/${cat}`}
                    className="card-elevated flex flex-col items-center text-center justify-center p-4 hover:-translate-y-1 hover:shadow-lg transition-all"
                  >
                    <span className="text-3xl mb-2">{CATEGORY_ICONS[cat] || "📝"}</span>
                    <span className="font-semibold text-sm text-base-900 dark:text-dark-base-900 line-clamp-1">
                      {t(`knowledge.categories.${cat}`)}
                    </span>
                    <span className="text-xs text-base-400 mt-1">{count} items</span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <Link
            href="/knowledge/add"
            className="w-full py-4 border-2 border-dashed border-primary-300 dark:border-primary-900 bg-primary-50 dark:bg-dark-primary-100 rounded-2xl flex flex-col items-center justify-center text-primary-600 dark:text-dark-primary-600 hover:bg-primary-100 transition-colors"
          >
            <Plus size={24} className="mb-2" />
            <span className="font-bold">Add Manual Knowledge</span>
            <span className="text-xs text-primary-500 opacity-80 mt-1 text-center px-4">
              Click here to add notes or open specialized forms for Reports and Labs.
            </span>
          </Link>
        </div>
      )}
    </AppShell>
  );
}
