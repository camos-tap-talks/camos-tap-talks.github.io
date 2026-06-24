"use client";

import TalkCard from "@/components/TalkCard";
import { getUpcomingTalks } from "@/lib/talks";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  noUpcomingText: string;
};

export default function NextTalkSectionClient({ locale, noUpcomingText }: Props) {
  const upcoming = getUpcomingTalks();

  return (
    <section id="next-talk" className="mb-8 scroll-mt-24">
      <p className="mb-4 text-center text-[0.7rem] font-semibold tracking-[0.32em] text-[var(--muted)]">
        — NEXT TALK —
      </p>
      {upcoming.length === 0 ? (
        <p className="text-center text-sm text-[var(--muted)]">{noUpcomingText}</p>
      ) : (
        upcoming.map((talk) => (
          <TalkCard
            key={talk.id}
            talk={talk}
            locale={locale}
            variant="upcomingTap"
            tapNumber={parseInt(talk.id, 10)}
            titleMaxLines={2}
          />
        ))
      )}
    </section>
  );
}
