"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { Plus, Pill, ChevronRight, CheckCircle, Circle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { getActiveMedicines } from "@/lib/db/medicines";
import type { Medicine } from "@/types";

export default function MedicinesPage() {
  const { t, language } = useLanguage();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "all">("active");

  useEffect(() => {
    getActiveMedicines().then((m) => {
      setMedicines(m);
      setLoading(false);
    });
  }, []);

  const scheduleLabel = (m: Medicine) => {
    const times = [];
    if (m.schedule.morning) times.push(language === "gu" ? "સ" : "M");
    if (m.schedule.afternoon) times.push(language === "gu" ? "બ" : "A");
    if (m.schedule.evening) times.push(language === "gu" ? "સા" : "E");
    if (m.schedule.night) times.push(language === "gu" ? "ર" : "N");
    return times.join("-");
  };

  return (
    <AppShell
      title={t("medicines.title")}
      rightAction={
        <Link
          href="/medicines/add"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 transition-colors"
        >
          <Plus size={20} className="text-white" />
        </Link>
      }
    >
      {/* Quick Schedule Link */}
      <Link
        href="/medicines/schedule"
        className="flex items-center justify-between p-4 gradient-primary rounded-2xl mb-4 hover:opacity-90 transition-opacity"
      >
        <div>
          <p className="text-white font-semibold">
            {language === "gu" ? "આજનો સ્કેડ્યૂલ" : "Today's Schedule"}
          </p>
          <p className="text-white/80 text-xs">
            {language === "gu" ? "દવા ચિહ્નિત કરો" : "Mark medicines as taken"}
          </p>
        </div>
        <ChevronRight size={20} className="text-white" />
      </Link>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : medicines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-base-100 dark:bg-dark-base-200 rounded-2xl flex items-center justify-center mb-4">
            <Pill size={32} className="text-base-300 dark:text-dark-base-400" />
          </div>
          <p className="text-base-500 text-sm mb-4">
            {t("medicines.noMedicines")}
          </p>
          <Link
            href="/medicines/add"
            className="px-6 py-3 gradient-primary text-white rounded-xl font-medium text-sm"
          >
            + {t("medicines.add")}
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {medicines.map((med, i) => (
            <Link
              key={med.id}
              href={`/medicines/${med.id}`}
              className="block card-elevated hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-dark-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <Pill
                    size={18}
                    className="text-primary-600 dark:text-dark-primary-600"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-base-900 dark:text-dark-base-900 truncate">
                        {med.name}
                      </p>
                      {med.strength && (
                        <p className="text-xs text-base-400">
                          {med.strength} · {med.dosageForm}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs bg-base-100 dark:bg-dark-base-200 text-base-600 dark:text-dark-base-600 px-2 py-0.5 rounded-full font-mono font-bold">
                        {scheduleLabel(med)}
                      </span>
                      <ChevronRight size={16} className="text-base-400" />
                    </div>
                  </div>
                  {med.purpose && (
                    <p className="text-xs text-base-400 mt-0.5 truncate">
                      {med.purpose}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        med.schedule.foodRelation === "before"
                          ? "bg-secondary-100 text-secondary-700"
                          : med.schedule.foodRelation === "after"
                            ? "bg-success-100 text-success-700"
                            : "bg-base-100 text-base-600"
                      }`}
                    >
                      {t(`medicines.${med.schedule.foodRelation}`)}
                    </span>
                    {med.isActive && (
                      <span className="text-xs text-success-600 font-medium">
                        ● {t("medicines.active")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
