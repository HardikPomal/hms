export const reportsData = [
  {
    type: "report_template",
    name: "PET-CT Scan",
    category: "medical_report",
    tags: ["imaging", "staging", "metastasis", "nuclear medicine"],
    simpleMeaning: "An advanced scan that highlights areas in the body where cells are using a lot of sugar, which often indicates cancer.",
    detailedDescription: "Positron Emission Tomography – Computed Tomography (PET-CT) combines a PET scan (which uses a radioactive sugar tracer, FDG, to show metabolic activity) with a CT scan (which shows detailed anatomical structure). Cancer cells, including ovarian cancer, typically grow rapidly and consume more glucose than normal cells, making them 'light up' (high SUV - Standardized Uptake Value) on the PET scan.",
    whyImportant: "It is critical for staging ovarian cancer, detecting distant metastasis (spread beyond the pelvis/abdomen), evaluating the effectiveness of chemotherapy (if tumors are shrinking and using less sugar), and checking for recurrence when CA-125 levels rise but regular CT scans are clear.",
    source: "NCCN Guidelines / Radiology Protocols"
  },
  {
    type: "report_template",
    name: "BRCA1 / BRCA2 Mutation Analysis",
    category: "medical_report",
    tags: ["genetics", "mutation", "blood test", "hereditary"],
    simpleMeaning: "A genetic blood or saliva test to see if a person carries mutations in the BRCA genes, which increase the risk of ovarian and breast cancer.",
    detailedDescription: "BRCA1 and BRCA2 are tumor suppressor genes that help repair damaged DNA. When they are mutated, DNA repair is faulty (Homologous Recombination Deficiency), leading to a higher likelihood of cancer development. This test can be performed on germline (inherited, usually via blood) or somatic (tumor tissue) samples.",
    whyImportant: "Extremely important for three reasons: 1) Determining if family members are at risk. 2) Prognosis (BRCA-mutated ovarian cancers often respond better to platinum chemotherapy). 3) Treatment selection: It is the primary indicator that a patient will benefit massively from PARP inhibitors like Olaparib.",
    source: "ASCO / ESMO Genetic Testing Guidelines"
  },
  {
    type: "report_template",
    name: "HRD Testing (Homologous Recombination Deficiency)",
    category: "medical_report",
    tags: ["genetics", "tumor biology", "biomarker", "tissue test"],
    simpleMeaning: "A test on the tumor tissue to see if the cancer cells have a specific inability to repair their own DNA.",
    detailedDescription: "HRD testing looks beyond just BRCA1/2. It checks for a 'genomic scar'—a pattern of DNA damage indicating that the tumor cannot repair double-strand DNA breaks via the homologous recombination pathway. Tests like Myriad myChoice or FoundationOne evaluate Loss of Heterozygosity (LOH), Telomeric Allelic Imbalance (TAI), and Large-scale State Transitions (LST).",
    whyImportant: "About 50% of high-grade serous ovarian cancers have HRD. Patients who test positive for HRD (even if their BRCA genes are normal) are still excellent candidates for targeted PARP inhibitor therapy (like Niraparib or Olaparib + Bevacizumab).",
    source: "NCCN Guidelines on Ovarian Cancer Biomarkers"
  },
  {
    type: "report_template",
    name: "Histopathology / Biopsy Report",
    category: "medical_report",
    tags: ["diagnosis", "microscope", "tissue", "grading"],
    simpleMeaning: "The final, definitive report from a pathologist who looks at the tumor tissue under a microscope to confirm cancer.",
    detailedDescription: "This report details the macroscopic and microscopic examination of surgical specimens (like ovaries, fallopian tubes, omentum). It confirms the exact histological type of ovarian cancer (e.g., High-Grade Serous, Clear Cell, Endometrioid, Mucinous). It also establishes the tumor grade (how aggressive the cells look) and surgical margins (if the edges of the removed tissue are clear of cancer).",
    whyImportant: "It is the ultimate source of truth for diagnosing ovarian cancer. The specific subtype dictates the expected clinical behavior and guides the chemotherapy protocol. For example, Clear Cell carcinoma is known to be less responsive to standard platinum chemotherapy than High-Grade Serous.",
    source: "College of American Pathologists (CAP) Protocols"
  },
  {
    type: "report_template",
    name: "CT Scan of Abdomen and Pelvis",
    category: "medical_report",
    tags: ["imaging", "staging", "ascites"],
    simpleMeaning: "A detailed 3D X-ray of the belly and pelvic area to look for tumors, enlarged lymph nodes, or fluid build-up.",
    detailedDescription: "Usually performed with oral and intravenous contrast dye. It provides high-resolution anatomical cross-sections of the abdominal cavity. The radiologist looks for primary ovarian masses, peritoneal carcinomatosis (cancer spread to the lining of the abdomen), omental caking, enlarged lymph nodes, and ascites (fluid in the belly).",
    whyImportant: "It is the standard imaging modality used for the initial staging of ovarian cancer and for monitoring the physical size of tumors during and after chemotherapy (using RECIST criteria).",
    source: "ACR Appropriateness Criteria"
  }
];
