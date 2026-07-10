const fs = require('fs');

const path = 'src/data/seed/reports.json';
let data = JSON.parse(fs.readFileSync(path, 'utf8'));

// The lab parameter names that conflict
const conflictingNames = [
  "Alpha-Fetoprotein (AFP)",
  "Lactate Dehydrogenase (LDH)",
  "Beta-hCG (Human Chorionic Gonadotropin)",
  "CA-125 (Cancer Antigen 125)"
];

const paramMap = {
  "Alpha-Fetoprotein (AFP)": "Alpha-Fetoprotein (AFP)",
  "Lactate Dehydrogenase (LDH)": "LDH",
  "Beta-hCG (Human Chorionic Gonadotropin)": "Beta-hCG",
  "CA-125 (Cancer Antigen 125)": "CA-125",
  "Complete Blood Count (CBC)": "Hemoglobin, RBC Count, Hematocrit, MCV, MCH, MCHC, RDW, Platelet Count, MPV, WBC Count, Neutrophils, Lymphocytes, Eosinophils, Monocytes, Basophils, ANC (Absolute Neutrophil Count)",
  "Liver Function Test (LFT)": "Total Bilirubin, Direct Bilirubin, Indirect Bilirubin, SGPT (ALT), SGOT (AST), Alkaline Phosphatase (ALP), Gamma-GT (GGT), Total Protein, Albumin, Globulin, A/G Ratio",
  "Kidney Function Test (KFT / RFT)": "Serum Creatinine, Blood Urea Nitrogen (BUN), eGFR, Uric Acid, Sodium, Potassium, Chloride, Calcium",
  "Tumor Marker Panel (CA-125, HE4, CEA)": "CA-125, HE4, ROMA Score, CEA, CA 19-9"
};

data = data.map(report => {
  if (conflictingNames.includes(report.name)) {
    report.name = report.name + " Test";
    // Also update Gujarati name slightly if we wanted, but not strictly necessary since English name drives indexing uniqueness in some cases.
    // Actually, let's append ' ટેસ્ટ' to Gujarati name as well.
    report.nameGu = report.nameGu + " ટેસ્ટ";
  }

  if (report.detailedDescription) {
    report.detailedDescription = report.detailedDescription.replace(/### How To Prepare\b/g, "### How To Prepare For The Test");
  }
  if (report.detailedDescriptionGu) {
    report.detailedDescriptionGu = report.detailedDescriptionGu.replace(/### કેવી રીતે તૈયારી કરવી\b/g, "### કેવી રીતે તૈયારી કરવી"); // This is already fine, just ensuring English parser doesn't break
  }

  // Find original name for param mapping
  const originalName = conflictingNames.includes(report.name.replace(" Test", "")) ? report.name.replace(" Test", "") : report.name;
  
  if (paramMap[originalName]) {
    report.detailedDescription = report.detailedDescription.replace("</en>", `\n**Parameters Included:** ${paramMap[originalName]}\n</en>`);
    report.detailedDescriptionGu = report.detailedDescriptionGu.replace("</gu>", `\n**Parameters Included:** ${paramMap[originalName]}\n</gu>`);
  }

  return report;
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log("Successfully updated reports.json");
