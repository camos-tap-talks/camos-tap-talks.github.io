import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { locales, type Locale, getTranslations } from "@/lib/i18n";
import { talks, formatDate } from "@/lib/talks";
import IconInitialHeading from "@/components/IconInitialHeading";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

type Props = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateStaticParams() {
  // Return only slug; lang is covered by the parent [lang] layout.
  // Return a dummy entry when no talks exist so the static export build succeeds.
  if (talks.length === 0) return [{ slug: "_placeholder" }];
  return talks.map((talk) => ({ slug: talk.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const talk = talks.find((t) => t.slug === slug);
  if (!talk) return {};

  const jaPath = `/ja/talks/${slug}`;
  const enPath = `/en/talks/${slug}`;

  return {
    title: lang === "ja" ? talk.titleJa : talk.titleEn,
    alternates: {
      canonical: lang === "ja" ? jaPath : enPath,
      languages: {
        ja: `${SITE_URL}${jaPath}`,
        en: `${SITE_URL}${enPath}`,
      },
    },
  };
}

export default async function TalkPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!locales.includes(lang as Locale)) notFound();

  const locale = lang as Locale;
  const t = getTranslations(locale);
  const talk = talks.find((tk) => tk.slug === slug);
  if (!talk) notFound();

  const title = locale === "ja" ? talk.titleJa : talk.titleEn;
  const speaker = locale === "ja" ? talk.speakerJa : talk.speakerEn;
  const abstract = locale === "ja" ? talk.abstractJa : talk.abstractEn;
  const bio = locale === "ja" ? talk.speakerBioJa : talk.speakerBioEn;

  return (
    <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-6 shadow-[0_10px_30px_rgba(44,32,24,0.04)]">
      <Link
        href={`/${locale}/talks`}
        className="mb-8 inline-block text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent-deep)]"
      >
        ← {t.nav.talks}
      </Link>

      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--accent-deep)]">{formatDate(talk.date, locale, talk.dateTbd)}</p>
      <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)]">{title}</h1>
      <p className="mb-8 text-[var(--muted)]">
        {t.talkCard.speaker}: {speaker}
      </p>

      <section className="mb-8">
        <IconInitialHeading
          text="Abstract"
          className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--accent-deep)]"
        />
        <p className="leading-relaxed text-[var(--muted)]">{abstract}</p>
      </section>

      {bio && (
        <section>
          <IconInitialHeading
            text="Speaker Bio"
            className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--accent-deep)]"
          />
          <p className="leading-relaxed text-[var(--muted)]">{bio}</p>
        </section>
      )}
    </div>
  );
}
