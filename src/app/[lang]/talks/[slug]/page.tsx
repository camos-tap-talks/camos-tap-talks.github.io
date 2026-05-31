import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { locales, type Locale, getTranslations } from "@/lib/i18n";
import { talks } from "@/lib/talks";
import TalkCard from "@/components/TalkCard";
import MarkdownText from "@/components/MarkdownText";
import Image from "next/image";
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

  // Determine which language to use based on talk.language setting
  const getLanguageForLocale = (locale: Locale, talkLanguage?: "ja" | "en" | "both"): "ja" | "en" => {
    if (talkLanguage === "ja") return "ja";
    if (talkLanguage === "en") return "en";
    return locale === "ja" ? "ja" : "en";
  };
  
  const displayLanguage = getLanguageForLocale(locale, talk.language);
  const abstract = displayLanguage === "ja" ? talk.abstractJa : talk.abstractEn;
  const bio = displayLanguage === "ja" ? talk.speakerBioJa : talk.speakerBioEn;
  const title = displayLanguage === "ja" ? talk.titleJa : talk.titleEn;
  const report = locale === "ja" ? talk.reportJa : talk.reportEn;

  return (
    <div>
      <Link
        href={`/${locale}/talks`}
        className="mb-6 inline-block text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent-deep)]"
      >
        ← {t.nav.talks}
      </Link>

      <TalkCard
        talk={talk}
        locale={locale}
        variant="upcomingTap"
        tapNumber={parseInt(talk.id, 10)}
        disableLink
      />

      {talk.talkImage && (
        <div className="relative mb-6 aspect-video w-full overflow-hidden">
          <Image
            src={talk.talkImage}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-6 space-y-6 px-1">
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)] sm:text-base">
            Abstract
          </h2>
          <MarkdownText content={abstract} className="leading-relaxed text-[var(--muted)]" />
        </section>

        {bio && (
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)] sm:text-base">
              Speaker Bio
            </h2>
            <MarkdownText content={bio} className="leading-relaxed text-[var(--muted)]" />
          </section>
        )}

        {talk.reportPublished && report && (
          <section className="border border-[color-mix(in_srgb,var(--line)_85%,var(--accent))] bg-[var(--surface)] px-4 py-4 sm:px-5">
            <div className="mb-2 text-center">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)] sm:text-base">
                Report
              </h2>
              <span
                aria-hidden="true"
                className="mx-auto mt-1 block h-px w-24 bg-[color-mix(in_srgb,var(--accent)_55%,var(--line))]"
              />
            </div>

            <MarkdownText
              content={report}
              className="leading-relaxed text-[var(--muted)]"
            />
          </section>
        )}
      </div>
    </div>
  );
}
