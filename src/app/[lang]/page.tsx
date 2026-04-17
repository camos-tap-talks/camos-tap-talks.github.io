import { notFound } from "next/navigation";
import { locales, type Locale, getTranslations } from "@/lib/i18n";
import { getUpcomingTalks, getPastTalks } from "@/lib/talks";
import TalkCard from "@/components/TalkCard";
import Link from "next/link";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();

  const locale = lang as Locale;
  const t = getTranslations(locale);
  const upcoming = getUpcomingTalks();
  const past = getPastTalks().slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">{t.home.title}</h1>
        <p className="text-stone-500 text-lg mb-6">{t.home.subtitle}</p>
        <p className="text-stone-600 leading-relaxed">{t.home.description}</p>
      </section>

      {/* Upcoming */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-stone-700 mb-4 pb-2 border-b border-stone-100">
          {t.home.upcomingTitle}
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-stone-400 text-sm">{t.home.noUpcoming}</p>
        ) : (
          upcoming.map((talk) => (
            <TalkCard key={talk.id} talk={talk} locale={locale} />
          ))
        )}
      </section>

      {/* Recent */}
      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-stone-700 mb-4 pb-2 border-b border-stone-100">
            {t.home.recentTitle}
          </h2>
          {past.map((talk) => (
            <TalkCard key={talk.id} talk={talk} locale={locale} />
          ))}
          <Link
            href={`/${locale}/talks`}
            className="inline-block mt-4 text-sm text-stone-500 hover:text-stone-800 transition-colors"
          >
            {t.home.viewAll}
          </Link>
        </section>
      )}
    </div>
  );
}
