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
      description:
        "Camos Tap Talks is a talk series held at Hongo Kikusaka-cho Camos, a taproom in Hongo, Bunkyo-ku, Tokyo. Researchers introduce their fields in an accessible way over a pint.",
      formatTitle: "What do we do?",
      formatItems: [
        "First, an invited researcher gives a short research introduction talk (about 15 minutes).",
        "Then we open the floor for free questions. Any question is welcome, such as: \"What inspired you to start this research?\" \"What is the future of this field?\" or \"What is your daily life like?\"",
      ],
      participationTitle: "How to Join",
      participationItems: [
        "No advance registration is needed. Just come by on the day.",
        "Participation is free. Please order a drink at the counter, then feel free to join the talk and Q&A.",
        "You can arrive late or leave early. We also briefly recap the talk during the session so late arrivals can follow along.",
      ],
      faqTitle: "FAQ",
      faqItems: [
        {
          question: "Can I join even if this is outside my field?",
          answer: "Yes. We aim to make the talks easy to follow for general visitors.",
        },
        {
          question: "Do I need to order a drink?",
          answer: "We ask everyone to order at least one drink.",
        },
        {
          question: "Are non-alcoholic drinks available?",
          answer: "Yes. Soft drinks are available, so people who do not drink alcohol are also welcome.",
        },
        {
          question: "What is a taproom?",
          answer: "A taproom is a bar attached to a brewery. It is called a taproom because beer taps are lined up at the counter.",
        }
      ],
      upcomingTitle: "Upcoming",
      noUpcoming: "Currently being arranged.",
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
      title: "Hongo Kikusaka-cho Camos",
      address: "1F, 5-1-2 Hongo, Bunkyo-ku, Tokyo",
      hours: "Tue–Wed 18:00–22:00 / Thu–Fri 18:00–23:00 / Sat 14:00–19:30 / Sun 14:00–18:30",
      hoursNote: "Last order 30 min before closing. Check Instagram for the latest hours.",
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
      noUpcoming: "現在調整中です。",
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
      hours: "火水 18:00–22:00 ／ 木金 18:00–23:00 ／ 土 14:00–19:30 ／ 日 14:00–18:30",
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
