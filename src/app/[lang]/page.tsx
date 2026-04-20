import { notFound } from "next/navigation";
import { locales, type Locale, getTranslations } from "@/lib/i18n";
import { getUpcomingTalks, getPastTalks } from "@/lib/talks";
import TalkCard from "@/components/TalkCard";
import IconInitialHeading from "@/components/IconInitialHeading";
import Link from "next/link";
import Image from "next/image";

type Props = {
  params: Promise<{ lang: string }>;
};

const siteBasePath = process.env.NODE_ENV === "production" ? "/camos-tap-talks" : "";

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();

  const locale = lang as Locale;
  const t = getTranslations(locale);
  const upcoming = getUpcomingTalks();
  const past = getPastTalks().slice(0, 3);

  return (
    <div>
      <section className="mb-6">
        <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto] sm:gap-8">
          <div className="order-2 sm:order-1">
            <div className="mb-4">
              <h1 className="sr-only sm:not-sr-only text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-[2.8rem]">
                {t.home.title}
              </h1>
            </div>
            <p className="max-w-xl leading-relaxed text-[var(--muted)]">
              {t.home.description}
            </p>
          </div>

          <div className="order-1 flex justify-center sm:order-2 sm:justify-end">
            <Image
              src={`${siteBasePath}/logo.svg`}
              alt={t.home.title}
              width={190}
              height={190}
              priority
              className="h-auto w-[190px] sm:w-[190px]"
            />
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-xl bg-[var(--surface)] px-6 py-7 shadow-sm">
        <IconInitialHeading
          text={t.home.formatTitle}
          className="mb-3 text-lg font-semibold text-[var(--foreground)] tracking-tight"
        />
        <ul className="space-y-2 text-sm text-[var(--muted)]">
          {t.home.formatItems.map((item) => (
            <li key={item} className="flex items-start gap-2 leading-relaxed">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8 rounded-xl bg-[var(--surface)] px-6 py-7 shadow-sm">
        <IconInitialHeading
          text={t.home.participationTitle}
          className="mb-3 text-lg font-semibold text-[var(--foreground)] tracking-tight"
        />
        <ul className="space-y-2 text-sm text-[var(--muted)]">
          {t.home.participationItems.map((item) => (
            <li key={item} className="flex items-start gap-2 leading-relaxed">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8 rounded-xl bg-[var(--surface)] px-6 py-7 shadow-sm">
        <IconInitialHeading
          text={t.home.faqTitle}
          className="mb-4 text-lg font-semibold text-[var(--foreground)] tracking-tight"
        />
        <dl className="space-y-4">
          {t.home.faqItems.map((item) => (
            <div key={item.question}>
              <dt className="text-sm font-semibold text-[var(--foreground)]">Q. {item.question}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-[var(--muted)]">A. {item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-8 rounded-xl bg-[var(--surface)] px-6 py-6 shadow-sm">
        <IconInitialHeading
          text={t.home.upcomingTitle}
          className="mb-4 text-lg font-semibold text-[var(--foreground)] tracking-tight"
        />
        {upcoming.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{t.home.noUpcoming}</p>
        ) : (
          upcoming.map((talk) => (
            <TalkCard key={talk.id} talk={talk} locale={locale} />
          ))
        )}
      </section>

      {past.length > 0 && (
        <section className="mb-8 rounded-xl bg-[var(--surface)] px-6 py-6 shadow-sm">
          <IconInitialHeading
            text={t.home.recentTitle}
            className="mb-4 text-lg font-semibold text-[var(--foreground)] tracking-tight"
          />
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

      <section className="mb-8  bg-[#d1773b] px-6 py-7 text-white">
        <p className="mb-1 text-xs font-semibold tracking-[0.08em] text-white/85">{t.camos.label}</p>
        <h2 className="mb-4 text-lg font-bold">{t.camos.title}</h2>
        <div className="space-y-3 text-sm">
          <p>{t.camos.address}</p>
          <div>
            <p>{t.camos.hours}</p>
            <p className="mt-0.5 text-xs opacity-80">{t.camos.hoursNote}</p>
          </div>
          <a
            href="https://www.instagram.com/hk.camos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-medium underline underline-offset-2 transition-opacity hover:opacity-80"
          >
            {t.camos.instagram} @hk.camos
          </a>
        </div>
      </section>
    </div>
  );
}
