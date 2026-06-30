"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { addParameter, addKnowledgeEntry } from "@/lib/db/knowledge";
import { Sparkles, Save, Type, FileText } from "lucide-react";

export default function AddFoodPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  
  const [mode, setMode] = useState<"form" | "notes">("form");
  const [saving, setSaving] = useState(false);

  // Form Mode State
  const [formState, setFormState] = useState({
    nameEn: "",
    benefitsEn: "",
    prepEn: "",
    timeEn: "",
    nameGu: "",
    benefitsGu: "",
    prepGu: "",
    timeGu: ""
  });

  // Notes Mode State
  const [notesTitle, setNotesTitle] = useState("");
  const [notesContent, setNotesContent] = useState("");

  const inputCls = "w-full px-4 py-3 bg-white dark:bg-dark-base-100 border-2 border-base-200 dark:border-dark-base-200 rounded-xl text-sm font-medium outline-none focus:border-primary-500 transition-colors";
  const labelCls = "text-xs font-bold text-base-500 dark:text-dark-base-500 block mb-1.5 uppercase tracking-wide";

  const handleSave = async () => {
    setSaving(true);
    try {
      if (mode === "form") {
        if (!formState.nameEn.trim()) throw new Error("English Name is required.");
        
        const param = await addParameter({
          name: formState.nameEn.trim(),
          nameGu: formState.nameGu.trim() || undefined,
          alternativeNames: [],
          category: "nutrition",
          knowledgeStatus: "needs_analysis", // This will still process tags/relations in background!
          defaultRefMin: undefined,
        });

        await addKnowledgeEntry({
          parameterId: param.id,
          simpleMeaning: formState.benefitsEn.trim() || formState.nameEn.trim(),
          detailedDescription: `${formState.prepEn}\n\nGujarati: ${formState.prepGu}\nBenefits (Gujarati): ${formState.benefitsGu}`,
          whyImportant: `Best time to eat: ${formState.timeEn} (${formState.timeGu})`,
          normalRangeText: "",
          source: "Food Guide Form",
          doctorNotes: "",
          personalNotes: "",
          references: [],
          tags: [], 
          versionHistory: [],
        });
      } else {
        if (!notesTitle.trim() || !notesContent.trim()) throw new Error("Title and Notes are required.");

        const param = await addParameter({
          name: notesTitle.trim(),
          alternativeNames: [],
          category: "nutrition",
          knowledgeStatus: "needs_analysis",
          defaultRefMin: undefined,
        });

        await addKnowledgeEntry({
          parameterId: param.id,
          simpleMeaning: notesTitle.trim(), // Same as param.name, meaning AI will overwrite this to summarize it
          detailedDescription: notesContent.trim(),
          whyImportant: "",
          normalRangeText: "",
          source: "Food Guide Notes",
          doctorNotes: "",
          personalNotes: "",
          references: [],
          tags: [], 
          versionHistory: [],
        });
      }

      // We go to the Knowledge page to let the AI process it? No, go back to Food Guide.
      // But they need to trigger analysis. The AI analysis happens in the Knowledge Base background processor.
      // They can click "Analyze Pending" there.
      router.replace("/nutrition");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Error saving food.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell showBack title={language === "gu" ? "ખોરાક ઉમેરો" : "Add Food"}>
      <div className="space-y-6 pb-24 max-w-2xl mx-auto w-full px-4 pt-4">
        
        {/* Mode Toggle */}
        <div className="flex p-1 bg-base-100 dark:bg-dark-base-200 rounded-xl">
          <button
            onClick={() => setMode("form")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-colors ${
              mode === "form" 
                ? "bg-white dark:bg-dark-base-100 text-primary-600 shadow-sm" 
                : "text-base-500 hover:text-base-700"
            }`}
          >
            <Type size={16} />
            Form Mode
          </button>
          <button
            onClick={() => setMode("notes")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-colors ${
              mode === "notes" 
                ? "bg-white dark:bg-dark-base-100 text-primary-600 shadow-sm" 
                : "text-base-500 hover:text-base-700"
            }`}
          >
            <FileText size={16} />
            Notes Mode
          </button>
        </div>

        {mode === "form" ? (
          <div className="space-y-6 animate-fade-in">
            {/* English Fields */}
            <div className="card-elevated space-y-4 border-l-4 border-l-primary-500">
              <h3 className="font-bold text-primary-700 flex items-center gap-2">
                🇺🇸 English Details
              </h3>
              <div>
                <label className={labelCls}>Food Name *</label>
                <input 
                  value={formState.nameEn} 
                  onChange={e => setFormState(s => ({...s, nameEn: e.target.value}))} 
                  placeholder="e.g. Moong Dal Soup" 
                  className={inputCls} 
                />
              </div>
              <div>
                <label className={labelCls}>Benefits</label>
                <textarea 
                  value={formState.benefitsEn} 
                  onChange={e => setFormState(s => ({...s, benefitsEn: e.target.value}))} 
                  className={`${inputCls} min-h-[80px]`} 
                />
              </div>
              <div>
                <label className={labelCls}>How to Prepare</label>
                <textarea 
                  value={formState.prepEn} 
                  onChange={e => setFormState(s => ({...s, prepEn: e.target.value}))} 
                  className={`${inputCls} min-h-[80px]`} 
                />
              </div>
              <div>
                <label className={labelCls}>Best time to eat</label>
                <input 
                  value={formState.timeEn} 
                  onChange={e => setFormState(s => ({...s, timeEn: e.target.value}))} 
                  className={inputCls} 
                />
              </div>
            </div>

            {/* Gujarati Fields */}
            <div className="card-elevated space-y-4 border-l-4 border-l-secondary-500">
              <h3 className="font-bold text-secondary-700 flex items-center gap-2">
                🇮🇳 Gujarati Details
              </h3>
              <div>
                <label className={labelCls}>Food Name (Gujarati)</label>
                <input 
                  value={formState.nameGu} 
                  onChange={e => setFormState(s => ({...s, nameGu: e.target.value}))} 
                  placeholder="e.g. મગની દાળનો સૂપ" 
                  className={inputCls} 
                />
              </div>
              <div>
                <label className={labelCls}>Benefits (Gujarati)</label>
                <textarea 
                  value={formState.benefitsGu} 
                  onChange={e => setFormState(s => ({...s, benefitsGu: e.target.value}))} 
                  className={`${inputCls} min-h-[80px]`} 
                />
              </div>
              <div>
                <label className={labelCls}>How to Prepare (Gujarati)</label>
                <textarea 
                  value={formState.prepGu} 
                  onChange={e => setFormState(s => ({...s, prepGu: e.target.value}))} 
                  className={`${inputCls} min-h-[80px]`} 
                />
              </div>
              <div>
                <label className={labelCls}>Best time to eat (Gujarati)</label>
                <input 
                  value={formState.timeGu} 
                  onChange={e => setFormState(s => ({...s, timeGu: e.target.value}))} 
                  className={inputCls} 
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="card-elevated space-y-4 animate-fade-in relative overflow-hidden">
             <div className="absolute inset-0 bg-linear-to-br from-primary-50/50 to-transparent pointer-events-none" />
             <div className="relative">
                <h3 className="font-bold text-primary-700 flex items-center gap-2 text-sm uppercase tracking-wider mb-4">
                  <Sparkles size={16} />
                  AI Notes Extraction
                </h3>
                
                <div className="mb-4">
                  <label className={labelCls}>Food Title *</label>
                  <input 
                    value={notesTitle} 
                    onChange={e => setNotesTitle(e.target.value)} 
                    placeholder="e.g. Kiwi" 
                    className={inputCls} 
                  />
                </div>

                <div>
                  <label className={labelCls}>Raw Notes *</label>
                  <textarea 
                    value={notesContent} 
                    onChange={e => setNotesContent(e.target.value)} 
                    placeholder="Paste full article or research notes here..." 
                    className={`${inputCls} min-h-[250px] font-mono`} 
                  />
                  <p className="text-xs text-base-500 mt-2">
                    The AI will automatically extract the preparation, benefits, and assign graph tags.
                  </p>
                </div>
             </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || (mode === "form" ? !formState.nameEn.trim() : (!notesTitle.trim() || !notesContent.trim()))}
          className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <><Save className="animate-pulse" size={20} /> Saving...</>
          ) : (
            <><Save size={20} /> {language === "gu" ? "સાચવો" : "Save"}</>
          )}
        </button>

      </div>
    </AppShell>
  );
}
