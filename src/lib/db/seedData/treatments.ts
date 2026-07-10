export const treatmentsData = [
  {
    type: "treatment",
    category: "treatment",
    name: "Cytoreductive Surgery (Debulking)",
    tags: ["surgery", "primary treatment", "omental caking"],
    simpleMeaning: "A major surgery to remove as much of the cancer as humanly possible from the belly.",
    detailedDescription: "Cytoreduction is the cornerstone of ovarian cancer treatment. The surgical goal is 'R0' (no macroscopic visible disease remaining). This often requires a total abdominal hysterectomy (TAH), bilateral salpingo-oophorectomy (BSO), omentectomy, lymph node dissection, and sometimes bowel resection or stripping of the diaphragm lining if the cancer has spread there.",
    whyImportant: "Survival in ovarian cancer is directly correlated with the amount of tumor left behind after surgery. Patients who achieve 'optimal debulking' (less than 1cm of residual disease) or complete gross resection live significantly longer.",
    source: "Society of Gynecologic Oncology (SGO) Guidelines"
  },
  {
    type: "treatment",
    category: "treatment",
    name: "HIPEC (Hyperthermic Intraperitoneal Chemotherapy)",
    tags: ["surgery", "chemotherapy", "advanced"],
    simpleMeaning: "Washing the inside of the belly with heated chemotherapy drugs immediately after removing the tumors during surgery.",
    detailedDescription: "After the surgeon has removed all visible tumors, a heated solution of chemotherapy (usually Cisplatin) is circulated continuously throughout the abdominal cavity for about 90 minutes. Heat enhances the penetration of the chemotherapy into the tissues, killing microscopic cancer cells left behind on the peritoneal surfaces.",
    whyImportant: "Clinical trials have shown that adding HIPEC to interval cytoreductive surgery significantly improves overall survival and progression-free survival for Stage III ovarian cancer patients.",
    source: "New England Journal of Medicine (NEJM) Clinical Trials"
  },
  {
    type: "treatment",
    category: "treatment",
    name: "Neoadjuvant Chemotherapy (NACT)",
    tags: ["chemotherapy", "timing", "stage IV"],
    simpleMeaning: "Giving chemotherapy before surgery to shrink the tumors and make the surgery safer and more successful.",
    detailedDescription: "For patients who have very extensive disease (e.g., massive ascites, heavy tumor burden around the liver or intestines) where upfront surgery cannot achieve optimal debulking, oncologists will give 3-4 cycles of chemotherapy first. This shrinks the tumors. Then, 'Interval Debulking Surgery' (IDS) is performed, followed by the remaining chemo cycles.",
    whyImportant: "It reduces surgical complications, decreases time spent in the ICU, and lowers blood loss during surgery, achieving similar survival outcomes to upfront surgery for high-burden disease.",
    source: "CHORUS and EORTC Clinical Trials"
  }
];

export const nutritionData = [
  {
    type: "diet",
    category: "nutrition",
    name: "High-Protein, High-Calorie Diet (During Chemo)",
    tags: ["diet", "weight loss", "cachexia", "chemotherapy"],
    simpleMeaning: "Eating foods packed with energy and protein to help the body repair itself during harsh treatments.",
    detailedDescription: "Chemotherapy damages healthy cells alongside cancer cells. The body requires significantly more protein (e.g., eggs, chicken, fish, lentils, Greek yogurt, protein shakes) and calories to rebuild tissues, maintain muscle mass, and prevent cancer cachexia (severe muscle wasting).",
    whyImportant: "Patients who maintain their weight and muscle mass tolerate chemotherapy much better, experience less severe fatigue, and have fewer treatment delays.",
    source: "American Cancer Society - Nutrition for Cancer Patients"
  },
  {
    type: "food",
    category: "nutrition",
    name: "Ginger & Peppermint",
    tags: ["food", "nausea", "symptom management"],
    simpleMeaning: "Natural foods that can help settle the stomach and reduce nausea.",
    detailedDescription: "Ginger contains active compounds (gingerols) that interact with serotonin receptors in the gut, similar to anti-nausea medications. Peppermint helps relax the gastrointestinal muscles.",
    whyImportant: "Used as a complementary dietary approach alongside medical antiemetics (like Ondansetron) to manage chemotherapy-induced nausea and vomiting (CINV). Best consumed in teas, raw grated, or in candies.",
    source: "Oncology Nutrition Dietetic Practice Group"
  },
  {
    type: "diet",
    category: "nutrition",
    name: "Neutropenic Diet (Food Safety)",
    tags: ["diet", "neutropenia", "infection prevention"],
    simpleMeaning: "A strict food hygiene protocol for patients with very low white blood cells to prevent foodborne illnesses.",
    detailedDescription: "When ANC (Absolute Neutrophil Count) is low, patients cannot fight off bacteria found in raw foods. Rules include: No raw meats or sushi, no unpasteurized dairy or juices, no raw sprouts, thoroughly washing and peeling all raw fruits/vegetables, and ensuring all hot food is served steaming hot.",
    whyImportant: "A simple foodborne bacteria (like Listeria or Salmonella), which might just cause a stomach ache in a healthy person, can cause fatal sepsis in a severely neutropenic patient.",
    source: "CDC / NCCN Supportive Care"
  }
];
