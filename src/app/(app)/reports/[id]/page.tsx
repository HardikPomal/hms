"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { Trash2, TrendingUp, FileImage } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getReportById, deleteReport, getFieldHistory } from "@/lib/db/reports";
import type { MedicalReport } from "@/types";
import FieldRow from "@/components/reports/FieldRow";
import ReportAnalysis from "@/components/reports/ReportAnalysis";
import ReportSuggestions from "@/components/reports/ReportSuggestions";
import { REPORT_TEMPLATES } from "@/data/reportTemplates";

export default function ReportDetailPage() {
  const { t, language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<MedicalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"values" | "analysis" | "suggestions" | "file">("values");

  useEffect(() => {
    getReportById(id).then((r) => {
      setReport(r ?? null);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    await deleteReport(id);
    router.replace("/reports");
  };

  if (loading) {
    return (
      <AppShell showBack>
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!report) {
    return (
      <AppShell showBack title="Not Found">
        <p className="text-base-400 text-center py-8">{t("common.noData")}</p>
      </AppShell>
    );
  }

  const template = REPORT_TEMPLATES.find((tp) => tp.type === report.templateId);
  const typeName =
    language === "gu"
      ? template?.labelGu ?? report.templateId
      : template?.label ?? report.templateId;

  const hasFile = !!report.fileData;
  const tabs = [
    { key: "values" as const, label: language === "gu" ? "મૂલ્ય" : "Values" },
    { key: "analysis" as const, label: language === "gu" ? "વિશ્લેષણ" : "Analysis" },
    { key: "suggestions" as const, label: language === "gu" ? "સૂચનો" : "Suggestions" },
    ...(hasFile ? [{ key: "file" as const, label: language === "gu" ? "ફાઇલ" : "File" }] : []),
  ];

  return (
    <AppShell
      title={typeName}
      showBack
      rightAction={
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-danger-50 dark:hover:bg-dark-danger-100 transition-colors"
        >
          <Trash2 size={18} className="text-danger-500" />
        </button>
      }
    >
      {/* Report Meta */}
      <div className="card-elevated mb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="text-xs bg-primary-100 dark:bg-dark-primary-100 text-primary-700 dark:text-dark-primary-700 px-2 py-1 rounded-full font-medium">
            {typeName}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-base-400 dark:text-dark-base-400">{t("reports.reportDate")}</p>
            <p className="font-medium text-base-900 dark:text-dark-base-900">{report.reportDate}</p>
          </div>
          {report.hospitalName && (
            <div>
              <p className="text-xs text-base-400 dark:text-dark-base-400">{t("reports.hospital")}</p>
              <p className="font-medium text-base-900 dark:text-dark-base-900">{report.hospitalName}</p>
            </div>
          )}
          {report.doctorName && (
            <div>
              <p className="text-xs text-base-400 dark:text-dark-base-400">{t("reports.doctor")}</p>
              <p className="font-medium text-base-900 dark:text-dark-base-900">Dr. {report.doctorName}</p>
            </div>
          )}
        </div>
        {report.generalNotes && (
          <div className="mt-2 pt-2 border-t border-base-100 dark:border-dark-base-200">
            <p className="text-xs text-base-500 dark:text-dark-base-500">{report.generalNotes}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-base-100 dark:bg-dark-base-200 rounded-xl p-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white dark:bg-dark-base-100 text-base-900 dark:text-dark-base-900 shadow-sm"
                : "text-base-500 dark:text-dark-base-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "values" && (
        <div className="card-elevated">
          {report.format === "narrative" ? (
            (!report.narrativeSections || report.narrativeSections.length === 0) ? (
              <p className="text-sm text-base-400 text-center py-4">{t("common.noData")}</p>
            ) : (
              <div className="space-y-6">
                {report.narrativeSections.map((section, idx) => (
                  <div key={idx} className="border-b border-base-100 dark:border-dark-base-200 pb-4 last:border-0 last:pb-0">
                    <h3 className="text-sm font-bold text-base-900 dark:text-dark-base-900 mb-2 uppercase tracking-wide">
                      {section.sectionName}
                    </h3>
                    <p className="text-sm text-base-700 dark:text-dark-base-700 whitespace-pre-wrap leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            )
          ) : (
            (!report.numericFields || report.numericFields.length === 0) ? (
              <p className="text-sm text-base-400 text-center py-4">{t("common.noData")}</p>
            ) : (
              report.numericFields.map((field, idx) => (
                <FieldRow 
                  key={field.parameterId || idx} 
                  name={field.parameterId} 
                  value={String(field.value)} 
                  unit={field.unit} 
                  refMin={field.refMin ? String(field.refMin) : undefined} 
                  refMax={field.refMax ? String(field.refMax) : undefined} 
                  status={field.status} 
                  notes={field.customNotes} 
                />
              ))
            )
          )}
        </div>
      )}

      {activeTab === "analysis" && (
        <ReportAnalysis 
          fields={(report.numericFields || []).map(f => ({
            id: f.parameterId,
            name: f.parameterId,
            value: String(f.value),
            unit: f.unit,
            refMin: f.refMin ? String(f.refMin) : undefined,
            refMax: f.refMax ? String(f.refMax) : undefined,
            status: f.status,
            notes: f.customNotes
          }))} 
        />
      )}

      {activeTab === "suggestions" && (
        <ReportSuggestions 
          fields={(report.numericFields || []).map(f => ({
            id: f.parameterId,
            name: f.parameterId,
            value: String(f.value),
            unit: f.unit,
            refMin: f.refMin ? String(f.refMin) : undefined,
            refMax: f.refMax ? String(f.refMax) : undefined,
            status: f.status,
            notes: f.customNotes
          }))} 
        />
      )}

      {activeTab === "file" && report.fileData && (
        <div className="card-elevated">
          {report.fileType === "image" ? (
            <img
              src={report.fileData}
              alt={report.fileName}
              className="w-full rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-8">
              <FileImage size={48} className="text-base-300" />
              <p className="text-sm text-base-600 dark:text-dark-base-600">{report.fileName}</p>
              <a
                href={report.fileData}
                download={report.fileName}
                className="px-4 py-2 gradient-primary text-white rounded-lg text-sm font-medium"
              >
                {language === "gu" ? "ડાઉનલોડ" : "Download"} PDF
              </a>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <div className="bg-white dark:bg-dark-base-100 rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="font-semibold text-base-900 dark:text-dark-base-900 mb-2">
              {t("reports.deleteConfirm")}
            </h3>
            <p className="text-sm text-base-500 mb-4">
              {typeName}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-base-100 dark:bg-dark-base-200 rounded-xl text-sm font-medium"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-danger-500 text-white rounded-xl text-sm font-medium"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
