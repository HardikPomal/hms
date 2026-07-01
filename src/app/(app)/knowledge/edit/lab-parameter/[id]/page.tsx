"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { getParameterById, getKnowledgeByParameterId, updateParameter, updateKnowledgeEntry } from "@/lib/db/knowledge";
import type { ParameterDef, KnowledgeEntry } from "@/types";
import { Save } from "lucide-react";

const extractLangBlock = (text: string, lang: 'en' | 'gu') => {
  const regex = new RegExp(`<${lang}>([\\s\\S]*?)<\\/${lang}>`);
  const match = text.match(regex);
  return match ? match[1].trim() : "";
};

const parseSection = (text: string, header: string) => {
  const regex = new RegExp(`### ${header}\\n([\\s\\S]*?)(?:\\n###|\\n\\*\\*Related|$)`);
  const match = text.match(regex);
  return match ? match[1].trim() : "";
};

const parseDescription = (text: string) => {
  const match = text.match(/^([\s\S]*?)(?:\n###|\n\*\*Related|$)/);
  return match ? match[1].trim() : "";
};

const parseRelated = (text: string, type: 'Reports' | 'Parameters') => {
  const regex = new RegExp(`\\*\\*Related ${type}:\\*\\*\\n([\\s\\S]*?)(?:\\n\\*\\*Related|$)`);
  const match = text.match(regex);
  return match ? match[1].trim() : "";
};

export default function EditLabParameterPage() {
  const { t, language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parameter, setParameter] = useState<ParameterDef | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry | null>(null);

  // Form State
  const [formState, setFormState] = useState({
    nameEn: "", nameGu: "",
    akaEn: "", akaGu: "",
    descEn: "", descGu: "",
    whyImportantEn: "", whyImportantGu: "",
    unit: "",
    normalRange: "",
    highIndicateEn: "", highIndicateGu: "",
    lowIndicateEn: "", lowIndicateGu: "",
    causesEn: "", causesGu: "",
    relatedReports: "",
    relatedParameters: "",
    relatedDiseasesEn: "", relatedDiseasesGu: "",
  });

  useEffect(() => {
    Promise.all([
      getParameterById(id),
      getKnowledgeByParameterId(id)
    ]).then(([p, k]) => {
      setParameter(p ?? null);
      setKnowledge(k ?? null);
      
      if (p) {
        const engAka = (p.alternativeNames || []).filter((n: string) => /^[a-zA-Z0-9\s,\.\(\)\-]+$/.test(n)).join(", ");
        const guAka = (p.alternativeNames || []).filter((n: string) => !/^[a-zA-Z0-9\s,\.\(\)\-]+$/.test(n)).join(", ");

        const fullDesc = k?.detailedDescription || "";
        let enBlock = extractLangBlock(fullDesc, "en");
        let guBlock = extractLangBlock(fullDesc, "gu");
        if (!enBlock && !guBlock) enBlock = fullDesc;

        const whyImportantFull = k?.whyImportant || "";
        let whyImportantEnBlock = extractLangBlock(whyImportantFull, "en");
        let whyImportantGuBlock = extractLangBlock(whyImportantFull, "gu");
        if (!whyImportantEnBlock && !whyImportantGuBlock) whyImportantEnBlock = whyImportantFull;

        setFormState({
          nameEn: p.name,
          nameGu: p.nameGu || "",
          akaEn: engAka,
          akaGu: guAka,
          unit: p.metadata?.unit || "",
          normalRange: k?.normalRangeText || "",
          descEn: parseDescription(enBlock),
          descGu: parseDescription(guBlock),
          whyImportantEn: whyImportantEnBlock,
          whyImportantGu: whyImportantGuBlock,
          highIndicateEn: parseSection(enBlock, "High Value May Indicate"),
          highIndicateGu: parseSection(guBlock, "High Value May Indicate"),
          lowIndicateEn: parseSection(enBlock, "Low Value May Indicate"),
          lowIndicateGu: parseSection(guBlock, "Low Value May Indicate"),
          causesEn: parseSection(enBlock, "Common Causes Of Abnormal Results"),
          causesGu: parseSection(guBlock, "Common Causes Of Abnormal Results"),
          relatedDiseasesEn: parseSection(enBlock, "Related Diseases"),
          relatedDiseasesGu: parseSection(guBlock, "Related Diseases"),
          relatedReports: parseRelated(enBlock, "Reports"),
          relatedParameters: parseRelated(enBlock, "Parameters"),
        });
      }
      setLoading(false);
    });
  }, [id]);

  const inputCls = "w-full px-4 py-3 bg-white dark:bg-dark-base-100 border-2 border-base-200 dark:border-dark-base-200 rounded-xl text-sm font-medium outline-none focus:border-primary-500 transition-colors";
  const labelCls = "text-xs font-bold text-base-500 dark:text-dark-base-500 block mb-1.5 uppercase tracking-wide";

  const handleSave = async () => {
    if (!parameter || !formState.nameEn.trim()) {
      alert("English Name is required.");
      return;
    }
    
    setSaving(true);
    try {
      const altNames = [...formState.akaEn.split(","), ...formState.akaGu.split(",")]
        .map(n => n.trim())
        .filter(n => n.length > 0);
      
      let defaultRefMin = undefined;
      let defaultRefMax = undefined;
      if (formState.normalRange.includes("-")) {
        const parts = formState.normalRange.split("-").map(p => p.trim());
        if (parts.length === 2 && parts[0] && parts[1]) {
          defaultRefMin = parts[0];
          defaultRefMax = parts[1];
        }
      }
      
      await updateParameter(id, {
        name: formState.nameEn.trim(),
        nameGu: formState.nameGu.trim() || undefined,
        alternativeNames: altNames,
        defaultUnit: formState.unit.trim() || undefined,
        defaultRefMin,
        defaultRefMax,
      });

      let enDesc = formState.descEn.trim();
      let guDesc = formState.descGu.trim();

      if (formState.highIndicateEn.trim()) enDesc += `\n\n### High Value May Indicate\n${formState.highIndicateEn.trim()}`;
      if (formState.highIndicateGu.trim()) guDesc += `\n\n### High Value May Indicate\n${formState.highIndicateGu.trim()}`;

      if (formState.lowIndicateEn.trim()) enDesc += `\n\n### Low Value May Indicate\n${formState.lowIndicateEn.trim()}`;
      if (formState.lowIndicateGu.trim()) guDesc += `\n\n### Low Value May Indicate\n${formState.lowIndicateGu.trim()}`;

      if (formState.causesEn.trim()) enDesc += `\n\n### Common Causes Of Abnormal Results\n${formState.causesEn.trim()}`;
      if (formState.causesGu.trim()) guDesc += `\n\n### Common Causes Of Abnormal Results\n${formState.causesGu.trim()}`;

      if (formState.relatedDiseasesEn.trim()) enDesc += `\n\n### Related Diseases\n${formState.relatedDiseasesEn.trim()}`;
      if (formState.relatedDiseasesGu.trim()) guDesc += `\n\n### Related Diseases\n${formState.relatedDiseasesGu.trim()}`;

      const sharedRelations = [];
      if (formState.relatedReports.trim()) sharedRelations.push(`**Related Reports:**\n${formState.relatedReports.trim()}`);
      if (formState.relatedParameters.trim()) sharedRelations.push(`**Related Parameters:**\n${formState.relatedParameters.trim()}`);

      const relationsStr = sharedRelations.length > 0 ? `\n\n### Relationships\n${sharedRelations.join("\n\n")}` : "";
      if (relationsStr) {
        enDesc += relationsStr;
        guDesc += relationsStr;
      }

      let detailedDesc = "";
      if (enDesc) detailedDesc += `<en>\n${enDesc}\n</en>\n`;
      if (guDesc) detailedDesc += `<gu>\n${guDesc}\n</gu>`;

      let whyImportant = "";
      if (formState.whyImportantEn.trim()) whyImportant += `<en>\n${formState.whyImportantEn.trim()}\n</en>\n`;
      if (formState.whyImportantGu.trim()) whyImportant += `<gu>\n${formState.whyImportantGu.trim()}\n</gu>`;

      if (knowledge) {
        await updateKnowledgeEntry(knowledge.id, {
          simpleMeaning: formState.descEn.trim() || formState.nameEn.trim(),
          detailedDescription: detailedDesc,
          whyImportant,
          normalRangeText: formState.normalRange.trim(),
        });
      }

      router.replace(`/knowledge/${id}`);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Error saving parameter.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof typeof formState, val: string) => {
    setFormState(prev => ({ ...prev, [field]: val }));
  };

  if (loading) return <AppShell showBack><div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div></AppShell>;
  if (!parameter) return <AppShell showBack><p className="text-center py-8 text-base-400">{t("common.noData")}</p></AppShell>;

  return (
    <AppShell showBack title={language === "gu" ? "માહિતી સંપાદિત કરો" : "Edit Lab Parameter"}>
      <div className="space-y-6 pb-24 max-w-2xl mx-auto w-full px-4 pt-4">
        
        {/* Core Info */}
        <div className="card-elevated space-y-4 border-l-4 border-l-primary-500">
          <h3 className="font-bold text-primary-700 flex items-center gap-2">Core Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelCls}>Name (English) *</label><input value={formState.nameEn} onChange={e => handleChange("nameEn", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Name (Gujarati)</label><input value={formState.nameGu} onChange={e => handleChange("nameGu", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Also Known As (English)</label><input value={formState.akaEn} onChange={e => handleChange("akaEn", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Also Known As (Gujarati)</label><input value={formState.akaGu} onChange={e => handleChange("akaGu", e.target.value)} className={inputCls} /></div>
          </div>
        </div>

        {/* Clinical Info */}
        <div className="card-elevated space-y-4 border-l-4 border-l-secondary-500">
          <h3 className="font-bold text-secondary-700 flex items-center gap-2">Clinical Details</h3>
          <div className="grid grid-cols-1 gap-4">
            <div><label className={labelCls}>Unit of Measurement</label><input value={formState.unit} onChange={e => handleChange("unit", e.target.value)} placeholder="e.g. g/dL, %, /c.mm" className={inputCls} /></div>
            <div><label className={labelCls}>Normal Range</label><input value={formState.normalRange} onChange={e => handleChange("normalRange", e.target.value)} placeholder="e.g. 12.0 - 15.5 or < 5.0" className={inputCls} /></div>
            <div><label className={labelCls}>Why is this important? (En)</label><textarea value={formState.whyImportantEn} onChange={e => handleChange("whyImportantEn", e.target.value)} className={`${inputCls} min-h-[80px]`} /></div>
            <div><label className={labelCls}>Why is this important? (Gu)</label><textarea value={formState.whyImportantGu} onChange={e => handleChange("whyImportantGu", e.target.value)} className={`${inputCls} min-h-[80px]`} /></div>
          </div>
        </div>

        {/* Details */}
        <div className="card-elevated space-y-4">
          <h3 className="font-bold text-primary-700 flex items-center gap-2">Parameter Description</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelCls}>Description (English)</label><textarea value={formState.descEn} onChange={e => handleChange("descEn", e.target.value)} className={`${inputCls} min-h-[80px]`} /></div>
            <div><label className={labelCls}>Description (Gujarati)</label><textarea value={formState.descGu} onChange={e => handleChange("descGu", e.target.value)} className={`${inputCls} min-h-[80px]`} /></div>
            <div><label className={labelCls}>High Value May Indicate (En)</label><textarea value={formState.highIndicateEn} onChange={e => handleChange("highIndicateEn", e.target.value)} className={`${inputCls} min-h-[80px]`} /></div>
            <div><label className={labelCls}>High Value May Indicate (Gu)</label><textarea value={formState.highIndicateGu} onChange={e => handleChange("highIndicateGu", e.target.value)} className={`${inputCls} min-h-[80px]`} /></div>
            <div><label className={labelCls}>Low Value May Indicate (En)</label><textarea value={formState.lowIndicateEn} onChange={e => handleChange("lowIndicateEn", e.target.value)} className={`${inputCls} min-h-[80px]`} /></div>
            <div><label className={labelCls}>Low Value May Indicate (Gu)</label><textarea value={formState.lowIndicateGu} onChange={e => handleChange("lowIndicateGu", e.target.value)} className={`${inputCls} min-h-[80px]`} /></div>
            <div><label className={labelCls}>Common Causes Of Abnormal Results (En)</label><textarea value={formState.causesEn} onChange={e => handleChange("causesEn", e.target.value)} className={`${inputCls} min-h-[80px]`} /></div>
            <div><label className={labelCls}>Common Causes Of Abnormal Results (Gu)</label><textarea value={formState.causesGu} onChange={e => handleChange("causesGu", e.target.value)} className={`${inputCls} min-h-[80px]`} /></div>
            <div><label className={labelCls}>Related Diseases (En)</label><textarea value={formState.relatedDiseasesEn} onChange={e => handleChange("relatedDiseasesEn", e.target.value)} className={`${inputCls} min-h-[80px]`} /></div>
            <div><label className={labelCls}>Related Diseases (Gu)</label><textarea value={formState.relatedDiseasesGu} onChange={e => handleChange("relatedDiseasesGu", e.target.value)} className={`${inputCls} min-h-[80px]`} /></div>
          </div>
        </div>

        {/* Relationships */}
        <div className="card-elevated space-y-4">
          <h3 className="font-bold text-primary-700 flex items-center gap-2">Relationships</h3>
          <div className="grid grid-cols-1 gap-4">
            <div><label className={labelCls}>Related Reports (Comma separated)</label><input value={formState.relatedReports} onChange={e => handleChange("relatedReports", e.target.value)} placeholder="e.g. Complete Blood Count (CBC)" className={inputCls} /></div>
            <div><label className={labelCls}>Related Parameters (Comma separated)</label><input value={formState.relatedParameters} onChange={e => handleChange("relatedParameters", e.target.value)} placeholder="e.g. RBC Count, Platelet Count" className={inputCls} /></div>
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
            <><Save size={20} /> {language === "gu" ? "સાચવો" : "Save Changes"}</>
          )}
        </button>

      </div>
    </AppShell>
  );
}
