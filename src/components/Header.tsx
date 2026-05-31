"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

export default function Header({ locale }: Props) {
  const t = getTranslations(locale);
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isSpeakerSubmitPage =
    pathname === `/${locale}/speaker/submit`
    || pathname === `/${locale}/speaker/submit/`;
  const isSpeakerSubmit =
    isSpeakerSubmitPage
    || pathname === `/${locale}/speaker/review`
    || pathname === `/${locale}/speaker/review/`;
  const newTabProps = isSpeakerSubmitPage
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
  const nextLocale = locale === "ja" ? "en" : "ja";
  const switchedPathname = pathname
    ? pathname.replace(/^\/(ja|en)(?=\/|$)/, `/${nextLocale}`)
    : `/${nextLocale}`;

  useEffect(() => {
    queueMicrotask(() => {
      setSearch(window.location.search);
    });
  }, []);

  const langSwitchHref = search ? `${switchedPathname}${search}` : switchedPathname;

  const isActive = (href: string) =>
    pathname === href || pathname === href + "/";

  const navLinks = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/talks`, label: t.nav.talks },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-6 py-3 text-white shadow-sm"
      style={{
        backgroundColor: "var(--accent)",
      }}
    >
      <div className={`${isSpeakerSubmit ? "w-[min(1120px,calc(100vw-2rem))]" : "max-w-3xl"} mx-auto flex items-center gap-5`}>
        <Link
          href={`/${locale}`}
          {...newTabProps}
          onClick={() => setIsMobileMenuOpen(false)}
          className="shrink-0 translate-y-[2px] transition-transform hover:scale-[1.03]"
        >
          <Image
            src="/logo-long-3.png"
            alt={t.siteName}
            width={150}
            height={31}
            priority
          />
        </Link>

        <button
          type="button"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          className="ml-auto inline-flex h-9 w-9 items-center justify-center text-white md:hidden"
        >
          <span className="sr-only">Menu</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            {isMobileMenuOpen ? (
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            ) : (
              <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            )}
          </svg>
        </button>

        <div className="ml-auto hidden items-center gap-5 pr-2 md:flex">
          <nav className="flex items-center gap-5 text-sm">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                {...newTabProps}
                className={
                  isActive(href)
                    ? "font-bold text-white underline decoration-white underline-offset-4"
                    : "font-bold text-white/78 hover:text-white transition-colors"
                }
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-start pr-2">
            <Link
              href={langSwitchHref}
              {...newTabProps}
              className="border-l border-white/30 pl-3 font-bold text-white/78 hover:text-white transition-colors text-sm"
            >
              {t.langSwitch}
            </Link>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 right-0 top-full z-50 border-t border-white/25 bg-[var(--accent)] px-6 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
            <div className={`${isSpeakerSubmit ? "w-[min(1120px,calc(100vw-2rem))]" : "max-w-3xl"} mx-auto`}>
              <nav className="flex flex-col gap-3 text-sm">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={`mobile-${href}`}
                    href={href}
                    {...newTabProps}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={
                      isActive(href)
                        ? "font-bold text-white underline decoration-white underline-offset-4"
                        : "font-bold text-white/86 hover:text-white transition-colors"
                    }
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="mt-4 border-t border-white/25 pt-3">
                <Link
                  href={langSwitchHref}
                  {...newTabProps}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-bold text-sm text-white/86 hover:text-white transition-colors"
                >
                  {t.langSwitch}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
