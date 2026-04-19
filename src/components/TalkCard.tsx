import type { Talk } from "@/lib/talks";
import { formatDate } from "@/lib/talks";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";
import Link from "next/link";

type Props = {
  talk: Talk;
  locale: Locale;
};

export default function TalkCard({ talk, locale }: Props) {
  const t = getTranslations(locale);
  const title = locale === "ja" ? talk.titleJa : talk.titleEn;
  const speaker = locale === "ja" ? talk.speakerJa : talk.speakerEn;
  const abstract = locale === "ja" ? talk.abstractJa : talk.abstractEn;

  return (
    <article className="rounded-lg bg-white/90 px-5 py-5 mb-4 shadow-[0_2px_12px_rgba(44,32,24,0.06)] transition hover:shadow-[0_4px_18px_rgba(44,32,24,0.10)]">
      <p className="mb-1 text-xs uppercase tracking-[0.18em] text-[var(--accent-deep)]">
        {formatDate(talk.date, locale)}
      </p>
      <Link href={`/${locale}/talks/${talk.slug}`} className="group block">
        <h3 className="mb-1 text-lg font-medium text-[var(--foreground)] transition-colors group-hover:text-[var(--accent-deep)]">
          {title}
        </h3>
      </Link>
      <p className="mb-2 text-sm text-[var(--muted)]">
        {t.talkCard.speaker}: {speaker}
      </p>
      <p className="line-clamp-3 text-sm text-[var(--muted)]">{abstract}</p>
    </article>
  );
}
