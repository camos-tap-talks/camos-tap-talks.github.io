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
      default: "Camos Tap Talks",
      template: "%s | Camos Tap Talks",
    },
    description: isJa
      ? "東京都文京区のタップルーム「本郷菊坂町かもす」で開催される、研究者がビール片手に一般向けに研究をわかりやすく紹介するトークシリーズ"
      : "A talk series held at Hongo Kikusaka-cho Camos, a taproom in Bunkyo, Tokyo, where researchers introduce their work to the public in a casual, engaging way—over beers",
  };
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) {
    notFound();
  }

  const isJa = lang === "ja";

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={lang as Locale} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-24 pb-10">{children}</main>
      <div className="max-w-3xl mx-auto w-full px-6 pb-4">
        <p
          className="text-[0.7rem] leading-relaxed"
          style={{ color: "color-mix(in srgb, var(--muted) 72%, white)" }}
        >
          {isJa
            ? "本サイトに掲載されている写真・画像は、権利者の許可を得て使用しています。著作権は各権利者に帰属します。無断での転載・使用を禁止します。"
            : "Images and photos on this website are used with permission from the speakers or respective copyright holders. All rights belong to their respective owners. Unauthorized use or reproduction is prohibited."}
        </p>
      </div>
      <Footer />
    </div>
  );
}
