export const cancerInfoData = [
  {
    type: "condition",
    category: "cancer_info",
    name: "Epithelial Ovarian Cancer",
    tags: ["type", "HGSOC", "most common"],
    simpleMeaning: "The most common type of ovarian cancer, starting in the cells covering the surface of the ovary or fallopian tube.",
    detailedDescription: "Epithelial tumors account for about 90% of all ovarian cancers. The most common and aggressive subtype is High-Grade Serous Ovarian Carcinoma (HGSOC), which actually often originates in the fimbriae (ends) of the fallopian tubes rather than the ovary itself. Other epithelial subtypes include Endometrioid, Clear Cell, and Mucinous carcinomas, which have different genetic drivers and responses to chemotherapy.",
    whyImportant: "Understanding the exact subtype is crucial. HGSOC responds very well initially to platinum chemotherapy but recurs frequently. Clear cell and mucinous types are more resistant to standard chemo, often requiring different treatment strategies.",
    source: "WHO Classification of Female Genital Tumors"
  },
  {
    type: "general",
    category: "cancer_info",
    name: "FIGO Staging for Ovarian Cancer",
    tags: ["staging", "spread", "prognosis"],
    simpleMeaning: "The international system used to describe how far the ovarian cancer has spread in the body.",
    detailedDescription: "Created by the International Federation of Gynecology and Obstetrics (FIGO).\n- Stage I: Cancer is confined to one or both ovaries/fallopian tubes.\n- Stage II: Cancer has spread to other organs within the pelvis (like the uterus or bladder).\n- Stage III: Cancer has spread outside the pelvis into the upper abdomen (peritoneum, omentum) or lymph nodes.\n- Stage IV: Cancer has spread to distant organs (e.g., inside the liver, lungs, or pleural fluid).",
    whyImportant: "Staging strictly dictates the treatment plan and is the strongest predictor of survival. Most patients (approx 70%) are diagnosed at Stage III or IV because early stages have no distinct symptoms.",
    source: "FIGO Staging Guidelines"
  },
  {
    type: "general",
    category: "cancer_info",
    name: "Platinum-Sensitive vs. Platinum-Resistant",
    tags: ["recurrence", "treatment choice", "chemotherapy"],
    simpleMeaning: "Categories defining how the cancer reacts to platinum-based chemotherapy (like Carboplatin) when it returns.",
    detailedDescription: "If ovarian cancer recurs, it is classified based on the 'Platinum-Free Interval' (time since the last dose of platinum chemo):\n- Platinum-Sensitive: The cancer returns MORE than 6 months after the last platinum dose. These patients are usually retreated with platinum-based chemo.\n- Platinum-Resistant: The cancer returns WITHIN 6 months. These patients are typically given non-platinum single agents (like Doxorubicin, Topotecan, or Gemcitabine) because the tumor has mutated to resist platinum.\n- Platinum-Refractory: The cancer grows while actually receiving platinum chemo.",
    whyImportant: "This is the primary determining factor for what drugs an oncologist will choose to treat a recurrence.",
    source: "Gynecologic Oncology Group (GOG) Definitions"
  }
];
