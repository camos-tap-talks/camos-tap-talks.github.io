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
    <article className="border-b border-stone-100 py-6 last:border-0">
      <p className="text-xs text-stone-400 mb-1">{formatDate(talk.date, locale)}</p>
      <Link
        href={`/${locale}/talks/${talk.slug}`}
        className="group block"
      >
        <h3 className="text-lg font-medium text-stone-800 group-hover:underline underline-offset-2 mb-1">
          {title}
        </h3>
      </Link>
      <p className="text-sm text-stone-500 mb-2">
        {t.talkCard.speaker}: {speaker}
      </p>
      <p className="text-sm text-stone-600 line-clamp-3">{abstract}</p>
    </article>
  );
}
