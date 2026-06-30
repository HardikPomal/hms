"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  addParameter,
  addKnowledgeEntry,
  addRelationship,
} from "@/lib/db/knowledge";
import { useKnowledgeContext } from "@/contexts/KnowledgeContext";
import { analyzeUserKnowledgeNotes } from "@/app/actions/ai";
import { Sparkles, Save, BrainCircuit } from "lucide-react";
import type { EntityType, RelationType } from "@/types";

function AddKnowledgeForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshKnowledge } = useKnowledgeContext();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("medical_term");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const pTitle = searchParams.get("title");
    const pCat = searchParams.get("category");
    if (pTitle) {
      setTitle(pTitle);
    }
    if (pCat) {
      setCategory(pCat);
    }
  }, [searchParams]);

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
    "doctor_advice",
    "general",
  ];

  const handleSave = async () => {
    if (!title.trim() || !notes.trim()) return;
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

      // 2. Save the Knowledge Entry with raw notes
      await addKnowledgeEntry({
        parameterId: param.id,
        simpleMeaning: title.trim(), // Will be updated by AI later
        detailedDescription: notes.trim(), // Storing raw markdown notes here
        whyImportant: "", // Will be updated by AI later
        normalRangeText: "", // Will be updated by AI later
        source: "User Notes (Pending AI)",
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
              placeholder="e.g. Hemoglobin"
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

        {/* AI Notes Section */}
        <div className="card-elevated relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-primary-50/50 to-transparent dark:from-dark-primary-100/50 pointer-events-none" />

          <div className="relative space-y-4">
            <h3 className="font-bold text-primary-700 dark:text-dark-primary-600 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Sparkles size={16} />
              Your Notes (Markdown Supported) *
            </h3>

            <p className="text-sm text-base-600 dark:text-dark-base-500 leading-relaxed">
              Paste your detailed research, textbook excerpts, or articles here.
              The AI will read these notes, format them beautifully, and
              automatically extract medical relationships for your Brain graph.
            </p>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="# Hemoglobin\n\nHemoglobin is a complex protein...\n\n### Normal Ranges\n- Men: 13.5-17.5 g/dL"
              className={`${inputCls} min-h-[250px] font-mono text-sm leading-relaxed`}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || !notes.trim()}
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
