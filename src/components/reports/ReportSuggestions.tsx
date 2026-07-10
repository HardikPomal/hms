"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import type { ReportField, MedicalEntity } from "@/types";
import { getRelationshipsForTarget, findEntityByNameAndType, getEntityById } from "@/lib/db/knowledge";
import { seedComprehensiveKnowledge } from "@/lib/db/seedData/seeder";
import RichDescription from "@/components/ui/RichDescription";
import { Activity } from "lucide-react";

interface Props {
  fields: ReportField[];
}

export default function ReportSuggestions({ fields }: Props) {
  const { language } = useLanguage();
  const [suggestions, setSuggestions] = useState<MedicalEntity[]>([]);
  const [loading, setLoading] = useState(true);

  const hasAbnormalities = fields.some(f => f.status === "low" || f.status === "high");

  useEffect(() => {
    async function fetchSuggestions() {
      // Ensure graph is seeded before querying
      await seedComprehensiveKnowledge();

      if (!hasAbnormalities) {
        setLoading(false);
        return;
      }

      const foundItems = new Set<string>();
      const items: MedicalEntity[] = [];

      const abnormalParams = fields.filter(f => f.status === "low" || f.status === "high");

      for (const reportParam of abnormalParams) {
        if (!reportParam.name) continue;

        // 1. Find Parameter Entity
        const paramEntity = await findEntityByNameAndType(reportParam.name, "parameter");
        if (!paramEntity) continue;

        // Look for direct relations where Intervention --improves--> Parameter
        const paramTreatments = await getRelationshipsForTarget(paramEntity.id);
        
        for (const rel of paramTreatments) {
          if (["food", "diet", "supplement", "nutrition"].includes(rel.sourceType) && rel.relationType === "improves") {
            if (!foundItems.has(rel.sourceId)) {
               foundItems.add(rel.sourceId);
               const interventionEntity = await getEntityById(rel.sourceId);
               if (interventionEntity) {
                 items.push(interventionEntity);
               }
            }
          }
        }
      }

      setSuggestions(items);
      setLoading(false);
    }

    fetchSuggestions();
  }, [fields, hasAbnormalities]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-success-50 dark:bg-dark-success-100 border border-success-200 dark:border-dark-success-300 p-4 rounded-xl">
        <p className="text-sm text-success-800 dark:text-dark-success-800 font-medium">
          {language === "gu" 
            ? hasAbnormalities 
                ? "તમારા રિપોર્ટના આધારે, તમારા સ્વાસ્થ્યને સુધારવામાં મદદ કરવા માટે તમારા 'બ્રેન' (Brain) માંથી અહીં કેટલાક ખોરાક સૂચનો છે:"
                : "તમારો રિપોર્ટ સારો દેખાય છે! શક્તિ જાળવી રાખવા માટે અહીં કેટલાક સામાન્ય આરોગ્યપ્રદ ખોરાક સૂચનો છે:"
            : hasAbnormalities
                ? "Based on your report, here are some recommendations from your Brain's diagnostic graph to help improve your health:"
                : "Your report looks good! Here are some general healthy food suggestions to maintain strength:"}
        </p>
      </div>

      {hasAbnormalities && suggestions.length === 0 && (
        <div className="bg-warning-50 dark:bg-dark-warning-100 border border-warning-200 p-4 rounded-xl">
           <p className="text-sm text-warning-800 font-medium">
             {language === "gu"
               ? "તમારા નોલેજ બેઝ (Brain) માં આ રિપોર્ટ માટે હજુ કોઈ ખોરાકના સૂચનો જોડાયેલા નથી. કૃપા કરીને નોલેજ બેઝમાં સંબંધિત ખોરાક ઉમેરો અને લિંક કરો."
               : "No interventions are linked in your Knowledge Graph for these findings yet. Try analyzing your knowledge base items in the Brain."}
           </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {suggestions.map(item => (
          <div key={item.id} className="card-elevated border border-base-200 dark:border-dark-base-200 p-4">
            <div className="flex items-start gap-3 mb-2">
              <span className="text-3xl bg-base-100 dark:bg-dark-base-200 p-2 rounded-xl shrink-0">
                {item.type === "food" ? "🍲" : item.type === "supplement" ? "💊" : "📝"}
              </span>
              <div>
                <h3 className="font-bold text-lg text-base-900 dark:text-dark-base-900 flex items-center gap-2">
                  {language === "gu" && item.nameGu ? item.nameGu : item.name}
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-secondary-100 dark:bg-dark-secondary-100 text-secondary-700 dark:text-dark-secondary-700 px-1.5 py-0.5 rounded-md">
                    {item.type}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.tags?.map(c => (
                    <span key={c} className="text-[10px] uppercase font-bold tracking-wider bg-base-100 dark:bg-dark-base-300 text-base-500 dark:text-dark-base-500 px-1.5 py-0.5 rounded-md border border-base-200 dark:border-dark-base-200">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mt-4">
              <div className="bg-base-50 dark:bg-dark-base-200 p-3 rounded-xl">
                <p className="text-xs font-bold text-base-500 uppercase tracking-wider mb-2">
                  {language === "gu" ? "વિગતો" : "Details"}
                </p>
                <RichDescription
                  text={item.detailedDescription || item.simpleMeaning || ""}
                  language={language}
                />
              </div>
              
              {item.whyImportant && (
                <div className="bg-primary-50 dark:bg-dark-primary-300 p-3 rounded-xl border border-primary-100 dark:border-dark-primary-400">
                  <p className="text-xs font-bold text-primary-600 dark:text-dark-primary-700 uppercase tracking-wider mb-2">
                    {language === "gu" ? "મહત્વ" : "Why it's important"}
                  </p>
                  <RichDescription
                    text={item.whyImportant}
                    language={language}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
