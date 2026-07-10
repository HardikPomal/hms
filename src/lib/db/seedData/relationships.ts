import { RelationType } from "@/types";

export const relationshipsData = [
  // Disease to Reports
  {
    sourceName: "CA-125",
    sourceType: "parameter",
    targetName: "Epithelial Ovarian Cancer",
    targetType: "condition",
    relationType: "indicates" as RelationType,
    strength: 85,
    evidence: "Standard clinical marker for monitoring HGSOC."
  },
  {
    sourceName: "PET-CT Scan",
    sourceType: "report_template",
    targetName: "Metastasis",
    targetType: "general", // Wait, Metastasis is general medical_term
    relationType: "indicates" as RelationType,
    strength: 95,
  },
  
  // Medicines to Diseases
  {
    sourceName: "Carboplatin",
    sourceType: "medication",
    targetName: "Epithelial Ovarian Cancer",
    targetType: "condition",
    relationType: "treats" as RelationType,
    strength: 100,
    evidence: "First-line standard of care."
  },
  {
    sourceName: "Paclitaxel (Taxol)",
    sourceType: "medication",
    targetName: "Epithelial Ovarian Cancer",
    targetType: "condition",
    relationType: "treats" as RelationType,
    strength: 100,
    evidence: "First-line standard of care."
  },
  {
    sourceName: "Olaparib (Lynparza)",
    sourceType: "medication",
    targetName: "Epithelial Ovarian Cancer",
    targetType: "condition",
    relationType: "treats" as RelationType,
    strength: 95,
  },

  // Medicines to Side Effects
  {
    sourceName: "Carboplatin",
    sourceType: "medication",
    targetName: "Neutropenia",
    targetType: "general", // Neutropenia is stored as general medical_term
    relationType: "causes" as RelationType,
    strength: 80,
    evidence: "Common myelosuppressive side effect."
  },
  {
    sourceName: "Paclitaxel (Taxol)",
    sourceType: "medication",
    targetName: "Neutropenia",
    targetType: "general",
    relationType: "causes" as RelationType,
  },

  // Supportive Meds to Side effects
  {
    sourceName: "Ondansetron (Zofran)",
    sourceType: "medication",
    targetName: "Carboplatin",
    targetType: "medication",
    relationType: "treats" as RelationType, // technically treats the side effect, but can't link to edge yet
  },
  {
    sourceName: "Filgrastim / Pegfilgrastim (Neupogen / Neulasta)",
    sourceType: "medication",
    targetName: "Neutropenia",
    targetType: "general",
    relationType: "treats" as RelationType,
    strength: 99,
  },

  // Genetics to Meds
  {
    sourceName: "BRCA1 / BRCA2 Mutation Analysis",
    sourceType: "report_template",
    targetName: "Olaparib (Lynparza)",
    targetType: "medication",
    relationType: "associated_with" as RelationType, // test is associated with treatment selection
  },
  {
    sourceName: "HRD Testing (Homologous Recombination Deficiency)",
    sourceType: "report_template",
    targetName: "Olaparib (Lynparza)",
    targetType: "medication",
    relationType: "associated_with" as RelationType,
  },

  // Treatments to Diseases
  {
    sourceName: "Cytoreductive Surgery (Debulking)",
    sourceType: "treatment",
    targetName: "Epithelial Ovarian Cancer",
    targetType: "condition",
    relationType: "treats" as RelationType,
    strength: 100,
  },

  // Symptoms to Diseases
  {
    sourceName: "Ascites",
    sourceType: "general", // Ascites is medical_term
    targetName: "Epithelial Ovarian Cancer",
    targetType: "condition",
    relationType: "indicates" as RelationType,
    strength: 85,
  }
];
