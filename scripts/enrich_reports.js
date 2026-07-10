const fs = require('fs');

const path = 'src/data/seed/reports.json';
let data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Provide some sample AKAs and Parameters for common reports
const akaMap = {
  "Complete Blood Count (CBC)": { en: ["CBC", "Hemogram", "Full Blood Count", "FBC"], gu: ["સીબીસી", "હિમોગ્રામ"] },
  "Liver Function Test (LFT)": { en: ["LFT", "Hepatic Panel", "Liver Panel"], gu: ["એલએફટી", "લિવર પેનલ"] },
  "Kidney Function Test (KFT / RFT)": { en: ["KFT", "RFT", "Renal Function Test", "Renal Panel"], gu: ["કેએફટી", "આરએફટી"] },
  "Tumor Marker Panel (CA-125, HE4, CEA)": { en: ["Ovarian Cancer Marker Panel", "CA-125 Profile"], gu: ["ટ્યુમર માર્કર"] },
  "CT Scan of Abdomen and Pelvis": { en: ["CT Abdomen", "CECT Abdomen Pelvis"], gu: ["સીટી સ્કેન"] },
  "PET-CT Scan": { en: ["PET Scan", "FDG PET"], gu: ["પેટ સ્કેન"] },
  "BRCA1 / BRCA2 Mutation Analysis": { en: ["BRCA Test", "BRCA Genetic Testing", "Breast Cancer Gene Test"], gu: ["બીઆરસીએ ટેસ્ટ"] },
  "HRD Testing (Homologous Recombination Deficiency)": { en: ["HRD Test", "Genomic Scarring Test"], gu: ["એચઆરડી ટેસ્ટ"] },
  "Histopathology / Biopsy Report": { en: ["Biopsy", "Histopath", "Tissue Pathology"], gu: ["બાયોપ્સી"] },
  "Echocardiogram (2D Echo)": { en: ["2D Echo", "ECHO", "Heart Ultrasound"], gu: ["ઇકો", "હૃદયની સોનોગ્રાફી"] },
  "Electrocardiogram (ECG / EKG)": { en: ["ECG", "EKG"], gu: ["ઇસીજી"] },
  "MRI Pelvis": { en: ["Magnetic Resonance Imaging", "Pelvic MRI"], gu: ["એમઆરઆઈ"] },
  "Ultrasound (USG) Abdomen & Pelvis": { en: ["USG", "Sonography", "Pelvic Ultrasound"], gu: ["સોનોગ્રાફી", "અલ્ટ્રાસાઉન્ડ"] },
  "Vitamin D (25-Hydroxy)": { en: ["Vit D3", "Cholecalciferol Test", "25-OH Vitamin D"], gu: ["વિટામિન ડી ટેસ્ટ"] },
  "Thyroid Stimulating Hormone (TSH)": { en: ["Thyroid Test", "TSH Test", "Thyroid Profile"], gu: ["થાઈરોઈડ ટેસ્ટ"] },
  "HbA1c (Glycosylated Hemoglobin)": { en: ["HbA1c", "A1c", "3-Month Average Blood Sugar"], gu: ["એચબીએ૧સી", "ડાયાબિટીસ રિપોર્ટ"] },
  "Lipid Profile": { en: ["Cholesterol Test", "Lipid Panel"], gu: ["કોલેસ્ટ્રોલ ટેસ્ટ"] },
  "Urine Routine & Microscopic (URM)": { en: ["Urine Test", "Urinalysis", "Urine Routine"], gu: ["પેશાબનો રિપોર્ટ"] },
  "Serum Electrolytes": { en: ["Electrolyte Panel", "Na K Cl Test"], gu: ["ઇલેક્ટ્રોલાઇટ્સ"] },
  "Serum Calcium": { en: ["Total Calcium", "Ca Test"], gu: ["કેલ્શિયમ ટેસ્ટ"] },
  "Bone Mineral Density (BMD / DEXA Scan)": { en: ["DEXA Scan", "Bone Density Test", "DXA"], gu: ["ડેક્સા સ્કેન", "હાડકાની મજબૂતાઈનો રિપોર્ટ"] }
};

// Provide sensible default parameters included for those without it
const paramMap = {
  "Complete Blood Count (CBC)": "Hemoglobin, RBC Count, Hematocrit, Platelet Count, WBC Count, Neutrophils, Lymphocytes, Eosinophils, Monocytes, Basophils",
  "Liver Function Test (LFT)": "Total Bilirubin, Direct Bilirubin, SGPT (ALT), SGOT (AST), Alkaline Phosphatase (ALP), Gamma-GT (GGT), Total Protein, Albumin",
  "Kidney Function Test (KFT / RFT)": "Serum Creatinine, Blood Urea Nitrogen (BUN), eGFR, Uric Acid",
  "Thyroid Stimulating Hormone (TSH)": "TSH, Free T3, Free T4",
  "Lipid Profile": "Total Cholesterol, HDL, LDL, VLDL, Triglycerides",
  "Urine Routine & Microscopic (URM)": "Urine Pus Cells, RBC in Urine, Epithelial Cells, Urine Sugar, Urine Protein",
  "Serum Electrolytes": "Sodium, Potassium, Chloride",
  "Serum Calcium": "Calcium, Ionized Calcium",
  "Vitamin D (25-Hydroxy)": "Vitamin D, Calcium"
};

data = data.map(report => {
  // 1. Setup Alternative Names (AKAs)
  const ogName = report.name.replace(" Test", "");
  
  if (!report.alternativeNames) {
    report.alternativeNames = [];
  }
  
  // Mix in both En and Gu AKAs as standard alternativeNames array
  const akas = akaMap[ogName] || { en: [], gu: [] };
  const combinedAkas = [...akas.en, ...akas.gu];
  
  combinedAkas.forEach(aka => {
    if (!report.alternativeNames.includes(aka)) {
      report.alternativeNames.push(aka);
    }
  });

  // 2. Ensure all 5 markdown sections exist in detailedDescription (English)
  if (report.detailedDescription) {
    // We already fixed "How To Prepare" in previous run
    
    // Add Important Notes if missing
    if (!report.detailedDescription.includes("### Important Notes")) {
      report.detailedDescription = report.detailedDescription.replace("</en>", `\n### Important Notes\n- Always consult your doctor before making any decisions based on this report.\n</en>`);
    }

    // Add Parameters Included if missing
    if (!report.detailedDescription.includes("**Parameters Included:**")) {
      const p = paramMap[ogName] || "None specifically mapped";
      report.detailedDescription = report.detailedDescription.replace("</en>", `\n**Parameters Included:** ${p}\n</en>`);
    }
  }

  // 3. Ensure all 5 markdown sections exist in detailedDescriptionGu (Gujarati)
  if (report.detailedDescriptionGu) {
    // Add Important Notes if missing
    if (!report.detailedDescriptionGu.includes("### Important Notes")) {
      report.detailedDescriptionGu = report.detailedDescriptionGu.replace("</gu>", `\n### Important Notes\n- આ રિપોર્ટના આધારે કોઈ પણ નિર્ણય લેતા પહેલા હંમેશા તમારા ડોક્ટરની સલાહ લો.\n</gu>`);
    }

    // Add Parameters Included if missing
    if (!report.detailedDescriptionGu.includes("**Parameters Included:**")) {
      const p = paramMap[ogName] || "None specifically mapped";
      report.detailedDescriptionGu = report.detailedDescriptionGu.replace("</gu>", `\n**Parameters Included:** ${p}\n</gu>`);
    }
  }

  return report;
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log("Successfully enriched reports.json with AKAs, Important Notes, and Parameters.");
