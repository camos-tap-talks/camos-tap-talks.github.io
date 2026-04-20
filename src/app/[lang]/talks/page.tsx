import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n";
import TalksClient from "./TalksClient";
import { SITE_URL } from "@/lib/site";

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isJa = lang === "ja";

  return {
    title: lang === "ja" ? "トーク一覧" : "Talks",
    alternates: {
      canonical: isJa ? "/ja/talks" : "/en/talks",
      languages: {
        ja: `${SITE_URL}/ja/talks`,
        en: `${SITE_URL}/en/talks`,
      },
    },
  };
}

export default async function TalksPage({ params }: Props) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();

  return <TalksClient locale={lang as Locale} />;
}
