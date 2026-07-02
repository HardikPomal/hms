import { MedicineFormData } from "@/types/forms";

export function generateMedicineMarkdown(data: MedicineFormData): string {
  const parts: string[] = [];

  // Title
  parts.push(`# ${data.title}`);

  // Basic Information
  const hasBasicInfo =
    data.genericName || data.drugClass || data.routeOfAdministration.length > 0 || data.brandNames.length > 0;
  
  if (hasBasicInfo) {
    parts.push(`## Basic Information`);
    if (data.genericName) parts.push(`**Generic Name:** ${data.genericName}`);
    if (data.drugClass) parts.push(`**Drug Class:** ${data.drugClass}`);
    
    if (data.brandNames.length > 0) {
      parts.push(`**Brand Names:**`);
      data.brandNames.forEach((brand) => parts.push(`- ${brand}`));
    }
    
    if (data.routeOfAdministration.length > 0) {
      parts.push(`**Route:**`);
      data.routeOfAdministration.forEach((route) => parts.push(`- ${route}`));
    }
    parts.push(`---`);
  }

  // Clinical Uses
  const hasUses = data.primaryUses.length > 0 || data.cancerUses.length > 0;
  if (hasUses) {
    parts.push(`## Clinical Uses`);
    if (data.primaryUses.length > 0) {
      data.primaryUses.forEach((use) => parts.push(`- ${use}`));
    }
    if (data.cancerUses.length > 0) {
      if (data.primaryUses.length > 0) parts.push(``); // spacing
      parts.push(`**Cancer-Specific Uses:**`);
      data.cancerUses.forEach((use) => parts.push(`- ${use}`));
    }
    parts.push(`---`);
  }

  // Common Side Effects
  if (data.commonSideEffects.length > 0) {
    parts.push(`## Common Side Effects`);
    data.commonSideEffects.forEach((effect) => parts.push(`- ${effect}`));
    parts.push(`---`);
  }

  // Serious Side Effects
  if (data.seriousSideEffects.length > 0) {
    parts.push(`## Serious Side Effects`);
    data.seriousSideEffects.forEach((effect) => parts.push(`- ${effect}`));
    parts.push(`---`);
  }

  // Contraindications
  if (data.contraindications.length > 0) {
    parts.push(`## Contraindications`);
    data.contraindications.forEach((contra) => parts.push(`- ${contra}`));
    parts.push(`---`);
  }
  
  // Precautions
  if (data.precautions) {
    parts.push(`## Precautions`);
    parts.push(data.precautions);
    parts.push(`---`);
  }

  // Monitoring Requirements
  if (data.monitoringTests.length > 0) {
    parts.push(`## Monitoring Requirements`);
    data.monitoringTests.forEach((test) => parts.push(`- ${test}`));
    parts.push(`---`);
  }
  
  // Dosage Information
  const hasDosage = data.dosageForms.length > 0 || data.generalDosageNotes;
  if (hasDosage) {
    parts.push(`## Dosage Information`);
    if (data.dosageForms.length > 0) {
      parts.push(`**Dosage Forms:**`);
      data.dosageForms.forEach((form) => parts.push(`- ${form}`));
    }
    if (data.generalDosageNotes) {
      if (data.dosageForms.length > 0) parts.push(``);
      parts.push(`**General Notes:**`);
      parts.push(data.generalDosageNotes);
    }
    parts.push(`---`);
  }

  // Drug Interactions
  if (data.drugInteractions.length > 0) {
    parts.push(`## Drug Interactions`);
    data.drugInteractions.forEach((interaction) => parts.push(`- ${interaction}`));
    parts.push(`---`);
  }

  // Additional Notes
  if (data.additionalNotes) {
    parts.push(`## Additional Notes`);
    parts.push(data.additionalNotes);
  }

  // Clean up trailing separators and join
  let finalMarkdown = parts.join("\n\n");
  if (finalMarkdown.endsWith("\n\n---")) {
    finalMarkdown = finalMarkdown.substring(0, finalMarkdown.length - 7);
  }

  return finalMarkdown;
}
