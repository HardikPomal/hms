import { addEntity, findEntityByNameAndType, getAllEntities } from "./knowledge";

export const seedOvarianCancerKnowledge = async () => {
  try {
    const existing = await findEntityByNameAndType("Ovarian Cancer", "condition");
    if (existing) {
      console.log("Ovarian Cancer knowledge already seeded.");
      return;
    }

    console.log("Seeding comprehensive Ovarian Cancer knowledge...");

    // 1. Main Condition Entity
    await addEntity({
      type: "condition",
      name: "Ovarian Cancer",
      nameGu: "અંડાશયનું કેન્સર",
      category: "cancer_info",
      knowledgeStatus: "advanced",
      tags: ["cancer", "ovarian", "oncology", "WHO", "gynecology", "malignancy", "tumor"],
      simpleMeaning: "Ovarian cancer is a type of cancer that begins in the ovaries, the female reproductive organs that produce eggs. It is characterized by the abnormal and uncontrolled growth of cells in the ovaries, fallopian tubes, or the peritoneum.",
      detailedDescription: "Based on World Health Organization (WHO) and International Agency for Research on Cancer (IARC) data, ovarian cancer is a major global health concern and one of the most common gynecologic cancers. Because early-stage symptoms are vague (often mimicking common gastrointestinal or pelvic issues), the disease is frequently diagnosed at an advanced stage (Stage III or IV) when it has already spread within the pelvis and abdomen. The majority (about 90%) of ovarian cancers are epithelial tumors, originating from the cells on the surface of the ovary or fallopian tube. Other less common types include germ cell tumors (from egg-producing cells) and stromal tumors (from estrogen- and progesterone-producing tissue). WHO continuously monitors ovarian cancer incidence through the Global Cancer Observatory (GLOBOCAN) and evaluates potential carcinogens (like asbestos and talc) through IARC Monographs.",
      whyImportant: "Ovarian cancer has a high mortality rate due to late-stage diagnosis. It accounts for a significant percentage of cancer-related deaths among women globally. Understanding risk factors, recognizing subtle symptoms early, and undergoing prompt diagnostic evaluation can dramatically improve survival rates. WHO emphasizes the need for better early detection methods and equitable access to multidisciplinary treatment.",
      source: "World Health Organization (WHO), IARC, Global Cancer Observatory",
    });

    // 2. Risk Factors & Epidemiology
    await addEntity({
      type: "general",
      name: "Ovarian Cancer Risk Factors",
      nameGu: "અંડાશયના કેન્સરના જોખમી પરિબળો",
      category: "cancer_info",
      knowledgeStatus: "advanced",
      tags: ["risk factors", "epidemiology", "genetics", "BRCA", "WHO"],
      simpleMeaning: "Factors that increase the chance of developing ovarian cancer, such as age, genetics, and reproductive history.",
      detailedDescription: "According to WHO and global epidemiological research, key risk factors include:\n\n1. Age: The risk increases with age, most commonly diagnosed in women over 50 (especially post-menopause).\n2. Genetics & Family History: Inherited mutations in BRCA1 and BRCA2 genes significantly increase risk. Family history of ovarian, breast, or colorectal cancer (Lynch syndrome) is a major indicator.\n3. Reproductive History: Never having been pregnant, unexplained infertility, or having children later in life can increase risk. Conversely, using oral contraceptives for several years is protective.\n4. Endometriosis: A known risk factor for specific subtypes (clear cell and endometrioid).\n5. Hormone Replacement Therapy (HRT): Long-term use of estrogen-only or combined HRT after menopause slightly increases risk.\n6. Environmental/Lifestyle: IARC has evaluated certain occupational exposures (like asbestos) and perineal use of talc-based body powder as having links to ovarian cancer.",
      whyImportant: "Identifying high-risk individuals allows for genetic counseling, closer monitoring, and sometimes risk-reducing surgeries (like prophylactic oophorectomy).",
      source: "WHO / IARC",
    });

    // 3. Symptoms
    await addEntity({
      type: "symptom",
      name: "Ovarian Cancer Symptoms",
      nameGu: "અંડાશયના કેન્સરના લક્ષણો",
      category: "cancer_info",
      knowledgeStatus: "advanced",
      tags: ["symptoms", "warning signs", "bloating", "pelvic pain"],
      simpleMeaning: "The physical signs that may indicate ovarian cancer. They are often vague and easy to ignore.",
      detailedDescription: "Early-stage ovarian cancer rarely causes symptoms. Advanced-stage ovarian cancer may cause few and nonspecific symptoms that are often mistaken for more common benign conditions (like constipation or irritable bowel). The most common symptoms include:\n\n1. Abdominal bloating or an increase in abdominal size.\n2. Pelvic or abdominal pain/discomfort.\n3. Difficulty eating or feeling full quickly (early satiety).\n4. Urinary symptoms (urgency or frequency).\n\nOther symptoms can include fatigue, upset stomach, back pain, pain during sex, constipation, and menstrual changes. Persistent symptoms (occurring on most days for a few weeks) require medical evaluation.",
      whyImportant: "Because there is no highly effective routine screening test for ovarian cancer, recognizing these subtle symptoms is the primary way the disease is currently detected. Prompt reporting of persistent symptoms to a healthcare provider is critical.",
      source: "WHO Guidelines / Global Oncology Standards",
    });

    // 4. Diagnosis and Screening
    await addEntity({
      type: "general",
      name: "Ovarian Cancer Diagnosis",
      nameGu: "અંડાશયના કેન્સરનું નિદાન",
      category: "cancer_info",
      knowledgeStatus: "advanced",
      tags: ["diagnosis", "screening", "ultrasound", "biopsy"],
      simpleMeaning: "The tests and procedures used to detect and confirm the presence of ovarian cancer.",
      detailedDescription: "Diagnosis typically involves a combination of methods:\n\n1. Pelvic Exam: Checking the size, shape, and consistency of the ovaries and uterus.\n2. Imaging Tests: Transvaginal Ultrasound (TVUS) is often the first imaging step to look for ovarian masses. CT scans, MRIs, and PET scans are used to determine if cancer has spread.\n3. Blood Tests: The CA-125 test measures the level of a protein often elevated in ovarian cancer. Other markers include HE4, AFP, and hCG (depending on the tumor type).\n4. Surgical Biopsy: The only definitive way to diagnose ovarian cancer is by examining tissue or fluid under a microscope, usually obtained during surgery.\n\nNote: Routine population screening (e.g., using CA-125 and ultrasound for all women) is not currently recommended by WHO as it has not been shown to significantly reduce mortality and can lead to unnecessary surgeries.",
      whyImportant: "Accurate diagnosis and staging are essential for developing an effective treatment plan. Staging determines how far the cancer has spread, from Stage I (confined to ovaries) to Stage IV (spread to distant organs like the liver or lungs).",
      source: "WHO / Clinical Oncology Guidelines",
    });

    // 5. CA-125 Tumor Marker
    await addEntity({
      type: "parameter",
      name: "CA-125",
      nameGu: "CA-125 (ટ્યુમર માર્કર)",
      category: "lab_parameter",
      knowledgeStatus: "advanced",
      tags: ["blood test", "tumor marker", "CA-125", "ovarian cancer", "monitoring"],
      simpleMeaning: "Cancer Antigen 125 is a protein found in the blood. High levels can be a sign of ovarian cancer or other conditions.",
      detailedDescription: "CA-125 is a biomarker frequently used in the context of ovarian cancer. While significantly elevated levels can indicate epithelial ovarian cancer, CA-125 can also be elevated by benign conditions such as endometriosis, pelvic inflammatory disease, fibroids, or even menstruation. Therefore, it is not a perfect screening tool for the general population.",
      whyImportant: "CA-125 is most useful for monitoring how well a patient is responding to ovarian cancer treatment (levels should drop if treatment is working) and for checking for recurrence of the disease after treatment has finished.",
      source: "WHO / Lab Standards",
    });

    // 6. Treatment Modalities
    await addEntity({
      type: "general",
      name: "Ovarian Cancer Treatment",
      nameGu: "અંડાશયના કેન્સરની સારવાર",
      category: "treatment",
      knowledgeStatus: "advanced",
      tags: ["surgery", "chemotherapy", "targeted therapy", "treatment", "oncology"],
      simpleMeaning: "The medical approaches used to remove or destroy ovarian cancer cells.",
      detailedDescription: "Treatment for ovarian cancer is usually multidisciplinary and depends on the stage, type of cancer, and the patient's overall health:\n\n1. Surgery: The primary treatment. The goal is 'optimal debulking' or cytoreduction (removing as much of the tumor as possible). This often involves a hysterectomy (removal of uterus), bilateral salpingo-oophorectomy (removal of both ovaries and fallopian tubes), and removal of the omentum and lymph nodes.\n2. Chemotherapy: Usually given after surgery (adjuvant) to kill any remaining cancer cells, most commonly involving a platinum compound (like carboplatin) and a taxane (like paclitaxel). Sometimes given before surgery (neoadjuvant) to shrink large tumors.\n3. Targeted Therapy: Drugs like PARP inhibitors (e.g., olaparib) are highly effective, especially for patients with BRCA mutations. Anti-angiogenesis drugs (like bevacizumab) may be used to starve the tumor of blood vessels.\n4. Immunotherapy and Hormone Therapy: Used in specific cases or clinical trials.",
      whyImportant: "A combination of aggressive cytoreductive surgery and systemic chemotherapy remains the gold standard of care. Access to targeted therapies is changing the landscape of ovarian cancer survival, as highlighted by global health initiatives.",
      source: "WHO Essential Medicines / Oncology Standards",
    });

    // 7. Prevention and Global Perspective
    await addEntity({
      type: "general",
      name: "Ovarian Cancer Prevention & Global Perspective",
      nameGu: "કેન્સર નિવારણ અને વૈશ્વિક પરિપ્રેક્ષ્ય",
      category: "cancer_info",
      knowledgeStatus: "advanced",
      tags: ["prevention", "global health", "WHO", "IARC", "statistics"],
      simpleMeaning: "Strategies to reduce the risk of ovarian cancer and the global impact of the disease.",
      detailedDescription: "While there is no surefire way to prevent ovarian cancer, certain factors can reduce risk: long-term use of oral contraceptives, pregnancy and breastfeeding, and risk-reducing surgeries (tubal ligation or prophylactic oophorectomy for high-risk genetic carriers).\n\nGlobally, WHO and the Global Cancer Observatory emphasize that ovarian cancer incidence varies by region, with higher rates generally seen in high-income countries, though mortality remains a massive challenge in low- and middle-income countries due to lack of access to early diagnostics and specialized surgical oncology. WHO advocates for strengthening health systems to provide equitable access to cancer diagnosis, essential medicines (including chemotherapy), and palliative care.",
      whyImportant: "Raising awareness of the subtle symptoms and genetic risks, combined with improving global healthcare access, are WHO's key strategies to reduce the burden and mortality of ovarian cancer worldwide.",
      source: "WHO Global Cancer Control / GLOBOCAN",
    });

    console.log("Successfully seeded Ovarian Cancer knowledge!");
  } catch (error) {
    console.error("Error seeding Ovarian Cancer knowledge:", error);
  }
};
