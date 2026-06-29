import { getDB, generateId, nowISO } from "./db";
import type { ChemoSession } from "@/types";

export async function getAllChemoSessions(): Promise<ChemoSession[]> {
  const db = await getDB();
  const sessions = await db.getAllFromIndex("chemo_sessions", "by-date");
  return sessions.reverse();
}

export async function getChemoSessionById(id: string): Promise<ChemoSession | undefined> {
  const db = await getDB();
  return db.get("chemo_sessions", id);
}

export async function addChemoSession(
  data: Omit<ChemoSession, "id" | "createdAt" | "updatedAt">
): Promise<ChemoSession> {
  const db = await getDB();
  const session: ChemoSession = {
    ...data,
    id: generateId(),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  await db.add("chemo_sessions", session);
  return session;
}

export async function updateChemoSession(
  id: string,
  data: Partial<ChemoSession>
): Promise<void> {
  const db = await getDB();
  const existing = await db.get("chemo_sessions", id);
  if (!existing) throw new Error(`Session ${id} not found`);
  await db.put("chemo_sessions", { ...existing, ...data, updatedAt: nowISO() });
}

export async function deleteChemoSession(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("chemo_sessions", id);
}

export async function getNextChemoAppointment(): Promise<ChemoSession | undefined> {
  const all = await getAllChemoSessions();
  const today = new Date().toISOString().split("T")[0];
  return all
    .filter((s) => s.nextAppointmentDate && s.nextAppointmentDate >= today)
    .sort((a, b) =>
      (a.nextAppointmentDate ?? "").localeCompare(b.nextAppointmentDate ?? "")
    )[0];
}

export async function getLatestCycleNumber(): Promise<number> {
  const all = await getAllChemoSessions();
  if (all.length === 0) return 0;
  return Math.max(...all.map((s) => s.cycleNumber));
}
