"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { NUTRITION_DATA, NutritionCategory } from "@/data/nutrition";
import type { ReportField } from "@/types";

interface Props {
  fields: ReportField[];
}

export default function ReportSuggestions({ fields }: Props) {
  const { language } = useLanguage();

  // Determine needed categories based on abnormal fields
  const neededCategories = new Set<NutritionCategory>();
  
  // Default general categories to always provide some value
  neededCategories.add("recovery");

  let hasAbnormalities = false;

  fields.forEach(f => {
    const name = f.name.toLowerCase();
    
    if (f.status === "low") {
      hasAbnormalities = true;
      if (name.includes("hemoglobin") || name === "hb" || name.includes("rbc") || name.includes("iron")) {
        neededCategories.add("lowHemoglobin");
        neededCategories.add("fatigue");
      }
      if (name.includes("protein") || name.includes("albumin")) {
        neededCategories.add("protein");
      }
      if (name.includes("wbc") || name.includes("lymphocyte") || name.includes("neutrophil")) {
        neededCategories.add("protein"); 
      }
      if (name.includes("platelet")) {
        neededCategories.add("recovery");
      }
      if (name.includes("sodium") || name.includes("potassium")) {
        neededCategories.add("hydration");
      }
    }
    
    if (f.status === "high") {
      hasAbnormalities = true;
      if (name.includes("creatinine") || name.includes("urea") || name.includes("bun") || name.includes("uric")) {
        neededCategories.add("hydration");
      }
      if (name.includes("sugar") || name.includes("glucose")) {
        neededCategories.add("hydration");
      }
      if (name.includes("sgpt") || name.includes("sgot") || name.includes("ast") || name.includes("alt") || name.includes("bilirubin")) {
        neededCategories.add("recovery");
        neededCategories.add("hydration");
      }
    }
  });

  // Filter nutrition data to those that match ANY of the needed categories
  const suggestions = NUTRITION_DATA.filter(item => 
    item.categories.some(c => neededCategories.has(c))
  );

  return (
    <div className="space-y-4">
      <div className="bg-success-50 dark:bg-dark-success-100 border border-success-200 dark:border-dark-success-300 p-4 rounded-xl">
        <p className="text-sm text-success-800 dark:text-dark-success-800 font-medium">
          {language === "gu" 
            ? hasAbnormalities 
                ? "તમારા રિપોર્ટના આધારે, તમારા સ્વાસ્થ્યને સુધારવામાં મદદ કરવા માટે અહીં કેટલાક શાકાહારી ખોરાક સૂચનો છે:"
                : "તમારો રિપોર્ટ સારો દેખાય છે! શક્તિ જાળવી રાખવા માટે અહીં કેટલાક સામાન્ય આરોગ્યપ્રદ ખોરાક સૂચનો છે:"
            : hasAbnormalities
                ? "Based on your report, here are some vegetarian food suggestions to help improve your health:"
                : "Your report looks good! Here are some general healthy food suggestions to maintain strength:"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {suggestions.map(food => (
          <div key={food.id} className="card-elevated border border-base-200 dark:border-dark-base-200 p-4">
            <div className="flex items-start gap-3 mb-2">
              <span className="text-3xl bg-base-100 dark:bg-dark-base-200 p-2 rounded-xl shrink-0">{food.emoji}</span>
              <div>
                <h3 className="font-bold text-lg text-base-900 dark:text-dark-base-900">
                  {language === "gu" ? food.nameGu : food.name}
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {food.categories.map(c => (
                    <span key={c} className="text-[10px] uppercase font-bold tracking-wider bg-secondary-100 dark:bg-dark-secondary-100 text-secondary-700 dark:text-dark-secondary-700 px-1.5 py-0.5 rounded-md">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mt-4">
              <div>
                <p className="text-xs font-bold text-base-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  {language === "gu" ? "ફાયદા" : "Benefits"}
                </p>
                <p className="text-sm text-base-700 dark:text-dark-base-700">
                  {language === "gu" ? food.benefitsGu : food.benefits}
                </p>
              </div>
              
              <div className="bg-base-50 dark:bg-dark-base-200 p-3 rounded-lg border border-base-100 dark:border-dark-base-300">
                <p className="text-xs font-bold text-base-500 uppercase tracking-wider mb-1">
                  {language === "gu" ? "કેવી રીતે બનાવવું" : "Preparation"}
                </p>
                <p className="text-sm text-base-800 dark:text-dark-base-800">
                  {language === "gu" ? food.preparationGu : food.preparation}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-base-500 uppercase tracking-wider mb-1">
                  {language === "gu" ? "ક્યારે ખાવું" : "When to eat"}
                </p>
                <p className="text-sm text-base-700 dark:text-dark-base-700">
                  {language === "gu" ? food.whenToEatGu : food.whenToEat}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
