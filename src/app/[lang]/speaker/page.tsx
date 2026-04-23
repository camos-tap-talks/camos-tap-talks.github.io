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
            ? <>Camos Tap Talks は、<span className="font-semibold underline decoration-[0.14em] underline-offset-[0.16em] decoration-[var(--accent)]">研究者（あるいは専門家）が自分の研究をわかりやすく一般向けに紹介するカジュアルなトークシリーズ</span>です。ビールを片手にお話しいただくことで、研究者と地域市民の壁をとりはらうことを目指しています。専門外の聴衆にも楽しんでもらえるトークをお願いします。</>
            : <>Camos Tap Talks is <span className="font-semibold underline decoration-[0.14em] underline-offset-[0.16em] decoration-[var(--accent)]">a casual talk series where researchers (or experts) present their work in an accessible way to the general public</span>. By sharing your research over a beer, we aim to break down barriers between researchers and the local community. Please do a talk that can be enjoyed by a non-specialist audience.</>}
        </p>
      </section>

      {/* 当日の流れ */}
      <section className="rounded-xl bg-[var(--surface)] px-5 py-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
          {isJa ? "当日の流れ" : "Event Flow"}
        </h2>
        <p className="mb-2 text-sm leading-relaxed text-[var(--muted)]">
          {isJa
            ? <>はじめに、<span className="font-semibold underline decoration-[0.14em] underline-offset-[0.16em] decoration-[var(--accent)]">15分程度で自己紹介・研究紹介</span>をお願いします。その後 Q&A（1時間以上想定）に移り、聴衆の聴衆の関心に合わせてカジュアルにお話しください。</> : <>First, please <span className="font-semibold underline decoration-[0.14em] underline-offset-[0.16em] decoration-[var(--accent)]">introduce yourself and your research for about 15 minutes</span>. After that, we will move on to a casual Q&A session based on the audience's interests.</>}
        </p>
        <p className="mb-4 text-sm leading-relaxed text-[var(--muted)]">
          {isJa
            ? <>聴衆側は、参加登録不要（参加費もなし）で、途中参加・退出も可です。途中参加の方向けに、適宜<span className="font-semibold underline decoration-[0.14em] underline-offset-[0.16em] decoration-[var(--accent)]">ダイジェスト版説明</span>をお願いできますと幸いです。タイミング・やり方等はお任せします。</> : <>Audience members can join without registration (and there is no participation fee), and they are free to come and go as they please. It would be appreciated if you could provide a <span className="font-semibold underline decoration-[0.14em] underline-offset-[0.16em] decoration-[var(--accent)]">digest version of your explanation</span> for those who join in the middle. The timing and method are up to you.</>}
        </p>
        <ul className="space-y-2 text-sm leading-relaxed text-[var(--muted)]">
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{isJa ? "スライド使用を想定していますが、形式は自由です（ポスター発表、トークのみ、実験実演など）。聴衆にとってのとっかかりとなれば何でも構いません。飲食店ですので、特殊な持ち込みがある場合は事前にご相談ください。" : "Slides are assumed, but the format is flexible (poster presentations, talks only, live demonstrations, etc.). Anything that serves as a starting point for the audience is fine. Since this is a bar, please consult us in advance if you plan to bring any special items."}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{isJa ? "世話人はワンオペでお店を運営していますので、進行は基本的にスピーカーにお任せしています。世話人の余裕のあるときにはファシリテーターとしてサポートします。" : "The organizer runs the bar alone, so the progress is basically left to the speaker. The organizer may support as a facilitator when available."}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{isJa ? "プロジェクター利用の場合は、10分程度早めにお越しください。" : "If you plan to use the projector, please arrive about 10 minutes early."}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>
              {isJa ? (
                <>
                  スピーカーは（どのサイズでも）
                  <span className="font-semibold underline decoration-[0.14em] underline-offset-[0.16em] decoration-[var(--accent)]">
                    ドリンク3杯まで無料
                  </span>
                  です。 ※謝金はお渡ししていません。
                </>
              ) : (
                <>
                  Speakers receive
                  {" "}
                  <span className="font-semibold underline decoration-[0.14em] underline-offset-[0.16em] decoration-[var(--accent)]">
                    up to 3 free drinks
                  </span>
                  {" "}
                  of any size. *No honorarium is provided.
                </>
              )}
            </span>
          </li>
        </ul>
      </section>

      {/* 言語 */}
      <section className="rounded-xl bg-[var(--surface)] px-5 py-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
          {isJa ? "言語" : "Language"}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-[var(--muted)]">
          {isJa
            ? <>トークは<span className="font-semibold underline decoration-[0.14em] underline-offset-[0.16em] decoration-[var(--accent)]">日本語・英語のいずれでも</span>問題ありません。話しやすい言語でご発表ください。</>
            : <>Talks can be given in either <span className="font-semibold underline decoration-[0.14em] underline-offset-[0.16em] decoration-[var(--accent)]">Japanese or English</span>. Please present in the language you are most comfortable with.</>}
        </p>
        <ul className="space-y-2 text-sm leading-relaxed text-[var(--muted)]">
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{isJa ? "日本語で話す場合：聴衆の多くは日本語話者ですが、英語話者も一定数いらっしゃいます。日本語で発表される場合も、適宜簡単な英語での説明を加えていただけますと幸いです。" : "If presenting in Japanese: Most of the audience are Japanese speakers, but there will also be some English-speaking attendees. Even if you present in Japanese, it would be appreciated if you could provide a brief explanation in English for the English-speaking attendees."}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>
              {isJa
                ? "英語で話す場合：英語を話せるお客さんも多いので、英語でのトークも歓迎しています。わかりやすく、ゆっくり話していただけますと幸いです。"
                : "If presenting in English: Many attendees can understand English, so talks in English are also welcome. Please speak clearly and at a moderate pace."}
            </span>
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
                <th scope="row" className="w-28 px-2 py-2 text-left font-semibold">
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
                <th scope="row" className="w-28 px-2 py-2 text-left font-semibold">
                  {isJa ? "住所" : "Address"}
                </th>
                <td className="px-2 py-2">
                    <p>{t.camos.address}</p>
                    <p className="mt-0.5 text-xs opacity-80">
                      {isJa
                        ? "最寄駅は本郷三丁目駅（都営大江戸線・丸ノ内線）です"
                        : "Nearest station: Hongo-sanchome Station (Toei Oedo Line / Marunouchi Line)."}
                    </p>
                    </td>
              </tr>
              <tr className="border-t border-[var(--line)]">
                <th scope="row" className="w-28 px-2 py-2 text-left font-semibold">
                  {isJa ? "営業時間" : "Hours"}
                </th>
                <td className="px-2 py-2">
                  <p>{t.camos.hours}</p>
                  <p className="mt-0.5 text-xs opacity-80">{t.camos.hoursNote}</p>
                </td>
              </tr>
              <tr className="border-t border-[var(--line)]">
                <th scope="row" className="w-28 px-2 py-2 text-left font-semibold">
                  {isJa ? "設備" : "Equipment"}
                </th>
                <td className="px-2 py-2">{isJa ? "プロジェクター（HDMI）、電源あり。" : "Projector (HDMI), power available."}</td>
              </tr>
              <tr className="border-y border-[var(--line)]">
                <th scope="row" className="w-28 px-2 py-2 text-left font-semibold">
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
          {isJa ? "開催日時" : "About Date and Time"}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-[var(--muted)]">
            {isJa
                ? <>基本的には、<span className="font-semibold underline decoration-[0.14em] underline-offset-[0.16em] decoration-[var(--accent)]">営業時間内で2時間程度</span>お時間をいただく想定です。世話人の都合もありますので、相談の上日時を決めさせていただきます。</>
                : <>As a general guideline, we ask for about <span className="font-semibold underline decoration-[0.14em] underline-offset-[0.16em] decoration-[var(--accent)]">two hours during taproom business hours</span>. Since the organizer also has scheduling constraints, we will coordinate and decide the date and time together.</>}
        </p>
              <ul className="space-y-2 text-sm leading-relaxed text-[var(--muted)]">
                  <li className="flex items-start gap-2">
                    <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    <span>{isJa ? "お忙しい場合、1時間でも問題ございません。" : "If you are busy, a one-hour session is also perfectly fine."}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    <span>{isJa ? "終了予定時間を設けていますが、聴衆の方々と話し足りない場合などは、予定の時間を過ぎてもそのままお話しいただいて構いません（むしろ望ましいです！）。" : "We do set an expected end time, but if audience members still have questions or the discussion is active, you are welcome to continue beyond the scheduled time (and that is actually encouraged)."}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    <span>{isJa ? "日程は、集客や運営の都合上、金・土・日が比較的実施しやすいです。金土日の都合がつかない場合は火・水・木も検討可能です。営業時間外も相談に応じますので、お気軽にご相談ください。" : "From an audience and operations standpoint, Friday, Saturday, and Sunday are generally easier to schedule. If weekends are difficult, Tuesday to Thursday can also be considered. We can also discuss options outside normal business hours."}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    <span>{isJa ? "開店直後はお客さんが少なめのため、例えば金曜日であれば19:00〜21:00頃の時間帯がおすすめです。" : "Right after opening, there are usually fewer customers, so on Fridays, for example, around 19:00-21:00 is often a good time slot."}</span>
                  </li>
              </ul>
      </section>

      {/* 世話人 */}
      <section className="rounded-xl bg-[var(--surface)] px-5 py-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
          {isJa ? "世話人" : "Organizer"}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-[var(--muted)]">
                  {isJa ? <>上杉佑人（東京大学 理学系研究科 博士課程2年, <a href="https://yuesugi.com" className="underline" target="_blank" rel="noopener noreferrer">HP</a>）が店長に協力してもらいながら運営しています。</> : <>Yuto Uesugi (PhD student, The University of Tokyo) [<a href="https://yuesugi.com" target="_blank" rel="noopener noreferrer">HP</a>] runs the event with the cooperation of the taproom manager.</>}
        </p>
        <ul className="space-y-2 text-sm leading-relaxed text-[var(--muted)]">
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>
              {isJa
                ? "タップルーム「本郷菊坂町かもす」では毎週金曜日に働いています。"
                : "I work at the taproom &apos;Hongo Kikusaka-cho Camos&apos; every Friday."}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>
              {isJa
                ? "普段は、動物の群れを対象に物理学的な手法を用いて研究しています。"
                : "I usually do research using physics-based methods on animal groups."}
            </span>
          </li>
        </ul>
      </section>

      {/* 準備いただくもの */}
      <section className="rounded-xl bg-[var(--surface)] px-5 py-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
          {isJa ? "準備いただくもの" : "What to Prepare"}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-[var(--muted)]">
                  {isJa ? <>簡単で構いませんので以下のものをご準備ください。</> : <>Please prepare the following items, even if only briefly.</>}
        </p>
        <ul className="space-y-2 text-sm leading-relaxed text-[var(--muted)]">
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{isJa ? <><span className="font-semibold underline decoration-[0.14em] underline-offset-[0.16em] decoration-[var(--accent)]">自己紹介・研究紹介を含む15分程度のスライド・トーク</span>。時間は目安ですので気にし過ぎる必要はございません。</> : <><span className="font-semibold underline decoration-[0.14em] underline-offset-[0.16em] decoration-[var(--accent)]">A ~15-minute presentation including a self-introduction and overview of your research</span>. The time is just a guideline, so don&apos;t worry too much about it.</>}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{isJa ? <><span className="font-semibold underline decoration-[0.14em] underline-offset-[0.16em] decoration-[var(--accent)]">題目・要旨・スピーカー情報の提出</span>（下のボタンから）。</> : <><span className="font-semibold underline decoration-[0.14em] underline-offset-[0.16em] decoration-[var(--accent)]">Submission of your talk title, abstract, and speaker info</span> (see button below).</>}</span>
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
