"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllReports } from "@/lib/db/reports";
import type { MedicalReport, ReportField } from "@/types";
import { DISCLAIMER } from "@/lib/analysis/explanations";

interface FieldSummary {
  fieldName: string;
  reportType: string;
  latestValue: string;
  latestDate: string;
  latestStatus: string;
  trend: "improving" | "worsening" | "stable" | "single";
  previousValue?: string;
}

function computeTrend(history: { value: string; date: string; status: string }[]): "improving" | "worsening" | "stable" | "single" {
  if (history.length < 2) return "single";
  const nums = history.map((h) => parseFloat(h.value));
  if (nums.some(isNaN)) return "stable";
  const last = nums[nums.length - 1];
  const prev = nums[nums.length - 2];
  if (Math.abs(last - prev) < 0.01) return "stable";
  const lastStatus = history[history.length - 1].status;
  if (lastStatus === "normal") return "improving";
  if (lastStatus === "high" || lastStatus === "low") {
    return last > prev ? (lastStatus === "high" ? "worsening" : "improving") : (lastStatus === "high" ? "improving" : "worsening");
  }
  return "stable";
}

export default function SummaryPage() {
  const { t, language } = useLanguage();
  const [summaries, setSummaries] = useState<FieldSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function compute() {
      const reports = await getAllReports();
      const fieldMap: Record<string, { value: string; date: string; status: string; reportType: string }[]> = {};

      for (const r of reports) {
        for (const f of (r.numericFields || [])) {
          if (!f.value) continue;
          const key = `${r.templateId}::${f.parameterId.toLowerCase()}`;
          if (!fieldMap[key]) fieldMap[key] = [];
          fieldMap[key].push({ value: String(f.value), date: r.reportDate, status: f.status, reportType: r.templateId });
        }
      }

      const result: FieldSummary[] = [];
      for (const [key, history] of Object.entries(fieldMap)) {
        const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
        const latest = sorted[sorted.length - 1];
        const prev = sorted[sorted.length - 2];
        const [reportType, ...nameParts] = key.split("::");
        result.push({
          fieldName: nameParts.join("::"),
          reportType,
          latestValue: latest.value,
          latestDate: latest.date,
          latestStatus: latest.status,
          trend: computeTrend(sorted),
          previousValue: prev?.value,
        });
      }
      setSummaries(result);
      setLoading(false);
    }
    compute().catch(() => setLoading(false));
  }, []);

  const improving = summaries.filter((s) => s.trend === "improving" || (s.trend === "single" && s.latestStatus === "normal"));
  const worsening = summaries.filter((s) => s.trend === "worsening" || (s.trend === "single" && (s.latestStatus === "high" || s.latestStatus === "low")));
  const stable = summaries.filter((s) => s.trend === "stable");

  const SummaryCard = ({ item }: { item: FieldSummary }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-base-100 dark:border-dark-base-200 last:border-0">
      <div>
        <p className="text-sm font-medium text-base-900 dark:text-dark-base-900 capitalize">{item.fieldName}</p>
        <p className="text-xs text-base-400">{item.reportType} · {item.latestDate}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-base-900 dark:text-dark-base-900">{item.latestValue}</p>
        {item.previousValue && (
          <p className="text-xs text-base-400">{language === "gu" ? "પ:" : "Prev:"} {item.previousValue}</p>
        )}
      </div>
    </div>
  );

  return (
    <AppShell title={t("summary.title")}>
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : summaries.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-base-500 text-sm">{t("summary.noData")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {improving.length > 0 && (
            <div className="card-elevated border-l-4 border-success-400">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} className="text-success-600" />
                <h2 className="font-semibold text-success-700 dark:text-dark-success-700">{t("summary.improving")} ({improving.length})</h2>
              </div>
              {improving.map((item) => <SummaryCard key={`${item.reportType}-${item.fieldName}`} item={item} />)}
            </div>
          )}

          {worsening.length > 0 && (
            <div className="card-elevated border-l-4 border-danger-400">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={18} className="text-danger-600" />
                <h2 className="font-semibold text-danger-700 dark:text-dark-danger-700">{t("summary.declining")} ({worsening.length})</h2>
              </div>
              {worsening.map((item) => <SummaryCard key={`${item.reportType}-${item.fieldName}`} item={item} />)}
              <div className="mt-3 p-2 bg-danger-50 dark:bg-dark-danger-100 rounded-lg">
                <p className="text-xs text-danger-600 font-medium">💬 {t("summary.discussWithDoctor")}</p>
              </div>
            </div>
          )}

          {stable.length > 0 && (
            <div className="card-elevated border-l-4 border-base-300">
              <div className="flex items-center gap-2 mb-3">
                <Minus size={18} className="text-base-500" />
                <h2 className="font-semibold text-base-600 dark:text-dark-base-600">{t("summary.stable")} ({stable.length})</h2>
              </div>
              {stable.map((item) => <SummaryCard key={`${item.reportType}-${item.fieldName}`} item={item} />)}
            </div>
          )}

          <div className="p-3 bg-base-100 dark:bg-dark-base-200 rounded-xl">
            <p className="text-xs text-base-500 dark:text-dark-base-500">{language === "gu" ? DISCLAIMER.gu : DISCLAIMER.en}</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
