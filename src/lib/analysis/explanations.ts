// Simple-language explanations for common medical terms
// Always educational, never diagnostic

export interface FieldExplanation {
  en: string;
  gu: string;
  highEn?: string;
  highGu?: string;
  lowEn?: string;
  lowGu?: string;
}

export const FIELD_EXPLANATIONS: Record<string, FieldExplanation> = {
  hemoglobin: {
    en: "Hemoglobin carries oxygen in your blood to all parts of your body.",
    gu: "હિમોગ્લોબિન લોહીમાં ઓક્સિજન વહન કરે છે.",
    highEn: "Your hemoglobin is a bit high. This is usually not a concern but worth discussing with your doctor.",
    highGu: "તમારું હિમોગ્લોબિન થોડું વધારે છે. ડૉક્ટર સાથે ચર્ચા કરો.",
    lowEn: "Your hemoglobin is low. This means your blood may not be carrying enough oxygen. You may feel tired or weak. Please discuss with your doctor.",
    lowGu: "તમારું હિમોગ્લોબિન ઓછું છે. આ થાક અને નબળાઈ કરી શકે છે. ડૉક્ટરને જણાવો.",
  },
  wbc: {
    en: "White blood cells help your body fight infections and diseases.",
    gu: "શ્વેત રક્તકણો ઇન્ફેક્શન સામે લડે છે.",
    highEn: "Your white blood cell count is high. This may indicate infection or inflammation. Your doctor will guide you.",
    highGu: "શ્વેત રક્તકણો વધારે છે. ઇન્ફેક્શન હોઈ શકે. ડૉક્ટરને જણાવો.",
    lowEn: "Your white blood cell count is low. This can happen during chemotherapy and means your body needs extra care to avoid infections.",
    lowGu: "શ્વેત રક્તકણો ઓછા છે. કીમો દરમ્યાન આ સામાન્ય છે. ઇન્ફેક્શનથી બચો.",
  },
  "wbc count": {
    en: "White blood cells help your body fight infections and diseases.",
    gu: "શ્વેત રક્તકણો ઇન્ફેક્શન સામે લડે છે.",
    highEn: "Your white blood cell count is high. This may indicate infection or inflammation. Your doctor will guide you.",
    highGu: "શ્વેત રક્તકણો વધારે છે. ઇન્ફેક્શન હોઈ શકે. ડૉક્ટરને જણાવો.",
    lowEn: "Your white blood cell count is low. This can happen during chemotherapy. Avoid crowded places and maintain hygiene.",
    lowGu: "શ્વેત રક્તકણો ઓછા છે. ભીડવાળી જગ્યાઓ ટાળો.",
  },
  platelets: {
    en: "Platelets help your blood clot when you get a cut or injury.",
    gu: "પ્લેટલેટ્સ લોહી ગઠ્ઠો બનાવવામાં મદદ કરે છે.",
    highEn: "Your platelet count is above normal. This will be monitored by your doctor.",
    highGu: "પ્લેટલેટ્સ સામાન્ય કરતા વધારે છે. ડૉક્ટર નિગ્રાહ રાખશે.",
    lowEn: "Your platelet count is low. You may bruise or bleed more easily. Be careful to avoid injuries. Discuss with your doctor.",
    lowGu: "પ્લેટલેટ્સ ઓછા છે. ઈજાઓ ટાળો. ઊઝળ જવાનું ધ્યાન રાખો.",
  },
  "platelet count": {
    en: "Platelets help your blood clot when you get a cut or injury.",
    gu: "પ્લેટલેટ્સ લોહી ગઠ્ઠો બનાવવામાં મદદ કરે છે.",
    lowEn: "Your platelet count is low. Be careful to avoid cuts and injuries. Discuss with your doctor.",
    lowGu: "પ્લેટલેટ્સ ઓછા છે. ઈજાઓ ટાળો. ડૉક્ટરને જણાવો.",
  },
  mchc: {
    en: "MCHC shows how much hemoglobin is packed into each red blood cell.",
    gu: "MCHC બતાવે છે કે દરેક લાલ રક્તકણમાં કેટલું હિમોગ્લોબિન છે.",
    lowEn: "Your red blood cells may not be carrying enough hemoglobin. This can sometimes happen due to iron deficiency. Please discuss with your doctor.",
    lowGu: "તમારા લાલ રક્તકણો પૂરતું હિમોગ્લોબિน ન ધારી શકે. આ ઘણીવાર આયર્નની ઉણપને કારણે થઈ શકે. ડૉક્ટર સાથે ચર્ચા કરો.",
    highEn: "Your MCHC is slightly high. This is usually not concerning but your doctor will advise you.",
    highGu: "MCHC થોડું વધારે છે. ડૉક્ટર સૂચના આપશે.",
  },
  mcv: {
    en: "MCV shows the average size of your red blood cells.",
    gu: "MCV બતાવે છે કે તમારા લાલ રક્તકણ સરેરાશ કેટલા મોટા છે.",
    lowEn: "Your red blood cells are smaller than normal. This can be a sign of iron deficiency. Please discuss with your doctor.",
    lowGu: "તમારા લાલ રક્તકણ સામાન્ય કરતા નાના છે. આ આયર્નની ઉણપ હોઈ શકે.",
    highEn: "Your red blood cells are larger than normal. This can happen due to vitamin B12 or folate deficiency. Discuss with your doctor.",
    highGu: "તમારા લાલ રક્તકણ સામાન્ય કરતા મોટા છે. B12 અથવા ફોલેટ ઓછું હોઈ શકે.",
  },
  "ca 125": {
    en: "CA-125 is a marker that can be higher when certain cancers are present. It is also used to monitor treatment response.",
    gu: "CA-125 એ ગાંઠ સૂચક છે. ઉપચારના પ્રતિભાવ ચકાસવા ઉપયોગ થાય છે.",
    highEn: "Your CA-125 is above the normal limit. This needs to be reviewed with your doctor who will compare it with your previous values and symptoms.",
    highGu: "CA-125 સામાન્ય મર્યાદા ઉપર છે. ડૉક્ટર આ મૂલ્ય પહેલાના સ્તર સાથે સરખાવશે.",
    lowEn: "Your CA-125 is within or below normal range. This is a positive sign.",
    lowGu: "CA-125 સામાน્ય મર્યાદામાં છે. આ સારી નિશાની છે.",
  },
  tsh: {
    en: "TSH checks how well your thyroid gland is working. The thyroid controls your energy and metabolism.",
    gu: "TSH થાઇરૉઇડ ગ્રંથિ કેટલી સારી રીતે કામ કરે છે તે ચકાસે છે.",
    highEn: "Your TSH is high, which may mean your thyroid is working slowly (underactive). This is treatable. Discuss with your doctor.",
    highGu: "TSH વધારે છે. થાઇરૉઇડ ધીમે કામ કરી શકે. સારવાર શક્ય છે.",
    lowEn: "Your TSH is low, which may mean your thyroid is overactive. Discuss with your doctor.",
    lowGu: "TSH ઓછું છે. થાઇરૉઇડ વધારે સક્રિય હોઈ શકે.",
  },
  creatinine: {
    en: "Creatinine shows how well your kidneys are filtering your blood.",
    gu: "ક્રિએટિનાઇન બતાવે છે કે કિડની કેટલી સારી રીતે લોહી ફિલ્ટર કરે છે.",
    highEn: "Your creatinine is high, which may suggest your kidneys are under some stress. This needs to be monitored with your doctor.",
    highGu: "ક્રિએટિનાઇન વધારે છે. કિડની પર ભાર હોઈ શકે. ડૉક્ટર સાથે ચર્ચા કરો.",
  },
  sgpt: {
    en: "SGPT (ALT) is a liver enzyme. It shows how well your liver is working.",
    gu: "SGPT (ALT) યકૃત ઉત્સેચક છે. યકૃત સ્વાસ્થ્ય બતાવે છે.",
    highEn: "Your SGPT is high. Your liver may be under some stress, possibly from medicines. Please discuss with your doctor.",
    highGu: "SGPT વધારે છે. દવાઓ કે અન્ય કારણથી યકૃત પર ભાર આવ્યો હોઈ શકે.",
  },
};

