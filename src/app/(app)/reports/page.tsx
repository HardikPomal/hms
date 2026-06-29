"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { Plus, Search, FileText, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllReports, searchReports } from "@/lib/db/reports";
import type { MedicalReport } from "@/types";
import { REPORT_TEMPLATES } from "@/data/reportTemplates";

export default function ReportsPage() {
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const all = await getAllReports();
      setReports(all);
    } finally {
      setLoading(false);
    }
  }

  const filtered = reports.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.templateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.hospitalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "ALL" || r.templateId === filterType;
    return matchesSearch && matchesType;
  });

  const uniqueTypes = [...new Set(reports.map((r) => r.templateId))];

  const getStatusCounts = (r: MedicalReport) => ({
    high: (r.numericFields || []).filter((f) => f.status === "high").length,
    low: (r.numericFields || []).filter((f) => f.status === "low").length,
  });

  return (
    <AppShell
      title={t("reports.title")}
      rightAction={
        <Link
          href="/reports/add"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 dark:bg-dark-primary-500 hover:bg-primary-600 transition-colors"
          aria-label={t("reports.add")}
        >
          <Plus size={20} className="text-white" />
        </Link>
      }
    >
      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-400 dark:text-dark-base-400"
        />
        <input
          type="search"
          placeholder={
            language === "gu" ? "રિપૉર્ટ શોધો..." : "Search reports..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-base-100 border border-base-200 dark:border-dark-base-200 rounded-xl text-sm outline-none focus:border-primary-400 dark:focus:border-dark-primary-400 transition-colors"
        />
      </div>

      {/* Type Filter Pills */}
      {uniqueTypes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          <button
            onClick={() => setFilterType("ALL")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterType === "ALL"
                ? "bg-primary-500 text-white"
                : "bg-base-100 dark:bg-dark-base-200 text-base-600 dark:text-dark-base-600"
            }`}
          >
            {language === "gu" ? "બધા" : "All"} ({reports.length})
          </button>
          {uniqueTypes.map((type) => {
            const template = REPORT_TEMPLATES.find((t) => t.type === type);
            const label =
              language === "gu"
                ? (template?.labelGu ?? type)
                : (template?.label ?? type);
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === type
                    ? "bg-primary-500 text-white"
                    : "bg-base-100 dark:bg-dark-base-200 text-base-600 dark:text-dark-base-600"
                }`}
              >
                {label} ({reports.filter((r) => r.templateId === type).length})
              </button>
            );
          })}
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-base-100 dark:bg-dark-base-200 rounded-2xl flex items-center justify-center mb-4">
            <FileText
              size={32}
              className="text-base-300 dark:text-dark-base-400"
            />
          </div>
          <p className="text-base-500 dark:text-dark-base-500 text-sm max-w-48">
            {searchQuery ? t("search.noResults") : t("reports.noReports")}
          </p>
          {!searchQuery && (
            <Link
              href="/reports/add"
              className="mt-4 px-6 py-3 gradient-primary text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
            >
              + {t("reports.add")}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report, i) => {
            const { high, low } = getStatusCounts(report);
            const template = REPORT_TEMPLATES.find(
              (t) => t.type === report.templateId,
            );
            const typeName =
              language === "gu"
                ? (template?.labelGu ?? report.templateId)
                : (template?.label ?? report.templateId);

            return (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="block card-elevated hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-base-100 dark:bg-dark-base-200 text-base-600 dark:text-dark-base-600 px-2 py-0.5 rounded-full font-medium">
                        {typeName}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base-900 dark:text-dark-base-900 truncate">
                      {typeName}
                    </h3>
                    <p className="text-xs text-base-400 dark:text-dark-base-400 mt-0.5">
                      {report.reportDate} · {report.hospitalName}
                    </p>
                    {report.doctorName && (
                      <p className="text-xs text-base-400 dark:text-dark-base-400">
                        Dr. {report.doctorName}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                    <ChevronRight
                      size={18}
                      className="text-base-300 dark:text-dark-base-300"
                    />
                    <div className="flex gap-1">
                      {high > 0 && (
                        <span className="text-xs badge-high px-1.5 py-0.5 rounded-full">
                          {high}↑
                        </span>
                      )}
                      {low > 0 && (
                        <span className="text-xs badge-low px-1.5 py-0.5 rounded-full">
                          {low}↓
                        </span>
                      )}
                      {high === 0 && low === 0 && (report.numericFields?.length || 0) > 0 && (
                        <span className="text-xs badge-normal px-1.5 py-0.5 rounded-full">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
