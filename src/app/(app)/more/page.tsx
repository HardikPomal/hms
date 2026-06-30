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
      icon: BookOpen,
      href: "/knowledge",
    },
    {
      title: t("nav.nutrition"),
      icon: Salad,
      href: "/nutrition",
    },
    {
      title: t("nav.wellness"),
      icon: Activity,
      href: "/wellness",
    },
    {
      title: t("nav.summary"),
      icon: BarChart2,
      href: "/summary",
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
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-primary-50 dark:bg-dark-primary-100 border border-primary-200 dark:border-dark-primary-200 hover:bg-primary-100 dark:hover:bg-dark-primary-200 transition-colors"
              >
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-sm font-medium text-primary-700 dark:text-dark-primary-700 text-center">
                  {item.title}
                </span>
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
