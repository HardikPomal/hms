"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  addParameter,
  addKnowledgeEntry,
} from "@/lib/db/knowledge";
import { useKnowledgeContext } from "@/contexts/KnowledgeContext";
import { Save } from "lucide-react";

import GenericMarkdownForm from "./forms/GenericMarkdownForm";
import MedicineForm from "./forms/MedicineForm";
import { MedicineFormData } from "@/types/forms";
import { generateMedicineMarkdown } from "./transformers/medicineToMarkdown";

const INITIAL_MEDICINE_DATA: MedicineFormData = {
  title: "",
  genericName: "",
  brandNames: [],
  drugClass: "",
  routeOfAdministration: [],
  primaryUses: [],
  cancerUses: [],
  commonSideEffects: [],
  seriousSideEffects: [],
  contraindications: [],
  precautions: "",
  monitoringTests: [],
  dosageForms: [],
  generalDosageNotes: "",
  drugInteractions: [],
  additionalNotes: "",
};

function AddKnowledgeForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshKnowledge } = useKnowledgeContext();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("medical_term");
  
  // State for generic markdown
  const [notes, setNotes] = useState("");
  
  // State for structured medicine data
  const [medicineData, setMedicineData] = useState<MedicineFormData>(INITIAL_MEDICINE_DATA);
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const pTitle = searchParams.get("title");
    const pCat = searchParams.get("category");
    if (pTitle) {
      setTitle(pTitle);
      setMedicineData(prev => ({ ...prev, title: pTitle }));
    }
    if (pCat) {
      setCategory(pCat);
    }
  }, [searchParams]);

  // Sync title between global title state and medicine specific title
  useEffect(() => {
    if (category === "medicine") {
      setMedicineData(prev => ({ ...prev, title }));
    }
  }, [title, category]);

  const inputCls =
    "w-full px-4 py-3 bg-white dark:bg-dark-base-100 border-2 border-base-200 dark:border-dark-base-200 rounded-xl text-sm font-medium outline-none focus:border-primary-500 transition-colors";
  const labelCls =
    "text-xs font-bold text-base-500 dark:text-dark-base-500 block mb-1.5 uppercase tracking-wide";

  const categories = [
    "medical_report",
    "lab_parameter",
    "medical_term",
    "medicine",
    "cancer_info",
    "treatment",
    "nutrition",
    "food",
    "exercise",
    "doctor_advice",
    "general",
    "Hematology",
  ];

  const handleSave = async () => {
    // Validation
    if (!title.trim()) return;
    
    let finalMarkdown = "";
    if (category === "medicine") {
      finalMarkdown = generateMedicineMarkdown(medicineData);
    } else {
      if (!notes.trim()) return;
      finalMarkdown = notes.trim();
    }

    setSaving(true);

    try {
      // 1. Save the Parameter with 'needs_analysis' status
      const param = await addParameter({
        name: title.trim(),
        alternativeNames: [],
        category,
        knowledgeStatus: "needs_analysis",
        defaultRefMin: undefined,
      });

      // 2. Save the Knowledge Entry with generated or raw notes
      await addKnowledgeEntry({
        parameterId: param.id,
        simpleMeaning: title.trim(), // Will be updated by AI later
        detailedDescription: finalMarkdown, // Storing markdown notes here (from form or text area)
        whyImportant: "", // Will be updated by AI later
        normalRangeText: "", // Will be updated by AI later
        source: category === "medicine" ? "Structured Medicine Form" : "User Notes (Pending AI)",
        doctorNotes: "",
        personalNotes: "",
        references: [],
        tags: [], // Will be updated by AI later
        versionHistory: [],
      });

      // Graph Relationships will be extracted during the batch AI analysis process later

      await refreshKnowledge();

      const returnTo = searchParams.get("returnTo");
      if (returnTo) {
        router.replace(returnTo);
      } else {
        router.replace("/knowledge");
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "An unexpected error occurred while saving.");
      setSaving(false);
    }
  };

  const isSaveDisabled = 
    saving || 
    !title.trim() || 
    (category === "medicine" ? false : !notes.trim());

  return (
    <AppShell showBack title="Add Knowledge">
      <div className="space-y-6 pb-24 max-w-2xl mx-auto w-full px-4 pt-4">
        {/* Basic Info */}
        <div className="card-elevated space-y-5">
          <div>
            <label className={labelCls}>Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={category === "medicine" ? "e.g. Carboplatin" : "e.g. Hemoglobin"}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-colors ${
                    category === cat
                      ? "border-primary-400 bg-primary-50 dark:bg-dark-primary-100 text-primary-700 dark:text-dark-primary-700"
                      : "border-base-200 dark:border-dark-base-200 text-base-500 dark:text-dark-base-500 hover:border-base-300 dark:hover:border-dark-base-300"
                  }`}
                >
                  {cat
                    .split("_")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Form Rendering */}
        {category === "medicine" ? (
          <MedicineForm data={medicineData} onChange={setMedicineData} />
        ) : (
          <GenericMarkdownForm notes={notes} onChange={setNotes} />
        )}

        <button
          onClick={handleSave}
          disabled={isSaveDisabled}
          className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:hover:bg-primary-500"
        >
          {saving ? (
            <>
              <Save className="animate-pulse" size={20} />
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Save
            </>
          )}
        </button>
      </div>
    </AppShell>
  );
}

export default function AddKnowledgePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <AddKnowledgeForm />
    </Suspense>
  );
}
