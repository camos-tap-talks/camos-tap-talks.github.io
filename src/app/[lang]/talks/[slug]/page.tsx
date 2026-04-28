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

        {talk.reportPublished && (talk.reportJa || talk.reportEn || (talk.reportImages && talk.reportImages.length > 0)) && (
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent-deep)]">
              Report
            </h2>

            {(locale === "ja" ? talk.reportJa : talk.reportEn) && (
              <MarkdownText
                content={(locale === "ja" ? talk.reportJa : talk.reportEn) ?? ""}
                className="leading-relaxed text-[var(--muted)]"
              />
            )}

            {talk.reportImages && talk.reportImages.length > 0 && (
              <div
                className={`mx-auto mt-7 grid gap-6 sm:gap-12 ${
                  talk.reportImages.length === 1
                    ? "max-w-[280px] grid-cols-1 justify-items-center"
                    : "max-w-[560px] grid-cols-2"
                }`}
              >
                {talk.reportImages.map((src, i) => (
                  <figure
                    key={src}
                    className={`relative w-full ${i % 2 === 0 ? "rotate-[-2deg]" : "mt-2 rotate-[2deg] sm:mt-4"}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute left-1/2 top-0 z-10 h-6 w-24 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent)] opacity-60 ${
                        i % 2 === 0 ? "rotate-[-4deg]" : "rotate-[7deg]"
                      }`}
                    />
                    <div className="relative aspect-[4/3] overflow-hidden shadow-[0_0px_10px_rgba(54,32,20,0.2)]">
                      <Image
                        src={src}
                        alt={`${title} — photo ${i + 1}`}
                        fill
                        sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 40vw"
                        className="object-cover"
                      />
                    </div>
                  </figure>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
