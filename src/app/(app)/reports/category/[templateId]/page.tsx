"use client";

import { useState, useEffect, use } from "react";
import AppShell from "@/components/layout/AppShell";
import { ChevronRight, FileText, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDate } from "@/lib/format";
import { getAllReports } from "@/lib/db/reports";
import type { MedicalReport } from "@/types";
import { REPORT_TEMPLATES } from "@/data/reportTemplates";

export default function CategoryReportsPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const unwrappedParams = use(params);
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("All");

  const templateId = unwrappedParams.templateId;
  const template = REPORT_TEMPLATES.find((t) => t.type === templateId);
  const typeName =
    language === "gu"
      ? (template?.labelGu ?? templateId)
      : (template?.label ?? templateId);

  useEffect(() => {
    loadReports();
  }, [templateId]);

  async function loadReports() {
    try {
      const all = await getAllReports();
      // Filter by this category and sort oldest to newest
      const categoryReports = all
        .filter(r => r.templateId === templateId)
        .sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime());
      
      setReports(categoryReports);
    } finally {
      setLoading(false);
    }
  }

  const getStatusCounts = (r: MedicalReport) => ({
    high: (r.numericFields || []).filter((f) => f.status === "high").length,
    low: (r.numericFields || []).filter((f) => f.status === "low").length,
  });

  const availableYears = [
    "All",
    ...Array.from(new Set(reports.map((r) => r.reportDate.split("-")[0]))).sort(
      (a, b) => b.localeCompare(a)
    ),
  ];

  const filteredReports = reports.filter((r) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      r.hospitalName?.toLowerCase().includes(searchLower) ||
      r.doctorName?.toLowerCase().includes(searchLower);

    const matchesYear =
      selectedYear === "All" || r.reportDate.startsWith(selectedYear);

    return matchesSearch && matchesYear;
  });

  return (
    <AppShell
      title={typeName}
      showBack={true}
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-base-100 dark:bg-dark-base-200 rounded-2xl flex items-center justify-center mb-4">
            <FileText
              size={32}
              className="text-base-300 dark:text-dark-base-400"
            />
          </div>
          <p className="text-base-500 dark:text-dark-base-500 text-sm max-w-48">
            {t("reports.noReports")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400 dark:text-dark-base-400"
                size={18}
              />
              <input
                type="text"
                placeholder={
                  language === "gu"
                    ? "હોસ્પિટલ અથવા ડોક્ટર શોધો..."
                    : "Search hospital or doctor..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-base-100 border border-base-200 dark:border-dark-base-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {availableYears.length > 1 && (
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
                {availableYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                      selectedYear === year
                        ? "bg-primary-600 text-white shadow-md shadow-primary-500/20 border border-primary-600"
                        : "bg-white dark:bg-dark-base-100 text-base-600 dark:text-dark-base-400 border border-base-200 dark:border-dark-base-200 hover:border-base-300 dark:hover:border-dark-base-300"
                    }`}
                  >
                    {year === "All"
                      ? language === "gu"
                        ? "બધા"
                        : "All"
                      : year}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results List */}
          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="text-center py-8 text-base-500 dark:text-dark-base-500 text-sm font-medium">
                {language === "gu" ? "કોઈ રિપોર્ટ મળ્યો નથી." : "No reports found."}
              </div>
            ) : (
              filteredReports.map((report, i) => {
                const { high, low } = getStatusCounts(report);

                return (
                  <Link
                    key={report.id}
                    href={`/reports/${report.id}`}
                    className="block card-elevated hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
                    style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base-900 dark:text-dark-base-900 truncate mb-0.5">
                          {typeName}
                        </h3>
                        <p className="text-xs text-base-500 dark:text-dark-base-500 font-medium truncate">
                          {formatDate(report.reportDate)} · {report.hospitalName}
                        </p>
                        {report.doctorName && (
                          <p className="text-xs text-base-400 dark:text-dark-base-400 font-medium truncate mt-0.5">
                            Dr. {report.doctorName}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                        <ChevronRight
                          size={18}
                          className="text-base-300 dark:text-dark-base-400"
                        />
                        <div className="flex gap-1.5 mt-1">
                          {high > 0 && (
                            <span className="text-[11px] font-bold bg-danger-50 dark:bg-dark-danger-100 text-danger-700 dark:text-dark-danger-700 px-2 py-0.5 rounded-md border border-danger-100 dark:border-dark-danger-200">
                              {high}↑
                            </span>
                          )}
                          {low > 0 && (
                            <span className="text-[11px] font-bold bg-warning-50 dark:bg-dark-warning-100 text-warning-700 dark:text-dark-warning-700 px-2 py-0.5 rounded-md border border-warning-100 dark:border-dark-warning-200">
                              {low}↓
                            </span>
                          )}
                          {high === 0 && low === 0 && (report.numericFields?.length || 0) > 0 && (
                            <span className="text-[11px] font-bold bg-success-50 dark:bg-dark-success-100 text-success-700 dark:text-dark-success-700 px-2 py-0.5 rounded-md border border-success-100 dark:border-dark-success-200">
                              ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
