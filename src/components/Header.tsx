"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

export default function Header({ locale }: Props) {
  const t = getTranslations(locale);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname === href + "/";

  const navLinks = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/talks`, label: t.nav.talks },
  ];

  return (
    <header className="border-b border-stone-200 py-4 px-6">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="font-semibold tracking-wide text-stone-800 hover:text-stone-600 transition-colors"
        >
          {t.siteName}
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={
                isActive(href)
                  ? "text-stone-800 font-medium underline underline-offset-4"
                  : "text-stone-500 hover:text-stone-800 transition-colors"
              }
            >
              {label}
            </Link>
          ))}
          <Link
            href={t.langSwitchPath}
            className="text-stone-400 hover:text-stone-700 transition-colors ml-2 border-l border-stone-200 pl-4"
          >
            {t.langSwitch}
          </Link>
        </nav>
      </div>
    </header>
  );
}
