"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Pill,
  Syringe,
  MoreHorizontal,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const navItems = [
  { href: "/dashboard", icon: Home, key: "home" },
  { href: "/reports", icon: FileText, key: "reports" },
  { href: "/medicines", icon: Pill, key: "medicines" },
  { href: "/chemo", icon: Syringe, key: "chemo" },
  { href: "/more", icon: MoreHorizontal, key: "more" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-base-100 border-t-2 border-base-200 dark:border-dark-base-200 bottom-nav">
      <div className="flex items-center justify-around max-w-lg mx-auto h-[72px] px-2">
        {navItems.map(({ href, icon: Icon, key }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-14 mx-1 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-primary-100 dark:bg-dark-primary-100 text-primary-700 dark:text-dark-primary-700"
                  : "text-base-500 dark:text-dark-base-400 hover:bg-base-50 dark:hover:bg-dark-base-200 hover:text-base-800 dark:hover:text-dark-base-800"
              }`}
              aria-label={t(`nav.${key}`)}
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? "" : "opacity-80"}
              />
              <span className={`text-[11px] font-medium leading-none ${isActive ? "font-bold" : ""}`}>
                {t(`nav.${key}`)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
