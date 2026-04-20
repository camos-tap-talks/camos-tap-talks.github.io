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
      participationTitle: "How to Join",
      participationItems: [
        "No registration needed. Just come to the taproom on the day.",
        "Order a drink at the counter and feel free to join the talk and Q&A.",
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
    camos: {
      label: "Taproom",
      title: "Camos",
      address: "1F, 5-1-2 Hongo, Bunkyo-ku, Tokyo",
      hours: "Tue–Thu 18:00–22:00 / Fri 18:00–23:00 / Sat 14:00–19:30 / Sun 14:00–18:30",
      hoursNote: "Last order 30 min before closing",
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
      formatTitle: "何をするの？",
      formatItems: [
        "はじめに、お呼びした研究者に研究紹介トーク（15分程度）をしていただきます。",
        "その後、皆さまがお聞きしたいことを自由にお聞きください。「研究を始めたきっかけは？」「この分野の将来は？」「ふだんどんな生活をしているの？」など、どんな質問でも歓迎です！"
      ],
      participationTitle: "参加方法",
      participationItems: [
        "事前申し込みは不要です。当日そのままご来店ください！",
        "参加費無料です。カウンターでドリンクをご注文のうえ、トークや Q&A にお気軽にご参加ください。",
        "途中参加・途中退出も自由です。途中参加の方にもわかるように、何度か研究紹介トークの内容を振り返る時間を設けます。",
      ],
      faqTitle: "よくある質問",
      faqItems: [
        {
          question: "専門外でも参加できますか？",
          answer: "参加できます。一般のお客さんにもわかりやすい内容を目指しています。",
        },
        {
          question: "ドリンクの注文は必要ですか？",
          answer: "ワンドリンク以上のご注文をお願いしています。",
        },
        {
          question: "ビール以外もありますか？",
          answer: "ソフトドリンクもありますので、アルコールが苦手な方も安心してご参加いただけます。",
        },
        {
          question: "タップルームとは何ですか？",
          answer: "ビール醸造所に併設されたバーのことです。ビールを注ぐタップが並んでいることからタップルーム（Taproom）と呼ばれています。",
        }
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
    camos: {
      label: "タップルーム",
      title: "本郷菊坂町かもす",
      address: "東京都文京区本郷5-1-2 1F",
      hours: "火水木 18:00–22:00 ／ 金 18:00–23:00 ／ 土 14:00–19:30 ／ 日 14:00–18:30",
      hoursNote: "※ラストオーダー閉店30分前　※最新の営業時間は Instagram をご確認ください",
      instagram: "Instagram",
    },
    langSwitch: "English",
    langSwitchPath: "/en",
  },
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale];
}
