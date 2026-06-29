"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { CheckCircle, Circle, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  generateTodaySchedule,
  updateMedicineLogStatus,
} from "@/lib/db/medicines";
import type { MedicineLog, MedicineScheduleTime } from "@/types";

const TIME_ORDER: MedicineScheduleTime[] = [
  "morning",
  "afternoon",
  "evening",
  "night",
];
const TIME_ICONS: Record<MedicineScheduleTime, string> = {
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌇",
  night: "🌙",
};

export default function MedicineSchedulePage() {
  const { t, language } = useLanguage();
  const [logs, setLogs] = useState<MedicineLog[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    generateTodaySchedule(today).then((l) => {
      setLogs(l);
      setLoading(false);
    });
  }, [today]);

  const handleMark = async (logId: string, status: "taken" | "skipped") => {
    await updateMedicineLogStatus(logId, status);
    setLogs((prev) =>
      prev.map((l) =>
        l.id === logId
          ? {
              ...l,
              status,
              takenAt:
                status === "taken" ? new Date().toISOString() : undefined,
            }
          : l,
      ),
    );
  };

  const groupedByTime = TIME_ORDER.map((time) => ({
    time,
    logs: logs.filter((l) => l.scheduledTime === time),
  })).filter((g) => g.logs.length > 0);

  const taken = logs.filter((l) => l.status === "taken").length;
  const total = logs.length;

  return (
    <AppShell title={t("medicines.today")} showBack>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress */}
          {total > 0 && (
            <div className="card-elevated">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-base-700 dark:text-dark-base-700">
                  {language === "gu" ? "આજ લીધી" : "Today's Progress"}
                </span>
                <span className="text-sm font-bold text-primary-500">
                  {taken}/{total}
                </span>
              </div>
              <div className="bg-base-100 dark:bg-dark-base-200 rounded-full h-3">
                <div
                  className="bg-success-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${total > 0 ? (taken / total) * 100 : 0}%` }}
                />
              </div>
              {taken === total && total > 0 && (
                <p className="text-xs text-success-600 mt-2 font-medium text-center">
                  {language === "gu"
                    ? "🎉 બધી દવા લઈ લીધી!"
                    : "🎉 All medicines taken!"}
                </p>
              )}
            </div>
          )}

          {groupedByTime.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-base-400">{t("dashboard.noMeds")}</p>
            </div>
          ) : (
            groupedByTime.map(({ time, logs: timeLogs }) => (
              <div key={time}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{TIME_ICONS[time]}</span>
                  <h2 className="text-sm font-semibold text-base-700 dark:text-dark-base-700 uppercase tracking-wide">
                    {t(`medicines.${time}`)}
                  </h2>
                </div>
                <div className="space-y-2">
                  {timeLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`card-elevated flex items-center gap-3 transition-all ${
                        log.status === "taken" ? "opacity-70" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold text-base-900 dark:text-dark-base-900 ${log.status === "taken" ? "line-through text-base-400" : ""}`}
                        >
                          {log.medicineName}
                        </p>
                        {log.status === "taken" && log.takenAt && (
                          <p className="text-xs text-success-500 mt-0.5">
                            ✓ {language === "gu" ? "લઈ લીધી" : "Taken"}{" "}
                            {new Date(log.takenAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                        {log.status === "skipped" && (
                          <p className="text-xs text-danger-400 mt-0.5">
                            {language === "gu" ? "ઉભી" : "Skipped"}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {log.status === "pending" ? (
                          <>
                            <button
                              onClick={() => handleMark(log.id, "taken")}
                              className="flex items-center gap-1.5 px-3 py-2 bg-success-500 text-white rounded-xl text-xs font-semibold hover:bg-success-600 transition-colors"
                            >
                              <CheckCircle size={14} />
                              {t("medicines.markTaken")}
                            </button>
                            <button
                              onClick={() => handleMark(log.id, "skipped")}
                              className="px-3 py-2 bg-base-100 dark:bg-dark-base-200 text-base-500 rounded-xl text-xs font-medium hover:bg-base-200 transition-colors"
                            >
                              {t("medicines.skipped")}
                            </button>
                          </>
                        ) : log.status === "taken" ? (
                          <CheckCircle size={22} className="text-success-500" />
                        ) : (
                          <Circle size={22} className="text-base-300" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </AppShell>
  );
}
