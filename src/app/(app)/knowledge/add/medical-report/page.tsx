"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { addParameter, addKnowledgeEntry, getAllParameters } from "@/lib/db/knowledge";
import type { ParameterDef } from "@/types";
import { Save, Search } from "lucide-react";

export default function AddMedicalReportPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  
  const [saving, setSaving] = useState(false);
  const [allParams, setAllParams] = useState<ParameterDef[]>([]);

  useEffect(() => {
    getAllParameters().then(p => setAllParams(p.filter(x => x.category === "lab_parameter")));
  }, []);

  // Form State
  const [formState, setFormState] = useState({
    nameEn: "", nameGu: "",
    akaEn: "", akaGu: "",
    descEn: "", descGu: "",
    whyOrderedEn: "", whyOrderedGu: "",
    whenRecommendedEn: "", whenRecommendedGu: "",
    howToPrepareEn: "", howToPrepareGu: "",
    importantNotesEn: "", importantNotesGu: ""
  });

  const [selectedParams, setSelectedParams] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const inputCls = "w-full px-4 py-3 bg-white dark:bg-dark-base-100 border-2 border-base-200 dark:border-dark-base-200 rounded-xl text-sm font-medium outline-none focus:border-primary-500 transition-colors";
  const labelCls = "text-xs font-bold text-base-500 dark:text-dark-base-500 block mb-1.5 uppercase tracking-wide";

  const handleSave = async () => {
    if (!formState.nameEn.trim()) {
      alert("English Name is required.");
      return;
    }
    
    setSaving(true);
    try {
      const altNames = [formState.akaEn, formState.akaGu].filter(n => n.trim().length > 0);
      
      const param = await addParameter({
        name: formState.nameEn.trim(),
        nameGu: formState.nameGu.trim() || undefined,
        alternativeNames: altNames,
        category: "medical_report",
        knowledgeStatus: "needs_analysis",
        defaultRefMin: undefined,
      });

      // Build detailed description markdown with XML tags for easy parsing
      let enDesc = formState.descEn.trim();
      let guDesc = formState.descGu.trim();

      if (formState.whyOrderedEn.trim()) enDesc += `\n\n### Why This Report Is Ordered\n${formState.whyOrderedEn.trim()}`;
      if (formState.whyOrderedGu.trim()) guDesc += `\n\n### Why This Report Is Ordered\n${formState.whyOrderedGu.trim()}`;

      if (formState.whenRecommendedEn.trim()) enDesc += `\n\n### When It Is Commonly Recommended\n${formState.whenRecommendedEn.trim()}`;
      if (formState.whenRecommendedGu.trim()) guDesc += `\n\n### When It Is Commonly Recommended\n${formState.whenRecommendedGu.trim()}`;

      if (formState.howToPrepareEn.trim()) enDesc += `\n\n### How To Prepare For The Test\n${formState.howToPrepareEn.trim()}`;
      if (formState.howToPrepareGu.trim()) guDesc += `\n\n### How To Prepare For The Test\n${formState.howToPrepareGu.trim()}`;

      if (formState.importantNotesEn.trim()) enDesc += `\n\n### Important Notes\n${formState.importantNotesEn.trim()}`;
      if (formState.importantNotesGu.trim()) guDesc += `\n\n### Important Notes\n${formState.importantNotesGu.trim()}`;
      
      if (selectedParams.length > 0) {
        const paramNames = allParams.filter(p => selectedParams.includes(p.id)).map(p => p.name).join(", ");
        enDesc += `\n\n**Parameters Included:** ${paramNames}`;
        guDesc += `\n\n**Parameters Included:** ${paramNames}`;
      }

      let detailedDesc = "";
      if (enDesc) detailedDesc += `<en>\n${enDesc}\n</en>\n`;
      if (guDesc) detailedDesc += `<gu>\n${guDesc}\n</gu>`;

      await addKnowledgeEntry({
        parameterId: param.id,
        simpleMeaning: formState.descEn.trim() || formState.nameEn.trim(),
        detailedDescription: detailedDesc,
        whyImportant: "",
        normalRangeText: "",
        source: "Manual Entry (Medical Report)",
        doctorNotes: "",
        personalNotes: "",
        references: [],
        tags: [], 
        versionHistory: [],
      });

      router.replace("/knowledge/category/medical_report");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Error saving report.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof typeof formState, val: string) => {
    setFormState(prev => ({ ...prev, [field]: val }));
  };

  const toggleParam = (id: string) => {
    setSelectedParams(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <AppShell showBack title="Add Medical Report">
      <div className="space-y-6 pb-24 max-w-2xl mx-auto w-full px-4 pt-4">
        
        {/* Core Info */}
        <div className="card-elevated space-y-4 border-l-4 border-l-primary-500">
          <h3 className="font-bold text-primary-700 flex items-center gap-2">Core Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name (English) *</label>
              <input value={formState.nameEn} onChange={e => handleChange("nameEn", e.target.value)} placeholder="e.g. Complete Blood Count" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Name (Gujarati)</label>
              <input value={formState.nameGu} onChange={e => handleChange("nameGu", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Also Known As (English)</label>
              <input value={formState.akaEn} onChange={e => handleChange("akaEn", e.target.value)} placeholder="e.g. CBC" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Also Known As (Gujarati)</label>
              <input value={formState.akaGu} onChange={e => handleChange("akaGu", e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="card-elevated space-y-4">
          <h3 className="font-bold text-primary-700 flex items-center gap-2">Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Description (English)</label>
              <textarea value={formState.descEn} onChange={e => handleChange("descEn", e.target.value)} className={`${inputCls} min-h-[80px]`} />
            </div>
            <div>
              <label className={labelCls}>Description (Gujarati)</label>
              <textarea value={formState.descGu} onChange={e => handleChange("descGu", e.target.value)} className={`${inputCls} min-h-[80px]`} />
            </div>
            <div>
              <label className={labelCls}>Why This Report Is Ordered (En)</label>
              <textarea value={formState.whyOrderedEn} onChange={e => handleChange("whyOrderedEn", e.target.value)} className={`${inputCls} min-h-[80px]`} />
            </div>
            <div>
              <label className={labelCls}>Why This Report Is Ordered (Gu)</label>
              <textarea value={formState.whyOrderedGu} onChange={e => handleChange("whyOrderedGu", e.target.value)} className={`${inputCls} min-h-[80px]`} />
            </div>
            <div>
              <label className={labelCls}>When It Is Commonly Recommended (En)</label>
              <textarea value={formState.whenRecommendedEn} onChange={e => handleChange("whenRecommendedEn", e.target.value)} className={`${inputCls} min-h-[80px]`} />
            </div>
            <div>
              <label className={labelCls}>When It Is Commonly Recommended (Gu)</label>
              <textarea value={formState.whenRecommendedGu} onChange={e => handleChange("whenRecommendedGu", e.target.value)} className={`${inputCls} min-h-[80px]`} />
            </div>
          </div>
        </div>

        {/* Prep & Notes */}
        <div className="card-elevated space-y-4">
          <h3 className="font-bold text-primary-700 flex items-center gap-2">Preparation & Notes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>How To Prepare For The Test (En)</label>
              <textarea value={formState.howToPrepareEn} onChange={e => handleChange("howToPrepareEn", e.target.value)} className={`${inputCls} min-h-[80px]`} />
            </div>
            <div>
              <label className={labelCls}>How To Prepare For The Test (Gu)</label>
              <textarea value={formState.howToPrepareGu} onChange={e => handleChange("howToPrepareGu", e.target.value)} className={`${inputCls} min-h-[80px]`} />
            </div>
            <div>
              <label className={labelCls}>Important Notes (En)</label>
              <textarea value={formState.importantNotesEn} onChange={e => handleChange("importantNotesEn", e.target.value)} className={`${inputCls} min-h-[80px]`} />
            </div>
            <div>
              <label className={labelCls}>Important Notes (Gu)</label>
              <textarea value={formState.importantNotesGu} onChange={e => handleChange("importantNotesGu", e.target.value)} className={`${inputCls} min-h-[80px]`} />
            </div>
          </div>
        </div>

        {/* Parameters Included (Smart Linking) */}
        <div className="card-elevated space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-primary-700 flex items-center gap-2">
              Parameters Included
            </h3>
            {selectedParams.length > 0 && (
              <span className="text-xs bg-primary-100 text-primary-700 font-bold px-2 py-1 rounded-full">
                {selectedParams.length} selected
              </span>
            )}
          </div>
          <p className="text-xs text-base-500">Select which lab parameters are typically included in this report.</p>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" size={16} />
            <input 
              type="text"
              placeholder="Search parameters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-base-100 border border-base-200 dark:border-dark-base-200 rounded-xl text-sm outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div className="border border-base-200 dark:border-dark-base-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto bg-base-50 dark:bg-dark-base-200/50">
            {allParams.length === 0 ? (
              <p className="p-4 text-sm text-base-400">No lab parameters found in the database.</p>
            ) : (() => {
              const filtered = allParams.filter(p => {
                const search = searchQuery.toLowerCase();
                if (!search) return true;
                return (
                  p.name.toLowerCase().includes(search) || 
                  (p.nameGu && p.nameGu.toLowerCase().includes(search)) ||
                  (p.alternativeNames || []).some((a: string) => a.toLowerCase().includes(search))
                );
              });
              
              if (filtered.length === 0) {
                return <p className="p-4 text-sm text-base-400 text-center">No matching parameters found.</p>;
              }

              return (
                <div className="flex flex-col divide-y divide-base-200 dark:divide-dark-base-200">
                  {filtered.map(param => (
                    <label key={param.id} className="flex items-start gap-3 p-3 hover:bg-white dark:hover:bg-dark-base-100 cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedParams.includes(param.id)} 
                        onChange={() => toggleParam(param.id)}
                        className="w-4 h-4 mt-0.5 shrink-0 text-primary-600 rounded border-base-300 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-base-900 dark:text-dark-base-900 leading-tight">
                        {param.name} {param.alternativeNames.length > 0 ? `(${param.alternativeNames[0]})` : ""}
                      </span>
                    </label>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !formState.nameEn.trim()}
          className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <><Save className="animate-pulse" size={20} /> Saving...</>
          ) : (
            <><Save size={20} /> {language === "gu" ? "સાચવો" : "Save Report"}</>
          )}
        </button>

      </div>
    </AppShell>
  );
}
