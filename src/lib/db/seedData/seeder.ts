import {
  addEntity,
  updateEntity,
  findEntityByNameAndType,
  addRelationship,
  getAllEntities,
  deleteEntity,
} from "../knowledge";

import medicinesData from "../../../data/seed/medicines.json";
import reportsData from "../../../data/seed/reports.json";
import nutritionData from "../../../data/seed/nutrition.json";
import termsData from "../../../data/seed/terms.json";
import cancerInfoData from "../../../data/seed/cancerInfo.json";
import treatmentsData from "../../../data/seed/treatments.json";
import miscData from "../../../data/seed/misc.json";
import relationshipsData from "../../../data/seed/relationships.json";
import labParametersData from "../../../data/seed/labParameters.json";
import hematologyData from "../../../data/seed/hematology.json";
import foodData from "../../../data/seed/food.json";

// ─── Relationships ───────────────────────────────────────────────────────────
const relationships = [
  {
    sourceName: "Ondansetron",
    sourceType: "medication",
    targetName: "Nausea",
    targetType: "general",
    relationType: "improves",
    strength: 90,
  },
  {
    sourceName: "Carboplatin",
    sourceType: "medication",
    targetName: "Neutropenia",
    targetType: "medical_term",
    relationType: "causes",
    strength: 85,
    evidence: "Standard adverse effect of platinum drugs",
  },
  ...relationshipsData,
];

// ─── Seeder ──────────────────────────────────────────────────────────────────

const SEED_VERSION = "v22_add_missing_reports";
let _seededInMemory = false;

function getRichDescription(item: any) {
  let englishSection = "";
  let gujaratiSection = "";

  if (item.category === "medical_report") {
    // Reports now have their own custom structured markdown natively in the JSON
    englishSection = item.detailedDescription || item.simpleMeaning || "";
    gujaratiSection = item.detailedDescriptionGu || item.simpleMeaningGu || "";
  } else if (item.category === "medicine") {
    englishSection = `<en>\n${item.detailedDescription}\n</en>`;
    gujaratiSection = `<gu>\n${item.detailedDescriptionGu || ""}\n</gu>`;
  } else if (item.category === "lab_parameter") {
    let enDesc = item.detailedDescription || item.simpleMeaning || "";
    let guDesc = item.detailedDescriptionGu || item.simpleMeaningGu || "";
    
    if (item.highIndicateEn) enDesc += `\n\n### High Value May Indicate\n${item.highIndicateEn}`;
    if (item.highIndicateGu) guDesc += `\n\n### ઊંચું મૂલ્ય શું સૂચવે છે\n${item.highIndicateGu}`;
    
    if (item.lowIndicateEn) enDesc += `\n\n### Low Value May Indicate\n${item.lowIndicateEn}`;
    if (item.lowIndicateGu) guDesc += `\n\n### નીચું મૂલ્ય શું સૂચવે છે\n${item.lowIndicateGu}`;
    
    if (item.causesEn) enDesc += `\n\n### Common Causes Of Abnormal Results\n${item.causesEn}`;
    if (item.causesGu) guDesc += `\n\n### અસામાન્ય પરિણામોના સામાન્ય કારણો\n${item.causesGu}`;
    
    if (item.relatedDiseasesEn) enDesc += `\n\n### Related Diseases\n${item.relatedDiseasesEn}`;
    if (item.relatedDiseasesGu) guDesc += `\n\n### સંબંધિત રોગો\n${item.relatedDiseasesGu}`;
    
    const enRelations = [];
    const guRelations = [];
    if (item.relatedReports) {
      enRelations.push(`**Related Reports:**\n${item.relatedReports}`);
      guRelations.push(`**સંબંધિત રિપોર્ટ્સ:**\n${item.relatedReports}`);
    }
    if (item.relatedParameters) {
      enRelations.push(`**Related Parameters:**\n${item.relatedParameters}`);
      guRelations.push(`**સંબંધિત પરિમાણો:**\n${item.relatedParameters}`);
    }
    
    if (enRelations.length > 0) {
      enDesc += `\n\n### Relationships\n${enRelations.join("\n\n")}`;
      guDesc += `\n\n### સંબંધો\n${guRelations.join("\n\n")}`;
    }
    
    englishSection = `<en>\n${enDesc}\n</en>`;
    gujaratiSection = `<gu>\n${guDesc}\n</gu>`;
  } else if (
    item.category === "nutrition" ||
    item.type === "nutrition"
  ) {
    englishSection = `<en>\n${item.detailedDescription || item.simpleMeaning || ""}\n</en>`;
    gujaratiSection = `<gu>\n${item.detailedDescriptionGu || item.simpleMeaningGu || ""}\n</gu>`;
  } else {
    englishSection = `<en>\n${item.detailedDescription || item.simpleMeaning || ""}\n</en>`;
    gujaratiSection = `<gu>\n${item.detailedDescriptionGu || item.simpleMeaningGu || ""}\n</gu>`;
  }

  return englishSection + "\n\n" + gujaratiSection;
}

