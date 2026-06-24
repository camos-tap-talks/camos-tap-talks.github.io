export type Talk = {
  id: string;
  slug: string;
  date: string; // ISO date string YYYY-MM-DD (ignored when dateTbd is true)
  startTime?: string; // 24h time string HH:mm
  endTime?: string; // 24h time string HH:mm
  dateTbd?: boolean;
  timeTbd?: boolean;
  title: string;
  speaker: string;
  abstract: string;
  speakerBio?: string;
  speakerImage?: string;
  talkImage?: string;
  report?: string;
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
    //   title: "Coming soon ...", // （55文字以内、\n で改行）
    //   speaker: "Coming soon ...",
    //   abstract: "詳細は後日公開予定です。",
    //   report: "レポートは後日公開予定です。\n\n<img src=\"/0-example/rep-1.jpg\" alt=\"当日の写真1\" width=\"320\" align=\"center\" />\n\n<img src=\"/0-example/rep-1.jpg\" alt=\"当日の写真1\" align=\"inline\" /><img src=\"/0-example/rep-2.jpg\" alt=\"当日の写真2\" align=\"inline\" />",
    //   reportPublished: false,
    // },
  {
  id: "3",
  slug: "3-eriko-yamada",
  date: "2026-06-19",
  dateTbd: false,
  timeTbd: false,
  startTime: "19:00",
  endTime: "22:00",
  title: "博士課程って何してるの？\n1本の論文ができるまで",
  speaker: "山田 江里子（東京大学）",
  abstract: "博士課程の大学院生として高分子材料の研究をしています。\n\n研究者というと特別な人たちの世界をイメージしてしまいますが、実際には論文を読み、実験に失敗し、締切に追われながら少しずつ研究を進めています。今回のトークでは、高分子材料の研究を例に、研究テーマがどのように生まれ、1本の論文になるのかをお話しします。\n\n「研究って何をしているの？」「論文はどうやって書くの？」「博士課程ってどんな生活？」といった話題から、研究の面白さや苦労まで、大学院生の目線で皆さんとお話しできればと思います。\n\nビールを飲みながら気軽に聞いていただければうれしいです！",
  speakerBio: "東京大学工学系研究科マテリアル工学専攻、博士課程3年(東大9年目)。\n水中で強力にくっつく高分子材料の研究をしている。研究室のあるあるを4コマ漫画に描くのが趣味。苦めのクラフトビールが好き。\n",
  speakerImage: "/3-eriko-yamada/speaker.jpg",
  report: "盛況でした！トーク後もたくさん交流いただき、ありがとうございました！\n\n<img src=\"/3-eriko-yamada/report1.jpg\" alt=\"当日の様子1\" align=\"inline\" /><img src=\"/3-eriko-yamada/report2.jpg\" alt=\"当日の様子2\" align=\"inline\" />",
    reportPublished: true,
},
  {
    id: "2",
    slug: "2-umemura",
    date: "2026-06-19",
    dateTbd: false,
    timeTbd: false,
    startTime: "19:00",
    endTime: "22:00",
    title: "遺伝子に\n名前をつけるということ",
    speaker: "梅村 悠介（東京大学）",
    abstract: "生き物はたくさんの遺伝子のはたらきによって成り立っています。私たちヒトも、私が研究に使うハエも、どんな生き物も同じです。これまで数々の重要な遺伝子が発見されてきましたが、詳しいはたらきが未解明なものも、まだまだたくさん残されています。\n\n私は大学院での研究を通じて、ハエのある遺伝子のはたらきを世界で初めて発見しました。遺伝子のはたらきを明らかにすると、その遺伝子に名前をつけることができます。私が選んだ名前は「Mulberry（桑）」です。\n\nなぜこの名前を選んだのか？という問いを入り口に、遺伝子が命名されるまでの裏側をお話しいたします。\n",
    speakerBio: "東京大学定量生命科学研究所でハエを使った研究をしている。博士課程3年。\n研究に用いているハエの正式名称は「ショウジョウバエ」といい、大きな赤い目を持つ。顔が赤く酒飲みの伝説上の生き物「猩々（しょうじょう）」に由来して名前がついたらしい。私もビールを飲むとすぐ顔が赤くなる。\n",
    speakerImage: "/2-umemura/speaker.jpg",
    report: "盛況でした！トーク後もたくさん交流いただき、ありがとうございました！\n\n<img src=\"/2-umemura/report1.jpg\" alt=\"当日の様子1\" align=\"inline\" /><img src=\"/2-umemura/report2.jpg\" alt=\"当日の様子2\" align=\"inline\" />",
    reportPublished: true,
  },
    {
    id: "1",
    slug: "1-karita",
    date: "2026-05-29",
    dateTbd: false,
    timeTbd: false,
    startTime: "18:30",
    endTime: "20:30",
    title: "ふえる微生物の陣取り合戦",
    speaker: "苅田 裕也（東京大学）",
    abstract: "みなさんも大好きなビールにはイースト菌という微生物のはたらきが欠かせません。ビールはこのイースト菌がはたらく場所によってエールとラガーに分類されます。エールでは液の上面にイースト菌が集合し、ラガーでは液の下部にイースト菌が沈んでいます。同じイースト菌でも住む場所がまったく違うというのは不思議ですよね？\n\n今回私が紹介するのは、このように住む場所が違うような微生物が「もともとは全く同じ」個体から「自ずと」生じるお話しです。微生物はどんどん自己複製し、ネズミ算的に数を増やしていきます。そんな状況では、仲間内で場所と栄養の奪い合いが自然と起こり、住み分けに繋がっていくのです。\n\nみなさんが飲んでいるビールにちょっとした彩りを添えるようなお話しができれば幸いです。かもすタップトークの第一回、ぜひ一緒に盛り上げましょう！\n",
    speakerBio: "生物物理学と微生物の進化・生態を専門とする実験研究者。要素が増えたり自己複製する集団でなにが起こるかに興味をもつ。髪の毛ほどの細さの容器で微生物を育てたり、その様子を数学・物理学を使って解析したりしている。最近は農学方面への応用を見据え、土壌を模した実験にも取り組んでいる。\n\n日本で物理学の学士をとったのち、アメリカで生物物理学の博士号を取得。その後ドイツで微生物学を研究し、日本に帰国した。海外での学位留学を目指す学生の支援を積極的に行っている。\n\n留学時代はピルスナービールを好んでいたが、アルコールには弱く量を飲むことはできない。はじめの一杯を味わうことに全力を注いでいる。",
    speakerImage: "/1-karita/speaker.jpg",
    report: "ビール発酵と微生物を絡めて話していただき、大盛況でした！開始時には15人程度の方にお聞きいただきました。お越しいただいた皆さま、ありがとうございました。\n\n<img src=\"/1-karita/rep-1.jpg\" alt=\"当日の様子1\" align=\"inline\" /><img src=\"/1-karita/rep-2.jpg\" alt=\"当日の様子2\" align=\"inline\" />",
    reportPublished: true,
  },
];

function getTodayDateString(): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return new Date().toISOString().split("T")[0];
  }

  return `${year}-${month}-${day}`;
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
