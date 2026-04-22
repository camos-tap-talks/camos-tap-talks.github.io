"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

export default function Header({ locale }: Props) {
  const t = getTranslations(locale);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSpeakerRoom = pathname === `/${locale}/speaker-room` || pathname === `/${locale}/speaker-room/`;
  const nextLocale = locale === "ja" ? "en" : "ja";
  const switchedPathname = pathname
    ? pathname.replace(/^\/(ja|en)(?=\/|$)/, `/${nextLocale}`)
    : `/${nextLocale}`;
  const switchedSearch = searchParams.toString();
  const langSwitchHref = switchedSearch ? `${switchedPathname}?${switchedSearch}` : switchedPathname;

  const isActive = (href: string) =>
    pathname === href || pathname === href + "/";

  const navLinks = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/talks`, label: t.nav.talks },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 py-3 px-6 text-white shadow-sm"
      style={{
        backgroundColor: "#d1773b",
      }}
    >
      <div className={`${isSpeakerRoom ? "w-[min(1120px,calc(100vw-2rem))]" : "max-w-3xl"} mx-auto flex items-center gap-5`}>
        <Link
          href={`/${locale}`}
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

        <div className="ml-auto flex items-center gap-5 pr-2">
          <nav className="flex items-center gap-5 text-sm">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
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
              className="border-l border-white/30 pl-3 font-bold text-white/78 hover:text-white transition-colors text-sm"
            >
              {t.langSwitch}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
