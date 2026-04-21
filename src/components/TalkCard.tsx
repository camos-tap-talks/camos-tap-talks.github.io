import type { Talk } from "@/lib/talks";
import { formatDate } from "@/lib/talks";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";
import Link from "next/link";
import Image from "next/image";

type Props = {
  talk: Talk;
  locale: Locale;
  variant?: "default" | "upcomingTap";
  tapNumber?: number;
  disableLink?: boolean;
};

export default function TalkCard({ talk, locale, variant = "default", tapNumber, disableLink }: Props) {
  const t = getTranslations(locale);
  const title = locale === "ja" ? talk.titleJa : talk.titleEn;
  const speaker = locale === "ja" ? talk.speakerJa : talk.speakerEn;
  const normalizedTapNumber = Number.isFinite(tapNumber) ? tapNumber : null;
  const tapLabel = `#${normalizedTapNumber ?? talk.id}`;

  if (variant === "upcomingTap") {
    const cardClass =
      "mb-4 grid min-h-36 grid-cols-[4.2rem_1fr_6.6rem] border border-[#2a2a2a] bg-[#1f1f1f] text-[#f4f0e6] shadow-[inset_0_0_0_1px_rgba(244,240,230,0.08),0_8px_18px_rgba(0,0,0,0.2)]";

    const inner = (
      <>
        <div className="flex flex-col items-center justify-center border-r border-[#3f3f3f] px-2 text-[#d9cfb7]">
          <span className="text-[0.68rem] font-semibold tracking-[0.26em]">TAP</span>
          <span className="mt-1 text-lg font-bold leading-none tracking-[0.03em]">{tapLabel}</span>
        </div>

        <div className="flex h-full flex-col px-5 py-4">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#d9cfb7]">
            {formatDate(talk.date, locale, talk.dateTbd)}
          </p>
          <div className="flex flex-1 items-center">
            <h3 className="text-lg font-semibold text-[#f4f0e6]">{title}</h3>
          </div>
          <p className="text-sm text-[#c8beaa]">
            {t.talkCard.speaker}: {speaker}
          </p>
        </div>

        <div className="relative h-full w-full border-l border-[#3f3f3f]">
          {talk.speakerImage ? (
            <Image
              src={talk.speakerImage}
              alt={speaker}
              fill
              sizes="106px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#2f2f2f,#252525)] text-[#cfc5af]">
              <Image src="/icon-white.svg" alt="" width={52} height={52} aria-hidden="true" />
            </div>
          )}
        </div>
      </>
    );

    if (disableLink) {
      return <article className={cardClass}>{inner}</article>;
    }

    return (
      <Link href={`/${locale}/talks/${talk.slug}`} className={`${cardClass} transition-opacity hover:opacity-85`}>
        {inner}
      </Link>
    );
  }

  const defaultClass =
    "mb-4 rounded-none bg-white/90 px-5 py-5 shadow-[0_2px_12px_rgba(44,32,24,0.06)] transition hover:shadow-[0_4px_18px_rgba(44,32,24,0.10)]";

  const defaultInner = (
    <>
      <p className="mb-1 text-xs uppercase tracking-[0.18em] text-[var(--accent-deep)]">
        {formatDate(talk.date, locale, talk.dateTbd)}
      </p>
      <h3 className="mb-1 text-lg font-medium text-[var(--foreground)]">{title}</h3>
      <p className="text-sm text-[var(--muted)]">
        {t.talkCard.speaker}: {speaker}
      </p>
    </>
  );

  if (disableLink) {
    return <article className={defaultClass}>{defaultInner}</article>;
  }

  return (
    <Link href={`/${locale}/talks/${talk.slug}`} className={`block ${defaultClass}`}>
      {defaultInner}
    </Link>
  );
}
