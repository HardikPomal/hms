import { openDB, DBSchema, IDBPDatabase } from "idb";
import type {
  MedicalReport,
  ChemoSession,
  Medicine,
  MedicineLog,
  AppSettings,
  MedicalEntity,
  ReportTemplate,
  EntityRelationship
} from "@/types";

// ─── Database Schema ─────────────────────────────────────────────────────────

interface SwasthyaSathiDB extends DBSchema {
  // New Unified Store (v4)
  medical_entities: {
    key: string;
    value: MedicalEntity;
    indexes: {
      "by-type": string;
      "by-name": string;
    };
  };
  
  // Archival stores (v3)
  parameters_archive_v3: {
    key: string;
    value: any;
  };
  knowledge_base_archive_v3: {
    key: string;
    value: any;
  };
  
  // Existing stores
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
  knowledge_archive: {
    key: string;
    value: any;
  };
  
  // Legacy stores that will be deleted after migration, kept for type safety during upgrade
  parameters: {
    key: string;
    value: any;
    indexes: { "by-name": string; "by-category": string; "by-status": string; };
  };
  knowledge_base: {
    key: string;
    value: any;
    indexes: { "by-parameter": string; "by-category": string; };
  };
}

const DB_NAME = "swasthya-sathi-db";
const DB_VERSION = 4; // Bumped to v4 for Unified MedicalEntity Graph

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

      // v4 stores
      if (!db.objectStoreNames.contains("medical_entities")) {
        const entities = db.createObjectStore("medical_entities", { keyPath: "id" });
        entities.createIndex("by-type", "type");
        entities.createIndex("by-name", "name");
      }
      if (!db.objectStoreNames.contains("parameters_archive_v3")) {
        db.createObjectStore("parameters_archive_v3", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("knowledge_base_archive_v3")) {
        db.createObjectStore("knowledge_base_archive_v3", { keyPath: "id" });
      }

      // ─── MIGRATION LOGIC v1 -> v2 ──────────────────────────────────────────
      if (oldVersion === 1) {
        if (db.objectStoreNames.contains("knowledge" as any)) {
          const oldKbStore = transaction.objectStore("knowledge" as any);
          const archiveStore = transaction.objectStore("knowledge_archive" as any);
          const allOldKnowledge = await oldKbStore.getAll();
          
          const paramStore = transaction.objectStore("parameters" as any);
          const newKbStore = transaction.objectStore("knowledge_base" as any);
          const relStore = transaction.objectStore("relationships");

          for (const old of allOldKnowledge) {
            await archiveStore.put(old);

            const paramId = `param_${old.id}`;
            const param = {
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

            const newKb = {
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

            if (old.relatedIds && Array.isArray(old.relatedIds)) {
              for (const relId of old.relatedIds) {
                const rel: EntityRelationship = {
                  id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  sourceId: paramId,
                  sourceType: "parameter" as any,
                  targetId: relId.startsWith("param_") ? relId : `param_${relId}`,
                  targetType: "parameter" as any,
                  relationType: "related_to",
                  createdAt: new Date().toISOString()
                };
                await relStore.put(rel);
              }
            }
          }
          db.deleteObjectStore("knowledge" as any);
        }
        
        if (db.objectStoreNames.contains("reports" as any)) {
          const reportStore = transaction.objectStore("reports" as any);
          const allReports = await reportStore.getAll();
          for (const oldReport of allReports) {
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

      // ─── MIGRATION LOGIC v3 -> v4 ──────────────────────────────────────────
      if (oldVersion < 4) {
        if (db.objectStoreNames.contains("parameters" as any) && db.objectStoreNames.contains("knowledge_base" as any)) {
          const paramStore = transaction.objectStore("parameters" as any);
          const kbStore = transaction.objectStore("knowledge_base" as any);
          const entityStore = transaction.objectStore("medical_entities");
          const paramArchive = transaction.objectStore("parameters_archive_v3");
          const kbArchive = transaction.objectStore("knowledge_base_archive_v3");

          const allParams = await paramStore.getAll();
          const allKbs = await kbStore.getAll();

          for (const param of allParams) {
            await paramArchive.put(param);

            // Find matching KB
            const kb = allKbs.find((k: any) => k.parameterId === param.id);

            const isFood = param.category === "nutrition" || param.category === "food";
            const isMedicine = param.category === "medicine";
            
            const entityType = isFood ? "food" : isMedicine ? "medication" : "parameter";

            let metadata: any = {};
            if (entityType === "parameter") {
              metadata = {
                unit: param.defaultUnit,
                refMin: param.defaultRefMin,
                refMax: param.defaultRefMax
              };
            }

            const newEntity: MedicalEntity = {
              id: param.id, // Preserve original ID so relationships and reports stay linked
              type: entityType,
              name: param.name,
              nameGu: param.nameGu,
              
              simpleMeaning: kb?.simpleMeaning || "",
              detailedDescription: kb?.detailedDescription || "",
              whyImportant: kb?.whyImportant || "",
              normalRangeText: kb?.normalRangeText || "",
              
              tags: kb?.tags || [],
              alternativeNames: param.alternativeNames,
              category: param.category,
              knowledgeStatus: param.knowledgeStatus,
              
              source: kb?.source,
              versionHistory: kb?.versionHistory || [],
              
              metadata,
              createdAt: param.createdAt,
              updatedAt: kb?.updatedAt || param.updatedAt
            };

            await entityStore.put(newEntity);
          }

          for (const kb of allKbs) {
            await kbArchive.put(kb);
          }

          // Safely remove old stores now that they are archived and migrated
          db.deleteObjectStore("parameters" as any);
          db.deleteObjectStore("knowledge_base" as any);
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

