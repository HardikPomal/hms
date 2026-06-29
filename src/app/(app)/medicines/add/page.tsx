"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { addMedicine } from "@/lib/db/medicines";
import type { MedicineSchedule } from "@/types";

export default function AddMedicinePage() {
  const { t, language } = useLanguage();
  const router = useRouter();

  const [name, setName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [strength, setStrength] = useState("");
  const [dosageForm, setDosageForm] = useState("Tablet");
  const [dosageAmount, setDosageAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [schedule, setSchedule] = useState<MedicineSchedule>({
    morning: false, afternoon: false, evening: false, night: false, foodRelation: "after",
  });
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [prescribedBy, setPrescribedBy] = useState("");
  const [sideEffects, setSideEffects] = useState("");
  const [precautions, setPrecautions] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const inputCls = "w-full px-4 py-3 bg-white dark:bg-dark-base-100 border border-base-200 dark:border-dark-base-200 rounded-xl text-sm outline-none focus:border-primary-400 transition-colors";
  const labelCls = "text-sm font-medium text-base-700 dark:text-dark-base-700 block mb-1.5";

  const toggleTime = (key: "morning" | "afternoon" | "evening" | "night") => {
    setSchedule((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    try {
      await addMedicine({ name, genericName, strength, dosageForm, dosageAmount, purpose, schedule, startDate, endDate: endDate || undefined, prescribedBy, isActive: true, sideEffects, precautions, notes });
      router.replace("/medicines");
    } catch { setSaving(false); }
  };

  const times: { key: "morning" | "afternoon" | "evening" | "night"; label: string; icon: string }[] = [
    { key: "morning", label: t("medicines.morning"), icon: "🌅" },
    { key: "afternoon", label: t("medicines.afternoon"), icon: "☀️" },
    { key: "evening", label: t("medicines.evening"), icon: "🌇" },
    { key: "night", label: t("medicines.night"), icon: "🌙" },
  ];

  return (
    <AppShell title={t("medicines.add")} showBack>
      <div className="space-y-4 pb-4">
        <div>
          <label className={labelCls}>{t("medicines.name")} *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t("medicines.strength")}</label>
            <input type="text" value={strength} onChange={(e) => setStrength(e.target.value)} className={inputCls} placeholder="500mg" />
          </div>
          <div>
            <label className={labelCls}>{t("medicines.dosageForm")}</label>
            <select value={dosageForm} onChange={(e) => setDosageForm(e.target.value)} className={inputCls}>
              {["Tablet", "Capsule", "Syrup", "Injection", "Drops", "Cream", "Patch", "Inhaler"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>{t("medicines.dosageAmount")}</label>
          <input type="text" value={dosageAmount} onChange={(e) => setDosageAmount(e.target.value)} className={inputCls} placeholder={language === "gu" ? "દા.ત. 1 ટૅબ્લૅટ" : "e.g. 1 tablet"} />
        </div>
        <div>
          <label className={labelCls}>{t("medicines.purpose")}</label>
          <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} className={inputCls} />
        </div>

        {/* Schedule */}
        <div>
          <label className={labelCls}>{t("medicines.schedule")}</label>
          <div className="grid grid-cols-4 gap-2">
            {times.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleTime(key)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
                  schedule[key]
                    ? "border-primary-400 bg-primary-50 dark:bg-dark-primary-100"
                    : "border-base-200 dark:border-dark-base-200 bg-white dark:bg-dark-base-100"
                }`}
              >
                <span className="text-xl">{icon}</span>
                <span className="text-xs font-medium text-base-700 dark:text-dark-base-700">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Food Relation */}
        <div>
          <label className={labelCls}>{t("medicines.foodRelation")}</label>
          <div className="grid grid-cols-4 gap-2">
            {(["before", "after", "with", "any"] as const).map((rel) => (
              <button
                key={rel}
                type="button"
                onClick={() => setSchedule((prev) => ({ ...prev, foodRelation: rel }))}
                className={`py-2 rounded-xl border-2 text-xs font-medium transition-all ${
                  schedule.foodRelation === rel
                    ? "border-primary-400 bg-primary-50 text-primary-700 dark:bg-dark-primary-100 dark:text-dark-primary-700"
                    : "border-base-200 dark:border-dark-base-200 text-base-600 dark:text-dark-base-600"
                }`}
              >
                {t(`medicines.${rel}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t("medicines.startDate")}</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t("medicines.endDate")}</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>{t("medicines.prescribedBy")}</label>
          <input type="text" value={prescribedBy} onChange={(e) => setPrescribedBy(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t("medicines.precautions")}</label>
          <textarea value={precautions} onChange={(e) => setPrecautions(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
        </div>
        <div>
          <label className={labelCls}>{t("medicines.notes")}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
        </div>

        <button onClick={handleSave} disabled={saving || !name} className="w-full py-4 gradient-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? t("common.loading") : t("common.save")}
        </button>
      </div>
    </AppShell>
  );
}
