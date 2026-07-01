import { getDB } from "./db";
import { getAllReports, getAllTemplates } from "./reports";
import { getAllChemoSessions } from "./chemo";
import { getAllMedicines } from "./medicines";
import { getSettings } from "./settings";

interface BackupData {
  version: number;
  exportedAt: string;
  reports: unknown[];
  chemoSessions: unknown[];
  medicines: unknown[];
  medicineLogs: unknown[];
  settings: unknown[];
  
  // v2 fields
  parameters?: unknown[];
  knowledgeBase?: unknown[];
  reportTemplates?: unknown[];
  relationships?: unknown[];

  // v4 fields
  medicalEntities?: unknown[];
}

export async function exportDatabase(): Promise<string> {
  const db = await getDB();

  const safeGetAll = async (storeName: string) => {
    if (db.objectStoreNames.contains(storeName as any)) {
      return await db.getAll(storeName as any);
    }
    return [];
  };

  const [
    reports, 
    chemoSessions, 
    medicines, 
    allLogs, 
    allSettings,
    parameters,
    knowledgeBase,
    reportTemplates,
    relationships,
    medicalEntities
  ] = await Promise.all([
    getAllReports(),
    getAllChemoSessions(),
    getAllMedicines(),
    safeGetAll("medicine_logs"),
    safeGetAll("settings"),
    safeGetAll("parameters"),
    safeGetAll("knowledge_base"),
    getAllTemplates(),
    safeGetAll("relationships"),
    safeGetAll("medical_entities")
  ]);

  const backup: BackupData = {
    version: 4,
    exportedAt: new Date().toISOString(),
    reports,
    chemoSessions,
    medicines,
    medicineLogs: allLogs,
    settings: allSettings,
    parameters,
    knowledgeBase,
    reportTemplates,
    relationships,
    medicalEntities
  };

  return JSON.stringify(backup, null, 2);
}

export async function importDatabase(jsonString: string): Promise<void> {
  const db = await getDB();
  let backup: BackupData;

  try {
    backup = JSON.parse(jsonString);
  } catch {
    throw new Error("Invalid backup file format");
  }

  if (!backup.version || !backup.exportedAt) {
    throw new Error("Invalid backup file: missing version or export date");
  }

  // Import all data using transactions
  const tx1 = db.transaction("reports", "readwrite");
  for (const report of backup.reports || []) {
    await tx1.store.put(report as Parameters<typeof tx1.store.put>[0]);
  }
  await tx1.done;

  const tx2 = db.transaction("chemo_sessions", "readwrite");
  for (const session of backup.chemoSessions || []) {
    await tx2.store.put(session as Parameters<typeof tx2.store.put>[0]);
  }
  await tx2.done;

  const tx3 = db.transaction("medicines", "readwrite");
  for (const med of backup.medicines || []) {
    await tx3.store.put(med as Parameters<typeof tx3.store.put>[0]);
  }
  await tx3.done;

  const tx4 = db.transaction("medicine_logs", "readwrite");
  for (const log of backup.medicineLogs || []) {
    await tx4.store.put(log as Parameters<typeof tx4.store.put>[0]);
  }
  await tx4.done;

  const tx6 = db.transaction("settings", "readwrite");
  for (const setting of backup.settings || []) {
    await tx6.store.put(setting as Parameters<typeof tx6.store.put>[0]);
  }
  await tx6.done;

  // Import legacy fields if they exist
  if (backup.parameters && backup.knowledgeBase) {
    if (db.objectStoreNames.contains("parameters" as any)) {
      const tx7 = db.transaction("parameters" as any, "readwrite");
      for (const p of backup.parameters) {
        await tx7.store.put(p as Parameters<typeof tx7.store.put>[0]);
      }
      await tx7.done;

      const tx8 = db.transaction("knowledge_base" as any, "readwrite");
      for (const k of backup.knowledgeBase) {
        await tx8.store.put(k as Parameters<typeof tx8.store.put>[0]);
      }
      await tx8.done;
    } else if (db.objectStoreNames.contains("medical_entities" as any) && (!backup.medicalEntities || backup.medicalEntities.length === 0)) {
      // Migrate V3 to V4 on the fly since parameters store is gone
      const tx11 = db.transaction("medical_entities" as any, "readwrite");
      for (const p of backup.parameters as any[]) {
        const kb = (backup.knowledgeBase as any[]).find((k: any) => k.parameterId === p.id);
        const isFood = p.category === "nutrition" || p.category === "food";
        const isMedicine = p.category === "medicine";
        const entityType = isFood ? "food" : isMedicine ? "medication" : "parameter";

        let metadata: any = {};
        if (entityType === "parameter") {
          metadata = {
            unit: p.defaultUnit,
            refMin: p.defaultRefMin,
            refMax: p.defaultRefMax
          };
        }

        const newEntity = {
          id: p.id,
          type: entityType,
          name: p.name,
          nameGu: p.nameGu,
          simpleMeaning: kb?.simpleMeaning || "",
          detailedDescription: kb?.detailedDescription || "",
          whyImportant: kb?.whyImportant || "",
          normalRangeText: kb?.normalRangeText || "",
          tags: kb?.tags || [],
          alternativeNames: p.alternativeNames,
          category: p.category,
          knowledgeStatus: p.knowledgeStatus,
          source: kb?.source,
          versionHistory: kb?.versionHistory || [],
          metadata,
          createdAt: p.createdAt,
          updatedAt: kb?.updatedAt || p.updatedAt
        };
        await tx11.store.put(newEntity as any);
      }
      await tx11.done;
    }
  }

  if (backup.reportTemplates) {
    const tx9 = db.transaction("report_templates", "readwrite");
    for (const t of backup.reportTemplates) {
      await tx9.store.put(t as Parameters<typeof tx9.store.put>[0]);
    }
    await tx9.done;
  }

  if (backup.relationships) {
    const tx10 = db.transaction("relationships", "readwrite");
    for (const r of backup.relationships) {
      await tx10.store.put(r as Parameters<typeof tx10.store.put>[0]);
    }
    await tx10.done;
  }
  
  if (backup.medicalEntities) {
    const tx11 = db.transaction("medical_entities", "readwrite");
    for (const e of backup.medicalEntities) {
      await tx11.store.put(e as Parameters<typeof tx11.store.put>[0]);
    }
    await tx11.done;
  }
}

export function downloadBackup(jsonString: string): void {
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `swasthya-sathi-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function clearDatabase(): Promise<void> {
  const db = await getDB();
  const stores = [
    "reports",
    "chemo_sessions",
    "medicines",
    "medicine_logs",
    "settings",
    "parameters",
    "knowledge_base",
    "report_templates",
    "relationships",
    "medical_entities"
    // knowledge_archive is intentionally not cleared so they don't lose the old data backup
  ] as const;
  
  for (const store of stores) {
    // Check if store exists before clearing
    if (db.objectStoreNames.contains(store)) {
      const tx = db.transaction(store, "readwrite");
      await tx.store.clear();
      await tx.done;
    }
  }
}
