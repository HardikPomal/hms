"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { Plus, BookOpen, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllParameters } from "@/lib/db/knowledge";
import type { ParameterDef } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  medical_report: "📋",
  lab_parameter: "🧪",
  medical_term: "🔬",
  medicine: "💊",
  cancer_info: "🎗️",
  treatment: "🏥",
  nutrition: "🥗",
  exercise: "🧘",
  doctor_advice: "👨‍⚕️",
  general: "📝",
  Hematology: "🩸",
};

export default function CategoryListPage() {
  const { t, language } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [entries, setEntries] = useState<ParameterDef[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllParameters().then((k) => {
      setEntries(k.filter(e => e.category === slug));
      setLoading(false);
    });
  }, [slug]);

  const filtered = entries.filter((e) => {
    return !query ||
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      (e.alternativeNames || []).some((a: string) => a.toLowerCase().includes(query.toLowerCase()));
  });

  const getAddLink = () => {
    if (slug === "lab_parameter") return "/knowledge/add/lab-parameter";
    if (slug === "medical_report") return "/knowledge/add/medical-report";
    return `/knowledge/add?returnTo=/knowledge/category/${slug}&category=${slug}`;
  };

  return (
    <AppShell
      title={t(`knowledge.categories.${slug}`) || slug}
      showBack
      rightAction={
        <Link
          href={getAddLink()}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 transition-colors"
        >
          <Plus size={20} className="text-white" />
        </Link>
      }
    >
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-400"
        />
        <input
          type="search"
          placeholder={
            language === "gu" ? "શોધો..." : "Search..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-base-100 border border-base-200 dark:border-dark-base-200 rounded-xl text-sm outline-none focus:border-primary-400 transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-base-100 dark:bg-dark-base-200 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-base-300" />
          </div>
          <p className="text-base-500 text-sm mb-4">
            {t("knowledge.noEntries")}
          </p>
          <Link
            href={getAddLink()}
            className="px-6 py-3 gradient-primary text-white rounded-xl font-medium text-sm"
          >
            + {t("knowledge.add")}
          </Link>
        </div>
      ) : (
        <div className="space-y-2 pb-24">
          {filtered.map((entry, i) => (
            <Link
              key={entry.id}
              href={`/knowledge/${entry.id}`}
              className="block card-elevated hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-base-100 dark:bg-dark-base-200 rounded-xl flex items-center justify-center text-xl shrink-0">
                  {CATEGORY_ICONS[entry.category] || "📝"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base-900 dark:text-dark-base-900 truncate">
                    {(() => {
                      if (language === "gu" && entry.nameGu) {
                        return entry.nameGu;
                      }
                      return entry.name;
                    })()}
                  </p>
                  <p className="text-xs text-base-400 mt-0.5 line-clamp-1">
                    Status: {entry.knowledgeStatus}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-base-400 shrink-0 mt-2"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
