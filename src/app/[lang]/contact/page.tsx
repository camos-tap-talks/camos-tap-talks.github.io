import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isJa = lang === "ja";

  return {
    title: "Contact",
    description: isJa
      ? "Camos Tap Talks へのお問い合わせ先です。トークに興味のある研究者の方もお気軽にご連絡ください。"
      : "Contact information for Camos Tap Talks. Researchers interested in giving a talk are also welcome to get in touch.",
    alternates: {
      canonical: isJa ? "/ja/contact" : "/en/contact",
      languages: {
        ja: `${SITE_URL}/ja/contact`,
        en: `${SITE_URL}/en/contact`,
      },
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();

  const isJa = lang === "ja";
  const email = "uesugi@noneq.phys.s.u-tokyo.ac.jp";
  const displayEmail = "uesugi[at]noneq.phys.s.u-tokyo.ac.jp";

  return (
    <article className="space-y-8">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
          CONTACT
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
          {isJa ? "お問い合わせ" : "Contact"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          {isJa
            ? "お問い合わせや、トークに興味のある研究者の方など、お気軽にご連絡ください。"
            : "If you have any questions, or if you are a researcher interested in giving a talk, feel free to reach out."}
        </p>
      </header>

      <section className="rounded-xl bg-[var(--surface)] px-5 py-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
          {isJa ? "世話人" : "Organizer"}
        </h2>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          {isJa ? (
            <>
              上杉 佑人（東京大学 大学院理学系研究科 物理学専攻 博士課程）が運営しています。お問い合わせは{" "}
              <a
                href={`mailto:${email}`}
                className="font-medium text-[var(--accent-deep)] transition-colors hover:text-[var(--foreground)]"
              >
                {displayEmail}
              </a>{" "}
              までお願いします。
            </>
          ) : (
            <>
                The series is organized by Yuto Uesugi, a PhD student in the Department of Physics at the University of Tokyo. For inquiries, please contact{" "}
                <a
                    href={`mailto:${email}`}
                    className="font-medium text-[var(--accent-deep)] transition-colors hover:text-[var(--foreground)]"
                >
                    {displayEmail}
                </a>.
            </>
          )}
        </p>
      </section>
    </article>
  );
}