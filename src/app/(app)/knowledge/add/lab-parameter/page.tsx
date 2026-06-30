"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { addParameter, addKnowledgeEntry } from "@/lib/db/knowledge";
import { Save } from "lucide-react";

function AddLabParameterForm() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [saving, setSaving] = useState(false);

  // Form State
  const [formState, setFormState] = useState({
    nameEn: "",
    nameGu: "",
    akaEn: "",
    akaGu: "",
    descEn: "",
    descGu: "",
    whyImportantEn: "",
    whyImportantGu: "",
    unit: "",
    normalRange: "",
    highIndicateEn: "",
    highIndicateGu: "",
    lowIndicateEn: "",
    lowIndicateGu: "",
    causesEn: "",
    causesGu: "",
    relatedReports: "",
    relatedParameters: "",
    relatedDiseasesEn: "",
    relatedDiseasesGu: "",
  });

  useEffect(() => {
    const pTitle = searchParams.get("title");
    if (pTitle) {
      setFormState(prev => ({ ...prev, nameEn: pTitle }));
    }
  }, [searchParams]);

  const inputCls =
    "w-full px-4 py-3 bg-white dark:bg-dark-base-100 border-2 border-base-200 dark:border-dark-base-200 rounded-xl text-sm font-medium outline-none focus:border-primary-500 transition-colors";
  const labelCls =
    "text-xs font-bold text-base-500 dark:text-dark-base-500 block mb-1.5 uppercase tracking-wide";

  const handleSave = async () => {
    if (!formState.nameEn.trim()) {
      alert("English Name is required.");
      return;
    }

    setSaving(true);
    try {
      const altNames = [
        formState.akaEn,
        formState.akaGu,
      ].filter((n) => n.trim().length > 0);

      let defaultRefMin = undefined;
      let defaultRefMax = undefined;
      if (formState.normalRange.includes("-")) {
        const parts = formState.normalRange.split("-").map(p => p.trim());
        if (parts.length === 2 && parts[0] && parts[1]) {
          defaultRefMin = parts[0];
          defaultRefMax = parts[1];
        }
      }

      const param = await addParameter({
        name: formState.nameEn.trim(),
        nameGu: formState.nameGu.trim() || undefined,
        alternativeNames: altNames,
        category: "lab_parameter",
        knowledgeStatus: "needs_analysis",
        defaultUnit: formState.unit.trim() || undefined,
        defaultRefMin,
        defaultRefMax,
      });

      // Build detailed description markdown with XML tags for easy parsing
      let enDesc = formState.descEn.trim();
      let guDesc = formState.descGu.trim();

      if (formState.highIndicateEn.trim())
        enDesc += `\n\n### High Value May Indicate\n${formState.highIndicateEn.trim()}`;
      if (formState.highIndicateGu.trim())
        guDesc += `\n\n### High Value May Indicate\n${formState.highIndicateGu.trim()}`;

      if (formState.lowIndicateEn.trim())
        enDesc += `\n\n### Low Value May Indicate\n${formState.lowIndicateEn.trim()}`;
      if (formState.lowIndicateGu.trim())
        guDesc += `\n\n### Low Value May Indicate\n${formState.lowIndicateGu.trim()}`;

      if (formState.causesEn.trim())
        enDesc += `\n\n### Common Causes Of Abnormal Results\n${formState.causesEn.trim()}`;
      if (formState.causesGu.trim())
        guDesc += `\n\n### Common Causes Of Abnormal Results\n${formState.causesGu.trim()}`;

      if (formState.relatedDiseasesEn.trim())
        enDesc += `\n\n### Related Diseases\n${formState.relatedDiseasesEn.trim()}`;
      if (formState.relatedDiseasesGu.trim())
        guDesc += `\n\n### Related Diseases\n${formState.relatedDiseasesGu.trim()}`;

      const sharedRelations = [];
      if (formState.relatedReports.trim())
        sharedRelations.push(
          `**Related Reports:**\n${formState.relatedReports.trim()}`,
        );
      if (formState.relatedParameters.trim())
        sharedRelations.push(
          `**Related Parameters:**\n${formState.relatedParameters.trim()}`,
        );

      const relationsStr =
        sharedRelations.length > 0
          ? `\n\n### Relationships\n${sharedRelations.join("\n\n")}`
          : "";
      if (relationsStr) {
        enDesc += relationsStr;
        guDesc += relationsStr;
      }

      let detailedDesc = "";
      if (enDesc) detailedDesc += `<en>\n${enDesc}\n</en>\n`;
      if (guDesc) detailedDesc += `<gu>\n${guDesc}\n</gu>`;

      let whyImportant = "";
      if (formState.whyImportantEn.trim())
        whyImportant += `<en>\n${formState.whyImportantEn.trim()}\n</en>\n`;
      if (formState.whyImportantGu.trim())
        whyImportant += `<gu>\n${formState.whyImportantGu.trim()}\n</gu>`;

      await addKnowledgeEntry({
        parameterId: param.id,
        simpleMeaning: formState.descEn.trim() || formState.nameEn.trim(),
        detailedDescription: detailedDesc,
        whyImportant: whyImportant,
        normalRangeText: formState.normalRange.trim(),
        source: "Manual Entry (Lab Parameter)",
        doctorNotes: "",
        personalNotes: "",
        references: [],
        tags: [],
        versionHistory: [],
      });

      const returnTo = searchParams.get("returnTo");
      if (returnTo) {
        router.replace(returnTo);
      } else {
        router.replace("/knowledge/category/lab_parameter");
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Error saving parameter.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof typeof formState, val: string) => {
    setFormState((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <AppShell showBack title="Add Lab Parameter">
      <div className="space-y-6 pb-24 max-w-2xl mx-auto w-full px-4 pt-4">
        {/* Core Info */}
        <div className="card-elevated space-y-4">
          <h3 className="font-bold text-primary-700 flex items-center gap-2">
            Core Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name (English) *</label>
              <input
                value={formState.nameEn}
                onChange={(e) => handleChange("nameEn", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Name (Gujarati)</label>
              <input
                value={formState.nameGu}
                onChange={(e) => handleChange("nameGu", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Also Known As (English)</label>
              <input
                value={formState.akaEn}
                onChange={(e) => handleChange("akaEn", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Also Known As (Gujarati)</label>
              <input
                value={formState.akaGu}
                onChange={(e) => handleChange("akaGu", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Unit</label>
              <input
                value={formState.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                placeholder="e.g. g/dL"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Normal Range</label>
              <input
                value={formState.normalRange}
                onChange={(e) => handleChange("normalRange", e.target.value)}
                placeholder="e.g. 13.5 - 17.5"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="card-elevated space-y-4">
          <h3 className="font-bold text-primary-700 flex items-center gap-2">
            Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Description (English)</label>
              <textarea
                value={formState.descEn}
                onChange={(e) => handleChange("descEn", e.target.value)}
                className={`${inputCls} min-h-[80px]`}
              />
            </div>
            <div>
              <label className={labelCls}>Description (Gujarati)</label>
              <textarea
                value={formState.descGu}
                onChange={(e) => handleChange("descGu", e.target.value)}
                className={`${inputCls} min-h-[80px]`}
              />
            </div>
            <div>
              <label className={labelCls}>Why It Is Important (English)</label>
              <textarea
                value={formState.whyImportantEn}
                onChange={(e) => handleChange("whyImportantEn", e.target.value)}
                className={`${inputCls} min-h-[80px]`}
              />
            </div>
            <div>
              <label className={labelCls}>Why It Is Important (Gujarati)</label>
              <textarea
                value={formState.whyImportantGu}
                onChange={(e) => handleChange("whyImportantGu", e.target.value)}
                className={`${inputCls} min-h-[80px]`}
              />
            </div>
          </div>
        </div>

        {/* Indications */}
        <div className="card-elevated space-y-4">
          <h3 className="font-bold text-primary-700 flex items-center gap-2">
            Indications & Causes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>High Value May Indicate (En)</label>
              <textarea
                value={formState.highIndicateEn}
                onChange={(e) => handleChange("highIndicateEn", e.target.value)}
                className={`${inputCls} min-h-[80px]`}
              />
            </div>
            <div>
              <label className={labelCls}>High Value May Indicate (Gu)</label>
              <textarea
                value={formState.highIndicateGu}
                onChange={(e) => handleChange("highIndicateGu", e.target.value)}
                className={`${inputCls} min-h-[80px]`}
              />
            </div>
            <div>
              <label className={labelCls}>Low Value May Indicate (En)</label>
              <textarea
                value={formState.lowIndicateEn}
                onChange={(e) => handleChange("lowIndicateEn", e.target.value)}
                className={`${inputCls} min-h-[80px]`}
              />
            </div>
            <div>
              <label className={labelCls}>Low Value May Indicate (Gu)</label>
              <textarea
                value={formState.lowIndicateGu}
                onChange={(e) => handleChange("lowIndicateGu", e.target.value)}
                className={`${inputCls} min-h-[80px]`}
              />
            </div>
            <div>
              <label className={labelCls}>Common Causes (En)</label>
              <textarea
                value={formState.causesEn}
                onChange={(e) => handleChange("causesEn", e.target.value)}
                className={`${inputCls} min-h-[80px]`}
              />
            </div>
            <div>
              <label className={labelCls}>Common Causes (Gu)</label>
              <textarea
                value={formState.causesGu}
                onChange={(e) => handleChange("causesGu", e.target.value)}
                className={`${inputCls} min-h-[80px]`}
              />
            </div>
          </div>
        </div>

        {/* Relations */}
        <div className="card-elevated space-y-4">
          <h3 className="font-bold text-primary-700 flex items-center gap-2">
            Relationships
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Related Reports</label>
              <textarea
                value={formState.relatedReports}
                onChange={(e) => handleChange("relatedReports", e.target.value)}
                placeholder="e.g. - CBC\n- Lipid Profile"
                className={`${inputCls} min-h-[80px]`}
              />
            </div>
            <div>
              <label className={labelCls}>Related Parameters</label>
              <textarea
                value={formState.relatedParameters}
                onChange={(e) =>
                  handleChange("relatedParameters", e.target.value)
                }
                placeholder="e.g. - RBC\n- Hemoglobin"
                className={`${inputCls} min-h-[80px]`}
              />
            </div>
            <div>
              <label className={labelCls}>Related Diseases (English)</label>
              <textarea
                value={formState.relatedDiseasesEn}
                onChange={(e) =>
                  handleChange("relatedDiseasesEn", e.target.value)
                }
                className={`${inputCls} min-h-[80px]`}
              />
            </div>
            <div>
              <label className={labelCls}>Related Diseases (Gujarati)</label>
              <textarea
                value={formState.relatedDiseasesGu}
                onChange={(e) =>
                  handleChange("relatedDiseasesGu", e.target.value)
                }
                className={`${inputCls} min-h-[80px]`}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !formState.nameEn.trim()}
          className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <Save className="animate-pulse" size={20} /> Saving...
            </>
          ) : (
            <>
              <Save size={20} />{" "}
              {language === "gu" ? "સાચવો" : "Save Parameter"}
            </>
          )}
        </button>
      </div>
    </AppShell>
  );
}

export default function AddLabParameterPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <AddLabParameterForm />
    </Suspense>
  );
}
