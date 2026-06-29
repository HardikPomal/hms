"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getParameterById, getKnowledgeByParameterId, deleteParameter } from "@/lib/db/knowledge";
import type { ParameterDef, KnowledgeEntry } from "@/types";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function KnowledgeDetailPage() {
  const { t, language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const [parameter, setParameter] = useState<ParameterDef | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    Promise.all([
      getParameterById(id),
      getKnowledgeByParameterId(id)
    ]).then(([p, k]) => {
      setParameter(p ?? null);
      setKnowledge(k ?? null);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => { 
    await deleteParameter(id); 
    router.replace("/knowledge"); 
  };

  if (loading) return <AppShell showBack><div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div></AppShell>;
  if (!parameter) return <AppShell showBack><p className="text-center py-8 text-base-400">{t("common.noData")}</p></AppShell>;

  const displayTitle = language === "gu" && parameter.alternativeNames.length > 0 ? parameter.alternativeNames[0] : parameter.name;

  return (
    <AppShell
      title={displayTitle}
      showBack
      rightAction={
        <button onClick={() => setShowDelete(true)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-danger-50 transition-colors">
          <Trash2 size={18} className="text-danger-500" />
        </button>
      }
    >
      <div className="space-y-4">
        {/* Category Badge */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-primary-100 dark:bg-dark-primary-100 text-primary-700 dark:text-dark-primary-700 px-3 py-1 rounded-full font-medium">
            {t(`knowledge.categories.${parameter.category}`)}
          </span>
          {knowledge?.tags?.map((tag) => (
            <span key={tag} className="text-xs bg-base-100 dark:bg-dark-base-200 text-base-500 px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        {/* Content */}
        <div className="card-elevated">
          <div className="prose prose-sm dark:prose-invert max-w-none text-base-800 dark:text-dark-base-800">
            {knowledge?.detailedDescription ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {knowledge.detailedDescription}
              </ReactMarkdown>
            ) : (
              <p>{knowledge?.simpleMeaning || "No detailed information available."}</p>
            )}
          </div>
        </div>

        {/* Normal Range */}
        {knowledge?.normalRangeText && (
          <div className="card-elevated">
            <p className="text-xs text-base-400 mb-1">{t("knowledge.normalRange")}</p>
            <p className="font-semibold text-primary-600 dark:text-dark-primary-600">{knowledge.normalRangeText}</p>
          </div>
        )}

        {/* Importance */}
        {knowledge?.whyImportant && (
          <div className="card-elevated bg-primary-50 dark:bg-dark-primary-100 border border-primary-200 dark:border-dark-primary-200">
            <p className="text-xs text-primary-500 mb-1">{t("knowledge.importance")}</p>
            <p className="text-sm text-primary-700 dark:text-dark-primary-700">{knowledge.whyImportant}</p>
          </div>
        )}

        {/* Meta */}
        <p className="text-xs text-base-400 text-center">
          {language === "gu" ? "ઉમેર્યો:" : "Added:"} {parameter.createdAt.split("T")[0]}
        </p>
      </div>

      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <div className="bg-white dark:bg-dark-base-100 rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="font-semibold mb-4">{language === "gu" ? "આ જ્ઞાન ભૂંસો?" : "Delete this entry?"}</h3>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-3 bg-base-100 dark:bg-dark-base-200 rounded-xl text-sm font-medium">{t("common.cancel")}</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-danger-500 text-white rounded-xl text-sm font-medium">{t("common.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
