"use client";

import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BookOpen,
  Salad,
  Activity,
  BarChart2,
  Settings,
  ChevronRight,
} from "lucide-react";

export default function MorePage() {
  const { t } = useLanguage();

  const menuItems = [
    {
      title: t("nav.knowledge"),
      subtitle: t("knowledge.title"),
      icon: BookOpen,
      href: "/knowledge",
      color: "text-primary-600 dark:text-dark-primary-600",
      bg: "bg-primary-100 dark:bg-dark-primary-100",
    },
    {
      title: t("nav.nutrition"),
      subtitle: t("nutrition.title"),
      icon: Salad,
      href: "/nutrition",
      color: "text-success-600 dark:text-dark-success-600",
      bg: "bg-success-100 dark:bg-dark-success-100",
    },
    {
      title: t("nav.wellness"),
      subtitle: t("wellness.title"),
      icon: Activity,
      href: "/wellness",
      color: "text-secondary-600 dark:text-dark-secondary-600",
      bg: "bg-secondary-100 dark:bg-dark-secondary-100",
    },
    {
      title: t("nav.summary"),
      subtitle: t("summary.title"),
      icon: BarChart2,
      href: "/summary",
      color: "text-danger-600 dark:text-dark-danger-600",
      bg: "bg-danger-100 dark:bg-dark-danger-100",
    },
  ];

  return (
    <AppShell title={t("nav.more")} showSearch={false}>
      <div className="space-y-6">
        {/* Main Grid Options */}
        <div className="grid grid-cols-2 gap-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center p-6 card-elevated hover:-translate-y-1 transition-transform duration-200"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${item.bg}`}
                >
                  <Icon size={28} className={item.color} />
                </div>
                <h3 className="font-semibold text-base-900 dark:text-dark-base-900 text-center">
                  {item.title}
                </h3>
              </Link>
            );
          })}
        </div>

        {/* Settings List */}
        <div className="card-elevated p-2!">
          <Link
            href="/settings"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-50 dark:hover:bg-dark-base-200 transition-colors"
          >
            <div className="w-10 h-10 bg-base-100 dark:bg-dark-base-200 rounded-xl flex items-center justify-center shrink-0">
              <Settings
                size={20}
                className="text-base-600 dark:text-dark-base-600"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base-900 dark:text-dark-base-900">
                {t("nav.settings")}
              </p>
              <p className="text-xs text-base-400">{t("settings.title")}</p>
            </div>
            <ChevronRight size={18} className="text-base-300" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
