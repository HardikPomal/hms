import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  addParameter,
  addKnowledgeEntry,
  addRelationship,
} from "@/lib/db/knowledge";
import { autoFillKnowledgeEntry } from "@/app/actions/ai";
import type { EntityType, RelationType } from "@/types";

interface QuickAddKnowledgeProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle: string;
  onSuccess: () => void;
}

const CATEGORIES: string[] = [
  "medical_report",
  "lab_parameter",
  "medical_term",
  "medicine",
  "cancer_info",
  "treatment",
  "nutrition",
  "exercise",
  "doctor_advice",
  "general",
];

export default function QuickAddKnowledge({
  isOpen,
  onClose,
  initialTitle,
  onSuccess,
}: QuickAddKnowledgeProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState<string>("medical_term");
  const [processingAI, setProcessingAI] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setCategory("medical_term");
      setProcessingAI(false);
    }
  }, [isOpen, initialTitle]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) return;

    setProcessingAI(true);
    try {
      const result = await autoFillKnowledgeEntry(title.trim(), category);

      const param = await addParameter({
        name: title.trim(),
        alternativeNames: [],
        category,
        knowledgeStatus: result ? "advanced" : "basic",
        defaultRefMin: result?.normalRange ? undefined : undefined, // Could parse if needed, but keeping simple
      });

      await addKnowledgeEntry({
        parameterId: param.id,
        simpleMeaning: result?.simpleMeaning || title.trim(),
        detailedDescription: result?.detailedDescription || "",
        whyImportant: result?.whyImportant || "",
        normalRangeText: result?.normalRange || "",
        source: "AI Assistant",
        doctorNotes: "",
        personalNotes: "",
        references: [],
        tags: result?.tags
          ? result.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        versionHistory: [],
      });

      if (result) {
        const processRelations = async (
          csv: string | undefined,
          targetType: EntityType,
          relType: RelationType,
        ) => {
          if (!csv) return;
          const items = csv
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean);
          for (const item of items) {
            const safeId = `ext_${targetType}_${item.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
            await addRelationship(
              param.id,
              "parameter",
              safeId,
              targetType,
              relType,
            );
          }
        };

        await processRelations(result.relatedSymptoms, "symptom", "causes");
        await processRelations(result.relatedMedicines, "medicine", "treats");
        await processRelations(result.relatedFoods, "food", "improves");
      }

      onSuccess();
    } catch (e) {
      console.error("AI processing failed", e);
    } finally {
      setProcessingAI(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-up Sheet */}
      <div className="relative bg-base-50 dark:bg-dark-base-100 w-full max-h-[90vh] rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-base-200 dark:border-dark-base-200 bg-white dark:bg-dark-base-100 rounded-t-3xl shrink-0">
          <div>
            <h3 className="font-bold text-lg text-base-900 dark:text-dark-base-900">
              Add to Brain
            </h3>
            <p className="text-xs font-bold text-primary-500 uppercase tracking-wide mt-0.5">
              Instantly Save with AI
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-base-100 dark:bg-dark-base-200 text-base-600 hover:bg-base-200 transition-colors border-2 border-base-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="text-xs font-bold text-base-500 dark:text-dark-base-500 block mb-1 uppercase tracking-wide">
              {t("knowledge.title")} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-dark-base-100 border-2 border-base-200 dark:border-dark-base-200 rounded-xl text-sm font-bold outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-base-500 dark:text-dark-base-500 block mb-1 uppercase tracking-wide">
              {t("knowledge.category")} *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-dark-base-100 border-2 border-base-200 dark:border-dark-base-200 rounded-xl text-sm font-bold outline-none focus:border-primary-500 transition-colors appearance-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`knowledge.categories.${cat}`)}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm text-base-600 dark:text-dark-base-600 bg-secondary-50 dark:bg-dark-secondary-100 p-3 rounded-xl border border-secondary-200 dark:border-dark-secondary-300">
            Just provide the title, and the AI will automatically fetch the
            normal range, meaning, and related medicines/symptoms directly into
            your knowledge base!
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-base-200 dark:border-dark-base-200 bg-white dark:bg-dark-base-100 shrink-0">
          <button
            onClick={handleSave}
            disabled={processingAI || !title.trim()}
            className="w-full py-4 bg-primary-500 text-white rounded-xl font-bold text-sm hover:bg-primary-600 transition-colors border-2 border-primary-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processingAI ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
            {processingAI ? "AI is writing..." : "Auto-Fill & Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
