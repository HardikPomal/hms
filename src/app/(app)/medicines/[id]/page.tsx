"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { Trash2, Edit } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMedicineById, deleteMedicine, getAdherenceStats } from "@/lib/db/medicines";
import type { Medicine } from "@/types";

export default function MedicineDetailPage() {
  const { t, language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [adherence, setAdherence] = useState<{ taken: number; skipped: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    Promise.all([getMedicineById(id), getAdherenceStats(id)]).then(([m, a]) => {
      setMedicine(m ?? null);
      setAdherence(a);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => { await deleteMedicine(id); router.replace("/medicines"); };

  if (loading) return <AppShell showBack><div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div></AppShell>;
  if (!medicine) return <AppShell showBack><p className="text-center py-8 text-base-400">{t("common.noData")}</p></AppShell>;

  const scheduleStr = [
    medicine.schedule.morning && `🌅 ${t("medicines.morning")}`,
    medicine.schedule.afternoon && `☀️ ${t("medicines.afternoon")}`,
    medicine.schedule.evening && `🌇 ${t("medicines.evening")}`,
    medicine.schedule.night && `🌙 ${t("medicines.night")}`,
  ].filter(Boolean).join("  ");

  return (
    <AppShell
      title={medicine.name}
      showBack
      rightAction={
        <button onClick={() => setShowDelete(true)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-danger-50 transition-colors">
          <Trash2 size={18} className="text-danger-500" />
        </button>
      }
    >
      <div className="space-y-4">
        {/* Header Card */}
        <div className="card-elevated gradient-calm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl">💊</span>
            </div>
            <div>
              <h2 className="font-bold text-base-900 dark:text-dark-base-900 text-lg">{medicine.name}</h2>
              {medicine.genericName && <p className="text-sm text-base-500">{medicine.genericName}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {medicine.strength && <div><p className="text-xs text-base-400">{t("medicines.strength")}</p><p className="font-medium">{medicine.strength}</p></div>}
            <div><p className="text-xs text-base-400">{t("medicines.dosageForm")}</p><p className="font-medium">{medicine.dosageForm}</p></div>
            {medicine.dosageAmount && <div><p className="text-xs text-base-400">{t("medicines.dosageAmount")}</p><p className="font-medium">{medicine.dosageAmount}</p></div>}
            <div><p className="text-xs text-base-400">{t("medicines.foodRelation")}</p><p className="font-medium">{t(`medicines.${medicine.schedule.foodRelation}`)}</p></div>
          </div>
        </div>

        {/* Schedule */}
        <div className="card-elevated">
          <p className="text-xs text-base-400 mb-1">{t("medicines.schedule")}</p>
          <p className="font-medium text-base-900 dark:text-dark-base-900">{scheduleStr || language === "gu" ? "સ્ૂચ. નહીં" : "No schedule set"}</p>
        </div>

        {/* Purpose */}
        {medicine.purpose && (
          <div className="card-elevated">
            <p className="text-xs text-base-400 mb-1">{t("medicines.purpose")}</p>
            <p className="text-sm text-base-700 dark:text-dark-base-700">{medicine.purpose}</p>
          </div>
        )}

        {/* Adherence */}
        {adherence && adherence.total > 0 && (
          <div className="card-elevated">
            <p className="text-xs text-base-400 mb-2">{t("medicines.adherence")} (30 {language === "gu" ? "દિ" : "days"})</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-base-100 dark:bg-dark-base-200 rounded-full h-3">
                <div
                  className="bg-success-500 h-3 rounded-full"
                  style={{ width: `${(adherence.taken / adherence.total) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-success-600">
                {Math.round((adherence.taken / adherence.total) * 100)}%
              </span>
            </div>
            <div className="flex gap-3 mt-2 text-xs text-base-500">
              <span>✓ {adherence.taken} {language === "gu" ? "લીધી" : "taken"}</span>
              <span>✗ {adherence.skipped} {language === "gu" ? "ઉભી" : "skipped"}</span>
            </div>
          </div>
        )}

        {/* Precautions & Side Effects */}
        {medicine.precautions && (
          <div className="card-elevated">
            <p className="text-xs text-base-400 mb-1">{t("medicines.precautions")}</p>
            <p className="text-sm text-base-700 dark:text-dark-base-700">{medicine.precautions}</p>
          </div>
        )}
        {medicine.sideEffects && (
          <div className="card-elevated border border-danger-200 dark:border-dark-danger-200">
            <p className="text-xs text-danger-500 mb-1">⚠️ {language === "gu" ? "આડ-અસર" : "Side Effects"}</p>
            <p className="text-sm text-base-700 dark:text-dark-base-700">{medicine.sideEffects}</p>
          </div>
        )}

        {/* Dates */}
        <div className="card-elevated">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><p className="text-xs text-base-400">{t("medicines.startDate")}</p><p className="font-medium">{medicine.startDate}</p></div>
            {medicine.endDate && <div><p className="text-xs text-base-400">{t("medicines.endDate")}</p><p className="font-medium">{medicine.endDate}</p></div>}
            {medicine.prescribedBy && <div><p className="text-xs text-base-400">{t("medicines.prescribedBy")}</p><p className="font-medium">{medicine.prescribedBy}</p></div>}
          </div>
        </div>
      </div>

      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <div className="bg-white dark:bg-dark-base-100 rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="font-semibold mb-4">{language === "gu" ? "આ દવા ભૂંસો?" : "Delete this medicine?"}</h3>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-3 bg-base-100 dark:bg-dark-base-200 rounded-xl text-sm font-medium">{t("common.cancel")}</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-danger-500 text-white rounded-xl text-sm font-medium">{t("common.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
