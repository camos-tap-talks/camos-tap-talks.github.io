export type Talk = {
  id: string;
  slug: string;
  date: string; // ISO date string YYYY-MM-DD (ignored when dateTbd is true)
  dateTbd?: boolean;
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
};

export const talks: Talk[] = [
  // Add talks here as they happen. Example:
    // {
    //   id: "0",
    //   slug: "0-example",
    //   date: "2026-05-30",
    //   dateTbd: true,
    //   titleEn: "TBD",
    //   titleJa: "Coming soon ...", （55文字以内、\n で改行）
    //   speakerEn: "TBD",
    //   speakerJa: "Coming soon ...",
    //   abstractEn: "Details to be announced.",
    //   abstractJa: "詳細は後日公開予定です。",
    // },
    {
      id: "1",
      slug: "1-first",
      date: "2026-03-30",
      dateTbd: true,
      titleEn: "TBD",
      titleJa: "Coming soon ...\n ...",
      speakerEn: "TBD",
      speakerJa: "Coming soon ...",
      abstractEn: "Details to be announced.",
    abstractJa: "詳細は後日公開予定です。",
    },
];

export function getUpcomingTalks(): Talk[] {
  const today = new Date().toISOString().split("T")[0];
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
  const today = new Date().toISOString().split("T")[0];
  return talks.filter((t) => !t.dateTbd && t.date < today).sort((a, b) => b.date.localeCompare(a.date));
}

export function formatDate(dateStr: string, locale: "en" | "ja", dateTbd?: boolean): string {
  if (dateTbd) {
    return locale === "ja" ? "x年x月x日" : "TBD";
  }
  const date = new Date(dateStr + "T00:00:00");
  if (locale === "ja") {
    return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
