"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { addChemoSession, getLatestCycleNumber } from "@/lib/db/chemo";
import { CalendarClock, Building2, UserCircle2 } from "lucide-react";

function AddChemoContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // If ?cycle=N is passed, we default to that cycle (useful for "half" chemo)
  const defaultCycle = searchParams.get("cycle");

  const [cycleNumber, setCycleNumber] = useState(defaultCycle ? parseInt(defaultCycle) : 1);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [hospital, setHospital] = useState("");
  const [doctor, setDoctor] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!defaultCycle) {
      getLatestCycleNumber().then((n) => setCycleNumber(n + 1));
    }
  }, [defaultCycle]);

  const handleSchedule = async () => {
    setSaving(true);
    try {
      const session = await addChemoSession({
        cycleNumber,
        sessionDate,
        hospital,
        doctorName: doctor,
        status: "scheduled",
        medicines: [],
        sideEffectsExperienced: "",
        notes: "",
        homeMedicinesPrescribed: false,
      });
      // Redirect directly to the Active Tracker for this session
      router.replace(`/chemo/${session.id}`);
    } catch {
      setSaving(false);
    }
  };

  const inputCls = "w-full pl-11 pr-4 py-3 bg-white dark:bg-dark-base-100 border border-base-200 dark:border-dark-base-200 rounded-xl text-sm outline-none focus:border-primary-500 transition-colors";
  const labelCls = "text-xs font-bold text-base-500 dark:text-dark-base-500 uppercase tracking-wide block mb-1.5";

  return (
    <AppShell title="Schedule Chemo Session" showBack>
      <div className="space-y-6 pb-24">
        
        <div className="bg-primary-50 dark:bg-dark-primary-100 p-4 rounded-xl border border-primary-100 dark:border-dark-primary-200">
          <p className="text-sm font-medium text-primary-700 dark:text-dark-primary-700">
            Scheduling a session will create a new Active Tracker to guide you through your hospital visit.
          </p>
        </div>

        <div className="card-elevated space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t("chemo.cycleNumber")}</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400">
                  <span className="font-bold text-lg">#</span>
                </div>
                <input type="number" value={cycleNumber} onChange={(e) => setCycleNumber(+e.target.value)} className={inputCls} min={1} />
              </div>
            </div>
            <div>
              <label className={labelCls}>{t("chemo.sessionDate")}</label>
              <div className="relative">
                <CalendarClock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
                <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>{t("chemo.hospital")}</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
              <input type="text" value={hospital} onChange={(e) => setHospital(e.target.value)} className={inputCls} placeholder="e.g. City Hospital" />
            </div>
          </div>
          
          <div>
            <label className={labelCls}>{t("chemo.doctor")}</label>
            <div className="relative">
              <UserCircle2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
              <input type="text" value={doctor} onChange={(e) => setDoctor(e.target.value)} className={inputCls} placeholder="e.g. Dr. Sharma" />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-dark-base-100/80 backdrop-blur-md border-t border-base-200 dark:border-dark-base-200 z-10 flex gap-4 max-w-2xl mx-auto pb-safe">
        <button
          onClick={handleSchedule}
          disabled={saving || !hospital || !doctor}
          className="flex-1 py-4 bg-primary-500 text-white rounded-2xl font-bold text-sm hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {saving ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <CalendarClock size={20} />
          )}
          {saving ? "Scheduling..." : "Schedule Session"}
        </button>
      </div>
    </AppShell>
  );
}

export default function AddChemoPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <AddChemoContent />
    </Suspense>
  );
}
