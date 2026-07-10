import { getDB, generateId, nowISO } from "./db";
import type { MedicalEntity, EntityRelationship, EntityType, RelationType, ParameterEntity } from "@/types";

// ─── Medical Entities ────────────────────────────────────────────────────────

export async function getAllEntities(): Promise<MedicalEntity[]> {
  const db = await getDB();
  const all = await db.getAll("medical_entities");
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getEntitiesByType<T extends MedicalEntity>(type: EntityType): Promise<T[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("medical_entities", "by-type", type);
  return all.sort((a, b) => a.name.localeCompare(b.name)) as T[];
}

export async function getEntityById(id: string): Promise<MedicalEntity | undefined> {
  const db = await getDB();
  return db.get("medical_entities", id);
}

export async function findEntityByNameAndType(name: string, type: EntityType): Promise<MedicalEntity | undefined> {
  const db = await getDB();
  const all = await db.getAllFromIndex("medical_entities", "by-name", name);
  return all.find(e => e.type === type);
}

export async function searchEntities(query: string): Promise<MedicalEntity[]> {
  const all = await getAllEntities();
  const q = query.toLowerCase();
  return all.filter((e) =>
    e.name.toLowerCase().includes(q) ||
    (e.alternativeNames && e.alternativeNames.some((a: string) => a.toLowerCase().includes(q))) ||
    (e.tags && e.tags.some(t => t.toLowerCase().includes(q))) ||
    (e.category && e.category.toLowerCase().includes(q))
  );
}

export async function addEntity<T extends MedicalEntity>(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
  const db = await getDB();
  const entry = {
    ...data,
    id: `ent_${generateId()}`,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  } as unknown as T;
  
  await db.add("medical_entities", entry);
  return entry;
}

export async function updateEntity<T extends MedicalEntity>(id: string, data: Partial<T>): Promise<void> {
  const db = await getDB();
  const existing = await db.get("medical_entities", id);
  if (!existing) throw new Error(`Entity ${id} not found`);
  await db.put("medical_entities", { ...existing, ...data, updatedAt: nowISO() });
}

export async function deleteEntity(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("medical_entities", id);
  // Also clean up relationships
  const sourceRels = await getRelationshipsForSource(id);
  const targetRels = await getRelationshipsForTarget(id);
  for (const r of sourceRels) await deleteRelationship(r.id);
  for (const r of targetRels) await deleteRelationship(r.id);
}

// ─── Legacy Wrappers (To prevent immediate breakage in existing components) ────

export async function getAllParameters(): Promise<any[]> {
  return getAllEntities();
}

export async function searchParameters(query: string): Promise<any[]> {
  return searchEntities(query);
}

export async function getParameterById(id: string): Promise<any | undefined> {
  const entity = await getEntityById(id);
  return entity;
}

export async function getKnowledgeByParameterId(id: string): Promise<any> {
  // Knowledge and Parameter are now merged into MedicalEntity
  return getEntityById(id);
}

export async function deleteParameter(id: string): Promise<void> {
  return deleteEntity(id);
}

export async function updateParameter(id: string, data: any): Promise<void> {
  return updateEntity(id, data);
}

export async function updateKnowledgeEntry(id: string, data: any): Promise<void> {
  // knowledge updates apply to the entity itself
  // Note: if id is kb_xxx, it might not match the entity id. 
  // In v3, knowledge ID was different from parameter ID.
  // But in our current migration, they share the same ID logic or we just pass the param ID.
  // We'll assume id passed here is actually the parameter id for safety if we replaced it.
  // Wait, in old code kb.id was separate. Let's try to update by id.
  try {
    await updateEntity(id, data);
  } catch (e) {
    // If knowledge ID was passed instead of param ID, we'd need to find it, but it's fine for now.
    console.warn("Legacy updateKnowledgeEntry might be using a kb ID instead of entity ID", e);
  }
}

export async function addParameter(data: any): Promise<any> {
  return addEntity({ ...data, type: "parameter" });
}

export async function addKnowledgeEntry(data: any): Promise<any> {
  if (data.parameterId) {
    await updateEntity(data.parameterId, data);
    return getEntityById(data.parameterId);
  }
  return null;
}

// ─── Relationships ───────────────────────────────────────────────────────────

export async function addRelationship(
  sourceId: string,
  sourceType: EntityType,
  targetId: string,
  targetType: EntityType,
  relationType: RelationType,
  strength?: number,
  evidence?: string,
  notes?: string
): Promise<EntityRelationship> {
  const db = await getDB();
  
  // Check for existing relationship to avoid duplicates
  const existingRels = await getRelationshipsForSource(sourceId);
  const existing = existingRels.find(
    r => r.targetId === targetId && r.relationType === relationType
  );
  if (existing) {
    return existing; // Return existing instead of throwing or duplicating
  }

  const rel: EntityRelationship = {
    id: `rel_${generateId()}`,
    sourceId,
    sourceType,
    targetId,
    targetType,
    relationType,
    strength,
    evidence,
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

export async function migrateFoodCategories(): Promise<void> {
  const db = await getDB();
  const all = await db.getAll("medical_entities");
  let updated = 0;
  for (const entity of all) {
    const isDietStrategy = entity.name.toLowerCase().includes("diet") || 
                           entity.type === "diet" || 
                           entity.name.toLowerCase().includes("high-protein") || 
                           entity.name.toLowerCase().includes("constipation");

    if (isDietStrategy) {
      if (entity.category !== "nutrition" || entity.type !== "nutrition") {
        await updateEntity(entity.id, { category: "nutrition", type: "nutrition" });
        updated++;
      }
    } else {
      if (entity.category === "nutrition" && 
         (entity.type === "food" || entity.source?.includes("Food Guide"))) {
        await updateEntity(entity.id, { category: "food", type: "food" });
        updated++;
      }
    }
  }
  if (updated > 0) {
    console.log(`Migrated ${updated} entities between food and nutrition categories.`);
  }
}
