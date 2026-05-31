export type Talk = {
  id: string;
  slug: string;
  date: string; // ISO date string YYYY-MM-DD (ignored when dateTbd is true)
  startTime?: string; // 24h time string HH:mm
  endTime?: string; // 24h time string HH:mm
  dateTbd?: boolean;
  timeTbd?: boolean;
  language?: "ja" | "en" | "both"; // "ja" = Japanese only, "en" = English only, "both" = bilingual (default)
  titleEn: string;
  titleJa: string;
  speakerEn: string;
  speakerJa: string;
  abstractEn: string;
  abstractJa: string;
  speakerBioEn?: string;
  speakerBioJa?: string;
  speakerImage?: string;
  talkImage?: string;
  reportEn?: string;
  reportJa?: string;
  reportPublished?: boolean; // set to true to show the report section publicly
};

export const talks: Talk[] = [
  // Add talks here as they happen. Example:
    // {
    //   id: "0",
    //   slug: "0-example",
    //   date: "2026-05-30",
    //   startTime: "19:00",
    //   endTime: "21:00",
    //   dateTbd: true,
    //   timeTbd: false,
    //   titleEn: "TBD",
    //   titleJa: "Coming soon ...", （55文字以内、\n で改行）
    //   speakerEn: "TBD",
    //   speakerJa: "Coming soon ...",
    //   abstractEn: "Details to be announced.",
    //   abstractJa: "詳細は後日公開予定です。",
    //   language: "both", // or "ja" / "en" for language-specific content
    //   reportEn: "Report to be announced.\n\n<img src=\"/0-example/rep-1.jpg\" alt=\"event photo 1\" width=\"320\" align=\"center\" />\n\n<img src=\"/0-example/rep-1.jpg\" alt=\"event photo 1\" align=\"inline\" /><img src=\"/0-example/rep-2.jpg\" alt=\"event photo 2\" align=\"inline\" />",
    //   reportJa: "レポートは後日公開予定です。\n\n<img src=\"/0-example/rep-1.jpg\" alt=\"当日の写真1\" width=\"320\" align=\"center\" />\n\n<img src=\"/0-example/rep-1.jpg\" alt=\"当日の写真1\" align=\"inline\" /><img src=\"/0-example/rep-2.jpg\" alt=\"当日の写真2\" align=\"inline\" />",
    //   reportPublished: false,
    // },
  {
    id: "1",
    slug: "1-karita",
    date: "2026-05-29",
    dateTbd: false,
    timeTbd: false,
    startTime: "18:30",
    endTime: "20:30",
    language: "ja",
    titleEn: "TBD",
    titleJa: "ふえる微生物の陣取り合戦",
    speakerEn: "TBD",
    speakerJa: "苅田 裕也（東京大学）",
    abstractEn: "Details to be announced.",
    abstractJa: "みなさんも大好きなビールにはイースト菌という微生物のはたらきが欠かせません。ビールはこのイースト菌がはたらく場所によってエールとラガーに分類されます。エールでは液の上面にイースト菌が集合し、ラガーでは液の下部にイースト菌が沈んでいます。同じイースト菌でも住む場所がまったく違うというのは不思議ですよね？\n\n今回私が紹介するのは、このように住む場所が違うような微生物が「もともとは全く同じ」個体から「自ずと」生じるお話しです。微生物はどんどん自己複製し、ネズミ算的に数を増やしていきます。そんな状況では、仲間内で場所と栄養の奪い合いが自然と起こり、住み分けに繋がっていくのです。\n\nみなさんが飲んでいるビールにちょっとした彩りを添えるようなお話しができれば幸いです。かもすタップトークの第一回、ぜひ一緒に盛り上げましょう！\n",
    speakerBioEn: "",
    speakerBioJa: "生物物理学と微生物の進化・生態を専門とする実験研究者。要素が増えたり自己複製する集団でなにが起こるかに興味をもつ。髪の毛ほどの細さの容器で微生物を育てたり、その様子を数学・物理学を使って解析したりしている。最近は農学方面への応用を見据え、土壌を模した実験にも取り組んでいる。\n\n日本で物理学の学士をとったのち、アメリカで生物物理学の博士号を取得。その後ドイツで微生物学を研究し、日本に帰国した。海外での学位留学を目指す学生の支援を積極的に行っている。\n\n留学時代はピルスナービールを好んでいたが、アルコールには弱く量を飲むことはできない。はじめの一杯を味わうことに全力を注いでいる。",
    speakerImage: "/1-karita/speaker.jpg",
    reportEn: "The talk on beer fermentation and microbes was a great success, and around 15 people joined from the beginning. Thank you very much for coming!\n\n<img src=\"/1-karita/rep-1.jpg\" alt=\"Talk scene 1\" align=\"inline\" /><img src=\"/1-karita/rep-2.jpg\" alt=\"Talk scene 2\" align=\"inline\" />",
    reportJa: "ビール発酵と微生物を絡めて話していただき、大盛況でした！開始時には15人程度の方にお聞きいただきました。お越しいただいた皆さま、ありがとうございました。\n\n<img src=\"/1-karita/rep-1.jpg\" alt=\"当日の様子1\" align=\"inline\" /><img src=\"/1-karita/rep-2.jpg\" alt=\"当日の様子2\" align=\"inline\" />",
    reportPublished: true,
  },
];

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getUpcomingTalks(): Talk[] {
  const today = getTodayDateString();
  return talks
    .filter((t) => t.dateTbd || t.date >= today)
    .sort((a, b) => {
      if (a.dateTbd && b.dateTbd) return 0;
      if (a.dateTbd) return 1;
      if (b.dateTbd) return -1;
      return a.date.localeCompare(b.date);
    });
}

export function getPastTalks(): Talk[] {
  const today = getTodayDateString();
  return talks.filter((t) => !t.dateTbd && t.date < today).sort((a, b) => b.date.localeCompare(a.date));
}

export function buildTalkPathSlug(tapNumber: string | number | undefined, slug: string, fallback = "preview"): string {
  const numericTap = typeof tapNumber === "number"
    ? tapNumber
    : Number.parseInt(String(tapNumber ?? ""), 10);
  const normalizedTap = Number.isFinite(numericTap) && numericTap > 0 ? numericTap : 0;
  const normalizedSlug = slug.trim() || fallback;
  return `${normalizedTap}-${normalizedSlug}`;
}

export function formatTimeRange(startTime?: string, endTime?: string, timeTbd?: boolean): string {
  if (timeTbd) {
    return "";
  }
  if (startTime && endTime) {
    return `${startTime}–${endTime}`;
  }
  if (startTime) {
    return `${startTime}–`;
  }
  if (endTime) {
    return `–${endTime}`;
  }
  return "";
}

export function formatDate(dateStr: string, locale: "en" | "ja", dateTbd?: boolean, startTime?: string, endTime?: string, timeTbd?: boolean): string {
  if (dateTbd) {
    return locale === "ja" ? "x年x月x日" : "TBD";
  }

  const date = new Date(dateStr + "T00:00:00");
  const formattedTime = formatTimeRange(startTime, endTime, timeTbd);

  if (locale === "ja") {
    const formattedDate = date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
    return formattedTime ? `${formattedDate} ${formattedTime}` : formattedDate;
  }

  const formattedDate = date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", weekday: "short" });
  return formattedTime ? `${formattedDate} ${formattedTime}` : formattedDate;
}
