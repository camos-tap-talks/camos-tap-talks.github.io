import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import SpeakerSubmitClient from "./SpeakerSubmitClient";

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isJa = lang === "ja";

  return {
    title: isJa ? "Speaker Submit" : "Speaker Submit",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function SpeakerSubmitPage({ params }: Props) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();

  return (
    <div className="relative left-1/2 right-1/2 w-[min(1120px,calc(100vw-2rem))] -translate-x-1/2">
      <SpeakerSubmitClient locale={lang as Locale} />
    </div>
  );
}
