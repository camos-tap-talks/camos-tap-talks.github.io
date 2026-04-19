export const locales = ["en", "ja"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ja";

export const translations = {
  en: {
    siteName: "Camos Tap Talks",
    nav: {
      home: "Home",
      talks: "Talks",
    },
    home: {
      title: "Camos Tap Talks",
      // subtitle: "An informal talk series at Hongo Kikusaka-cho Camos",
      description:
        "Camos Tap Talks is a series of casual talks held at Hongo Kikusaka-cho Camos, the tap room of CAMOS CLASSIC brewery in Hongo, Tokyo. Speakers share their research, ideas, and stories over a pint.",
      formatTitle: "Format",
      formatItems: [
        "A 10-minute research introduction by a guest researcher",
        "Open Q&A and discussion with people in the room (no registration required)",
        "Presentations are flexible: slides, poster, talk-only, live demo, and more",
        "Main language is Japanese",
      ],
      faqTitle: "FAQ",
      faqItems: [
        {
          question: "Do I need to register in advance?",
          answer: "No registration is required. Please feel free to join on the day.",
        },
        {
          question: "Can non-specialists join?",
          answer: "Yes. Talks are designed for a broad audience, and questions are welcome.",
        },
        {
          question: "What language are talks given in?",
          answer: "Most talks are in Japanese.",
        },
      ],
      speakersTitle: "Who Speaks",
      speakersDescription:
        "Graduate students, postdocs, and faculty from any field are welcome. We currently run this as a pilot and may expand to several sessions per year based on audience response.",
      valueTitle: "Why It Matters",
      valueItems: [
        "For guests: easy access to research stories you would not usually hear",
        "For researchers: outreach practice for interdisciplinary and non-specialist audiences",
        "For the venue: new communities, new conversations, and local visibility",
      ],
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
      venue: "Held at Hongo Kikusaka-cho Camos, Hongo, Tokyo",
      instagram: "Instagram",
    },
    langSwitch: "日本語",
    langSwitchPath: "/ja",
  },
  ja: {
    siteName: "Camos Tap Talks",
    nav: {
      home: "Home",
      talks: "Talks",
    },
    home: {
      title: "Camos Tap Talks",
      // subtitle: "本郷菊坂町かもすで開かれるトークシリーズ",
      description:
        "Camos Tap Talks は、東京都文京区本郷のタップルーム「本郷菊坂町かもす」で開催されるトークシリーズです。研究者がビール片手に研究の世界をわかりやすく紹介します。",
      formatTitle: "企画内容",
      formatItems: [
        "招聘研究者による 10 分の研究紹介トーク",
        "その後は自由な Q&A・Discussion（事前登録不要）",
        "発表形式は自由（スライド、ポスター、口頭のみ、実演など）",
        "言語は日本語を基本とします",
      ],
      faqTitle: "よくある質問",
      faqItems: [
        {
          question: "事前申し込みは必要ですか？",
          answer: "不要です。当日そのままご参加いただけます。",
        },
        {
          question: "専門外でも参加できますか？",
          answer: "参加できます。一般のお客さんにもわかりやすい内容を目指しています。",
        },
        {
          question: "トークは何語で行われますか？",
          answer: "基本的に日本語で実施します。",
        },
      ],
      speakersTitle: "招聘者・運営",
      speakersDescription:
        "大学院生・ポスドク・大学教員など、分野を問わず研究者を招聘します。まずは試験的に実施し、反応を見ながら年数回の定期開催を検討します。",
      valueTitle: "想定される価値",
      valueItems: [
        "一般のお客さん: 普段聞けない研究の話を気軽に楽しめる",
        "研究者: 異分野・非専門家へのアウトリーチ機会になる",
        "店舗: 新しい客層との接点や話題づくりにつながる",
      ],
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
      venue: "東京・本郷 本郷菊坂町かもす にて開催",
      instagram: "Instagram",
    },
    langSwitch: "English",
    langSwitchPath: "/en",
  },
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale];
}
