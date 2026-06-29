import { getDB, generateId, nowISO } from "./db";
import type { ParameterDef, KnowledgeEntry, EntityRelationship, EntityType, RelationType } from "@/types";

// ─── Parameters ──────────────────────────────────────────────────────────────

export async function getAllParameters(): Promise<ParameterDef[]> {
  const db = await getDB();
  const all = await db.getAll("parameters");
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getParameterById(id: string): Promise<ParameterDef | undefined> {
  const db = await getDB();
  return db.get("parameters", id);
}

export async function searchParameters(query: string): Promise<ParameterDef[]> {
  const all = await getAllParameters();
  const q = query.toLowerCase();
  return all.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    p.alternativeNames.some(a => a.toLowerCase().includes(q)) ||
    p.category.toLowerCase().includes(q)
  );
}

export async function addParameter(data: Omit<ParameterDef, "id" | "createdAt" | "updatedAt">): Promise<ParameterDef> {
  const db = await getDB();
  const entry: ParameterDef = {
    ...data,
    id: `param_${generateId()}`,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  await db.add("parameters", entry);
  return entry;
}

export async function updateParameter(id: string, data: Partial<ParameterDef>): Promise<void> {
  const db = await getDB();
  const existing = await db.get("parameters", id);
  if (!existing) throw new Error(`Parameter ${id} not found`);
  await db.put("parameters", { ...existing, ...data, updatedAt: nowISO() });
}

export async function deleteParameter(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("parameters", id);
}

// ─── Knowledge Base ──────────────────────────────────────────────────────────

export async function getKnowledgeByParameterId(parameterId: string): Promise<KnowledgeEntry | undefined> {
  const db = await getDB();
  const all = await db.getAllFromIndex("knowledge_base", "by-parameter", parameterId);
  return all[0];
}

export async function getKnowledgeById(id: string): Promise<KnowledgeEntry | undefined> {
  const db = await getDB();
  return db.get("knowledge_base", id);
}

export async function addKnowledgeEntry(data: Omit<KnowledgeEntry, "id" | "createdAt" | "updatedAt">): Promise<KnowledgeEntry> {
  const db = await getDB();
  const entry: KnowledgeEntry = {
    ...data,
    id: `kb_${generateId()}`,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  await db.add("knowledge_base", entry);
  return entry;
}

export async function updateKnowledgeEntry(id: string, data: Partial<KnowledgeEntry>): Promise<void> {
  const db = await getDB();
  const existing = await db.get("knowledge_base", id);
  if (!existing) throw new Error(`Knowledge ${id} not found`);
  await db.put("knowledge_base", { ...existing, ...data, updatedAt: nowISO() });
}

// ─── Relationships ───────────────────────────────────────────────────────────

export async function addRelationship(
  sourceId: string,
  sourceType: EntityType,
  targetId: string,
  targetType: EntityType,
  relationType: RelationType,
  notes?: string
): Promise<EntityRelationship> {
  const db = await getDB();
  const rel: EntityRelationship = {
    id: `rel_${generateId()}`,
    sourceId,
    sourceType,
    targetId,
    targetType,
    relationType,
    notes,
    createdAt: nowISO(),
  };
  await db.add("relationships", rel);
  return rel;
}

export async function getRelationshipsForSource(sourceId: string): Promise<EntityRelationship[]> {
  const db = await getDB();
  return db.getAllFromIndex("relationships", "by-source", sourceId);
}

export async function getRelationshipsForTarget(targetId: string): Promise<EntityRelationship[]> {
  const db = await getDB();
  return db.getAllFromIndex("relationships", "by-target", targetId);
}

export async function deleteRelationship(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("relationships", id);
}
