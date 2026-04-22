export type Talk = {
  id: string;
  slug: string;
  date: string; // ISO date string YYYY-MM-DD (ignored when dateTbd is true)
  startTime?: string; // 24h time string HH:mm
  endTime?: string; // 24h time string HH:mm
  dateTbd?: boolean;
  timeTbd?: boolean;
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
    const formattedDate = date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
    return formattedTime ? `${formattedDate} ${formattedTime}` : formattedDate;
  }

  const formattedDate = date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  return formattedTime ? `${formattedDate} ${formattedTime}` : formattedDate;
}
