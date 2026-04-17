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
    <div>
      <h1 className="text-3xl font-bold text-stone-800 mb-8">{t.talks.title}</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-stone-100">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm transition-colors ${
              tab === key
                ? "text-stone-800 font-medium border-b-2 border-stone-700 -mb-px"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <p className="text-stone-400 text-sm">{t.talks.noTalks}</p>
      ) : (
        displayed.map((talk) => (
          <TalkCard key={talk.id} talk={talk} locale={locale} />
        ))
      )}
    </div>
  );
}
