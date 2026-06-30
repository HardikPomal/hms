import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { ParameterDef, KnowledgeEntry } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { getKnowledgeByParameterId } from "@/lib/db/knowledge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const extractLangBlock = (content: string, language: string) => {
  if (!content) return "";
  if (content.includes("<en>") || content.includes("<gu>")) {
    const enMatch = content.match(/<en>([\s\S]*?)<\/en>/);
    const guMatch = content.match(/<gu>([\s\S]*?)<\/gu>/);
    
    if (language === "gu" && guMatch) {
      return guMatch[1].trim();
    } else if (enMatch) {
      return enMatch[1].trim();
    }
  }
  return content.trim();
};

interface QuickViewKnowledgeProps {
  isOpen: boolean;
  onClose: () => void;
  parameter: ParameterDef | null;
}

export default function QuickViewKnowledge({
  isOpen,
  onClose,
  parameter,
}: QuickViewKnowledgeProps) {
  const { t, language } = useLanguage();
  const [knowledge, setKnowledge] = useState<KnowledgeEntry | null>(null);

  useEffect(() => {
    if (isOpen && parameter) {
      getKnowledgeByParameterId(parameter.id).then(k => setKnowledge(k || null));
    }
  }, [isOpen, parameter]);

  if (!isOpen || !parameter) return null;

  const guName = parameter.alternativeNames.length > 0 ? parameter.alternativeNames[0] : parameter.name;

  return (
    <div className="fixed inset-0 z-100 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Slide-up Sheet */}
      <div className="relative bg-base-50 dark:bg-dark-base-100 w-full max-h-[90vh] rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-base-200 dark:border-dark-base-200 bg-white dark:bg-dark-base-100 rounded-t-3xl shrink-0">
          <div>
            <h3 className="font-bold text-lg text-base-900 dark:text-dark-base-900">
              {language === "gu" ? guName : parameter.name}
            </h3>
            <p className="text-xs font-bold text-primary-500 uppercase tracking-wide mt-0.5">
              {t(`knowledge.categories.${parameter.category}`)}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-base-100 dark:bg-dark-base-200 text-base-600 hover:bg-base-200 transition-colors border-2 border-base-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-white dark:bg-dark-base-100">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {knowledge ? (
               <>
                 <div className="text-base-700 dark:text-dark-base-700 font-medium">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>
                     {extractLangBlock(knowledge.detailedDescription || knowledge.simpleMeaning || "", language)}
                   </ReactMarkdown>
                 </div>
                 {knowledge.normalRangeText && (
                   <p className="mt-4 text-sm text-base-800 dark:text-dark-base-800 bg-primary-50 dark:bg-dark-primary-900/30 p-3 rounded-xl border border-primary-100 dark:border-dark-primary-800">
                     <strong>Normal Range:</strong> {extractLangBlock(knowledge.normalRangeText, language)}
                   </p>
                 )}
                 {knowledge.whyImportant && (
                   <div className="mt-4 text-sm text-base-700 dark:text-dark-base-700">
                     <strong>Why it's important:</strong> 
                     <div className="mt-1">
                       <ReactMarkdown remarkPlugins={[remarkGfm]}>
                         {extractLangBlock(knowledge.whyImportant, language)}
                       </ReactMarkdown>
                     </div>
                   </div>
                 )}
               </>
            ) : (
               <p className="text-base-500 italic font-medium text-center py-4">Loading details...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
