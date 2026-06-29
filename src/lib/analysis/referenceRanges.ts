// Reference ranges for common medical test fields
// Format: { min?: number, max?: number, unit: string }
// Source: Standard medical reference values (educational use only)

export interface ReferenceRange {
  min?: number;
  max?: number;
  unit: string;
  description?: string;
}

// Keyed by lowercase field name (normalized)
export const REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // CBC Fields
  "hemoglobin": { min: 12, max: 15, unit: "gm%" },
  "hb": { min: 12, max: 15, unit: "gm%" },
  "rbc count": { min: 3.8, max: 4.8, unit: "Mill/c.mm" },
  "rbc": { min: 3.8, max: 4.8, unit: "Mill/c.mm" },
  "wbc count": { min: 4000, max: 10000, unit: "/c.mm" },
  "wbc": { min: 4000, max: 10000, unit: "/c.mm" },
  "platelet count": { min: 150000, max: 410000, unit: "/c.mm" },
  "platelets": { min: 150000, max: 410000, unit: "/c.mm" },
  "hematocrit": { min: 36, max: 46, unit: "%" },
  "mcv": { min: 83, max: 101, unit: "fL" },
  "mch": { min: 27, max: 32, unit: "Pg" },
  "mchc": { min: 31.5, max: 34.5, unit: "%" },
  "rdw-cv": { min: 11.6, max: 14.0, unit: "%" },
  "rdw": { min: 11.6, max: 14.0, unit: "%" },
  "mpv": { min: 7.2, max: 11.7, unit: "/c.mm" },
  "polymorphs": { min: 40, max: 80, unit: "%" },
  "neutrophils": { min: 40, max: 80, unit: "%" },
  "lymphocyte": { min: 20, max: 40, unit: "%" },
  "lymphocytes": { min: 20, max: 40, unit: "%" },
  "eosinophils": { min: 1, max: 6, unit: "%" },
  "monocytes": { min: 2, max: 10, unit: "%" },
  "basophils": { min: 0, max: 2, unit: "%" },

  // Liver Function Tests
  "sgot": { min: 10, max: 40, unit: "U/L" },
  "ast": { min: 10, max: 40, unit: "U/L" },
  "sgpt": { min: 7, max: 45, unit: "U/L" },
  "alt": { min: 7, max: 45, unit: "U/L" },
  "total bilirubin": { min: 0.2, max: 1.2, unit: "mg/dL" },
  "direct bilirubin": { min: 0, max: 0.3, unit: "mg/dL" },
  "indirect bilirubin": { min: 0.2, max: 0.9, unit: "mg/dL" },
  "alkaline phosphatase": { min: 44, max: 147, unit: "U/L" },
  "alp": { min: 44, max: 147, unit: "U/L" },
  "total protein": { min: 6.0, max: 8.3, unit: "g/dL" },
  "albumin": { min: 3.4, max: 5.4, unit: "g/dL" },
  "globulin": { min: 2.0, max: 3.5, unit: "g/dL" },

  // Kidney Function Tests
  "creatinine": { min: 0.5, max: 1.2, unit: "mg/dL" },
  "urea": { min: 15, max: 45, unit: "mg/dL" },
  "bun": { min: 7, max: 20, unit: "mg/dL" },
  "uric acid": { min: 2.5, max: 7.5, unit: "mg/dL" },

  // Blood Sugar
  "fasting glucose": { min: 70, max: 100, unit: "mg/dL" },
  "fasting blood sugar": { min: 70, max: 100, unit: "mg/dL" },
  "ppbs": { min: 70, max: 140, unit: "mg/dL" },
  "hba1c": { min: 4.0, max: 5.7, unit: "%" },
  "glycated hemoglobin": { min: 4.0, max: 5.7, unit: "%" },

  // Thyroid
  "tsh": { min: 0.4, max: 4.0, unit: "mIU/L" },
  "t3": { min: 80, max: 200, unit: "ng/dL" },
  "t4": { min: 5.0, max: 12.0, unit: "µg/dL" },
  "free t3": { min: 2.3, max: 4.2, unit: "pg/mL" },
  "free t4": { min: 0.9, max: 1.7, unit: "ng/dL" },

  // Tumor Markers
  "ca 125": { min: 0, max: 35, unit: "U/mL" },
  "ca125": { min: 0, max: 35, unit: "U/mL" },
  "ca 19-9": { min: 0, max: 37, unit: "U/mL" },
  "cea": { min: 0, max: 5, unit: "ng/mL" },
  "afp": { min: 0, max: 8.1, unit: "ng/mL" },
  "psa": { min: 0, max: 4, unit: "ng/mL" },

  // Electrolytes
  "sodium": { min: 136, max: 145, unit: "mEq/L" },
  "potassium": { min: 3.5, max: 5.0, unit: "mEq/L" },
  "chloride": { min: 98, max: 107, unit: "mEq/L" },
  "calcium": { min: 8.5, max: 10.5, unit: "mg/dL" },
  "magnesium": { min: 1.7, max: 2.3, unit: "mg/dL" },
  "phosphorus": { min: 2.5, max: 4.5, unit: "mg/dL" },
};

export function getReferenceRange(fieldName: string): ReferenceRange | null {
  const key = fieldName.toLowerCase().trim();
  return REFERENCE_RANGES[key] ?? null;
}
