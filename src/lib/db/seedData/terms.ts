export const termsData = [
  {
    type: "general", // mapped to general or symptom depending on use case. We'll use general for medical terms
    category: "medical_term",
    name: "Ascites",
    tags: ["symptom", "fluid", "abdomen"],
    simpleMeaning: "A buildup of fluid in the belly.",
    detailedDescription: "Ascites is the abnormal accumulation of protein-rich fluid in the peritoneal cavity (the space between the lining of the abdomen and the internal organs). In ovarian cancer, this is often malignant ascites caused by cancer cells blocking the lymphatic system or increasing the permeability of blood vessels in the peritoneum.",
    whyImportant: "It causes severe bloating, weight gain, abdominal pain, and shortness of breath (as the fluid presses against the diaphragm). It is a classic sign of advanced (Stage III/IV) ovarian cancer. It is managed by diuretics, chemotherapy, or therapeutic paracentesis (draining the fluid with a needle).",
    source: "NCI Dictionary of Cancer Terms"
  },
  {
    type: "general",
    category: "medical_term",
    name: "Metastasis",
    tags: ["spread", "advanced", "stage IV"],
    simpleMeaning: "The spread of cancer cells from where they first formed to another part of the body.",
    detailedDescription: "In metastasis, cancer cells break away from the primary tumor (e.g., the ovary), travel through the blood or lymph system, and form new tumors (metastatic tumors) in other organs. In ovarian cancer, metastasis typically occurs first within the abdominal cavity (peritoneum, omentum), and later to distant organs like the liver, lungs, or brain (which defines Stage IV).",
    whyImportant: "The presence of metastasis drastically changes the treatment intent from curative to disease control and management, requiring systemic therapies (like chemo or targeted therapy) rather than just localized surgery.",
    source: "WHO / NCI"
  },
  {
    type: "general",
    category: "medical_term",
    name: "Neutropenia",
    tags: ["blood", "chemo side effect", "immune", "ANC"],
    simpleMeaning: "An abnormally low number of neutrophils (a type of white blood cell that fights bacteria).",
    detailedDescription: "Neutrophils are the immune system's first responders against bacterial infections. Chemotherapy drugs, particularly Carboplatin and Paclitaxel, destroy fast-dividing cells in the bone marrow, leading to a drop in neutrophil production. Severe neutropenia (ANC < 500) leaves the patient defenseless against common bacteria.",
    whyImportant: "It puts the patient at extreme risk for life-threatening infections and sepsis. If a patient with neutropenia develops a fever (Febrile Neutropenia), it is a massive medical emergency requiring immediate IV antibiotics.",
    source: "ESMO Clinical Practice Guidelines"
  },
  {
    type: "general",
    category: "medical_term",
    name: "Omentum / Omental Caking",
    tags: ["anatomy", "surgery", "spread"],
    simpleMeaning: "The omentum is an apron of fatty tissue covering the intestines. 'Caking' means it is heavily infiltrated by cancer.",
    detailedDescription: "The greater omentum plays a role in immunity and fat storage in the abdomen. Ovarian cancer has a strong predilection to spread to the omentum. When it becomes thickly infiltrated with cancer cells, it forms a solid, hard mass known radiologically and surgically as 'omental caking'.",
    whyImportant: "Omentectomy (surgical removal of the omentum) is a mandatory part of ovarian cancer staging and debulking surgery. The presence of omental caking confirms advanced intra-abdominal spread.",
    source: "Surgical Oncology Principles"
  },
  {
    type: "general",
    category: "medical_term",
    name: "Progression-Free Survival (PFS)",
    tags: ["statistics", "clinical trials", "prognosis"],
    simpleMeaning: "The length of time during and after treatment that a patient lives with the disease but it does not get worse.",
    detailedDescription: "PFS is a key metric used in oncology clinical trials to determine if a new drug works. It measures the time from randomization (start of trial) until the tumor grows significantly (progression) or death occurs.",
    whyImportant: "In ovarian cancer, targeted therapies like Olaparib (PARP inhibitors) and Bevacizumab are approved because they significantly extend PFS, delaying the time until patients have to undergo another grueling round of chemotherapy.",
    source: "FDA Oncology Endpoints"
  }
];