export const seedComprehensiveKnowledge = async () => {
  const storageKey = `seed_done_${SEED_VERSION}`;
  const alreadySeededInStorage =
    typeof window !== "undefined" && localStorage.getItem(storageKey) === "1";

  // Only seed entities if not already done in this session or a previous one
  if (!alreadySeededInStorage && !_seededInMemory) {
    _seededInMemory = true;
    console.log("[KnowledgeDB] Starting comprehensive entity seed...");

    if (SEED_VERSION === "v22_add_missing_reports") {
      const allEnts = await getAllEntities();
      for (const e of allEnts) {
        // Wipe all existing knowledge base entities to ensure a completely clean slate without duplicates
        await deleteEntity(e.id);
      }
      console.log(`Wiped all legacy knowledge entities for ${SEED_VERSION}`);
    }

    const allData = [
      ...medicinesData,
      ...reportsData,
      ...nutritionData,
      ...termsData,
      ...cancerInfoData,
      ...treatmentsData,
      ...miscData,
      ...hematologyData,
      ...foodData,
      ...labParametersData.map((p: any) => ({
        type: "parameter",
        name: p.nameEn,
        nameGu: p.nameGu,
        category: "lab_parameter",
        tags: p.tags || [],
        simpleMeaning: p.descEn || "",
        simpleMeaningGu: p.descGu || "",
        whyImportant: p.whyImportantEn || "",
        whyImportantGu: p.whyImportantGu || "",
        highIndicateEn: p.highIndicateEn || "",
        highIndicateGu: p.highIndicateGu || "",
        lowIndicateEn: p.lowIndicateEn || "",
        lowIndicateGu: p.lowIndicateGu || "",
        causesEn: p.causesEn || "",
        causesGu: p.causesGu || "",
        relatedDiseasesEn: p.relatedDiseasesEn || "",
        relatedDiseasesGu: p.relatedDiseasesGu || "",
        relatedReports: p.relatedReports || "",
        relatedParameters: p.relatedParameters || "",
        unit: p.unit || "",
        normalRange: p.normalRange || "",
        alternativeNames: [
          ...(p.akaEn ? p.akaEn.split(",") : []),
          ...(p.akaGu ? p.akaGu.split(",") : [])
        ].map((s: string) => s.trim()).filter((s: string) => s.length > 0),
      })),
    ];

    let addedCount = 0;
    let updatedCount = 0;

    for (const item of allData) {
      try {
        const i = item as any;
        const existing = await findEntityByNameAndType(i.name, i.type);
        const richDescription = getRichDescription(item);

        if (!existing) {
          const entityData: any = {
            type: i.type,
            name: i.name,
            nameGu: i.nameGu,
            category: i.category,
            knowledgeStatus: "advanced",
            tags: i.tags || [],
            simpleMeaning: i.simpleMeaning || "",
            simpleMeaningGu: i.simpleMeaningGu || "",
            source: i.source || "Comprehensive Medical DB",
            alternativeNames: i.alternativeNames || [],
          };
          if (i.normalRange || i.unit) {
            entityData.normalRangeText = (i.normalRange || "") + (i.unit ? " " + i.unit : "");
            entityData.normalRangeText = entityData.normalRangeText.trim();
          }

          if (i.type === "food") {
            entityData.detailedDescription = `<en>\n${i.detailedDescription || ""}\n</en>\n<gu>\n${i.detailedDescriptionGu || ""}\n</gu>`;
            entityData.detailedDescriptionGu = i.detailedDescriptionGu || "";
            entityData.whyImportant = `<en>\n${i.whyImportant || ""}\n</en>\n<gu>\n${i.whyImportantGu || ""}\n</gu>`;
            entityData.whyImportantGu = i.whyImportantGu || "";
            entityData.metadata = {
              bestTimeToEat: i.bestTimeToEat || "",
              bestTimeToEatGu: i.bestTimeToEatGu || ""
            };
          } else if (i.type === "parameter") {
            entityData.detailedDescription = richDescription;
            entityData.whyImportant = i.whyImportantGu
              ? `<en>\n${i.whyImportant || ""}\n</en>\n<gu>\n${i.whyImportantGu}\n</gu>`
              : i.whyImportant || "";
            
            let refMin, refMax;
            if (i.normalRange && i.normalRange.includes("-")) {
              const parts = i.normalRange.split("-").map((p: string) => p.trim());
              if (parts.length === 2 && parts[0] && parts[1]) {
                refMin = parts[0];
                refMax = parts[1];
              }
            }
            entityData.metadata = {
              unit: i.unit || undefined,
              refMin,
              refMax
            };
          } else {
            entityData.detailedDescription = richDescription;
            entityData.whyImportant = i.whyImportantGu
              ? `<en>\n${i.whyImportant || ""}\n</en>\n<gu>\n${i.whyImportantGu}\n</gu>`
              : i.whyImportant || "";
          }

          await addEntity(entityData);
          addedCount++;
        } else if (existing.knowledgeStatus === "advanced") {
          const updateData: any = {
            nameGu: i.nameGu,
            simpleMeaningGu: i.simpleMeaningGu,
            alternativeNames: i.alternativeNames || existing.alternativeNames || [],
          };
          if (i.normalRange || i.unit) {
            updateData.normalRangeText = (i.normalRange || "") + (i.unit ? " " + i.unit : "");
            updateData.normalRangeText = updateData.normalRangeText.trim();
          }

          if (i.type === "food") {
            updateData.detailedDescription = `<en>\n${i.detailedDescription || ""}\n</en>\n<gu>\n${i.detailedDescriptionGu || ""}\n</gu>`;
            updateData.detailedDescriptionGu = i.detailedDescriptionGu || "";
            updateData.whyImportant = `<en>\n${i.whyImportant || ""}\n</en>\n<gu>\n${i.whyImportantGu || ""}\n</gu>`;
            updateData.whyImportantGu = i.whyImportantGu || "";
            updateData.metadata = {
              ...(existing.metadata || {}),
              bestTimeToEat: i.bestTimeToEat || "",
              bestTimeToEatGu: i.bestTimeToEatGu || ""
            };
          } else if (i.type === "parameter") {
            updateData.detailedDescription = richDescription;
            updateData.whyImportant = i.whyImportantGu
              ? `<en>\n${i.whyImportant || ""}\n</en>\n<gu>\n${i.whyImportantGu}\n</gu>`
              : i.whyImportant || "";
            
            let refMin, refMax;
            if (i.normalRange && i.normalRange.includes("-")) {
              const parts = i.normalRange.split("-").map((p: string) => p.trim());
              if (parts.length === 2 && parts[0] && parts[1]) {
                refMin = parts[0];
                refMax = parts[1];
              }
            }
            updateData.metadata = {
              ...(existing.metadata || {}),
              unit: i.unit || undefined,
              refMin,
              refMax
            };
          } else {
            updateData.detailedDescription = richDescription;
            updateData.whyImportant = i.whyImportantGu
              ? `<en>\n${i.whyImportant || ""}\n</en>\n<gu>\n${i.whyImportantGu}\n</gu>`
              : i.whyImportant || "";
          }

          await updateEntity(existing.id, updateData);
          updatedCount++;
        }
      } catch {
        // skip duplicates or partial errors
      }
    }

    console.log(
      `[KnowledgeDB] Added ${addedCount} new entities and updated ${updatedCount} existing.`,
    );

    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, "1");
    }
  }

  // ─── ALWAYS rebuild relationship edges ───────────────────────────────────
  // This is fast (idempotent via dedup check in addRelationship) and ensures
  // that even if entities were already in DB from a previous migration (with
  // different IDs), the relationship edges correctly point to them.
  const allEntitiesFromDB = await getAllEntities();
  const entityMap = new Map<string, string>();
  for (const e of allEntitiesFromDB) {
    entityMap.set(`${e.type}::${e.name}`, e.id);
  }

  for (const rel of relationships) {
    const sourceId = entityMap.get(`${rel.sourceType}::${rel.sourceName}`);
    const targetId = entityMap.get(`${rel.targetType}::${rel.targetName}`);

    if (sourceId && targetId) {
      try {
        await addRelationship(
          sourceId,
          rel.sourceType as any,
          targetId,
          rel.targetType as any,
          rel.relationType as any,
          rel.strength,
          (rel as any).evidence,
        );
      } catch {
        // ignore duplicates
      }
    }
  }

  console.log("[KnowledgeDB] Seed + relationship build complete!");
};
