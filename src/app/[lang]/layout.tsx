import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isJa = lang === "ja";
  return {
    title: {
      default: "CAMOS TAP TALKS",
      template: "%s | CAMOS TAP TALKS",
    },
    description: isJa
      ? "香港 CAMOS CLASSIC で開催されるカジュアルなトークシリーズ"
      : "An informal talk series at CAMOS CLASSIC, Hong Kong",
  };
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={lang as Locale} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">{children}</main>
      <Footer locale={lang as Locale} />
    </div>
  );
}
