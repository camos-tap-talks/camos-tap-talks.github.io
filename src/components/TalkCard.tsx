import type { Talk } from "@/lib/talks";
import { formatDate } from "@/lib/talks";
import type { Locale } from "@/lib/i18n";
import Link from "next/link";
import Image from "next/image";
import MarkdownText from "@/components/MarkdownText";

type Props = {
  talk: Talk;
  locale: Locale;
  variant?: "default" | "upcomingTap";
  tapNumber?: number;
  showTapHash?: boolean;
  disableLink?: boolean;
  forceMobileTypography?: boolean;
  forceDesktopTypography?: boolean;
  titleMaxLines?: 1 | 2 | 3;
  speakerMaxLines?: 1 | 2 | 3;
  titleDataField?: string;
  speakerDataField?: string;
};

export default function TalkCard({
  talk,
  locale,
  variant = "default",
  tapNumber,
  showTapHash = true,
  disableLink,
  forceMobileTypography = false,
  forceDesktopTypography = false,
  titleMaxLines,
  speakerMaxLines,
  titleDataField,
  speakerDataField,
}: Props) {
  const title = locale === "ja" ? talk.titleJa : talk.titleEn;
  const speaker = locale === "ja" ? talk.speakerJa : talk.speakerEn;
  const normalizedTapNumber = Number.isFinite(tapNumber) ? tapNumber : null;
  const tapLabel = `${showTapHash ? "#" : ""}${normalizedTapNumber ?? talk.id}`;
  const titleLineClampClass =
    titleMaxLines === 1 ? "line-clamp-1" : titleMaxLines === 2 ? "line-clamp-2" : titleMaxLines === 3 ? "line-clamp-3" : "";
  const speakerLineClampClass =
    speakerMaxLines === 1 ? "line-clamp-1" : speakerMaxLines === 2 ? "line-clamp-2" : speakerMaxLines === 3 ? "line-clamp-3" : "";
  const titleContent = titleMaxLines ? <span>{title}</span> : <MarkdownText content={title} variant="inline" />;

  if (variant === "upcomingTap") {
    const usesCompactMobileLayout = forceMobileTypography;
    const usesFixedDesktopLayout = forceDesktopTypography;
    const usesResponsiveLayout = !usesCompactMobileLayout && !usesFixedDesktopLayout;
    const cardClass =
      usesCompactMobileLayout
        ? "mb-4 grid min-h-[11.9rem] grid-cols-[1fr_6.6rem] border border-[#2a2a2a] bg-[#1f1f1f] text-[#ece5d5] [text-shadow:0_0_1px_rgba(255,255,255,0.12)] shadow-[inset_0_0_0_1px_rgba(244,240,230,0.08),0_8px_18px_rgba(0,0,0,0.2)]"
        : usesFixedDesktopLayout
          ? "mb-4 grid min-h-[9.9rem] grid-cols-[4.2rem_1fr_6.6rem] border border-[#2a2a2a] bg-[#1f1f1f] text-[#ece5d5] [text-shadow:0_0_1px_rgba(255,255,255,0.12)] shadow-[inset_0_0_0_1px_rgba(244,240,230,0.08),0_8px_18px_rgba(0,0,0,0.2)]"
          : "mb-4 grid min-h-[11.9rem] grid-cols-[1fr_6.6rem] border border-[#2a2a2a] bg-[#1f1f1f] text-[#ece5d5] [text-shadow:0_0_1px_rgba(255,255,255,0.12)] shadow-[inset_0_0_0_1px_rgba(244,240,230,0.08),0_8px_18px_rgba(0,0,0,0.2)] md:min-h-[9.9rem] md:grid-cols-[4.2rem_1fr_6.6rem]";

    const inner = (
      <>
        {!usesCompactMobileLayout && (
          <div className={`${usesResponsiveLayout ? "hidden md:flex" : "flex"} flex-col items-center justify-center border-r border-[#3f3f3f] px-2 text-[#e0d8c6]`}>
            <span
              className={`font-semibold tracking-[0.26em] ${
                forceMobileTypography
                  ? "text-[0.62rem]"
                  : forceDesktopTypography
                    ? "text-[0.68rem]"
                    : "text-[0.62rem] md:text-[0.68rem]"
              }`}
            >
              TAP
            </span>
            <span
              className={`mt-1 font-bold leading-none tracking-[0.03em] ${
                forceMobileTypography ? "text-sm" : forceDesktopTypography ? "text-lg" : "text-sm md:text-lg"
              }`}
            >
              {tapLabel}
            </span>
          </div>
        )}

        <div className={`grid h-full grid-rows-[auto_1fr_auto] gap-1 ${usesCompactMobileLayout ? "px-4 py-4" : "px-5 py-4"}`}>
          <p
            className={`uppercase tracking-[0.2em] text-[#ddd4bf] ${
              forceMobileTypography ? "text-[0.62rem]" : forceDesktopTypography ? "text-xs" : "text-[0.62rem] md:text-xs"
            }`}
          >
            {formatDate(talk.date, locale, talk.dateTbd)}
          </p>
          <div className="flex flex-1 items-center">
            <h3
              data-preview-field={titleDataField}
              className={`whitespace-pre-line font-medium leading-tight text-[#efe8d9] ${titleLineClampClass} ${
                forceMobileTypography ? "text-sm" : forceDesktopTypography ? "text-lg" : "text-sm md:text-lg"
              }`}
            >
              {titleContent}
            </h3>
          </div>
          <p
            data-preview-field={speakerDataField}
            className={`text-[#ddd4bf] ${speakerLineClampClass} ${
              forceMobileTypography ? "text-xs" : forceDesktopTypography ? "text-sm" : "text-xs md:text-sm"
            }`}
          >
            {speaker}
          </p>
        </div>

        <div
          className={`h-full w-full border-l border-[#3f3f3f] ${
            usesCompactMobileLayout
              ? "grid grid-rows-[minmax(2rem,1fr)_9.9rem]"
              : usesResponsiveLayout
                ? "grid grid-rows-[minmax(2rem,1fr)_9.9rem] md:block"
                : ""
          }`}
        >
          {!usesFixedDesktopLayout && (
            <div className={`${usesResponsiveLayout ? "flex md:hidden" : "flex"} h-8 items-center justify-center gap-2 border-b border-[#3f3f3f] bg-[#252525] px-2 text-[#e0d8c6]`}>
              <span className="text-[0.62rem] font-semibold tracking-[0.22em]">TAP</span>
              <span className="text-sm font-bold leading-none tracking-[0.03em]">{tapLabel}</span>
            </div>
          )}

          <div className={`relative h-[9.9rem] w-full ${usesResponsiveLayout ? "md:h-full" : ""}`}>
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
      <p className="mb-1 text-[0.62rem] uppercase tracking-[0.18em] text-[var(--accent-deep)] md:text-xs">
        {formatDate(talk.date, locale, talk.dateTbd)}
      </p>
      <h3 className="mb-1 text-base font-medium text-[var(--foreground)] md:text-lg">
        <MarkdownText content={title} variant="inline" />
      </h3>
      <p className="text-xs text-[var(--muted)] md:text-sm">{speaker}</p>
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
