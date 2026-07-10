import { getDB } from "./db";
import { migrateFoodCategories, getAllEntities, deleteEntity } from "./knowledge";

export const seedNutritionData = async () => {
  try {
    const existingParams = await getAllEntities();
    
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
        await deleteEntity(id);
      }
      console.log("Deduplication complete.");
    }
    
    // --- 2. Seeding Logic Removed ---
    // (User opted to rely entirely on manual DB entries for Nutrition)
    
    // --- 3. Fix Categories for legacy entries ---
    await migrateFoodCategories();
  } catch (error) {
    console.error("Failed to seed nutrition data:", error);
  }
};
