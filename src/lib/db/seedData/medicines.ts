export const medicinesData = [
  {
    type: "medication",
    name: "Carboplatin",
    category: "medicine",
    tags: ["chemotherapy", "platinum", "ovarian cancer", "first-line"],
    simpleMeaning: "A platinum-based chemotherapy drug that kills cancer cells by damaging their DNA.",
    detailedDescription: "Carboplatin is a core, first-line chemotherapy medication for ovarian cancer. It works by forming cross-links in DNA, which prevents the cancer cells from dividing and eventually causes them to undergo apoptosis (programmed cell death). It is usually administered intravenously in a hospital or clinic setting, often in combination with a taxane (like Paclitaxel). Dosage is typically calculated based on the area under the curve (AUC) using the Calvert formula, factoring in the patient's kidney function (GFR).",
    whyImportant: "It is the backbone of ovarian cancer chemotherapy protocols (e.g., Carbo/Taxol). \n\nMajor Side Effects: Myelosuppression (bone marrow suppression leading to low platelets, low white blood cells, and anemia), nausea, vomiting, fatigue, and neuropathy (though less severe than Cisplatin).\nMonitoring: Requires frequent CBCs, kidney function tests (Creatinine), and electrolyte monitoring.",
    source: "NCCN / ESMO Guidelines"
  },
  {
    type: "medication",
    name: "Paclitaxel (Taxol)",
    category: "medicine",
    tags: ["chemotherapy", "taxane", "ovarian cancer", "first-line", "alopecia"],
    simpleMeaning: "A chemotherapy drug that stops cancer cells from dividing by freezing their internal skeleton.",
    detailedDescription: "Paclitaxel belongs to the class of drugs known as taxanes. It disrupts the microtubule network essential for cell division (mitosis), stopping the cancer cells from multiplying. It is the standard partner drug to Carboplatin for first-line treatment of epithelial ovarian cancer. Because it is formulated in Cremophor EL (castor oil), patients must receive pre-medication (like dexamethasone and antihistamines) to prevent severe allergic reactions.",
    whyImportant: "Combined with Carboplatin, it provides one of the most effective regimens for advanced ovarian cancer. \n\nMajor Side Effects: Complete hair loss (alopecia), peripheral neuropathy (numbness/tingling in hands and feet), neutropenia, muscle and joint pain (myalgia/arthralgia).\nMonitoring: CBC for neutropenia, neurological checks for neuropathy progression.",
    source: "NCCN / ESMO Guidelines"
  },
  {
    type: "medication",
    name: "Olaparib (Lynparza)",
    category: "medicine",
    tags: ["targeted therapy", "PARP inhibitor", "maintenance", "BRCA", "oral"],
    simpleMeaning: "A daily pill that targets a specific weakness in cancer cells (especially those with BRCA mutations) to stop them from repairing their DNA.",
    detailedDescription: "Olaparib is an oral poly (ADP-ribose) polymerase (PARP) inhibitor. It exploits the concept of synthetic lethality: cancer cells with BRCA mutations already have a defective homologous recombination repair (HRR) pathway. Olaparib blocks PARP, their backup DNA repair mechanism, causing fatal DNA damage to the cancer cells while sparing normal cells. It is heavily used as maintenance therapy for patients who have responded to platinum-based chemotherapy.",
    whyImportant: "Revolutionized ovarian cancer treatment, significantly prolonging progression-free survival in patients with BRCA mutations or HRD (Homologous Recombination Deficiency).\n\nMajor Side Effects: Fatigue, anemia, nausea, vomiting, changes in taste, and rarely, secondary leukemias (MDS/AML).\nMonitoring: Monthly CBC to check for severe anemia.",
    source: "FDA / NCCN / ASCO Guidelines"
  },
  {
    type: "medication",
    name: "Bevacizumab (Avastin)",
    category: "medicine",
    tags: ["targeted therapy", "anti-angiogenesis", "VEGF inhibitor", "maintenance", "IV"],
    simpleMeaning: "A targeted therapy given by IV that starves tumors by preventing them from growing new blood vessels.",
    detailedDescription: "Bevacizumab is a monoclonal antibody that binds to Vascular Endothelial Growth Factor (VEGF). Tumors secrete VEGF to create new blood vessels (angiogenesis) to supply themselves with nutrients and oxygen. By neutralizing VEGF, Bevacizumab 'starves' the tumor and also normalizes the chaotic tumor vasculature, potentially improving the delivery of chemotherapy drugs.",
    whyImportant: "Used in both frontline therapy (alongside Carboplatin/Paclitaxel) and maintenance therapy, especially for patients with a high burden of disease or ascites.\n\nMajor Side Effects: High blood pressure (hypertension), proteinuria (protein in urine), increased risk of bleeding, poor wound healing, and a rare but serious risk of bowel perforation.\nMonitoring: Blood pressure checks, urine dipstick for protein prior to every dose, monitoring for abdominal pain.",
    source: "FDA / NCCN / ESMO Guidelines"
  },
  {
    type: "medication",
    name: "Ondansetron (Zofran)",
    category: "medicine",
    tags: ["antiemetic", "nausea", "supportive care"],
    simpleMeaning: "A highly effective medication used to prevent nausea and vomiting caused by chemotherapy.",
    detailedDescription: "Ondansetron is a serotonin 5-HT3 receptor antagonist. It works by blocking the action of serotonin, a natural substance that may cause nausea and vomiting, both centrally in the brain (chemoreceptor trigger zone) and peripherally in the gut.",
    whyImportant: "Crucial for maintaining patient quality of life and nutritional intake during chemotherapy like Carboplatin. \n\nMajor Side Effects: Constipation (very common), headache, and in rare cases, QT prolongation on an ECG.\nPatient Advice: Take exactly as prescribed, usually before chemo and regularly for a few days after. Manage constipation proactively.",
    source: "WHO Essential Medicines"
  },
  {
    type: "medication",
    name: "Filgrastim / Pegfilgrastim (Neupogen / Neulasta)",
    category: "medicine",
    tags: ["growth factor", "G-CSF", "neutropenia", "supportive care", "injection"],
    simpleMeaning: "An injection that stimulates the bone marrow to produce more white blood cells to prevent infections.",
    detailedDescription: "These are Granulocyte Colony-Stimulating Factors (G-CSF). Chemotherapy frequently destroys fast-dividing neutrophils, leading to neutropenia (dangerously low white blood cell counts) and leaving the patient highly vulnerable to life-threatening infections. These drugs signal the bone marrow to rapidly produce and release new neutrophils.",
    whyImportant: "Prevents severe infections and avoids delays in chemotherapy cycles.\n\nMajor Side Effects: Bone pain (often in the sternum, pelvis, and long bones) caused by the rapid expansion of bone marrow; sometimes fatigue and low-grade fever.\nPatient Advice: Taking an over-the-counter antihistamine (like Claritin/Loratadine) is clinically shown to help reduce the bone pain associated with these injections.",
    source: "ASCO Guidelines on White Blood Cell Growth Factors"
  },
  {
    type: "medication",
    name: "Dexamethasone",
    category: "medicine",
    tags: ["steroid", "corticosteroid", "supportive care", "anti-nausea", "pre-medication"],
    simpleMeaning: "A strong steroid used to prevent allergic reactions to chemotherapy and to reduce nausea.",
    detailedDescription: "Dexamethasone is a potent synthetic glucocorticoid. In ovarian cancer treatment, it serves two massive roles: 1) It is a critical pre-medication before Paclitaxel to prevent hypersensitivity (allergic) reactions. 2) It works synergistically with 5-HT3 antagonists (like Ondansetron) to prevent delayed chemotherapy-induced nausea and vomiting (CINV).",
    whyImportant: "Essential for the safe administration of taxane chemotherapy and for CINV control.\n\nMajor Side Effects: Insomnia, increased appetite, increased blood sugar (hyperglycemia - very important for diabetic patients), mood changes, and fluid retention.\nPatient Advice: Take early in the day if possible to prevent insomnia. Diabetics must monitor blood sugar closely as it will spike.",
    source: "NCCN Antiemesis Guidelines"
  }
];
