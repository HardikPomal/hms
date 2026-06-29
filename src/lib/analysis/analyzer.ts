import type { ReportField, ReportStatus, ParameterDef } from "@/types";
import { getReferenceRange } from "./referenceRanges";

// ─── Field Analysis ───────────────────────────────────────────────────────────

export function analyzeField(field: ReportField, knowledge?: ParameterDef[]): ReportStatus {
  const valueStr = field.value.trim();
  if (!valueStr) return "unknown";

  // Parse numeric value (handle ranges like "10-12", take first number)
  const numMatch = valueStr.match(/[\d.]+/);
  if (!numMatch) return "unknown";
  const value = parseFloat(numMatch[0]);
  if (isNaN(value)) return "unknown";

  // Use custom ref range if provided, else look up from database
  let min: number | undefined;
  let max: number | undefined;

  if (field.refMin !== undefined && field.refMin !== "") {
    min = parseFloat(field.refMin);
  }
  if (field.refMax !== undefined && field.refMax !== "") {
    max = parseFloat(field.refMax);
  }

  // Fallback to Knowledge Base (Active Brain)
  if (knowledge && min === undefined && max === undefined) {
    const k = knowledge.find((x) => x.name.toLowerCase().trim() === field.name.toLowerCase().trim() || x.alternativeNames?.some(n => n.toLowerCase().trim() === field.name.toLowerCase().trim()));
    if (k) {
      if (k.defaultRefMin !== undefined && k.defaultRefMin !== "") min = typeof k.defaultRefMin === 'string' ? parseFloat(k.defaultRefMin) : k.defaultRefMin;
      if (k.defaultRefMax !== undefined && k.defaultRefMax !== "") max = typeof k.defaultRefMax === 'string' ? parseFloat(k.defaultRefMax) : k.defaultRefMax;
    }
  }

  // Fall back to known reference ranges
  if (min === undefined && max === undefined) {
    const ref = getReferenceRange(field.name);
    if (ref) {
      min = ref.min;
      max = ref.max;
    }
  }

  if (min === undefined && max === undefined) return "unknown";

  if (max !== undefined && value > max) return "high";
  if (min !== undefined && value < min) return "low";
  return "normal";
}

// Analyze all fields in a report and return updated fields with status
export function analyzeReportFields(fields: ReportField[], knowledge?: ParameterDef[]): ReportField[] {
  return fields.map((field) => ({
    ...field,
    status: analyzeField(field, knowledge),
  }));
}

// Get summary counts
export function getAnalysisSummary(fields: ReportField[]): {
  high: number;
  low: number;
  normal: number;
  unknown: number;
} {
  return fields.reduce(
    (acc, f) => {
      acc[f.status]++;
      return acc;
    },
    { high: 0, low: 0, normal: 0, unknown: 0 }
  );
}
