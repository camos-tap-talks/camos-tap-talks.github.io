export const locales = ["en", "ja"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ja";

export const translations = {
  en: {
    siteName: "CAMOS TAP TALKS",
    nav: {
      home: "Home",
      talks: "Talks",
    },
    home: {
      title: "CAMOS TAP TALKS",
      subtitle: "An informal talk series at CAMOS CLASSIC",
      description:
        "CAMOS TAP TALKS is a series of casual talks held at CAMOS CLASSIC, a brewery & tap room in Hongo, Tokyo. Speakers share their research, ideas, and stories over a pint.",
      upcomingTitle: "Upcoming",
      noUpcoming: "No upcoming talks scheduled.",
      recentTitle: "Recent Talks",
      viewAll: "View all talks →",
    },
    talks: {
      title: "Talks",
      all: "All Talks",
      upcoming: "Upcoming",
      past: "Past",
      noTalks: "No talks yet.",
    },
    talkCard: {
      speaker: "Speaker",
      date: "Date",
      venue: "Venue",
    },
    footer: {
      venue: "Held at CAMOS CLASSIC, Hongo, Tokyo",
      instagram: "Instagram",
    },
    langSwitch: "日本語",
    langSwitchPath: "/ja",
  },
  ja: {
    siteName: "CAMOS TAP TALKS",
    nav: {
      home: "ホーム",
      talks: "トーク一覧",
    },
    home: {
      title: "CAMOS TAP TALKS",
      subtitle: "CAMOS CLASSIC で開かれるトークシリーズ",
      description:
        "CAMOS TAP TALKS は、東京・本郷のブルワリー & タップルーム「CAMOS CLASSIC」で開催されるカジュアルなトークシリーズです。研究者や実践者がビール片手に自らのアイデアや研究を語ります。",
      upcomingTitle: "次回のトーク",
      noUpcoming: "予定されているトークはありません。",
      recentTitle: "最近のトーク",
      viewAll: "すべてのトークを見る →",
    },
    talks: {
      title: "トーク一覧",
      all: "すべて",
      upcoming: "予定",
      past: "過去",
      noTalks: "まだトークはありません。",
    },
    talkCard: {
      speaker: "スピーカー",
      date: "日時",
      venue: "会場",
    },
    footer: {
      venue: "東京・本郷 CAMOS CLASSIC にて開催",
      instagram: "Instagram",
    },
    langSwitch: "English",
    langSwitchPath: "/en",
  },
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale];
}
