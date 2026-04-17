import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { locales, type Locale, getTranslations } from "@/lib/i18n";
import { talks, formatDate } from "@/lib/talks";
import Link from "next/link";

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
  return {
    title: lang === "ja" ? talk.titleJa : talk.titleEn,
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
    <div>
      <Link
        href={`/${locale}/talks`}
        className="text-sm text-stone-400 hover:text-stone-700 transition-colors mb-8 inline-block"
      >
        ← {t.nav.talks}
      </Link>

      <p className="text-xs text-stone-400 mb-2">{formatDate(talk.date, locale)}</p>
      <h1 className="text-2xl font-bold text-stone-800 mb-2">{title}</h1>
      <p className="text-stone-500 mb-8">
        {t.talkCard.speaker}: {speaker}
      </p>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-3">
          Abstract
        </h2>
        <p className="text-stone-600 leading-relaxed">{abstract}</p>
      </section>

      {bio && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-3">
            Speaker Bio
          </h2>
          <p className="text-stone-600 leading-relaxed">{bio}</p>
        </section>
      )}
    </div>
  );
}
