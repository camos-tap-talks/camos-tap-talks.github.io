import type { MetadataRoute } from "next";
import { talks } from "@/lib/talks";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const localizedStaticRoutes = ["", "/talks"] as const;

function withLang(path: string, lang: "ja" | "en") {
  return `${SITE_URL}/${lang}${path}`;
}

function toLastModified(date: string, dateTbd?: boolean) {
  if (dateTbd) return new Date();
  return new Date(`${date}T00:00:00.000Z`);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = localizedStaticRoutes.flatMap((path) => [
    {
      url: withLang(path, "ja"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: path === "" ? 1 : 0.9,
      alternates: {
        languages: {
          ja: withLang(path, "ja"),
          en: withLang(path, "en"),
        },
      },
    },
    {
      url: withLang(path, "en"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: path === "" ? 1 : 0.9,
      alternates: {
        languages: {
          ja: withLang(path, "ja"),
          en: withLang(path, "en"),
        },
      },
    },
  ]);

  const talkEntries: MetadataRoute.Sitemap = talks.flatMap((talk) => {
    const jaUrl = withLang(`/talks/${talk.slug}`, "ja");
    const enUrl = withLang(`/talks/${talk.slug}`, "en");
    const lastModified = toLastModified(talk.date, talk.dateTbd);

    return [
      {
        url: jaUrl,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: {
          languages: {
            ja: jaUrl,
            en: enUrl,
          },
        },
      },
      {
        url: enUrl,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: {
          languages: {
            ja: jaUrl,
            en: enUrl,
          },
        },
      },
    ];
  });

  return [...staticEntries, ...talkEntries];
}
