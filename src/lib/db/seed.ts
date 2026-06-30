import { addParameter, addKnowledgeEntry, getAllParameters, deleteParameter } from "./knowledge";
import { getDB } from "./db";

export const seedNutritionData = async () => {
  try {
    const existingParams = await getAllParameters();
    
    // --- 1. Deduplication Logic ---
    const nutritionParams = existingParams.filter(p => p.category === "nutrition" || p.category === "food");
    const nameMap = new Map<string, string>(); // name -> id to keep
    const toDelete: string[] = [];

    for (const p of nutritionParams) {
      const nameKey = p.name.toLowerCase();
      if (!nameMap.has(nameKey)) {
        nameMap.set(nameKey, p.id);
      } else {
        toDelete.push(p.id);
      }
    }

    if (toDelete.length > 0) {
      console.log(`Found ${toDelete.length} duplicate nutrition entries. Deleting...`);
      const db = await getDB();
      for (const id of toDelete) {
        await deleteParameter(id);
        // Delete associated knowledge base entries
        const kbs = await db.getAllFromIndex("knowledge_base", "by-parameter", id);
        for (const kb of kbs) {
          await db.delete("knowledge_base", kb.id);
        }
      }
      console.log("Deduplication complete.");
    }
    
    // --- 2. Seeding Logic Removed ---
    // (User opted to rely entirely on manual DB entries for Nutrition)
  } catch (error) {
    console.error("Failed to seed nutrition data:", error);
  }
};
