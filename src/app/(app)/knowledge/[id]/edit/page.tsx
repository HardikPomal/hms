"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { getParameterById, getKnowledgeByParameterId, updateParameter, updateKnowledgeEntry } from "@/lib/db/knowledge";
import type { ParameterDef, KnowledgeEntry } from "@/types";
import { Save } from "lucide-react";

export default function EditKnowledgePage() {
  const { t, language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parameter, setParameter] = useState<ParameterDef | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry | null>(null);

  // Form State
  const [formState, setFormState] = useState({
    nameEn: "",
    nameGu: "",
    akaEn: "",
    simpleMeaning: "",
    detailedDescription: ""
  });

  useEffect(() => {
    Promise.all([
      getParameterById(id),
      getKnowledgeByParameterId(id)
    ]).then(([p, k]) => {
      setParameter(p ?? null);
      setKnowledge(k ?? null);
      
      if (p) {
        setFormState({
          nameEn: p.name,
          nameGu: p.nameGu || "",
          akaEn: (p.alternativeNames || []).join(", "),
          simpleMeaning: k?.simpleMeaning || "",
          detailedDescription: k?.detailedDescription || "",
        });
      }
      setLoading(false);
    });
  }, [id]);

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!parameter || !formState.nameEn.trim()) return;
    setSaving(true);
    
    try {
      // Safely update Parameter
      await updateParameter(id, {
        name: formState.nameEn.trim(),
        nameGu: formState.nameGu.trim() || undefined,
        alternativeNames: formState.akaEn
          .split(",")
          .map(n => n.trim())
          .filter(n => n.length > 0),
      });

      // Safely update Knowledge Entry
      if (knowledge) {
        await updateKnowledgeEntry(knowledge.id, {
          simpleMeaning: formState.simpleMeaning.trim(),
          detailedDescription: formState.detailedDescription.trim(),
        });
      }
      
      router.replace(`/knowledge/${id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to save changes.");
      setSaving(false);
    }
  };

  if (loading) return <AppShell showBack><div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div></AppShell>;
  if (!parameter) return <AppShell showBack><p className="text-center py-8 text-base-400">{t("common.noData")}</p></AppShell>;

  const inputCls = "w-full px-4 py-3 bg-white dark:bg-dark-base-100 border-2 border-base-200 dark:border-dark-base-200 rounded-xl text-sm font-medium outline-none focus:border-primary-500 transition-colors";
  const labelCls = "text-xs font-bold text-base-500 dark:text-dark-base-500 block mb-1.5 uppercase tracking-wide";

  return (
    <AppShell
      title={language === "gu" ? "માહિતી સંપાદિત કરો" : "Edit Details"}
      showBack
    >
      <div className="space-y-6 pb-20">
        
        {/* Name Fields */}
        <div className="card-elevated space-y-4">
          <h3 className="font-bold text-primary-700 flex items-center gap-2">Basic Info</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelCls}>Name (English) *</label>
              <input
                type="text"
                value={formState.nameEn}
                onChange={e => handleChange("nameEn", e.target.value)}
                className={inputCls}
                placeholder="Complete Blood Count"
              />
            </div>
            <div>
              <label className={labelCls}>Name (Gujarati)</label>
              <input
                type="text"
                value={formState.nameGu}
                onChange={e => handleChange("nameGu", e.target.value)}
                className={inputCls}
                placeholder="સીબીસી"
              />
            </div>
            <div>
              <label className={labelCls}>Also Known As (Comma separated)</label>
              <input
                type="text"
                value={formState.akaEn}
                onChange={e => handleChange("akaEn", e.target.value)}
                className={inputCls}
                placeholder="CBC, Hemogram"
              />
            </div>
          </div>
        </div>

        {/* Content Fields */}
        <div className="card-elevated space-y-4">
          <h3 className="font-bold text-primary-700 flex items-center gap-2">Knowledge Content</h3>
          
          <div>
            <label className={labelCls}>Simple Meaning</label>
            <textarea
              value={formState.simpleMeaning}
              onChange={e => handleChange("simpleMeaning", e.target.value)}
              className={`${inputCls} min-h-[80px]`}
              placeholder="A simple explanation..."
            />
          </div>

          <div>
            <label className={labelCls}>Detailed Description (Markdown)</label>
            <p className="text-xs text-base-500 mb-2">You can use Markdown to format this text. To add new parameters, simply type them into the text below.</p>
            <textarea
              value={formState.detailedDescription}
              onChange={e => handleChange("detailedDescription", e.target.value)}
              className={`${inputCls} min-h-[300px] font-mono leading-relaxed`}
              placeholder="Detailed explanation goes here..."
            />
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
            <><Save size={20} /> Save Changes</>
          )}
        </button>

      </div>
    </AppShell>
  );
}
