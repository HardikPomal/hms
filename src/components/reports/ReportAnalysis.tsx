"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ReportField } from "@/types";
import { getExplanation } from "@/lib/analysis/explanations";
import { DISCLAIMER } from "@/lib/analysis/explanations";
import { getAnalysisSummary } from "@/lib/analysis/analyzer";

interface ReportAnalysisProps {
  fields: ReportField[];
}

export default function ReportAnalysis({ fields }: ReportAnalysisProps) {
  const { t, language } = useLanguage();
  const summary = getAnalysisSummary(fields);
  const analyzedFields = fields.filter((f) => f.status !== "unknown");

  if (analyzedFields.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-base-900 dark:text-dark-base-900">
        {t("reports.analysis")}
      </h2>

      {/* Summary Pills */}
      <div className="flex gap-2 flex-wrap">
        {summary.high > 0 && (
          <span className="badge-high px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <TrendingUp size={14} />
            {summary.high} {t("reports.status.high")}
          </span>
        )}
        {summary.low > 0 && (
          <span className="badge-low px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <TrendingDown size={14} />
            {summary.low} {t("reports.status.low")}
          </span>
        )}
        {summary.normal > 0 && (
          <span className="badge-normal px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Minus size={14} />
            {summary.normal} {t("reports.status.normal")}
          </span>
        )}
      </div>

      {/* Field-by-Field Explanations */}
      <div className="space-y-3">
        {fields
          .filter((f) => f.status === "high" || f.status === "low")
          .map((field, i) => (
            <div
              key={i}
              className={`rounded-xl p-4 border ${
                field.status === "high"
                  ? "bg-danger-50 dark:bg-dark-danger-100 border-danger-200 dark:border-dark-danger-200"
                  : "bg-primary-50 dark:bg-dark-primary-100 border-primary-200 dark:border-dark-primary-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-base-900 dark:text-dark-base-900 text-sm">
                  {field.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-base-900 dark:text-dark-base-900">
                    {field.value} {field.unit}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      field.status === "high" ? "badge-high" : "badge-low"
                    }`}
                  >
                    {field.status === "high" ? "↑" : "↓"} {t(`reports.status.${field.status}`)}
                  </span>
                </div>
              </div>
              {(field.refMin || field.refMax) && (
                <p className="text-xs text-base-500 dark:text-dark-base-500 mb-2">
                  {language === "gu" ? "સામાન્ય:" : "Normal:"} {field.refMin}–{field.refMax} {field.unit}
                </p>
              )}
              <p className="text-sm text-base-700 dark:text-dark-base-700 leading-relaxed">
                {getExplanation(field.name, field.status, language)}
              </p>
            </div>
          ))}

        {fields.filter((f) => f.status === "normal").length > 0 && (
          <div className="rounded-xl p-4 bg-success-50 dark:bg-dark-success-100 border border-success-200 dark:border-dark-success-200">
            <p className="text-sm font-semibold text-success-700 dark:text-dark-success-700 mb-1">
              ✓ {language === "gu" ? "સામાન્ય મૂલ્ય" : "Normal Values"}
            </p>
            <p className="text-xs text-success-600 dark:text-dark-success-600">
              {fields
                .filter((f) => f.status === "normal")
                .map((f) => f.name)
                .join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl p-3 bg-base-100 dark:bg-dark-base-200 border border-base-200 dark:border-dark-base-200">
        <p className="text-xs text-base-500 dark:text-dark-base-500 leading-relaxed">
          {language === "gu" ? DISCLAIMER.gu : DISCLAIMER.en}
        </p>
      </div>
    </div>
  );
}
