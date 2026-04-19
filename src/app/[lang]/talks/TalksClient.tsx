"use client";

import { useState } from "react";
import { getTranslations, type Locale } from "@/lib/i18n";
import { getUpcomingTalks, getPastTalks } from "@/lib/talks";
import TalkCard from "@/components/TalkCard";

type Tab = "all" | "upcoming" | "past";

type Props = {
  locale: Locale;
};

export default function TalksClient({ locale }: Props) {
  const t = getTranslations(locale);
  const [tab, setTab] = useState<Tab>("all");

  const upcoming = getUpcomingTalks();
  const past = getPastTalks();
  const all = [...upcoming, ...past];

  const displayed = tab === "all" ? all : tab === "upcoming" ? upcoming : past;

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: t.talks.all },
    { key: "upcoming", label: t.talks.upcoming },
    { key: "past", label: t.talks.past },
  ];

  return (
    <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-6 shadow-[0_10px_30px_rgba(44,32,24,0.04)]">
      <h1 className="mb-8 text-3xl font-bold text-[var(--foreground)]">{t.talks.title}</h1>

      <div className="mb-8 flex gap-1 border-b border-[var(--line)]">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm transition-colors ${
              tab === key
                ? "-mb-px border-b-2 border-[var(--accent)] font-medium text-[var(--accent-deep)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{t.talks.noTalks}</p>
      ) : (
        displayed.map((talk) => (
          <TalkCard key={talk.id} talk={talk} locale={locale} />
        ))
      )}
    </div>
  );
}
