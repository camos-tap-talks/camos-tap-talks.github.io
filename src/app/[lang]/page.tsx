import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { locales, type Locale, getTranslations } from "@/lib/i18n";
import { getUpcomingTalks, getPastTalks } from "@/lib/talks";
import TalkCard from "@/components/TalkCard";
import IconInitialHeading from "@/components/IconInitialHeading";
import Link from "next/link";
import Image from "next/image";
import { SITE_URL } from "@/lib/site";

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isJa = lang === "ja";

  return {
    title: "Camos Tap Talks",
    alternates: {
      canonical: isJa ? "/ja" : "/en",
      languages: {
        ja: `${SITE_URL}/ja`,
        en: `${SITE_URL}/en`,
      },
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();

  const locale = lang as Locale;
  const isJa = locale === "ja";
  const t = getTranslations(locale);
  const upcoming = getUpcomingTalks();
  const past = getPastTalks().slice(0, 3);

  return (
    <div>
      <section className="mb-6">
        <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto] sm:gap-8">
          <div className="order-2 sm:order-1">
            <div className="mb-4">
              <h1 className="sr-only sm:not-sr-only text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-[2.8rem]">
                {t.home.title}
              </h1>
            </div>
            <p className="max-w-xl leading-relaxed text-[var(--muted)]">
              {t.home.description}
            </p>
          </div>

          <div className="order-1 flex justify-center sm:order-2 sm:justify-end">
            <Image
              src="/logo.svg"
              alt={t.home.title}
              width={190}
              height={190}
              priority
              className="h-auto w-[190px] sm:w-[190px]"
            />
          </div>
        </div>
      </section>

      <section className="mb-8">
        <p className="mb-4 text-center text-[0.7rem] font-semibold tracking-[0.32em] text-[var(--muted)]">
          — NEXT TALK —
        </p>
        {upcoming.length === 0 ? (
          <p className="text-center text-sm text-[var(--muted)]">{t.home.noUpcoming}</p>
        ) : (
          upcoming.map((talk) => (
            <TalkCard
              key={talk.id}
              talk={talk}
              locale={locale}
              variant="upcomingTap"
              tapNumber={parseInt(talk.id, 10)}
            />
          ))
        )}
      </section>

      <section className="mb-8 rounded-xl bg-[var(--surface)] px-6 py-7 shadow-sm">
        <IconInitialHeading
          text={t.home.formatTitle}
          className="mb-3 text-lg font-semibold text-[var(--foreground)] tracking-tight"
        />
        <ul className="space-y-2 text-sm text-[var(--muted)]">
          {t.home.formatItems.map((item) => (
            <li key={item} className="flex items-start gap-2 leading-relaxed">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8 rounded-xl bg-[var(--surface)] px-6 py-7 shadow-sm">
        <IconInitialHeading
          text={t.home.participationTitle}
          className="mb-3 text-lg font-semibold text-[var(--foreground)] tracking-tight"
        />
        <ul className="space-y-2 text-sm text-[var(--muted)]">
          {t.home.participationItems.map((item) => (
            <li key={item} className="flex items-start gap-2 leading-relaxed">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <div className="mx-auto grid max-w-[560px] grid-cols-2 gap-6 sm:gap-12">
          <figure className="relative rotate-[-2deg]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 z-10 h-6 w-24 -translate-x-1/2 -translate-y-1/2 rotate-[-4deg] bg-[var(--accent)] opacity-60"
            />
            <div className="relative aspect-[4/3] overflow-hidden shadow-[0_0px_10px_rgba(54,32,20,0.2)]">
              <Image
                src="/camos_exterior-1.jpg"
                alt={isJa ? "本郷菊坂町かもすの外観" : "Exterior of Hongo Kikusaka-cho Camos"}
                fill
                sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 40vw"
                className="object-cover"
              />
            </div>
          </figure>

          <figure className="relative mt-2 rotate-[2deg] sm:mt-4">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 z-10 h-6 w-24 -translate-x-1/2 -translate-y-1/2 rotate-[7deg] bg-[var(--accent)] opacity-60"
            />
            <div className="relative aspect-[4/3] overflow-hidden shadow-[0_0px_10px_rgba(54,32,20,0.2)]">
              <Image
                src="/camos_taps-1.jpg"
                alt={isJa ? "本郷菊坂町かもすのタップ" : "Taps at Hongo Kikusaka-cho Camos"}
                fill
                sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 40vw"
                className="object-cover object-[center_38%]"
              />
            </div>
          </figure>
        </div>
      </section>

      <section className="mb-8 rounded-xl bg-[var(--surface)] px-6 py-7 shadow-sm">
        <IconInitialHeading
          text={t.home.faqTitle}
          className="mb-4 text-lg font-semibold text-[var(--foreground)] tracking-tight"
        />
        <dl className="space-y-4">
          {t.home.faqItems.map((item) => (
            <div key={item.question}>
              <dt className="text-sm font-semibold text-[var(--foreground)]">Q. {item.question}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-[var(--muted)]">A. {item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {past.length > 0 && (
        <section className="mb-8 rounded-xl bg-[var(--surface)] px-6 py-6 shadow-sm">
          <IconInitialHeading
            text={t.home.recentTitle}
            className="mb-4 text-lg font-semibold text-[var(--foreground)] tracking-tight"
          />
          {past.map((talk) => (
            <TalkCard key={talk.id} talk={talk} locale={locale} />
          ))}
          <Link
            href={`/${locale}/talks`}
            className="mt-4 inline-block text-sm font-medium text-[var(--accent-deep)] transition-colors hover:text-[var(--foreground)]"
          >
            {t.home.viewAll}
          </Link>
        </section>
      )}

      <section className="overflow-hidden shadow-sm">
        <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
          <div className="bg-[var(--accent)] px-6 py-7 text-white md:px-7 md:py-8">
            <p className="mb-1 text-xs font-semibold tracking-[0.08em] text-white/85">{t.camos.label}</p>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-bold">{t.camos.title}</h2>
              <a
                href="https://www.instagram.com/hk.camos"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t.camos.instagram} @hk.camos`}
                className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-sm text-white/90 transition-colors hover:text-white"
              >
                <span
                  aria-hidden="true"
                  className="h-5 w-5 bg-current [mask-image:url('/icons/instagram.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url('/icons/instagram.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]"
                />
              </a>
            </div>
            <div className="space-y-3 text-sm">
              <p>{t.camos.address}</p>
              <div>
                <p className="whitespace-pre-line">{t.camos.hours}</p>
                <p className="mt-0.5 text-xs opacity-80">{t.camos.hoursNote}</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[260px]">
            <Image
              src="/camos_interior-1.jpg"
              alt={isJa ? "本郷菊坂町かもすの内観" : "Interior of Hongo Kikusaka-cho Camos"}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 md:hidden" aria-hidden="true">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                <path d="M0 0 H100 V50 C50 25 16 40 0 0 Z" fill="var(--accent)" />
              </svg>
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-20 md:block" aria-hidden="true">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                <path d="M0 0 H50 C50 50 100 50 100 100 H0 Z" fill="var(--accent)" />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
