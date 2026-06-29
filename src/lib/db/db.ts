import { openDB, DBSchema, IDBPDatabase } from "idb";
import type {
  MedicalReport,
  ChemoSession,
  Medicine,
  MedicineLog,
  AppSettings,
  ParameterDef,
  KnowledgeEntry,
  ReportTemplate,
  EntityRelationship
} from "@/types";

// ─── Database Schema ─────────────────────────────────────────────────────────

interface SwasthyaSathiDB extends DBSchema {
  parameters: {
    key: string;
    value: ParameterDef;
    indexes: {
      "by-name": string;
      "by-category": string;
      "by-status": string;
    };
  };
  knowledge_base: {
    key: string;
    value: KnowledgeEntry;
    indexes: {
      "by-parameter": string;
      "by-category": string;
    };
  };
  report_templates: {
    key: string;
    value: ReportTemplate;
    indexes: {
      "by-type": string;
    };
  };
  relationships: {
    key: string;
    value: EntityRelationship;
    indexes: {
      "by-source": string;
      "by-target": string;
      "by-type": string;
    };
  };
  reports: {
    key: string;
    value: MedicalReport;
    indexes: {
      "by-date": string;
      "by-template": string;
      "by-format": string;
    };
  };
  chemo_sessions: {
    key: string;
    value: ChemoSession;
    indexes: {
      "by-date": string;
      "by-cycle": number;
    };
  };
  medicines: {
    key: string;
    value: Medicine;
    indexes: {
      "by-active": number;
      "by-name": string;
    };
  };
  medicine_logs: {
    key: string;
    value: MedicineLog;
    indexes: {
      "by-date": string;
      "by-medicine": string;
      "by-status": string;
    };
  };
  settings: {
    key: string;
    value: { key: string; value: unknown };
  };
  // Archived store for fallback
  knowledge_archive: {
    key: string;
    value: any;
  };
}

const DB_NAME = "swasthya-sathi-db";
const DB_VERSION = 3; // Bumped to v3 for Chemo Session Workflow Redesign

