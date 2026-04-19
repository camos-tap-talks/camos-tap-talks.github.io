import { notFound } from "next/navigation";
import { locales, type Locale, getTranslations } from "@/lib/i18n";
import { getUpcomingTalks, getPastTalks } from "@/lib/talks";
import TalkCard from "@/components/TalkCard";
import Link from "next/link";
import Image from "next/image";

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
      <section className="mb-14">
        <div className="grid items-center gap-5 md:grid-cols-[1fr_auto] md:gap-8">
          <div className="order-2 md:order-1">
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-[var(--foreground)] md:text-[2.8rem]">
              {t.home.title}
            </h1>
            <p className="max-w-xl leading-relaxed text-[var(--muted)]">
              {t.home.description}
            </p>
          </div>

          <div className="order-1 flex justify-center md:order-2 md:justify-end">
            <Image
              src="/logo.svg"
              alt={t.home.title}
              width={190}
              height={190}
              priority
              className="h-auto w-[124px] md:w-[190px]"
            />
          </div>
        </div>
      </section>

      <section className="mb-12 rounded-xl bg-[var(--surface)] px-6 py-7 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)] tracking-tight">
          {t.home.formatTitle}
        </h2>
        <ul className="space-y-2 text-sm text-[var(--muted)]">
          {t.home.formatItems.map((item) => (
            <li key={item} className="flex items-start gap-2 leading-relaxed">
              <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12 rounded-xl bg-[var(--surface)] px-6 py-7 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)] tracking-tight">
          {t.home.faqTitle}
        </h2>
        <dl className="space-y-4">
          {t.home.faqItems.map((item) => (
            <div key={item.question}>
              <dt className="text-sm font-semibold text-[var(--foreground)]">Q. {item.question}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-[var(--muted)]">A. {item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-12 rounded-xl bg-[var(--surface)] px-6 py-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)] tracking-tight">
          {t.home.upcomingTitle}
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{t.home.noUpcoming}</p>
        ) : (
          upcoming.map((talk) => (
            <TalkCard key={talk.id} talk={talk} locale={locale} />
          ))
        )}
      </section>

      {past.length > 0 && (
        <section className="rounded-xl bg-[var(--surface)] px-6 py-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)] tracking-tight">
            {t.home.recentTitle}
          </h2>
          {past.map((talk) => (
            <TalkCard key={talk.id} talk={talk} locale={locale} />
          ))}
          <Link
            href={`/${locale}/talks`}
            className="mt-4 inline-block text-sm font-medium text-[var(--accent-deep)] transition-colors hover:text-[var(--foreground)]"
          >
            {t.home.viewAll}
          </Link>
        </section>
      )}
    </div>
  );
}
