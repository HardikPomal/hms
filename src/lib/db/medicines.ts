import { getDB, generateId, nowISO } from "./db";
import type { Medicine, MedicineLog, MedicineLogStatus, MedicineScheduleTime } from "@/types";

// ─── Medicines ───────────────────────────────────────────────────────────────

export async function getAllMedicines(): Promise<Medicine[]> {
  const db = await getDB();
  return db.getAll("medicines");
}

export async function getActiveMedicines(): Promise<Medicine[]> {
  const db = await getDB();
  const all = await db.getAll("medicines");
  return all.filter((m) => m.isActive);
}

export async function getMedicineById(id: string): Promise<Medicine | undefined> {
  const db = await getDB();
  return db.get("medicines", id);
}

export async function addMedicine(
  data: Omit<Medicine, "id" | "createdAt" | "updatedAt">
): Promise<Medicine> {
  const db = await getDB();
  const medicine: Medicine = {
    ...data,
    id: generateId(),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  await db.add("medicines", medicine);
  return medicine;
}

export async function updateMedicine(
  id: string,
  data: Partial<Medicine>
): Promise<void> {
  const db = await getDB();
  const existing = await db.get("medicines", id);
  if (!existing) throw new Error(`Medicine ${id} not found`);
  await db.put("medicines", { ...existing, ...data, updatedAt: nowISO() });
}

export async function deleteMedicine(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("medicines", id);
}

// ─── Medicine Logs ────────────────────────────────────────────────────────────

export async function getLogsForDate(date: string): Promise<MedicineLog[]> {
  const db = await getDB();
  return db.getAllFromIndex("medicine_logs", "by-date", date);
}

export async function getLogsForMedicine(medicineId: string): Promise<MedicineLog[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("medicine_logs", "by-medicine", medicineId);
  return all.sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
}

export async function addMedicineLog(
  data: Omit<MedicineLog, "id" | "createdAt">
): Promise<MedicineLog> {
  const db = await getDB();
  const log: MedicineLog = {
    ...data,
    id: generateId(),
    createdAt: nowISO(),
  };
  await db.add("medicine_logs", log);
  return log;
}

export async function updateMedicineLogStatus(
  logId: string,
  status: MedicineLogStatus,
  takenAt?: string
): Promise<void> {
  const db = await getDB();
  const existing = await db.get("medicine_logs", logId);
  if (!existing) return;
  await db.put("medicine_logs", {
    ...existing,
    status,
    takenAt: takenAt ?? (status === "taken" ? nowISO() : undefined),
  });
}

// Generate today's schedule from active medicines
export async function generateTodaySchedule(date: string): Promise<MedicineLog[]> {
  const db = await getDB();
  const existing = await getLogsForDate(date);
  if (existing.length > 0) return existing;

  const medicines = await getActiveMedicines();
  const logs: MedicineLog[] = [];
  const times: MedicineScheduleTime[] = ["morning", "afternoon", "evening", "night"];

  for (const medicine of medicines) {
    // Check if medicine is active for this date
    if (medicine.endDate && medicine.endDate < date) continue;
    if (medicine.startDate > date) continue;

    for (const time of times) {
      if (medicine.schedule[time]) {
        const log = await addMedicineLog({
          medicineId: medicine.id,
          medicineName: medicine.name,
          scheduledDate: date,
          scheduledTime: time,
          status: "pending",
        });
        logs.push(log);
      }
    }
  }

  return logs;
}

// Get adherence stats
export async function getAdherenceStats(
  medicineId: string,
  days: number = 30
): Promise<{ taken: number; skipped: number; total: number }> {
  const logs = await getLogsForMedicine(medicineId);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const recent = logs.filter((l) => new Date(l.scheduledDate) >= cutoff);

  return {
    taken: recent.filter((l) => l.status === "taken").length,
    skipped: recent.filter((l) => l.status === "skipped").length,
    total: recent.length,
  };
}

export async function searchMedicines(query: string): Promise<Medicine[]> {
  const db = await getDB();
  const all = await db.getAll("medicines");
  const lowerQuery = query.toLowerCase();
  return all.filter((m) =>
    m.name.toLowerCase().includes(lowerQuery) ||
    m.genericName?.toLowerCase().includes(lowerQuery) ||
    m.purpose?.toLowerCase().includes(lowerQuery) ||
    m.notes?.toLowerCase().includes(lowerQuery)
  );
}
