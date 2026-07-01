"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { Plus, Syringe, ChevronRight, Calendar } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllChemoSessions } from "@/lib/db/chemo";
import type { ChemoSession } from "@/types";
import { format, isAfter, parseISO } from "date-fns";

export default function ChemoPage() {
  const { t, language } = useLanguage();
  const [sessions, setSessions] = useState<ChemoSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllChemoSessions().then((s) => {
      setSessions(s);
      setLoading(false);
    });
  }, []);

  const activeSessions = sessions.filter(
    (s) => s.status !== "completed" && s.status !== "delayed"
  );
  const pastSessions = sessions.filter(
    (s) => s.status === "completed" || s.status === "delayed"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-base-100 text-base-600";
      case "blood_test_pending": 
      case "doctor_consult":
      case "approval_pending": return "bg-amber-100 text-amber-700";
      case "treatment_active": return "bg-primary-100 text-primary-700 animate-pulse";
      case "discharge": return "bg-info-100 text-info-700";
      case "completed": return "bg-success-100 text-success-700";
      case "delayed": return "bg-danger-100 text-danger-700";
      default: return "bg-base-100 text-base-600";
    }
  };

  const getStatusText = (status: string) => {
    return status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <AppShell
      title={t("chemo.title")}
      rightAction={
        <Link
          href="/chemo/add"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 dark:bg-dark-primary-500 hover:bg-primary-600 transition-colors"
        >
          <Plus size={20} className="text-white" />
        </Link>
      }
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-base-100 dark:bg-dark-base-200 rounded-2xl flex items-center justify-center mb-4">
            <Syringe
              size={32}
              className="text-base-300 dark:text-dark-base-400"
            />
          </div>
          <p className="text-base-500 dark:text-dark-base-500 text-sm mb-4">
            {t("chemo.noSessions")}
          </p>
          <Link
            href="/chemo/add"
            className="px-6 py-3 gradient-primary text-white rounded-xl font-medium text-sm"
          >
            + {t("chemo.addSession")}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Sessions */}
          {activeSessions.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-primary-600 mb-2 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                Active Sessions
              </h2>
              {activeSessions.map((s) => (
                <Link
                  key={s.id + "-active"}
                  href={`/chemo/${s.id}`}
                  className="block card-elevated mb-2 border-l-4 border-primary-500 dark:border-dark-primary-500"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-dark-primary-100 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-primary-600">CYCLE</span>
                      <span className="text-lg font-black text-primary-700 leading-none">{s.cycleNumber}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-base-900 dark:text-dark-base-900">
                          {s.sessionDate}
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusColor(s.status)}`}>
                          {getStatusText(s.status)}
                        </span>
                      </div>
                      <p className="text-xs text-base-500 dark:text-dark-base-400 font-medium">
                        {s.hospital} · Dr. {s.doctorName}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-primary-500" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Past Sessions */}
          {pastSessions.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-base-500 dark:text-dark-base-500 mb-2 uppercase tracking-wide">
                {t("chemo.past")}
              </h2>
              <div className="space-y-2">
                {pastSessions.map((session, i) => (
                  <Link
                    key={session.id}
                    href={`/chemo/${session.id}`}
                    className="block card-elevated hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 animate-slide-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="flex items-center gap-3 opacity-75 hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 bg-base-100 dark:bg-dark-base-200 border border-base-200 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-base-600 font-bold text-sm">
                          #{session.cycleNumber}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-base-800 dark:text-dark-base-800">
                            {session.sessionDate}
                          </p>
                          {session.status === "delayed" && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-danger-50 text-danger-600">
                              Delayed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-base-400 dark:text-dark-base-500">
                          {session.hospital}
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-base-300 shrink-0"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
