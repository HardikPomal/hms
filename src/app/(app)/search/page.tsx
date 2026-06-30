"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  Search as SearchIcon,
  FileText,
  Pill,
  Syringe,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { searchReports } from "@/lib/db/reports";
import { searchMedicines } from "@/lib/db/medicines";
import { searchParameters } from "@/lib/db/knowledge";
import { getAllChemoSessions } from "@/lib/db/chemo";

export default function SearchPage() {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { type: string; id: string; title: string; subtitle: string; icon: any }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const [rep, med, know, chem] = await Promise.all([
          searchReports(query),
          searchMedicines(query),
          searchParameters(query),
          getAllChemoSessions(),
        ]);

        const filteredChem = chem.filter(
          (c) =>
            c.hospital.toLowerCase().includes(query.toLowerCase()) ||
            c.doctorName.toLowerCase().includes(query.toLowerCase()) ||
            c.medicines.some((m) =>
              m.name.toLowerCase().includes(query.toLowerCase()),
            ),
        );

        const all = [
          ...rep.map((r) => ({
            type: "reports",
            id: r.id,
            title: r.templateId,
            subtitle: `${r.reportDate} · ${r.hospitalName}`,
            icon: FileText,
          })),
          ...med.map((m) => ({
            type: "medicines",
            id: m.id,
            title: m.name,
            subtitle: m.purpose || m.strength || "Medicine",
            icon: Pill,
          })),
          ...filteredChem.map((c) => ({
            type: "chemo",
            id: c.id,
            title: `${t("chemo.cycle")} ${c.cycleNumber}`,
            subtitle: c.sessionDate,
            icon: Syringe,
          })),
          ...know.map((k) => ({
            type: "knowledge",
            id: k.id,
            title: language === "gu" && k.nameGu ? k.nameGu : k.name,
            subtitle: t(`knowledge.categories.${k.category}`),
            icon: BookOpen,
          })),
        ];

        setResults(all);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [query, language, t]);

  return (
    <AppShell showBack showSearch={false} title={t("search.title")}>
      <div className="relative mb-6">
        <SearchIcon
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500"
        />
        <input
          autoFocus
          type="search"
          placeholder={t("search.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-dark-base-100 border-2 border-primary-200 dark:border-dark-primary-200 rounded-2xl text-base outline-none focus:border-primary-500 transition-colors shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : query.length >= 2 && results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-base-500 text-sm">{t("search.noResults")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((r, i) => {
            const Icon = r.icon;
            return (
              <Link
                key={`${r.type}-${r.id}`}
                href={`/${r.type}/${r.id}`}
                className="block card-elevated hover:bg-base-50 dark:hover:bg-dark-base-200 transition-colors animate-slide-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-base-100 dark:bg-dark-base-200 rounded-xl flex items-center justify-center shrink-0">
                    <Icon
                      size={18}
                      className="text-base-600 dark:text-dark-base-600"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base-900 dark:text-dark-base-900 truncate">
                      {r.title}
                    </p>
                    <p className="text-xs text-base-400 mt-0.5 truncate">
                      {t(
                        `search.in${r.type.charAt(0).toUpperCase() + r.type.slice(1)}`,
                      )}{" "}
                      · {r.subtitle}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-base-300" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
