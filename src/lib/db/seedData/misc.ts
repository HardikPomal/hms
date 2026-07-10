export const exerciseData = [
  {
    type: "general",
    category: "exercise",
    name: "Pelvic Floor Exercises (Kegels)",
    tags: ["exercise", "pelvic", "post-surgery"],
    simpleMeaning: "Squeezing and relaxing the muscles that support your bladder, bowel, and uterus.",
    detailedDescription: "After a total hysterectomy and pelvic surgery for ovarian cancer, the pelvic floor muscles can weaken. Kegel exercises involve contracting the pelvic floor muscles (the same ones used to stop the flow of urine) for a few seconds, then releasing. This should be done gradually and only after surgical clearance.",
    whyImportant: "Helps prevent urinary and fecal incontinence, a common side effect of extensive pelvic surgery.",
    source: "American Physical Therapy Association (APTA)"
  },
  {
    type: "general",
    category: "exercise",
    name: "Gentle Walking (During Chemo)",
    tags: ["exercise", "fatigue", "cardio"],
    simpleMeaning: "Short, regular walks to maintain blood flow and energy.",
    detailedDescription: "While high-intensity exercise is often difficult during chemotherapy, maintaining a low-intensity routine like walking 15-30 minutes a day is highly recommended. It should be done during times of the day when energy is highest.",
    whyImportant: "Paradoxically, light exercise is one of the most effective, evidence-based treatments for Cancer-Related Fatigue (CRF). It also helps prevent blood clots (DVT) which ovarian cancer patients are at high risk for, and stimulates bowel movements to counter chemotherapy-induced constipation.",
    source: "ACSM (American College of Sports Medicine) Cancer Guidelines"
  }
];

export const adviceData = [
  {
    type: "general",
    category: "doctor_advice",
    name: "When to Visit the ER",
    tags: ["emergency", "fever", "neutropenia"],
    simpleMeaning: "Crucial danger signs that mean you must go to the Emergency Room immediately.",
    detailedDescription: "Ovarian cancer patients on active chemotherapy must go to the ER if they experience: \n1. A fever of 100.4°F (38°C) or higher (Neutropenic Fever is a medical emergency).\n2. Uncontrollable vomiting or inability to keep fluids down for 24 hours.\n3. Sudden, severe abdominal pain or swelling.\n4. Shortness of breath or chest pain (risk of pulmonary embolism).\n5. Bleeding that won't stop.",
    whyImportant: "Because chemotherapy suppresses the immune system and increases blood clot risk, ignoring these signs can be fatal within hours.",
    source: "NCCN Patient Guidelines"
  },
  {
    type: "general",
    category: "doctor_advice",
    name: "Port-a-Cath Care",
    tags: ["hygiene", "surgery", "infection"],
    simpleMeaning: "How to take care of the IV port implanted under your skin.",
    detailedDescription: "Many patients have a port implanted in their chest to receive chemotherapy. To care for it: Keep the incision clean and dry until healed. Once healed, you can bathe normally. The port must be 'flushed' with saline and heparin every 4 to 6 weeks by a nurse if not in active use to prevent blood clots from forming inside it.",
    whyImportant: "A clotted or infected port can cause severe systemic infections and may require surgical removal, delaying life-saving chemotherapy.",
    source: "Oncology Nursing Society (ONS)"
  }
];

export const generalData = [
  {
    type: "general",
    category: "general",
    name: "BMI & BSA (Body Surface Area)",
    tags: ["calculation", "dosing", "chemotherapy"],
    simpleMeaning: "Measurements used to figure out exactly how much chemotherapy drug you need.",
    detailedDescription: "While Body Mass Index (BMI) evaluates weight categories, Body Surface Area (BSA) is the standard metric used in oncology to calculate chemotherapy doses (e.g., mg/m²). It is calculated using the patient's height and weight. Drugs like Paclitaxel are dosed strictly by BSA. Carboplatin, uniquely, is dosed by the Calvert Formula which uses GFR (kidney function) and a target AUC (Area Under the Curve).",
    whyImportant: "Accurate calculation is a matter of life and death: too little drug means the cancer survives; too much drug causes fatal toxicity.",
    source: "ASCO Dosing Guidelines"
  }
];
