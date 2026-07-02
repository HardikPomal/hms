export interface MedicineFormData {
  // Basic Information
  title: string; // Medicine Name (Required)
  genericName: string;
  brandNames: string[];
  drugClass: string;
  routeOfAdministration: string[]; // e.g., ["Oral", "IV"]

  // Clinical Uses
  primaryUses: string[];
  cancerUses: string[];

  // Safety Profile
  commonSideEffects: string[];
  seriousSideEffects: string[];
  contraindications: string[];
  precautions: string; // Textarea

  // Monitoring
  monitoringTests: string[];

  // Dosage Information
  dosageForms: string[];
  generalDosageNotes: string; // Textarea

  // Interactions
  drugInteractions: string[];

  // Notes
  additionalNotes: string; // Markdown text
}
