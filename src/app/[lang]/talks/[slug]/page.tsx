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

  const abstract = locale === "ja" ? talk.abstractJa : talk.abstractEn;
  const bio = locale === "ja" ? talk.speakerBioJa : talk.speakerBioEn;
  const title = locale === "ja" ? talk.titleJa : talk.titleEn;

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
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent-deep)]">
            Abstract
          </h2>
          <MarkdownText content={abstract} className="leading-relaxed text-[var(--muted)]" />
        </section>

        {bio && (
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent-deep)]">
              Speaker Bio
            </h2>
            <MarkdownText content={bio} className="leading-relaxed text-[var(--muted)]" />
          </section>
        )}
      </div>
    </div>
  );
}
