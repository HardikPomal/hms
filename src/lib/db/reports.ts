import { getDB, generateId, nowISO } from "./db";
import type { MedicalReport, ReportTemplate, NumericField, NarrativeSection } from "@/types";

// ─── Templates ───────────────────────────────────────────────────────────────

export async function getAllTemplates(): Promise<ReportTemplate[]> {
  const db = await getDB();
  const all = await db.getAll("report_templates");
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTemplateById(id: string): Promise<ReportTemplate | undefined> {
  const db = await getDB();
  return db.get("report_templates", id);
}

export async function addTemplate(
  data: Omit<ReportTemplate, "id">
): Promise<ReportTemplate> {
  const db = await getDB();
  const template = {
    ...data,
    id: `tpl_${generateId()}`,
  } as ReportTemplate; // typecasting because discriminated union
  await db.add("report_templates", template);
  return template;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function getAllReports(): Promise<MedicalReport[]> {
  const db = await getDB();
  const reports = await db.getAllFromIndex("reports", "by-date");
  return reports.reverse(); // newest first
}

export async function getReportById(id: string): Promise<MedicalReport | undefined> {
  const db = await getDB();
  return db.get("reports", id);
}

export async function getReportsByTemplate(templateId: string): Promise<MedicalReport[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("reports", "by-template", templateId);
  return all.sort((a, b) => b.reportDate.localeCompare(a.reportDate));
}

export async function addReport(
  data: Omit<MedicalReport, "id" | "createdAt" | "updatedAt">
): Promise<MedicalReport> {
  const db = await getDB();
  const report: MedicalReport = {
    ...data,
    id: generateId(),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  await db.add("reports", report);
  return report;
}

export async function updateReport(
  id: string,
  data: Partial<MedicalReport>
): Promise<void> {
  const db = await getDB();
  const existing = await db.get("reports", id);
  if (!existing) throw new Error(`Report ${id} not found`);
  await db.put("reports", { ...existing, ...data, updatedAt: nowISO() });
}

export async function deleteReport(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("reports", id);
}

// Get historical values for a specific numeric parameter across all numeric reports
export async function getFieldHistory(
  parameterId: string
): Promise<{ date: string; value: number | string; reportId: string }[]> {
  const db = await getDB();
  // Fetch all numeric reports
  const numericReports = await db.getAllFromIndex("reports", "by-format", "numeric");
  
  const history: { date: string; value: number | string; reportId: string }[] = [];

  for (const report of numericReports) {
    if (report.numericFields) {
      const field = report.numericFields.find(
        (f) => f.parameterId === parameterId
      );
      if (field && field.value !== undefined) {
        history.push({
          date: report.reportDate,
          value: field.value,
          reportId: report.id,
        });
      }
    }
  }

  return history.sort((a, b) => a.date.localeCompare(b.date));
}

// Search reports
export async function searchReports(query: string): Promise<MedicalReport[]> {
  const all = await getAllReports();
  const q = query.toLowerCase();
  
  return all.filter((r) => {
    // Search general text fields
    if (r.hospitalName.toLowerCase().includes(q)) return true;
    if (r.doctorName.toLowerCase().includes(q)) return true;
    if (r.generalNotes.toLowerCase().includes(q)) return true;
    
    // Search narrative sections
    if (r.narrativeSections) {
      if (r.narrativeSections.some(s => s.sectionName.toLowerCase().includes(q) || s.content.toLowerCase().includes(q))) return true;
    }
    
    return false;
  });
}
