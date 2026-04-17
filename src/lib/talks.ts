export type Talk = {
  id: string;
  slug: string;
  date: string; // ISO date string YYYY-MM-DD
  titleEn: string;
  titleJa: string;
  speakerEn: string;
  speakerJa: string;
  abstractEn: string;
  abstractJa: string;
  speakerBioEn?: string;
  speakerBioJa?: string;
};

export const talks: Talk[] = [
  // Add talks here as they happen. Example:
  // {
  //   id: "1",
  //   slug: "example-talk",
  //   date: "2026-05-01",
  //   titleEn: "Example Talk Title",
  //   titleJa: "トーク例",
  //   speakerEn: "Yuto Uesugi",
  //   speakerJa: "上杉勇人",
  //   abstractEn: "Abstract in English.",
  //   abstractJa: "概要（日本語）。",
  // },
    {
      id: "1",
      slug: "first-talk",
      date: "2026-05-30",
      titleEn: "TBD",
      titleJa: "（タイトル未定）",
      speakerEn: "TBD",
      speakerJa: "（スピーカー未定）",
      abstractEn: "Details to be announced.",
      abstractJa: "詳細は後日公開予定です。",
    },
];

export function getUpcomingTalks(): Talk[] {
  const today = new Date().toISOString().split("T")[0];
  return talks.filter((t) => t.date >= today).sort((a, b) => a.date.localeCompare(b.date));
}

export function getPastTalks(): Talk[] {
  const today = new Date().toISOString().split("T")[0];
  return talks.filter((t) => t.date < today).sort((a, b) => b.date.localeCompare(a.date));
}

export function formatDate(dateStr: string, locale: "en" | "ja"): string {
  const date = new Date(dateStr + "T00:00:00");
  if (locale === "ja") {
    return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
