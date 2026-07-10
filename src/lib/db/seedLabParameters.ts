import { getAllParameters, updateEntity } from "./knowledge";
import labParametersData from "@/data/seed/labParameters.json";

export const seedAllPendingLabParameters = async () => {
  try {
    const params = await getAllParameters();
    
    // Force update ALL lab parameters that we have JSON data for
    const pendingParams = params;
    
    console.log(`Found ${pendingParams.length} parameters to seed/update...`);
    
    let updatedCount = 0;

    for (const param of pendingParams) {
      const knowledge = labParametersData.find((k: any) => k.nameEn === param.name);
      if (knowledge) {
        // Build detailed description markdown with XML tags for easy parsing
        let enDesc = knowledge.descEn.trim();
        let guDesc = knowledge.descGu.trim();

        if (knowledge.highIndicateEn.trim())
          enDesc += `\n\n### High Value May Indicate\n${knowledge.highIndicateEn.trim()}`;
        if (knowledge.highIndicateGu.trim())
          guDesc += `\n\n### High Value May Indicate\n${knowledge.highIndicateGu.trim()}`;

        if (knowledge.lowIndicateEn.trim())
          enDesc += `\n\n### Low Value May Indicate\n${knowledge.lowIndicateEn.trim()}`;
        if (knowledge.lowIndicateGu.trim())
          guDesc += `\n\n### Low Value May Indicate\n${knowledge.lowIndicateGu.trim()}`;

        if (knowledge.causesEn.trim())
          enDesc += `\n\n### Common Causes Of Abnormal Results\n${knowledge.causesEn.trim()}`;
        if (knowledge.causesGu.trim())
          guDesc += `\n\n### Common Causes Of Abnormal Results\n${knowledge.causesGu.trim()}`;

        if (knowledge.relatedDiseasesEn.trim())
          enDesc += `\n\n### Related Diseases\n${knowledge.relatedDiseasesEn.trim()}`;
        if (knowledge.relatedDiseasesGu.trim())
          guDesc += `\n\n### Related Diseases\n${knowledge.relatedDiseasesGu.trim()}`;

        const sharedRelations = [];
        if (knowledge.relatedReports.trim())
          sharedRelations.push(
            `**Related Reports:**\n${knowledge.relatedReports.trim()}`,
          );
        if (knowledge.relatedParameters.trim())
          sharedRelations.push(
            `**Related Parameters:**\n${knowledge.relatedParameters.trim()}`,
          );

        const relationsStr =
          sharedRelations.length > 0
            ? `\n\n### Relationships\n${sharedRelations.join("\n\n")}`
            : "";
        if (relationsStr) {
          enDesc += relationsStr;
          guDesc += relationsStr;
        }

        let detailedDesc = "";
        if (enDesc) detailedDesc += `<en>\n${enDesc}\n</en>\n`;
        if (guDesc) detailedDesc += `<gu>\n${guDesc}\n</gu>`;

        let whyImportant = "";
        if (knowledge.whyImportantEn.trim())
          whyImportant += `<en>\n${knowledge.whyImportantEn.trim()}\n</en>\n`;
        if (knowledge.whyImportantGu.trim())
          whyImportant += `<gu>\n${knowledge.whyImportantGu.trim()}\n</gu>`;

        await updateEntity(param.id, {
          simpleMeaning: knowledge.descEn.trim() || knowledge.nameEn.trim(),
          whyImportant: whyImportant,
          detailedDescription: detailedDesc,
          tags: knowledge.tags || [],
          knowledgeStatus: "advanced"
        });
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} parameters with advanced knowledge.`);
  } catch (error) {
    console.error("Error seeding lab parameters:", error);
  }
};

