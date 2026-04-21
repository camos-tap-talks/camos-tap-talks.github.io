import { getTranslations, type Locale } from "@/lib/i18n";
import { getUpcomingTalks, getPastTalks } from "@/lib/talks";
import TalkCard from "@/components/TalkCard";

type Props = {
  locale: Locale;
};

export default function TalksClient({ locale }: Props) {
  const t = getTranslations(locale);
  const all = [...getUpcomingTalks(), ...getPastTalks()];

  return (
    <div>
      <p className="mb-8 text-center text-[0.7rem] font-semibold tracking-[0.32em] text-[var(--muted)]">
        — TAP LIST —
      </p>
      {all.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{t.talks.noTalks}</p>
      ) : (
        all.map((talk) => (
          <TalkCard
            key={talk.id}
            talk={talk}
            locale={locale}
            variant="upcomingTap"
            tapNumber={parseInt(talk.id, 10)}
          />
        ))
      )}
    </div>
  );
}
