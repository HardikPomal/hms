"use client";

import { useState, useEffect } from "react";
import { MedicineFormData } from "@/types/forms";
import DynamicListInput from "@/components/ui/DynamicListInput";
import { getAllEntities } from "@/lib/db/knowledge";

interface MedicineFormProps {
  data: MedicineFormData;
  onChange: (data: MedicineFormData) => void;
}

export default function MedicineForm({ data, onChange }: MedicineFormProps) {
  const [suggestions, setSuggestions] = useState<{
    symptoms: string[];
    medicines: string[];
    all: string[];
  }>({ symptoms: [], medicines: [], all: [] });

  useEffect(() => {
    getAllEntities().then((entities) => {
      const symptoms = entities
        .filter((e) => e.type === "symptom" || e.category === "medical_term")
        .map((e) => e.name);
      const medicines = entities
        .filter((e) => e.type === "medication" || e.category === "medicine")
        .map((e) => e.name);
      const all = entities.map((e) => e.name);

      setSuggestions({ symptoms, medicines, all });
    });
  }, []);

  const inputCls =
    "w-full px-4 py-3 bg-white dark:bg-dark-base-100 border-2 border-base-200 dark:border-dark-base-200 rounded-xl text-sm font-medium outline-none focus:border-primary-500 transition-colors";
  const labelCls =
    "text-xs font-bold text-base-500 dark:text-dark-base-500 block mb-1.5 uppercase tracking-wide";

  const handleChange = (field: keyof MedicineFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card-elevated space-y-5">
      <h3 className="font-bold text-primary-700 dark:text-dark-primary-600 border-b border-base-200 dark:border-dark-base-200 pb-2 mb-4">
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <Section title="Basic Information">
        <div>
          <label className={labelCls}>Generic Name / Composition</label>
          <input
            type="text"
            value={data.genericName}
            onChange={(e) => handleChange("genericName", e.target.value)}
            placeholder="e.g. Ondansetron Hydrochloride"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Drug Class</label>
          <input
            type="text"
            value={data.drugClass}
            onChange={(e) => handleChange("drugClass", e.target.value)}
            placeholder="e.g. Antiemetic"
            className={inputCls}
          />
        </div>
        <DynamicListInput
          label="Brand Names"
          value={data.brandNames}
          onChange={(v) => handleChange("brandNames", v)}
          placeholder="Add brand name..."
          suggestions={suggestions.medicines}
        />
        <DynamicListInput
          label="Route of Administration"
          value={data.routeOfAdministration}
          onChange={(v) => handleChange("routeOfAdministration", v)}
          placeholder="e.g. Oral, IV..."
        />
      </Section>

      <Section title="Clinical Uses">
        <DynamicListInput
          label="Primary Uses / Indications"
          value={data.primaryUses}
          onChange={(v) => handleChange("primaryUses", v)}
          placeholder="Add indication..."
          suggestions={suggestions.symptoms}
        />
        <DynamicListInput
          label="Cancer-Specific Uses"
          value={data.cancerUses}
          onChange={(v) => handleChange("cancerUses", v)}
          placeholder="Add cancer use..."
          suggestions={suggestions.symptoms}
        />
      </Section>

      <Section title="Safety Profile">
        <DynamicListInput
          label="Common Side Effects"
          value={data.commonSideEffects}
          onChange={(v) => handleChange("commonSideEffects", v)}
          placeholder="Add side effect..."
          suggestions={suggestions.symptoms}
        />
        <DynamicListInput
          label="Serious Side Effects"
          value={data.seriousSideEffects}
          onChange={(v) => handleChange("seriousSideEffects", v)}
          placeholder="Add serious side effect..."
          suggestions={suggestions.symptoms}
        />
        <DynamicListInput
          label="Contraindications"
          value={data.contraindications}
          onChange={(v) => handleChange("contraindications", v)}
          placeholder="Add contraindication..."
          suggestions={suggestions.symptoms}
        />
        <div>
          <label className={labelCls}>Precautions</label>
          <textarea
            value={data.precautions}
            onChange={(e) => handleChange("precautions", e.target.value)}
            placeholder="Important precautions..."
            className={`${inputCls} min-h-[100px] resize-y`}
          />
        </div>
      </Section>

      <Section title="Monitoring Requirements">
        <DynamicListInput
          label="Required Monitoring Tests"
          value={data.monitoringTests}
          onChange={(v) => handleChange("monitoringTests", v)}
          placeholder="e.g. CBC, Liver Function Test..."
        />
      </Section>

      <Section title="Dosage Information">
        <DynamicListInput
          label="Dosage Forms"
          value={data.dosageForms}
          onChange={(v) => handleChange("dosageForms", v)}
          placeholder="e.g. Tablet, Injection..."
        />
        <div>
          <label className={labelCls}>General Dosage Notes</label>
          <textarea
            value={data.generalDosageNotes}
            onChange={(e) => handleChange("generalDosageNotes", e.target.value)}
            placeholder="e.g. Administer before chemotherapy..."
            className={`${inputCls} min-h-[100px] resize-y`}
          />
        </div>
      </Section>

      <Section title="Drug Interactions">
        <DynamicListInput
          label="Drug Interactions"
          value={data.drugInteractions}
          onChange={(v) => handleChange("drugInteractions", v)}
          placeholder="Add interaction..."
          suggestions={suggestions.medicines}
        />
      </Section>

      <Section title="Additional Notes (Markdown Supported)">
        <textarea
          value={data.additionalNotes}
          onChange={(e) => handleChange("additionalNotes", e.target.value)}
          placeholder="Paste detailed research, textbook excerpts, or articles here..."
          className={`${inputCls} min-h-[250px] font-mono text-sm leading-relaxed`}
        />
      </Section>
    </div>
  );
}