let dbInstance: IDBPDatabase<SwasthyaSathiDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<SwasthyaSathiDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<SwasthyaSathiDB>(DB_NAME, DB_VERSION, {
    async upgrade(db, oldVersion, newVersion, transaction) {
      
      // 1. Ensure all standard stores exist
      if (!db.objectStoreNames.contains("chemo_sessions")) {
        const chemo = db.createObjectStore("chemo_sessions", { keyPath: "id" });
        chemo.createIndex("by-date", "sessionDate");
        chemo.createIndex("by-cycle", "cycleNumber");
      }
      if (!db.objectStoreNames.contains("medicines")) {
        const medicines = db.createObjectStore("medicines", { keyPath: "id" });
        medicines.createIndex("by-active", "isActive");
        medicines.createIndex("by-name", "name");
      }
      if (!db.objectStoreNames.contains("medicine_logs")) {
        const logs = db.createObjectStore("medicine_logs", { keyPath: "id" });
        logs.createIndex("by-date", "scheduledDate");
        logs.createIndex("by-medicine", "medicineId");
        logs.createIndex("by-status", "status");
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }

      // v2 stores
      if (!db.objectStoreNames.contains("parameters")) {
        const params = db.createObjectStore("parameters", { keyPath: "id" });
        params.createIndex("by-name", "name");
        params.createIndex("by-category", "category");
        params.createIndex("by-status", "knowledgeStatus");
      }
      if (!db.objectStoreNames.contains("knowledge_base")) {
        const kb = db.createObjectStore("knowledge_base", { keyPath: "id" });
        kb.createIndex("by-parameter", "parameterId");
        kb.createIndex("by-category", "category");
      }
      if (!db.objectStoreNames.contains("report_templates")) {
        const templates = db.createObjectStore("report_templates", { keyPath: "id" });
        templates.createIndex("by-type", "type");
      }
      if (!db.objectStoreNames.contains("relationships")) {
        const rels = db.createObjectStore("relationships", { keyPath: "id" });
        rels.createIndex("by-source", "sourceId");
        rels.createIndex("by-target", "targetId");
        rels.createIndex("by-type", "relationType");
      }
      if (!db.objectStoreNames.contains("knowledge_archive")) {
        db.createObjectStore("knowledge_archive", { keyPath: "id" });
      }
      
      // Update reports indexes
      if (!db.objectStoreNames.contains("reports")) {
        const reports = db.createObjectStore("reports", { keyPath: "id" });
        reports.createIndex("by-date", "reportDate");
        reports.createIndex("by-template", "templateId");
        reports.createIndex("by-format", "format");
      } else {
        const reports = transaction.objectStore("reports") as any;
        if (!reports.indexNames.contains("by-template")) reports.createIndex("by-template", "templateId");
        if (!reports.indexNames.contains("by-format")) reports.createIndex("by-format", "format");
      }

      // ─── MIGRATION LOGIC v1 -> v2 ──────────────────────────────────────────
      if (oldVersion === 1) {
        if (db.objectStoreNames.contains("knowledge" as any)) {
          const oldKbStore = transaction.objectStore("knowledge" as any);
          const archiveStore = transaction.objectStore("knowledge_archive" as any);
          const allOldKnowledge = await oldKbStore.getAll();
          
          const paramStore = transaction.objectStore("parameters");
          const newKbStore = transaction.objectStore("knowledge_base");
          const relStore = transaction.objectStore("relationships");

          for (const old of allOldKnowledge) {
            // Archive original data
            await archiveStore.put(old);

            // Generate Parameter
            const paramId = `param_${old.id}`;
            const param: ParameterDef = {
              id: paramId,
              name: old.title || "Unknown",
              alternativeNames: old.titleGu ? [old.titleGu] : [],
              category: old.category || "general",
              defaultUnit: old.unit,
              defaultRefMin: old.refMin,
              defaultRefMax: old.refMax,
              knowledgeStatus: "advanced", 
              createdAt: old.createdAt || new Date().toISOString(),
              updatedAt: old.updatedAt || new Date().toISOString()
            };
            await paramStore.put(param);

            // Generate KnowledgeEntry
            const newKb: KnowledgeEntry = {
              id: `kb_${old.id}`,
              parameterId: paramId,
              simpleMeaning: old.title || "",
              whyImportant: old.importance || old.importanceGu || "",
              normalRangeText: old.normalRange || "",
              detailedDescription: old.content + (old.contentGu ? `\n\n${old.contentGu}` : ""),
              source: "Migration from v1",
              doctorNotes: "",
              personalNotes: "",
              references: [],
              tags: old.tags || [],
              versionHistory: [{ date: new Date().toISOString(), changes: "Migrated to v2" }],
              createdAt: old.createdAt || new Date().toISOString(),
              updatedAt: old.updatedAt || new Date().toISOString()
            };
            await newKbStore.put(newKb);

            // Generate Relationships
            if (old.relatedIds && Array.isArray(old.relatedIds)) {
              for (const relId of old.relatedIds) {
                const rel: EntityRelationship = {
                  id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  sourceId: paramId,
                  sourceType: "parameter",
                  targetId: relId.startsWith("param_") ? relId : `param_${relId}`,
                  targetType: "parameter",
                  relationType: "related_to",
                  createdAt: new Date().toISOString()
                };
                await relStore.put(rel);
              }
            }
          }
          
          // Delete old store to clean up, since we backed it up to knowledge_archive
          db.deleteObjectStore("knowledge" as any);
        }
        
        // Migrate "reports" structure
        if (db.objectStoreNames.contains("reports" as any)) {
          const reportStore = transaction.objectStore("reports" as any);
          const allReports = await reportStore.getAll();
          for (const oldReport of allReports) {
            // Check if it's already in the new format (has templateId)
            if (!oldReport.templateId) {
              const newReport = {
                ...oldReport,
                templateId: oldReport.reportType || "unknown", 
                format: "numeric" as const, 
                numericFields: oldReport.fields?.map((f: any) => ({
                  parameterId: `param_${f.name?.toLowerCase().replace(/\s+/g, '_') || generateId()}`, 
                  value: f.value,
                  unit: f.unit || "",
                  refMin: f.refMin,
                  refMax: f.refMax,
                  status: f.status,
                  customNotes: f.notes
                })) || [],
                narrativeSections: [],
                generalNotes: oldReport.notes || ""
              };
              
              // Remove old properties manually since type restricts them
              delete newReport.fields;
              delete newReport.reportType;
              delete newReport.reportName;
              delete newReport.notes;

              await reportStore.put(newReport);
            }
          }
        }
      }
      // ─── MIGRATION LOGIC v2 -> v3 ──────────────────────────────────────────
      if (oldVersion < 3) {
        if (db.objectStoreNames.contains("chemo_sessions")) {
          const chemoStore = transaction.objectStore("chemo_sessions");
          const allChemo = await chemoStore.getAll();
          for (const old of allChemo) {
            if (!old.status) {
              const updated = {
                ...old,
                status: old.nextAppointmentDate ? "completed" : "scheduled",
                homeMedicinesPrescribed: false
              };
              await chemoStore.put(updated as any);
            }
          }
        }
      }
    },
  });

  return dbInstance;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}
