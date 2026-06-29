"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showLangToggle?: boolean;
  rightAction?: React.ReactNode;
}

export default function Header({
  title,
  showBack = false,
  showSearch = true,
  showLangToggle = true,
  rightAction,
}: HeaderProps) {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "gu" : "en");
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-dark-base-100 border-b-2 border-base-200 dark:border-dark-base-200">
      <div className="flex items-center gap-3 px-4 h-16 max-w-lg mx-auto">
        {/* Left: Back Button or Logo */}
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-base-100 dark:hover:bg-dark-base-200 transition-colors"
            aria-label={t("common.back")}
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
          </Link>
        )}

        {/* Center: Title */}
        <div className="flex-1 min-w-0">
          {title ? (
            <h1 className="text-base font-semibold text-base-900 dark:text-dark-base-900 truncate">
              {title}
            </h1>
          ) : (
            <div>
              <span className="text-base font-bold text-primary-600 dark:text-dark-primary-600">
                {t("app.name")}
              </span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {rightAction}

          {showSearch && (
            <Link
              href="/search"
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-base-100 dark:hover:bg-dark-base-200 transition-colors"
              aria-label={t("common.search")}
            >
              <Search size={18} />
            </Link>
          )}

          {showLangToggle && (
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 h-10 px-4 rounded-full border-2 border-base-200 dark:border-dark-base-200 hover:bg-base-100 dark:hover:bg-dark-base-200 transition-colors text-sm font-bold"
              aria-label="Toggle language"
            >
              <Globe size={14} />
              {language === "en" ? "ગુ" : "EN"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
