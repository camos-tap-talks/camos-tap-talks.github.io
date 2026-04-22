import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, locales, type Locale } from "@/lib/i18n";

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isJa = lang === "ja";

  return {
    title: isJa ? "Speaker Guide" : "Speaker Guide",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function SpeakerGuidePage({ params }: Props) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();

  const locale = lang as Locale;
  const isJa = locale === "ja";
  const t = getTranslations(locale);

  return (
    <article className="space-y-8">
      <header className="text-center">
        {isJa && (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">SPEAKER GUIDE</p>
        )}
        <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
          {isJa ? "スピーカー向けご案内" : "Speaker Guide"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          {isJa
            ? "トークしていただく前に、このページの内容をご確認ください。"
            : "Please review this page before your talk."}
        </p>
      </header>

      {/* 目的 */}
      <section className="rounded-xl bg-[var(--surface)] px-5 py-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
          {isJa ? "目的" : "Purpose"}
        </h2>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          {isJa
            ? "Camos Tap Talks は、研究者（あるいは専門家）が自分の研究をわかりやすく一般向けに紹介するカジュアルなトークシリーズです。ビールを片手にお話しいただくことで、研究者と地域市民の壁をとりはらうことを目指しています。専門外の聴衆にも楽しんでもらえるトークをお願いします。"
            : "Camos Tap Talks is a casual talk series where researchers (or experts) present their work in an accessible way to the general public. By sharing your research over a beer, we aim to break down barriers between researchers and the local community. Please prepare a talk that can be enjoyed by a non-specialist audience."}
        </p>
      </section>

      {/* 当日の流れ */}
      <section className="rounded-xl bg-[var(--surface)] px-5 py-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
          {isJa ? "当日の流れ" : "Event Flow"}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-[var(--muted)]">
          {isJa
                      ? "はじめに、15分程度で自己紹介や研究紹介をお願いします。その後 Q&A に移り、聴衆の興味にしたがってカジュアルにお話しいただけますと幸いです。" : "First, please introduce yourself and your research for about 15 minutes. Anything that serves as a starting point for the audience is fine. After that, we will move on to a casual Q&A session based on the audience's interests."}
        </p>
        <ul className="space-y-2 text-sm leading-relaxed text-[var(--muted)]">
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{isJa ? "スライドを用いたトークを想定していますが、聴衆にとってのとっかかりとなれば何でも構いません。ポスター発表、トークのみ、実験実演など、形式は自由です。飲食店ですので、特殊な物を持ち込まれる場合は事前にご相談ください。" : "We assume talks will use slides, but anything that serves as a starting point for the audience is fine. Poster presentations, talks only, or live demonstrations are all acceptable. Since this is a bar, please consult us in advance if you plan to bring any special items."}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{isJa ? "プロジェクターを利用される場合は、10分程度早めにお越しいただき接続確認をお願いします。" : "If you plan to use the projector, please arrive about 10 minutes early to check the connection."}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{isJa ? "スピーカーはドリンク3杯までどのサイズでも無料です。　※謝金はお渡ししていません。" : "Speakers enjoy up to 3 drinks for free. *No honorarium is provided."}</span>
          </li>
        </ul>
      </section>

      {/* 会場 */}
      <section className="rounded-xl bg-[var(--surface)] px-5 py-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
          {isJa ? "会場" : "Venue"}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-[var(--muted)]">
            {isJa
                ? "東京都文京区本郷のタップルーム「本郷菊坂町かもす」です。東京大学本郷キャンパスのすぐ近くにあります。クラフトビールを楽しみながら気軽に話せるゆったりとした空間です。" : "The venue is 'Hongo Kikuzaka-cho Kamosu,' a taproom located in Hongo, Bunkyo-ku, Tokyo. It is situated very close to the University of Tokyo's Hongo campus. The space offers a relaxed atmosphere where you can enjoy craft beer and have casual conversations."}
        </p>
        <div className="overflow-x-auto">
          <table className="mx-auto w-auto min-w-[min(100%,36rem)] border-collapse text-sm leading-relaxed text-[var(--muted)]">
            <tbody>
              <tr className="border-t border-[var(--line)]">
                <th scope="row" className="w-28 px-2 py-2 text-left font-semibold text-[var(--foreground)]">
                  {isJa ? "店名" : "Name"}
                </th>
                <td className="px-2 py-2">
                  <div className="inline-flex items-center gap-2">
                    <span>{t.camos.title}</span>
                    <a
                      href="https://www.instagram.com/hk.camos"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t.camos.instagram} @hk.camos`}
                      className="inline-flex items-center text-[var(--accent-deep)]"
                    >
                      <Image src="/instagram.svg" alt="" width={16} height={16} aria-hidden="true" />
                    </a>
                  </div>
                </td>
              </tr>
              <tr className="border-t border-[var(--line)]">
                <th scope="row" className="w-28 px-2 py-2 text-left font-semibold text-[var(--foreground)]">
                  {isJa ? "住所" : "Address"}
                </th>
                <td className="px-2 py-2">{t.camos.address}</td>
              </tr>
              <tr className="border-t border-[var(--line)]">
                <th scope="row" className="w-28 px-2 py-2 text-left font-semibold text-[var(--foreground)]">
                  {isJa ? "営業時間" : "Hours"}
                </th>
                <td className="px-2 py-2">
                  <p>{t.camos.hours}</p>
                  <p className="mt-0.5 text-xs opacity-80">{t.camos.hoursNote}</p>
                </td>
              </tr>
              <tr className="border-t border-[var(--line)]">
                <th scope="row" className="w-28 px-2 py-2 text-left font-semibold text-[var(--foreground)]">
                  {isJa ? "設備" : "Equipment"}
                </th>
                <td className="px-2 py-2">{isJa ? "プロジェクター（HDMI）、電源あり。" : "Projector (HDMI), power available."}</td>
              </tr>
              <tr className="border-y border-[var(--line)]">
                <th scope="row" className="w-28 px-2 py-2 text-left font-semibold text-[var(--foreground)]">
                  {isJa ? "収容人数" : "Capacity"}
                </th>
                <td className="px-2 py-2">{isJa ? "最大15席。トークに参加できるのは8名程度です。" : "Maximum 15 seats. Approximately 8 people can participate in the talk."}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 開催日時について */}
      <section className="rounded-xl bg-[var(--surface)] px-5 py-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
          {isJa ? "開催日時について" : "About Date and Time"}
        </h2>
        <ul className="space-y-2 text-sm leading-relaxed text-[var(--muted)]">
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>
              {isJa
                ? "開催日は回ごとに異なります。確定した日時はトークページおよび公開情報に反映されます。"
                : "Dates vary by event. Confirmed schedules are reflected on the talks page and public listings."}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>
              {isJa
                ? "最新情報は Instagram でもご案内します。"
                : "Latest updates are also announced on Instagram."}
            </span>
          </li>
        </ul>
      </section>

      {/* 準備いただくもの */}
      <section className="rounded-xl bg-[var(--surface)] px-5 py-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
          {isJa ? "準備いただくもの" : "What to Prepare"}
        </h2>
        <ul className="space-y-2 text-sm leading-relaxed text-[var(--muted)]">
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{isJa ? "自己紹介と研究紹介を含む15分程度のスライドまたはトーク。" : "A ~15-minute presentation including a self-introduction and overview of your research."}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{isJa ? "題目・要旨・スピーカー情報の提出（下のボタンから）。" : "Submission of your talk title, abstract, and speaker info (see button below)."}</span>
          </li>
        </ul>

        <div className="mt-5">
          <Link
            href={`/${lang}/speaker/submit`}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold !text-white transition-opacity hover:opacity-90"
          >
            {isJa ? "提出ページへ →" : "Go to Submit Page →"}
          </Link>
        </div>
      </section>
    </article>
  );
}
