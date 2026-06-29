"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ReportStatus } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import KnowledgeLink from "@/components/ui/KnowledgeLink";

interface FieldRowProps {
  name: string;
  value: string;
  unit?: string;
  refMin?: string;
  refMax?: string;
  status: ReportStatus;
  notes?: string;
}

const statusConfig = {
  high: {
    badge: "badge-high",
    icon: TrendingUp,
    label: "↑",
  },
  low: {
    badge: "badge-low",
    icon: TrendingDown,
    label: "↓",
  },
  normal: {
    badge: "badge-normal",
    icon: Minus,
    label: "✓",
  },
  unknown: {
    badge:
      "bg-base-100 dark:bg-dark-base-200 text-base-500 dark:text-dark-base-500",
    icon: Minus,
    label: "—",
  },
};

export default function FieldRow({
  name,
  value,
  unit,
  refMin,
  refMax,
  status,
  notes,
}: FieldRowProps) {
  const { t } = useLanguage();
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center justify-between py-3 border-b border-base-100 dark:border-dark-base-200 last:border-0 ${
        status === "high" || status === "low" ? "bg-opacity-30" : ""
      }`}
    >
      <div className="flex-1 min-w-0 pr-3">
        <div className="text-sm font-medium text-base-900 dark:text-dark-base-900 truncate">
          <KnowledgeLink term={name} />
        </div>
        {(refMin || refMax) && (
          <p className="text-xs text-base-400 dark:text-dark-base-400">
            {refMin}–{refMax} {unit}
          </p>
        )}
        {notes && !value && (
          <p className="text-xs text-base-400 dark:text-dark-base-400 italic mt-0.5">
            {notes}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold text-base-900 dark:text-dark-base-900">
          {value || "—"} {value && unit}
        </span>
        {value && (
          <span
            className={`flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full font-semibold ${config.badge}`}
          >
            <Icon size={10} />
            {config.label}
          </span>
        )}
      </div>
    </div>
  );
}
