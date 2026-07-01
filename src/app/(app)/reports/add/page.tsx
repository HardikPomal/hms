"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import {
  Plus,
  Trash2,
  ChevronDown,
  Info,
  Sparkles,
  Search,
  Link as LinkIcon,
  FileText,
  FlaskConical,
  X,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { addReport } from "@/lib/db/reports";
import { updateParameter } from "@/lib/db/knowledge";
import { useKnowledgeContext } from "@/contexts/KnowledgeContext";
import { analyzeReportFields } from "@/lib/analysis/analyzer";
import { REPORT_TEMPLATES } from "@/data/reportTemplates";
import FileUpload from "@/components/ui/FileUpload";
import type { ReportField } from "@/types";
import { generateId } from "@/lib/db/db";
import { extractReportValuesFromImage } from "@/app/actions/ai";

export default function AddReportPage() {
  const { t, language } = useLanguage();
  const router = useRouter();

  const [step, setStep] = useState<"type" | "form">("type");
  const [reportType, setReportType] = useState("");
  const [reportName, setReportName] = useState("");
  const [hospital, setHospital] = useState("");
  const [doctor, setDoctor] = useState("");
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState("");
  const [fields, setFields] = useState<ReportField[]>([]);
  const [sections, setSections] = useState<
    { sectionName: string; content: string }[]
  >([]);
  const [fileData, setFileData] = useState<string | undefined>();
  const [fileName, setFileName] = useState<string | undefined>();
  const [fileType, setFileType] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const { parameters, knownTerms, refreshKnowledge } = useKnowledgeContext();

  const [linkModalTitle, setLinkModalTitle] = useState<string | null>(null);
  const [linkSearchQuery, setLinkSearchQuery] = useState("");
  const [linking, setLinking] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState<string | null>(null);

  useEffect(() => {
    const draftStr = sessionStorage.getItem("addReportDraft");
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        if (draft.step) setStep(draft.step);
        if (draft.reportType) setReportType(draft.reportType);
        if (draft.reportName) setReportName(draft.reportName);
        if (draft.hospital) setHospital(draft.hospital);
        if (draft.doctor) setDoctor(draft.doctor);
        if (draft.reportDate) setReportDate(draft.reportDate);
        if (draft.notes) setNotes(draft.notes);
        if (draft.fields) setFields(draft.fields);
        if (draft.sections) setSections(draft.sections);
        if (draft.fileData) setFileData(draft.fileData);
        if (draft.fileName) setFileName(draft.fileName);
        if (draft.fileType) setFileType(draft.fileType);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
      sessionStorage.removeItem("addReportDraft");
    }
  }, []);

  const handleResearchAndAdd = (title: string) => {
    setLinkModalTitle(title);
    setLinkSearchQuery(title);
  };

  const handleLinkKnowledge = async (parameterId: string) => {
    if (!linkModalTitle) return;
    setLinking(true);
    try {
      const param = parameters.find((p) => p.id === parameterId);
      if (param) {
        const altNames = Array.from(
          new Set([...(param.alternativeNames || []), linkModalTitle]),
        );
        await updateParameter(parameterId, { alternativeNames: altNames });
        await refreshKnowledge();
      }
      setLinkModalTitle(null);
    } catch (e) {
      console.error(e);
      alert("Failed to link knowledge.");
    } finally {
      setLinking(false);
    }
  };

  const handleCreateKnowledge = (categoryUrl: string) => {
    if (!linkModalTitle) return;
    const draft = {
      step,
      reportType,
      reportName,
      hospital,
      doctor,
      reportDate,
      notes,
      fields,
      sections,
      fileData,
      fileName,
      fileType,
    };
    sessionStorage.setItem("addReportDraft", JSON.stringify(draft));
    router.push(
      `${categoryUrl}?title=${encodeURIComponent(linkModalTitle)}&returnTo=/reports/add`,
    );
  };

  const handleAutoFill = async () => {
    if (!fileData || !fileData.startsWith("data:image") || !fields.length)
      return;
    setExtracting(true);
    try {
      const fieldNames = fields.map((f) => f.name);
      const extracted = await extractReportValuesFromImage(
        fileData,
        fieldNames,
      );

      setFields((prev) =>
        prev.map((f) => {
          if (extracted[f.name]) {
            return { ...f, value: extracted[f.name] };
          }
          return f;
        }),
      );
    } catch (e) {
      console.error(e);
      alert(
        language === "gu"
          ? "ઇમેજમાંથી ડેટા વાંચવામાં નિષ્ફળતા"
          : "Failed to auto-fill from image.",
      );
    } finally {
      setExtracting(false);
    }
  };

  const selectedTemplate = REPORT_TEMPLATES.find((t) => t.type === reportType);

  const handleSelectType = (type: string) => {
    setReportType(type);
    const template = REPORT_TEMPLATES.find((t) => t.type === type);
    if (template) {
      const name = language === "gu" ? template.labelGu : template.label;
      setReportName(name || template.label);
      if (template.format === "narrative") {
        setSections(
          template.fields.map((f) => ({
            sectionName: f.name,
            content: "",
          })),
        );
        setFields([]);
      } else {
        setFields(
          template.fields.map((f) => {
            const dbParam = parameters.find(
              (p) => p.name.toLowerCase() === f.name.toLowerCase(),
            );
            return {
              id: generateId(),
              name: dbParam ? dbParam.name : f.name,
              nameGu: dbParam ? dbParam.nameGu || f.nameGu : f.nameGu,
              value: "",
              unit: dbParam?.defaultUnit || f.unit,
              refMin: (dbParam?.defaultRefMin || f.refMin)?.toString(),
              refMax: (dbParam?.defaultRefMax || f.refMax)?.toString(),
              status: "unknown",
              notes: f.notes,
            };
          }),
        );
        setSections([]);
      }
    }
    setStep("form");
  };

  const addCustomField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: generateId(),
        name: "",
        value: "",
        unit: "",
        status: "unknown",
      },
    ]);
  };

  const addCustomSection = () => {
    setSections((prev) => [...prev, { sectionName: "", content: "" }]);
  };

  const updateField = (id: string, key: keyof ReportField, val: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: val } : f)),
    );
  };

  const updateSection = (
    idx: number,
    key: "sectionName" | "content",
    val: string,
  ) => {
    setSections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [key]: val } : s)),
    );
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const removeSection = (idx: number) => {
    setSections((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!reportType) return;
    setSaving(true);
    try {
      const isNarrative = selectedTemplate?.format === "narrative";
      const analyzed = isNarrative
        ? []
        : analyzeReportFields(fields, parameters);

      await addReport({
        templateId: reportType,
        format: isNarrative ? "narrative" : "numeric",
        hospitalName: hospital,
        doctorName: doctor,
        reportDate,
        numericFields: isNarrative
          ? undefined
          : analyzed.map((f) => ({
              parameterId: f.name,
              value: parseFloat(f.value) || f.value,
              unit: f.unit || "",
              refMin: f.refMin,
              refMax: f.refMax,
              status: f.status,
              customNotes: f.notes,
            })),
        narrativeSections: isNarrative
          ? sections.filter(
              (s) => s.sectionName.trim() !== "" || s.content.trim() !== "",
            )
          : undefined,
        generalNotes: notes,
        fileData,
        fileName,
        fileType,
      });
      router.replace("/reports");
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  // Step 1: Select Type
  if (step === "type") {
    return (
      <AppShell title={t("reports.selectTemplate")} showBack>
        <div className="space-y-2">
          {REPORT_TEMPLATES.map((template) => (
            <button
              key={template.type}
              onClick={() => handleSelectType(template.type)}
              className="w-full flex items-center justify-between p-4 card-elevated hover:border-primary-300 dark:hover:border-dark-primary-300 border border-transparent text-left transition-all active:scale-98"
            >
              <div>
                <p className="font-semibold text-base-900 dark:text-dark-base-900">
                  {language === "gu"
                    ? template.labelGu || template.label
                    : template.label}
                </p>
                {language === "en" && template.labelGu && (
                  <p className="text-xs text-base-400 dark:text-dark-base-400">
                    {template.labelGu}
                  </p>
                )}
              </div>
              <ChevronDown size={16} className="text-base-400 -rotate-90" />
            </button>
          ))}
        </div>
      </AppShell>
    );
  }

  // Step 2: Form
  return (
    <AppShell title={t("reports.add")} showBack>
      <div className="space-y-6">
        {/* SECTION 1: REPORT INFO */}
        <section className="card border border-base-200 dark:border-dark-base-200 space-y-4">
          <h2 className="text-sm font-semibold text-base-900 dark:text-dark-base-900 border-b border-base-200 dark:border-dark-base-200 pb-2">
            {t("reports.reportName")} & {t("reports.reportDate")}
          </h2>
          <div>
            <label className="text-sm font-medium text-base-700 dark:text-dark-base-700 block mb-1.5">
              {t("reports.reportName")}
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-dark-base-100 border border-base-200 dark:border-dark-base-200 rounded-xl text-sm outline-none focus:border-primary-400 dark:focus:border-dark-primary-400 transition-colors"
            />
            {selectedTemplate?.suggestions &&
              selectedTemplate.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTemplate.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReportName(suggestion)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-base-100 dark:bg-dark-base-200 text-base-600 dark:text-dark-base-500 hover:bg-primary-50 dark:hover:bg-dark-primary-200 hover:text-primary-600 dark:hover:text-dark-primary-500 border border-transparent hover:border-primary-200 dark:hover:border-dark-primary-300 transition-all text-left"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-medium text-base-700 dark:text-dark-base-700 block mb-1.5">
              {t("reports.reportDate")} *
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-dark-base-100 border border-base-200 dark:border-dark-base-200 rounded-xl text-sm outline-none focus:border-primary-400 transition-colors"
            />
          </div>

          {/* Hospital */}
          <div>
            <label className="text-sm font-medium text-base-700 dark:text-dark-base-700 block mb-1.5">
              {t("reports.hospital")}
            </label>
            <input
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-dark-base-100 border border-base-200 dark:border-dark-base-200 rounded-xl text-sm outline-none focus:border-primary-400 transition-colors"
            />
          </div>

          {/* Doctor */}
          <div>
            <label className="text-sm font-medium text-base-700 dark:text-dark-base-700 block mb-1.5">
              {t("reports.doctor")}
            </label>
            <input
              type="text"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-dark-base-100 border border-base-200 dark:border-dark-base-200 rounded-xl text-sm outline-none focus:border-primary-400 transition-colors"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="text-sm font-medium text-base-700 dark:text-dark-base-700 block mb-1.5">
              {t("reports.uploadFile")} ({t("common.optional")})
            </label>
            <FileUpload
              onFileLoad={(data, name, type) => {
                setFileData(data);
                setFileName(name);
                setFileType(type);
              }}
              currentFile={
                fileName ? { name: fileName, type: fileType ?? "" } : null
              }
              onClear={() => {
                setFileData(undefined);
                setFileName(undefined);
                setFileType(undefined);
              }}
            />
            {fileData && fileData.startsWith("data:image") && (
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={extracting}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-primary-50 dark:bg-dark-primary-100 text-primary-600 dark:text-dark-primary-600 border border-primary-200 dark:border-dark-primary-300 rounded-xl text-sm font-semibold hover:bg-primary-100 dark:hover:bg-dark-primary-200 transition-colors disabled:opacity-50"
              >
                <Sparkles size={16} />
                {extracting
                  ? language === "gu"
                    ? "સ્કેન કરી રહ્યા છીએ..."
                    : "Scanning image..."
                  : language === "gu"
                    ? "ઇમેજમાંથી ઓટો-ફિલ"
                    : "Auto-fill from Image"}
              </button>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-base-700 dark:text-dark-base-700 block mb-1.5">
              {t("reports.notes")} ({t("common.optional")})
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-white dark:bg-dark-base-100 border border-base-200 dark:border-dark-base-200 rounded-xl text-sm outline-none focus:border-primary-400 transition-colors resize-none"
            />
          </div>
        </section>

        {/* SECTION 2: REPORT FIELDS OR NARRATIVE SECTIONS */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-base-900 dark:text-dark-base-900 mb-2 px-1">
            {selectedTemplate?.format === "narrative"
              ? "Narrative Sections"
              : t("reports.fields")}
          </h2>

          {selectedTemplate?.format === "narrative" ? (
            <div className="space-y-4">
              {sections.map((section, idx) => (
                <div
                  key={idx}
                  className="card border border-base-200 dark:border-dark-base-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="text"
                      value={section.sectionName}
                      onChange={(e) =>
                        updateSection(idx, "sectionName", e.target.value)
                      }
                      placeholder="Section Name"
                      className="font-bold text-base-900 dark:text-dark-base-900 bg-transparent outline-none border-b-2 border-transparent focus:border-primary-500 transition-colors w-full max-w-[250px]"
                    />
                    <button
                      type="button"
                      onClick={() => removeSection(idx)}
                      className="p-2 text-danger-500 bg-danger-50 hover:bg-danger-100 dark:bg-dark-danger-200 dark:hover:bg-dark-danger-300 rounded-xl transition-colors flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea
                    value={section.content}
                    onChange={(e) =>
                      updateSection(idx, "content", e.target.value)
                    }
                    placeholder="Enter details..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-sm border-2 border-base-200 dark:border-dark-base-200 bg-white dark:bg-dark-base-100 outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addCustomSection}
                className="w-full py-3 border-2 border-dashed border-base-300 dark:border-dark-base-300 rounded-xl text-sm text-base-500 dark:text-dark-base-500 hover:border-primary-400 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Section
              </button>
            </div>
          ) : (
            <>
              {fields.length > 0 && (
                <div className="space-y-3">
                  {fields.map((field) => {
                    const knownParam = parameters.find((p) => p.name.toLowerCase() === field.name.trim().toLowerCase());
                    const templateParam = selectedTemplate?.fields.find((tf) => tf.name === field.name);
                    const isKnownField = !!templateParam || !!knownParam;
                    
                    const displayUnit = field.unit || knownParam?.metadata?.unit || knownParam?.defaultUnit || knownParam?.unit || templateParam?.unit || "";
                    const displayMin = field.refMin || knownParam?.metadata?.refMin || knownParam?.defaultRefMin || knownParam?.refMin || templateParam?.refMin || "";
                    const displayMax = field.refMax || knownParam?.metadata?.refMax || knownParam?.defaultRefMax || knownParam?.refMax || templateParam?.refMax || "";
                    
                    return (
                    <div
                      key={field.id}
                      className="card border border-base-200 dark:border-dark-base-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-3">
                          {/* Field Name */}
                          {isKnownField ? (
                            <div className="font-bold text-base-900 dark:text-dark-base-900 border-b-2 border-base-100 dark:border-dark-base-200 pb-2 mb-1">
                              {field.name}
                            </div>
                          ) : (
                            <div className="relative">
                              <label className="text-xs font-bold text-base-500 dark:text-dark-base-500 block mb-1 uppercase tracking-wide">
                                {t("reports.fieldName")}
                              </label>
                              <input
                                type="text"
                                placeholder={t("reports.fieldName")}
                                value={field.name}
                                onChange={(e) => {
                                  updateField(field.id, "name", e.target.value);
                                  setShowSuggestions(field.id);
                                }}
                                onFocus={() => setShowSuggestions(field.id)}
                                onBlur={() =>
                                  setTimeout(
                                    () => setShowSuggestions(null),
                                    200,
                                  )
                                }
                                className="w-full px-3 py-2.5 rounded-xl text-sm font-medium border-2 border-base-200 dark:border-dark-base-200 bg-white dark:bg-dark-base-100 outline-none focus:border-primary-500 transition-colors"
                              />

                              {showSuggestions === field.id && field.name && (
                                <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white dark:bg-dark-base-100 border border-base-200 dark:border-dark-base-200 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden">
                                  {parameters
                                    .filter((p) =>
                                      p.name
                                        .toLowerCase()
                                        .includes(field.name.toLowerCase()),
                                    )
                                    .map((p) => (
                                      <button
                                        key={p.id}
                                        type="button"
                                        onMouseDown={(e) => {
                                          // Prevent onBlur from firing before click
                                          e.preventDefault();
                                        }}
                                        onClick={() => {
                                          updateField(field.id, "name", p.name);
                                          const unit = p.metadata?.unit || p.defaultUnit || p.unit;
                                          const min = p.metadata?.refMin ?? p.defaultRefMin ?? p.refMin;
                                          const max = p.metadata?.refMax ?? p.defaultRefMax ?? p.refMax;
                                          
                                          if (unit !== undefined) updateField(field.id, "unit", unit);
                                          if (min !== undefined) updateField(field.id, "refMin", String(min));
                                          if (max !== undefined) updateField(field.id, "refMax", String(max));
                                          setShowSuggestions(null);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-base-50 dark:hover:bg-dark-base-200 text-sm border-b border-base-100 dark:border-dark-base-200 last:border-0"
                                      >
                                        <span className="font-medium text-base-900 dark:text-dark-base-900">
                                          {p.name}
                                        </span>
                                        {p.unit && (
                                          <span className="text-xs text-base-400 dark:text-dark-base-400 ml-2">
                                            ({p.unit})
                                          </span>
                                        )}
                                      </button>
                                    ))}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-start gap-4">
                            {/* Value Input */}
                            <div className="flex-1">
                              <label className="text-xs font-bold text-primary-600 dark:text-dark-primary-600 block mb-1 uppercase tracking-wide">
                                {t("reports.fieldValue")}
                              </label>
                              <input
                                type="text"
                                placeholder="0.0"
                                value={field.value}
                                onChange={(e) =>
                                  updateField(field.id, "value", e.target.value)
                                }
                                className="w-full px-3 py-2.5 rounded-xl text-sm font-bold border-2 border-primary-200 dark:border-dark-primary-300 bg-primary-50 dark:bg-dark-primary-100 outline-none focus:border-primary-500 transition-colors"
                              />
                            </div>

                            {/* Details (Unit & Range) */}
                            {isKnownField ? (
                              <div className="flex-1 pt-5">
                                <div className="text-sm font-bold text-base-700 dark:text-dark-base-700">
                                  {displayUnit}
                                </div>
                                {(displayMin || displayMax) && (
                                  <div className="text-xs font-medium text-base-500 dark:text-dark-base-500 mt-0.5">
                                    Normal: {displayMin} - {displayMax}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex-1">
                                <label className="text-xs font-bold text-base-500 dark:text-dark-base-500 block mb-1 uppercase tracking-wide">
                                  {t("reports.fieldUnit")}
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. g/dL"
                                  value={field.unit ?? ""}
                                  onChange={(e) =>
                                    updateField(
                                      field.id,
                                      "unit",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-3 py-2.5 rounded-xl text-sm font-medium border-2 border-base-200 dark:border-dark-base-200 bg-white dark:bg-dark-base-100 outline-none focus:border-primary-500 transition-colors"
                                />
                              </div>
                            )}
                          </div>

                          {/* Custom Reference Range */}
                          {!isKnownField && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-bold text-base-500 dark:text-dark-base-500 block mb-1 uppercase tracking-wide">
                                  {t("reports.refMin")}
                                </label>
                                <input
                                  type="text"
                                  value={field.refMin ?? ""}
                                  onChange={(e) =>
                                    updateField(
                                      field.id,
                                      "refMin",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-3 py-2.5 rounded-xl text-sm font-medium border-2 border-base-200 dark:border-dark-base-200 bg-white dark:bg-dark-base-100 outline-none focus:border-primary-500 transition-colors"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-base-500 dark:text-dark-base-500 block mb-1 uppercase tracking-wide">
                                  {t("reports.refMax")}
                                </label>
                                <input
                                  type="text"
                                  value={field.refMax ?? ""}
                                  onChange={(e) =>
                                    updateField(
                                      field.id,
                                      "refMax",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-3 py-2.5 rounded-xl text-sm font-medium border-2 border-base-200 dark:border-dark-base-200 bg-white dark:bg-dark-base-100 outline-none focus:border-primary-500 transition-colors"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Remove button for custom fields */}
                        {!selectedTemplate?.fields.some(
                          (tf) => tf.name === field.name,
                        ) && (
                          <button
                            type="button"
                            onClick={() => removeField(field.id)}
                            className="mt-1 p-2 text-danger-500 bg-danger-50 hover:bg-danger-100 dark:bg-dark-danger-200 dark:hover:bg-dark-danger-300 rounded-xl transition-colors flex items-center justify-center"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>

                      {/* Knowledge Prompt */}
                      {field.name.trim() &&
                        !knownTerms.includes(
                          field.name.toLowerCase().trim(),
                        ) && (
                          <div className="mt-4 p-3 bg-secondary-50 dark:bg-dark-secondary-100 border-2 border-secondary-200 dark:border-dark-secondary-300 rounded-xl flex items-center justify-between gap-3 animate-in fade-in zoom-in duration-300">
                            <p className="text-xs font-bold text-secondary-800 dark:text-dark-secondary-800 flex items-center gap-1.5">
                              <Info size={14} className="shrink-0" />"
                              {field.name}" is not in the Brain.
                            </p>
                            <button
                              type="button"
                              onClick={() => handleResearchAndAdd(field.name)}
                              className="px-3 py-1.5 bg-secondary-500 text-white text-xs font-bold rounded-lg hover:bg-secondary-600 transition-colors shrink-0"
                            >
                              Research & Add
                            </button>
                          </div>
                        )}
                    </div>
                  )})}
                </div>
              )}

              {/* Add Custom Field */}
              <button
                type="button"
                onClick={addCustomField}
                className="w-full py-3 border-2 border-dashed border-base-300 dark:border-dark-base-300 rounded-xl text-sm text-base-500 dark:text-dark-base-500 hover:border-primary-400 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                {t("reports.addField")}
              </button>
            </>
          )}
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || !reportDate}
          className="w-full py-4 gradient-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mb-8"
        >
          {saving ? t("common.loading") : t("common.save")}
        </button>
      </div>
      {/* Link Knowledge Modal */}
      {linkModalTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-base-100 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b-2 border-base-100 dark:border-dark-base-200 flex justify-between items-center shrink-0">
              <h2 className="font-bold text-lg text-base-900 dark:text-dark-base-900 flex items-center gap-2">
                <LinkIcon size={20} className="text-primary-500" />
                Link "{linkModalTitle}"
              </h2>
              <button
                onClick={() => setLinkModalTitle(null)}
                className="p-2 text-base-500 hover:text-base-900 dark:text-dark-base-500 dark:hover:text-dark-base-900 rounded-full hover:bg-base-100 dark:hover:bg-dark-base-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-6">
              {/* Search Existing */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-base-600 dark:text-dark-base-600">
                  Search Existing Brain
                </h3>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400"
                  />
                  <input
                    type="text"
                    placeholder="Search existing parameters..."
                    value={linkSearchQuery}
                    onChange={(e) => setLinkSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-base-50 dark:bg-dark-base-200 border-2 border-base-200 dark:border-dark-base-300 rounded-xl text-sm font-medium outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                <div className="max-h-[150px] overflow-y-auto space-y-2 pr-1">
                  {parameters
                    .filter(
                      (p) =>
                        p.name
                          .toLowerCase()
                          .includes(linkSearchQuery.toLowerCase()) ||
                        (p.alternativeNames || []).some((a: string) =>
                          a
                            .toLowerCase()
                            .includes(linkSearchQuery.toLowerCase()),
                        ),
                    )
                    .slice(0, 5)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-base-200 dark:border-dark-base-300 hover:border-primary-300 dark:hover:border-dark-primary-300 bg-white dark:bg-dark-base-100 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-sm text-base-900 dark:text-dark-base-900">
                            {p.name}
                          </p>
                          <p className="text-xs text-base-500 capitalize">
                            {p.category.replace("_", " ")}
                          </p>
                        </div>
                        <button
                          onClick={() => handleLinkKnowledge(p.id)}
                          disabled={linking}
                          className="px-3 py-1.5 bg-primary-100 text-primary-700 dark:bg-dark-primary-200 dark:text-dark-primary-700 text-xs font-bold rounded-lg hover:bg-primary-200 transition-colors"
                        >
                          Link
                        </button>
                      </div>
                    ))}
                  {parameters.filter(
                    (p) =>
                      p.name
                        .toLowerCase()
                        .includes(linkSearchQuery.toLowerCase()) ||
                      (p.alternativeNames || []).some((a: string) =>
                        a.toLowerCase().includes(linkSearchQuery.toLowerCase()),
                      ),
                  ).length === 0 && (
                    <p className="text-center text-sm text-base-400 py-4">
                      No matching terms found.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-px bg-base-200 dark:bg-dark-base-300 flex-1"></div>
                <span className="text-xs font-bold text-base-400 uppercase tracking-widest">
                  OR
                </span>
                <div className="h-px bg-base-200 dark:bg-dark-base-300 flex-1"></div>
              </div>

              {/* Add New Knowledge */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-base-600 dark:text-dark-base-600">
                  Add New Knowledge
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      handleCreateKnowledge("/knowledge/add/lab-parameter")
                    }
                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-base-200 dark:border-dark-base-300 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-dark-primary-100 transition-colors text-left"
                  >
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg shrink-0">
                      <FlaskConical size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-base-900 dark:text-dark-base-900">
                        Lab Parameter
                      </p>
                      <p className="text-xs text-base-500">
                        Normal ranges, uses
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleCreateKnowledge("/knowledge/add")}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-base-200 dark:border-dark-base-300 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-dark-primary-100 transition-colors text-left"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-base-900 dark:text-dark-base-900">
                        Generic Term
                      </p>
                      <p className="text-xs text-base-500">
                        Any other medical info
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