export function getExplanation(
  fieldName: string,
  status: "high" | "low" | "normal" | "unknown",
  language: "en" | "gu" = "en"
): string {
  const key = fieldName.toLowerCase().trim();
  const exp = FIELD_EXPLANATIONS[key];

  if (!exp) {
    if (language === "gu") {
      if (status === "high") return `${fieldName} સામાન્ય કરતા વધારે છે. ડૉક્ટર સાથે ચર્ચા કરો.`;
      if (status === "low") return `${fieldName} સામાન્ય કરતા ઓછું છે. ડૉક્ટર સાથે ચર્ચા કરો.`;
      return `${fieldName} સામાન્ય મર્યાદામાં છે.`;
    }
    if (status === "high") return `${fieldName} is above the normal range. Please discuss with your doctor.`;
    if (status === "low") return `${fieldName} is below the normal range. Please discuss with your doctor.`;
    return `${fieldName} is within the normal range.`;
  }

  if (language === "gu") {
    if (status === "high" && exp.highGu) return exp.highGu;
    if (status === "low" && exp.lowGu) return exp.lowGu;
    if (status === "normal") return exp.gu;
    return exp.gu;
  }

  if (status === "high" && exp.highEn) return exp.highEn;
  if (status === "low" && exp.lowEn) return exp.lowEn;
  if (status === "normal") return exp.en;
  return exp.en;
}

export const DISCLAIMER = {
  en: "⚕️ This information is for educational purposes only. Always consult your doctor before making any health decisions.",
  gu: "⚕️ આ માહિતી ફક્ત શૈક્ષણિક હેતુ માટે છે. કોઈ પણ સ્વાસ્થ્ય નિર્ણય લેતા પહેલા ડૉક્ટરની સલાહ અચૂક લો.",
};
