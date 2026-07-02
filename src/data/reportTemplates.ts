export interface UIReportTemplate {
  type: string;
  label: string;
  labelGu?: string;
  format?: "numeric" | "narrative";
  suggestions?: string[];
  fields: {
    name: string;
    nameGu?: string;
    unit?: string;
    refMin?: string;
    refMax?: string;
    notes?: string;
  }[];
}

export const REPORT_TEMPLATES: UIReportTemplate[] = [
  {
    type: "CBC",
    label: "CBC / Blood Count",
    labelGu: "CBC / રક્ત ગણના",
    fields: [
      { name: "Hemoglobin", nameGu: "હિમોગ્લોબિન", unit: "gm%", refMin: "12", refMax: "15" },
      { name: "RBC Count", nameGu: "RBC ગણના", unit: "Mill/c.mm", refMin: "3.8", refMax: "4.8" },
      { name: "WBC Count", nameGu: "WBC ગણના", unit: "/c.mm", refMin: "4000", refMax: "10000" },
      { name: "Platelet Count", nameGu: "પ્લેટલેટ ગણના", unit: "/c.mm", refMin: "150000", refMax: "410000" },
      { name: "Hematocrit", nameGu: "હેમેટૉક્રિટ", unit: "%", refMin: "36", refMax: "46" },
      { name: "MCV", nameGu: "MCV", unit: "fL", refMin: "83", refMax: "101" },
      { name: "MCH", nameGu: "MCH", unit: "Pg", refMin: "27", refMax: "32" },
      { name: "MCHC", nameGu: "MCHC", unit: "%", refMin: "31.5", refMax: "34.5" },
      { name: "RDW-CV", nameGu: "RDW-CV", unit: "%", refMin: "11.6", refMax: "14.0" },
      { name: "RDW-SD", nameGu: "RDW-SD", unit: "fL", refMin: "39", refMax: "46" },
      { name: "MPV", nameGu: "MPV", unit: "fL", refMin: "7.2", refMax: "11.7" },
      { name: "PDW", nameGu: "PDW", unit: "fL", refMin: "9.0", refMax: "17.0" },
      { name: "Plateletcrit (PCT)", nameGu: "પ્લેટલેટક્રિટ", unit: "%", refMin: "0.17", refMax: "0.35" },
      { name: "Polymorphs", nameGu: "પૉલિમૉર્ફ્સ", unit: "%", refMin: "40", refMax: "80" },
      { name: "Lymphocyte", nameGu: "લિમ્ફોસાઇટ", unit: "%", refMin: "20", refMax: "40" },
      { name: "Eosinophils", nameGu: "ઇઓઝિનોફિલ", unit: "%", refMin: "1", refMax: "6" },
      { name: "Monocytes", nameGu: "મૉનૉસાઇટ", unit: "%", refMin: "2", refMax: "10" },
      { name: "Basophils", nameGu: "બૅઝૉફિલ", unit: "%", refMin: "0", refMax: "2" },
      { name: "Absolute Neutrophil Count", nameGu: "ANC", unit: "/c.mm", refMin: "1500", refMax: "8000" },
      { name: "Absolute Lymphocyte Count", nameGu: "ALC", unit: "/c.mm", refMin: "1000", refMax: "4800" },
      { name: "WBC Morphology", nameGu: "WBC મૉર્ફૉલૉજી", notes: "Text observation" },
      { name: "RBC Morphology", nameGu: "RBC મૉર્ફૉલૉજી", notes: "Text observation" },
      { name: "Platelet Morphology", nameGu: "પ્લેટલેટ મૉર્ફૉલૉજી", notes: "Text observation" },
      { name: "Malarial Parasite", nameGu: "મેલેરિયા પૅરૅસાઇટ", notes: "Present/Absent" },
    ],
  },
  {
    type: "LFT",
    label: "Liver Function Test",
    labelGu: "યકૃત કાર્ય પરીક્ષણ",
    fields: [
      { name: "SGOT (AST)", nameGu: "SGOT (AST)", unit: "U/L", refMin: "10", refMax: "40" },
      { name: "SGPT (ALT)", nameGu: "SGPT (ALT)", unit: "U/L", refMin: "7", refMax: "45" },
      { name: "Gamma-GT (GGT)", nameGu: "Gamma-GT", unit: "U/L", refMin: "8", refMax: "61" },
      { name: "LDH", nameGu: "LDH", unit: "U/L", refMin: "140", refMax: "280" },
      { name: "Total Bilirubin", nameGu: "કુલ બિલિરૂબિન", unit: "mg/dL", refMin: "0.2", refMax: "1.2" },
      { name: "Direct Bilirubin", nameGu: "ડાઇરેક્ટ બિલિરૂબિન", unit: "mg/dL", refMin: "0", refMax: "0.3" },
      { name: "Indirect Bilirubin", nameGu: "ઇન્ડાઇરેક્ટ બિલિરૂબિન", unit: "mg/dL", refMin: "0.2", refMax: "0.9" },
      { name: "Alkaline Phosphatase", nameGu: "આલ્કૅલાઇન ફૉસ્ફૅટૅઝ", unit: "U/L", refMin: "44", refMax: "147" },
      { name: "Total Protein", nameGu: "કુલ પ્રોટીન", unit: "g/dL", refMin: "6.0", refMax: "8.3" },
      { name: "Albumin", nameGu: "આલ્બ્યૂમિન", unit: "g/dL", refMin: "3.4", refMax: "5.4" },
      { name: "Globulin", nameGu: "ગ્લોબ્યૂલિન", unit: "g/dL", refMin: "2.0", refMax: "3.5" },
      { name: "A/G Ratio", nameGu: "A/G ગુણોત્તર", unit: "", refMin: "1.1", refMax: "2.5" },
      { name: "Prothrombin Time", nameGu: "Prothrombin Time", unit: "sec", refMin: "11", refMax: "13.5" },
    ],
  },
  {
    type: "KFT",
    label: "Kidney Function Test",
    labelGu: "કિડની કાર્ય પરીક્ષણ",
    fields: [
      { name: "Creatinine", nameGu: "ક્રિએટિનાઇન", unit: "mg/dL", refMin: "0.60", refMax: "1.20" },
      { name: "eGFR", nameGu: "eGFR", unit: "mL/min", refMin: "90", refMax: "120" },
      { name: "Urea", nameGu: "યૂરિયા", unit: "mg/dL", refMin: "15", refMax: "45" },
      { name: "BUN", nameGu: "BUN", unit: "mg/dL", refMin: "7", refMax: "20" },
      { name: "BUN/Creatinine Ratio", nameGu: "BUN/Cr ગુણોત્તર", unit: "", refMin: "10", refMax: "20" },
      { name: "Uric Acid", nameGu: "યૂરિક ઍસિડ", unit: "mg/dL", refMin: "2.5", refMax: "7.5" },
      { name: "Sodium", nameGu: "સૉડિયમ", unit: "mEq/L", refMin: "136", refMax: "145" },
      { name: "Potassium", nameGu: "પૉટૅશિયમ", unit: "mEq/L", refMin: "3.5", refMax: "5.0" },
      { name: "Chloride", nameGu: "ક્લૉરાઇડ", unit: "mEq/L", refMin: "98", refMax: "107" },
      { name: "Calcium", nameGu: "કેલ્શિયમ", unit: "mg/dL", refMin: "8.5", refMax: "10.5" },
      { name: "Phosphorus", nameGu: "ફોસ્ફરસ", unit: "mg/dL", refMin: "2.5", refMax: "4.5" },
      { name: "Magnesium", nameGu: "મેગ્નેશિયમ", unit: "mg/dL", refMin: "1.7", refMax: "2.2" },
    ],
  },
  {
    type: "BLOOD_SUGAR",
    label: "Blood Sugar",
    labelGu: "બ્લડ સુગર",
    fields: [
      { name: "Fasting Blood Sugar", nameGu: "ઉપવાસ બ્લડ સુગર", unit: "mg/dL", refMin: "70", refMax: "100" },
      { name: "PPBS", nameGu: "PPBS", unit: "mg/dL", refMin: "70", refMax: "140" },
      { name: "Random Blood Sugar", nameGu: "રેન્ડમ બ્લડ સુગર", unit: "mg/dL", refMin: "70", refMax: "140" },
      { name: "HbA1c", nameGu: "HbA1c", unit: "%", refMin: "4.0", refMax: "5.7" },
      { name: "Estimated Average Glucose", nameGu: "eAG", unit: "mg/dL", refMin: "70", refMax: "117" },
      { name: "Fasting Insulin", nameGu: "ઉપવાસ ઇન્સ્યુલિન", unit: "mIU/L", refMin: "2.6", refMax: "24.9" },
      { name: "C-Peptide", nameGu: "C-પેપ્ટાઇડ", unit: "ng/mL", refMin: "0.5", refMax: "2.0" },
    ],
  },
  {
    type: "THYROID",
    label: "Thyroid Function",
    labelGu: "થાઇરૉઇડ કાર્ય",
    fields: [
      { name: "TSH", nameGu: "TSH", unit: "mIU/L", refMin: "0.4", refMax: "4.0" },
      { name: "Free T3", nameGu: "ફ્રી T3", unit: "pg/mL", refMin: "2.3", refMax: "4.2" },
      { name: "Free T4", nameGu: "ફ્રી T4", unit: "ng/dL", refMin: "0.9", refMax: "1.7" },
      { name: "Total T3", nameGu: "T3", unit: "ng/dL", refMin: "80", refMax: "200" },
      { name: "Total T4", nameGu: "T4", unit: "µg/dL", refMin: "5.0", refMax: "12.0" },
      { name: "Anti-TPO Antibodies", nameGu: "Anti-TPO", unit: "IU/mL", refMin: "0", refMax: "34" },
      { name: "Thyroglobulin", nameGu: "થાઇરોગ્લોબ્યુલિન (Tg)", unit: "ng/mL", refMin: "3", refMax: "40" },
    ],
  },
  {
    type: "ONCOLOGY_MARKERS",
    label: "Oncology Markers",
    labelGu: "ઓન્કોલોજી માર્કર્સ",
    fields: [
      { name: "CA 125", nameGu: "CA 125 (Ovarian)", unit: "U/mL", refMin: "0", refMax: "35" },
      { name: "CEA", nameGu: "CEA (Colon/GI)", unit: "ng/mL", refMin: "0", refMax: "5.0" },
      { name: "CA 19-9", nameGu: "CA 19-9 (Pancreatic)", unit: "U/mL", refMin: "0", refMax: "37" },
      { name: "CA 15-3", nameGu: "CA 15-3 (Breast)", unit: "U/mL", refMin: "0", refMax: "30" },
      { name: "PSA", nameGu: "PSA (Prostate)", unit: "ng/mL", refMin: "0", refMax: "4.0" },
      { name: "AFP", nameGu: "AFP (Liver/Germ cell)", unit: "ng/mL", refMin: "0", refMax: "10" },
    ],
  },
  {
    type: "PET_SCAN",
    label: "PET Scan",
    labelGu: "PET સ્કૅન",
    format: "narrative",
    fields: [
      { name: "SUV Max", nameGu: "SUV Max", notes: "Standardized Uptake Value" },
      { name: "Findings", nameGu: "તારણો", notes: "Radiologist findings" },
      { name: "Impression", nameGu: "અભિપ્રાય", notes: "Overall impression" },
    ],
  },
  {
    type: "CT_SCAN",
    label: "CT Scan",
    labelGu: "CT સ્કૅન",
    format: "narrative",
    suggestions: [
      "CT Abdomen & Pelvis Plain and Contrast",
      "Plain and Contrast CT Scan of Abdomen and Pelvis",
      "Plain and Contrast CT Scan of Abdomen and Pelvis - Female",
      "CT Scan Thorax, Abdomen and Pelvis"
    ],
    fields: [
      { name: "Clinical Profile", nameGu: "ક્લિનિકલ પ્રોફાઇલ" },
      { name: "Technique / Protocol", nameGu: "તકનીક / પ્રોટોકોલ" },
      { name: "Findings", nameGu: "તારણો", notes: "Radiologist findings (or Nodules/Measurements)" },
      { name: "Impression", nameGu: "અભિપ્રાય", notes: "Overall impression or Comments" },
      { name: "Advice", nameGu: "સલાહ", notes: "Doctor's advice/recommendations" },
    ],
  },
  {
    type: "MRI",
    label: "MRI",
    labelGu: "MRI",
    format: "narrative",
    fields: [
      { name: "Findings", nameGu: "તારણો", notes: "Radiologist findings" },
      { name: "Impression", nameGu: "અભિપ્રાય", notes: "Overall impression" },
    ],
  },
  {
    type: "HISTOPATHOLOGY",
    label: "Histopathology / Biopsy",
    labelGu: "હિસ્ટૉપૅથૉલૉજી / બાયૉપ્સી",
    format: "narrative",
    fields: [
      { name: "Specimen", nameGu: "નમૂનો", notes: "Tissue type" },
      { name: "Diagnosis", nameGu: "નિર્ણય", notes: "Pathologist report" },
      { name: "Grade", nameGu: "ગ્રેડ", notes: "Tumor grade if applicable" },
      { name: "Margins", nameGu: "કિનારા", notes: "Clear/Positive margins" },
    ],
  },
  {
    type: "2D_ECHO",
    label: "2D Echo",
    labelGu: "2D ઇકો",
    format: "narrative",
    fields: [
      { name: "Findings", notes: "Cardiologist findings (e.g., LV function, valves)" },
      { name: "Measurements (mm)", notes: "LA/AO, IVSD/PWD, etc." },
      { name: "Impression" },
    ],
  },
  {
    type: "B12",
    label: "B-12 & Ferritin",
    labelGu: "વિટામિન B-12 અને ફેરિટિન",
    format: "numeric",
    fields: [
      { name: "Vitamin B12", nameGu: "વિટામિન B12", unit: "pg/mL", refMin: "189", refMax: "883" },
      { name: "Ferritin", nameGu: "ફેરિટિન", unit: "ng/mL", refMin: "4.63", refMax: "204.0" },
    ],
  },
  {
    type: "BIOCHEMISTRY",
    label: "Biochemistry",
    labelGu: "બાયોકેમિસ્ટ્રી",
    format: "numeric",
    fields: [
      { name: "Creatinine", nameGu: "ક્રિએટિનાઇન", unit: "mg/dL", refMin: "0.60", refMax: "1.20" },
      { name: "SGPT (ALT)", nameGu: "SGPT (ALT)", unit: "U/L", refMin: "0", refMax: "34" },
    ],
  },
  {
    type: "BRCA",
    label: "BRCA1/BRCA2 Mutation Analysis",
    labelGu: "BRCA1/BRCA2 મ્યુટેશન",
    format: "narrative",
    fields: [
      { name: "Clinical Indication" },
      { name: "Test Result Summary" },
      { name: "Variant Details" },
      { name: "Interpretation & Drugs" },
    ],
  },
  {
    type: "CA125",
    label: "CA-125",
    labelGu: "CA-125",
    fields: [
      { name: "CA-125", unit: "U/mL", refMin: "0", refMax: "35" },
    ],
  },
  {
    type: "CYTOPATHOLOGY",
    label: "Cytopathology",
    labelGu: "સાયટોપેથોલોજી",
    format: "narrative",
    fields: [
      { name: "Specimen" },
      { name: "Microscopic Examination" },
      { name: "Diagnosis" },
    ],
  },
  {
    type: "HEMATOLOGY",
    label: "Hematology",
    labelGu: "હેમેટોલોજી",
    fields: [],
  },
  {
    type: "IMMUNOLOGY",
    label: "Immunology",
    labelGu: "ઇમ્યુનોલોજી",
    fields: [],
  },
  {
    type: "PROTHROMBIN",
    label: "Prothrombin",
    labelGu: "પ્રોથ્રોમ્બિન",
    fields: [
      { name: "Prothrombin Time (PT)", unit: "sec" },
      { name: "INR" },
    ],
  },
  {
    type: "SONOGRAPHY",
    label: "Sonography",
    labelGu: "સોનોગ્રાફી",
    format: "narrative",
    fields: [
      { name: "Findings" },
      { name: "Impression" },
    ],
  },
  {
    type: "TAPPING_REPORT",
    label: "Tapping Report",
    labelGu: "ટેપિંગ રિપોર્ટ",
    format: "narrative",
    fields: [
      { name: "Physical Appearance" },
      { name: "Microscopic Examination" },
      { name: "Biochemical Analysis" },
    ],
  },
  {
    type: "URINE_EXAMINATION",
    label: "Urine Examination",
    labelGu: "યુરિન પરીક્ષણ",
    fields: [
      { name: "Urine Color" },
      { name: "Urine pH" },
      { name: "Urine Specific Gravity" },
      { name: "Urine Protein" },
      { name: "Urine Glucose" },
      { name: "Urine Ketone" },
      { name: "Urine Albumin" },
      { name: "Urine Bilirubin" },
      { name: "Urine Occult Blood" },
      { name: "Urine Leucocytes/WBC" },
      { name: "Urine Nitrite" },
      { name: "Urine Urobilinogen" },
      { name: "Urine Epithelial Cells" },
      { name: "Urine Red Blood Cells" },
      { name: "Urine Casts" },
      { name: "Urine Crystals" },
      { name: "Urine Bacteria" },
      { name: "Urine Yeast" },
      { name: "Urine Parasites" },
    ],
  },
  {
    type: "XRAY_CHEST",
    label: "X-RAY Chest & PA View",
    labelGu: "એક્સ-રે છાતી",
    format: "narrative",
    fields: [
      { name: "Findings" },
      { name: "Impression" },
    ],
  },
  {
    type: "ATTACHMENT_ONLY",
    label: "Image / Document Only",
    labelGu: "ફક્ત છબી / દસ્તાવેજ",
    format: "narrative",
    fields: [],
  },
  {
    type: "CUSTOM",
    label: "Other Report",
    labelGu: "અન્ય રિપૉર્ટ",
    fields: [],
  },
];

export function getTemplateByType(type: string): UIReportTemplate | undefined {
  return REPORT_TEMPLATES.find((t) => t.type === type);
}
