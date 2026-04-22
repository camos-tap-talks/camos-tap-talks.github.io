"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Talk } from "@/lib/talks";
import { buildTalkPathSlug } from "@/lib/talks";
import TalkCard from "@/components/TalkCard";
import MarkdownText from "@/components/MarkdownText";

type Props = {
  locale: Locale;
};

type ParsedDraft = {
  slug: string;
  titleJa: string;
  titleEn: string;
  tapNumber: string;
  date: string;
  startTime: string;
  endTime: string;
  dateTbd: boolean;
  timeTbd: boolean;
  speakerJa: string;
  speakerEn: string;
  abstractJa: string;
  abstractEn: string;
  bioJa: string;
  bioEn: string;
  speakerImage: string;
  uploadedImages: Array<{ url: string; deleteUrl?: string }>;
};

type UploadedImageUsage = "speakerImage" | "abstractJa" | "abstractEn" | "bioJa" | "bioEn";

type UploadedImageMapping = {
  sourceUrl: string;
  replacementUrl: string;
  localPath: string;
  downloadFileName: string;
  usages: UploadedImageUsage[];
};

const EMPTY_DRAFT: ParsedDraft = {
  slug: "",
  titleJa: "",
  titleEn: "",
  tapNumber: "",
  date: "",
  startTime: "",
  endTime: "",
  dateTbd: false,
  timeTbd: false,
  speakerJa: "",
  speakerEn: "",
  abstractJa: "",
  abstractEn: "",
  bioJa: "",
  bioEn: "",
  speakerImage: "",
  uploadedImages: [],
};

function parseDraftFromSearchParams(params: URLSearchParams): ParsedDraft {
  const legacyUploadedImageUrls = params.getAll("uploadedImage").filter((value) => value.trim());
  const encodedUploadedImages = params.getAll("uploadedImageData");

  const parsedUploadedImages: Array<{ url: string; deleteUrl?: string }> = [];
  for (const item of encodedUploadedImages) {
    try {
      const payload = JSON.parse(item) as { url?: string; deleteUrl?: string };
      const imageUrl = payload.url?.trim() ?? "";
      if (!imageUrl) {
        continue;
      }
      parsedUploadedImages.push({
        url: imageUrl,
        deleteUrl: payload.deleteUrl?.trim() || undefined,
      });
    } catch {
      // Ignore malformed items.
    }
  }

  const mergedByUrl = new Map<string, { url: string; deleteUrl?: string }>();
  for (const imageUrl of legacyUploadedImageUrls) {
    mergedByUrl.set(imageUrl, { url: imageUrl });
  }
  for (const item of parsedUploadedImages) {
    const existing = mergedByUrl.get(item.url);
    mergedByUrl.set(item.url, {
      url: item.url,
      deleteUrl: item.deleteUrl ?? existing?.deleteUrl,
    });
  }

  return {
    slug: params.get("slug") ?? "",
    titleJa: params.get("titleJa") ?? params.get("title") ?? "",
    titleEn: params.get("titleEn") ?? params.get("title") ?? "",
    tapNumber: params.get("tap") ?? params.get("tapNumber") ?? "",
    date: params.get("date") ?? "",
    startTime: params.get("startTime") ?? "",
    endTime: params.get("endTime") ?? "",
    dateTbd: params.get("dateTbd") === "1" || params.get("dateTbd") === "true",
    timeTbd: params.get("timeTbd") === "1" || params.get("timeTbd") === "true",
    speakerJa: params.get("speakerJa") ?? params.get("speaker") ?? "",
    speakerEn: params.get("speakerEn") ?? params.get("speaker") ?? "",
    abstractJa: params.get("abstractJa") ?? params.get("abstract") ?? "",
    abstractEn: params.get("abstractEn") ?? params.get("abstract") ?? "",
    bioJa: params.get("bioJa") ?? params.get("bio") ?? "",
    bioEn: params.get("bioEn") ?? params.get("bio") ?? "",
    speakerImage: params.get("speakerImage") ?? "",
    uploadedImages: Array.from(mergedByUrl.values()),
  };
}

function codeString(value: string): string {
  return JSON.stringify(value);
}

function inferImageExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
    const ext = match?.[1]?.toLowerCase();
    return ext === "png" ? "png" : "jpg";
  } catch {
    return "jpg";
  }
}

function buildUploadedImageMappings(draft: ParsedDraft): UploadedImageMapping[] {
  const slugCore = buildTalkPathSlug(draft.tapNumber, draft.slug, "new-talk");
  const usageMap = new Map<string, Set<UploadedImageUsage>>();

  const addUsage = (url: string, usage: UploadedImageUsage) => {
    if (!url.trim()) {
      return;
    }
    const existing = usageMap.get(url) ?? new Set<UploadedImageUsage>();
    existing.add(usage);
    usageMap.set(url, existing);
  };

  if (draft.speakerImage.trim()) {
    addUsage(draft.speakerImage.trim(), "speakerImage");
  }

  for (const image of draft.uploadedImages) {
    const imageUrl = image.url.trim();
    if (!imageUrl) {
      continue;
    }
    if (draft.abstractJa.includes(imageUrl)) addUsage(imageUrl, "abstractJa");
    if (draft.abstractEn.includes(imageUrl)) addUsage(imageUrl, "abstractEn");
    if (draft.bioJa.includes(imageUrl)) addUsage(imageUrl, "bioJa");
    if (draft.bioEn.includes(imageUrl)) addUsage(imageUrl, "bioEn");
  }

  let contentImageIndex = 0;

  return draft.uploadedImages
    .filter((image) => usageMap.has(image.url.trim()))
    .map((image) => {
      const sourceUrl = image.url.trim();
      const usages = Array.from(usageMap.get(sourceUrl) ?? []);
      const ext = inferImageExtension(sourceUrl);
      const fileStem = usages.includes("speakerImage")
        ? `${slugCore}-speaker`
        : `${slugCore}-image-${++contentImageIndex}`;
      const downloadFileName = `${fileStem}.${ext}`;
      const replacementUrl = `/speakers/${downloadFileName}`;

      return {
        sourceUrl,
        replacementUrl,
        localPath: `public${replacementUrl}`,
        downloadFileName,
        usages,
      };
    });
}

function replaceMappedUrls(value: string, mappings: UploadedImageMapping[]): string {
  let nextValue = value;

  for (const mapping of mappings) {
    nextValue = nextValue.split(mapping.sourceUrl).join(mapping.replacementUrl);
  }

  return nextValue;
}

export default function SpeakerReviewClient({ locale }: Props) {
  const isJa = locale === "ja";
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [draft, setDraft] = useState<ParsedDraft>(EMPTY_DRAFT);
  const [parseError, setParseError] = useState("");
  const [copiedToken, setCopiedToken] = useState<"none" | "snippet" | "error">("none");

  const text = useMemo(
    () => ({
      pageLabel: "SPEAKER REVIEW",
      title: isJa ? "提出 URL 受け取り後の作業" : "After Receiving a Submission URL",
      description: isJa
        ? "スピーカーから受け取った提出 URL を貼ると、内容確認と talks.ts 反映用の雛形を作れます。"
        : "Paste a speaker submission URL to review its content and generate a talks.ts snippet.",
      inputLabel: isJa ? "提出 URL" : "Submission URL",
      inputPlaceholder: isJa
        ? "https://.../ja/speaker/submit?title=..."
        : "https://.../en/speaker/submit?title=...",
      parseButton: isJa ? "URL を読み込む" : "Load URL",
      openButton: isJa ? "提出 URL を開く" : "Open submission URL",
      parseErrorPrefix: isJa ? "読み込みエラー:" : "Load error:",
      checklistTitle: isJa ? "やること" : "Checklist",
      checklist: isJa
        ? [
            "内容を確認して不足があれば、スピーカーへ修正依頼する。",
            "下の雛形を src/lib/talks.ts に追加・編集する。",
            "日本語・英語ページの公開内容を必要に応じて整える。",
          ]
        : [
            "Review the content and ask the speaker for fixes if needed.",
            "Add/edit the generated snippet in src/lib/talks.ts.",
            "Adjust public EN/JA content as needed before publishing.",
          ],
      previewTitle: isJa ? "プレビュー" : "Preview",
      talkCardPreviewTitle: "Talk Card",
      abstractPreviewTitle: "Abstract",
      bioPreviewTitle: "Speaker Profile",
      imageAssetsTitle: isJa ? "画像の local 対応" : "Local image mapping",
      imageAssetsDescription: isJa
        ? "HP で使う画像は local に保存し、下の対応表に沿って URL を差し替えてください。"
        : "For images that will be used on the website, download them locally and replace the URLs using the mapping below.",
      noImageAssets: isJa ? "local 対応が必要なアップロード画像はありません。" : "There are no uploaded images that need local replacement.",
      downloadImage: isJa ? "画像をダウンロード" : "Download image",
      downloadAllImages: isJa ? "画像を一括ダウンロード" : "Download all images",
      urlPreviewLabel: "URL",
      sourceUrlLabel: isJa ? "元 URL" : "Source URL",
      localPathLabel: isJa ? "保存先 path" : "Local path",
      usedInLabel: isJa ? "使用箇所" : "Used in",
      snippetTitle: isJa ? "talks.ts 追加用の雛形" : "Snippet for talks.ts",
      copySnippet: isJa ? "雛形をコピー" : "Copy snippet",
      copied: isJa ? "コピーしました。" : "Copied.",
      copyFailed: isJa ? "コピーに失敗しました。" : "Copy failed.",
      emptyHint: isJa ? "提出 URL を読み込むとここに結果が表示されます。" : "Loaded results will appear here.",
      fields: {
        titleJa: isJa ? "タイトル（日本語）" : "Title (Japanese)",
        titleEn: isJa ? "タイトル（英語）" : "Title (English)",
        tap: "Tap #",
        date: isJa ? "日付" : "Date",
        time: isJa ? "時間" : "Time",
        speakerJa: isJa ? "スピーカー（日本語）" : "Speaker (Japanese)",
        speakerEn: isJa ? "スピーカー（英語）" : "Speaker (English)",
        speakerImage: isJa ? "スピーカー画像" : "Speaker image",
        uploadedImages: isJa ? "アップロード画像" : "Uploaded images",
      },
      usageLabels: {
        speakerImage: isJa ? "スピーカー画像" : "Speaker image",
        abstractJa: isJa ? "Abstract（日本語）" : "Abstract (Japanese)",
        abstractEn: isJa ? "Abstract（英語）" : "Abstract (English)",
        bioJa: isJa ? "Speaker Profile（日本語）" : "Speaker Profile (Japanese)",
        bioEn: isJa ? "Speaker Profile（英語）" : "Speaker Profile (English)",
      },
    }),
    [isJa],
  );

  const hasLoadedDraft = useMemo(
    () => Object.values(draft).some((value) => (Array.isArray(value) ? value.length > 0 : Boolean(value))),
    [draft],
  );
  const talkPathSlug = useMemo(() => buildTalkPathSlug(draft.tapNumber, draft.slug, "preview"), [draft.tapNumber, draft.slug]);

  const previewTalk = useMemo<Talk>(() => ({
    id: draft.tapNumber.trim() || "preview",
    slug: talkPathSlug,
    date: draft.date || "2099-01-01",
    startTime: draft.timeTbd ? undefined : draft.startTime.trim() || undefined,
    endTime: draft.timeTbd ? undefined : draft.endTime.trim() || undefined,
    dateTbd: draft.dateTbd,
    timeTbd: draft.timeTbd,
    titleJa: draft.titleJa || "タイトルプレビュー",
    titleEn: draft.titleEn || "Title preview",
    speakerJa: draft.speakerJa || "スピーカー名",
    speakerEn: draft.speakerEn || "Speaker name",
    abstractJa: draft.abstractJa,
    abstractEn: draft.abstractEn,
    speakerBioJa: draft.bioJa,
    speakerBioEn: draft.bioEn,
    speakerImage: draft.speakerImage || undefined,
  }), [draft, talkPathSlug]);

  const uploadedImageMappings = useMemo(() => buildUploadedImageMappings(draft), [draft]);

  const replacedDraft = useMemo(() => ({
    abstractJa: replaceMappedUrls(draft.abstractJa, uploadedImageMappings),
    abstractEn: replaceMappedUrls(draft.abstractEn, uploadedImageMappings),
    bioJa: replaceMappedUrls(draft.bioJa, uploadedImageMappings),
    bioEn: replaceMappedUrls(draft.bioEn, uploadedImageMappings),
    speakerImage: replaceMappedUrls(draft.speakerImage, uploadedImageMappings),
  }), [draft.abstractEn, draft.abstractJa, draft.bioEn, draft.bioJa, draft.speakerImage, uploadedImageMappings]);

  const snippet = useMemo(() => {
    if (!hasLoadedDraft) {
      return "";
    }

    const tapPart = draft.tapNumber.trim() || "x";
    const slugCore = buildTalkPathSlug(tapPart, draft.slug, "new-talk");

    return [
      "{",
      `  id: ${codeString(tapPart)},`,
      `  slug: ${codeString(slugCore)},`,
      `  date: ${codeString(draft.date || "YYYY-MM-DD")},`,
      `  dateTbd: ${draft.dateTbd ? "true" : "false"},`,
      `  timeTbd: ${draft.timeTbd ? "true" : "false"},`,
      !draft.timeTbd && draft.startTime.trim() ? `  startTime: ${codeString(draft.startTime.trim())},` : "",
      !draft.timeTbd && draft.endTime.trim() ? `  endTime: ${codeString(draft.endTime.trim())},` : "",
      `  titleEn: ${codeString(draft.titleEn || "TBD")},`,
      `  titleJa: ${codeString(draft.titleJa || "TBD")},`,
      `  speakerEn: ${codeString(draft.speakerEn || "TBD")},`,
      `  speakerJa: ${codeString(draft.speakerJa || "TBD")},`,
      `  abstractEn: ${codeString(replacedDraft.abstractEn || "")},`,
      `  abstractJa: ${codeString(replacedDraft.abstractJa || "")},`,
      `  speakerBioEn: ${codeString(replacedDraft.bioEn || "")},`,
      `  speakerBioJa: ${codeString(replacedDraft.bioJa || "")},`,
      replacedDraft.speakerImage.trim() ? `  speakerImage: ${codeString(replacedDraft.speakerImage)},` : "",
      "},",
    ]
      .filter(Boolean)
      .join("\n");
  }, [draft, hasLoadedDraft, replacedDraft]);

  const parseSubmissionUrl = () => {
    setCopiedToken("none");
    setParseError("");

    if (!submissionUrl.trim()) {
      setDraft(EMPTY_DRAFT);
      return;
    }

    let parsed: URL;
    try {
      parsed = new URL(submissionUrl.trim());
    } catch {
      setParseError(isJa ? "URLの形式が正しくありません。" : "Invalid URL format.");
      return;
    }

    const params = parsed.searchParams;
    if (!params.toString()) {
      setParseError(isJa ? "クエリパラメータが見つかりません。" : "No query parameters were found.");
      return;
    }

    setDraft(parseDraftFromSearchParams(params));
  };

  const copySnippet = async () => {
    if (!snippet) {
      return;
    }

    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedToken("snippet");
    } catch {
      setCopiedToken("error");
    }
  };

  const downloadImage = async (mapping: UploadedImageMapping) => {
    const response = await fetch(mapping.sourceUrl);
    if (!response.ok) {
      throw new Error("download failed");
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = mapping.downloadFileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(blobUrl);
  };

  const downloadAllImages = async () => {
    for (const mapping of uploadedImageMappings) {
      await downloadImage(mapping);
    }
  };

  return (
    <div>
      <p className="mb-2 text-center text-[0.7rem] font-semibold tracking-[0.32em] text-[var(--muted)]">{text.pageLabel}</p>
      <h1 className="mb-2 text-center text-xl font-semibold text-[var(--foreground)]">{text.title}</h1>
      <p className="mb-8 text-center text-sm text-[var(--muted)]">{text.description}</p>

      <section className="mb-8 rounded-xl bg-[var(--surface)] px-6 py-6 shadow-sm">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]" htmlFor="submission-url">
          {text.inputLabel}
        </label>
        <textarea
          id="submission-url"
          value={submissionUrl}
          onChange={(event) => setSubmissionUrl(event.target.value)}
          rows={4}
          placeholder={text.inputPlaceholder}
          className="w-full rounded-none border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={parseSubmissionUrl}
            className="inline-flex items-center rounded-md border border-[var(--line)] bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[color-mix(in_srgb,var(--accent)_88%,#000)]"
          >
            {text.parseButton}
          </button>
          {submissionUrl.trim() && (
            <a
              href={submissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-[var(--line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--accent)_8%,white)]"
            >
              {text.openButton}
            </a>
          )}
        </div>

        {parseError && (
          <p className="mt-3 text-sm text-[#a23b22]">
            {text.parseErrorPrefix} {parseError}
          </p>
        )}
      </section>

      <section className="mb-8 rounded-xl bg-[var(--surface)] px-6 py-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">{text.checklistTitle}</h2>
        <ul className="space-y-2 text-sm text-[var(--muted)]">
          {text.checklist.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-[0.42rem] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8 rounded-xl bg-[var(--surface)] px-6 py-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">{text.previewTitle}</h2>
        {!hasLoadedDraft ? (
          <p className="text-sm text-[var(--muted)]">{text.emptyHint}</p>
        ) : (
          <div className="space-y-8">
            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">{text.talkCardPreviewTitle}</h3>
              <div className="grid gap-6 xl:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Japanese</h4>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.urlPreviewLabel}</p>
                  <p className="mb-4 break-all rounded-none border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)]">.../ja/talks/{talkPathSlug}</p>
                  <TalkCard
                    talk={previewTalk}
                    locale="ja"
                    variant="upcomingTap"
                    tapNumber={Number.parseInt(draft.tapNumber, 10) || 0}
                    disableLink
                    forceDesktopTypography
                    titleMaxLines={2}
                  />
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">English</h4>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.urlPreviewLabel}</p>
                  <p className="mb-4 break-all rounded-none border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)]">.../en/talks/{talkPathSlug}</p>
                  <TalkCard
                    talk={previewTalk}
                    locale="en"
                    variant="upcomingTap"
                    tapNumber={Number.parseInt(draft.tapNumber, 10) || 0}
                    disableLink
                    forceDesktopTypography
                    titleMaxLines={2}
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">{text.abstractPreviewTitle}</h3>
              <div className="grid gap-6 xl:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Japanese</h4>
                  {draft.abstractJa ? <MarkdownText content={draft.abstractJa} className="leading-relaxed text-[var(--muted)]" /> : <p className="text-sm text-[var(--muted)]">-</p>}
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">English</h4>
                  {draft.abstractEn ? <MarkdownText content={draft.abstractEn} className="leading-relaxed text-[var(--muted)]" /> : <p className="text-sm text-[var(--muted)]">-</p>}
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">{text.bioPreviewTitle}</h3>
              <div className="grid gap-6 xl:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Japanese</h4>
                  {draft.bioJa ? <MarkdownText content={draft.bioJa} className="leading-relaxed text-[var(--muted)]" /> : <p className="text-sm text-[var(--muted)]">-</p>}
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">English</h4>
                  {draft.bioEn ? <MarkdownText content={draft.bioEn} className="leading-relaxed text-[var(--muted)]" /> : <p className="text-sm text-[var(--muted)]">-</p>}
                </div>
              </div>
            </section>
          </div>
        )}
      </section>

      <section className="mb-8 rounded-xl bg-[var(--surface)] px-6 py-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">{text.imageAssetsTitle}</h2>
        <p className="mb-4 text-sm text-[var(--muted)]">{text.imageAssetsDescription}</p>

        {uploadedImageMappings.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{text.noImageAssets}</p>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void downloadAllImages()}
                className="inline-flex items-center rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--accent)_8%,white)]"
              >
                {text.downloadAllImages}
              </button>
            </div>
            {uploadedImageMappings.map((mapping) => (
              <div key={mapping.sourceUrl} className="rounded-lg border border-[var(--line)] bg-white px-4 py-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{mapping.downloadFileName}</p>
                  <button
                    type="button"
                    onClick={() => void downloadImage(mapping)}
                    className="inline-flex items-center rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--accent)_8%,white)]"
                  >
                    {text.downloadImage}
                  </button>
                </div>

                <dl className="space-y-3 text-sm text-[var(--muted)]">
                  <div>
                    <dt className="font-semibold text-[var(--foreground)]">{text.usedInLabel}</dt>
                    <dd>{mapping.usages.map((usage) => text.usageLabels[usage]).join(" / ")}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[var(--foreground)]">{text.sourceUrlLabel}</dt>
                    <dd className="break-all">{mapping.sourceUrl}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[var(--foreground)]">{text.localPathLabel}</dt>
                    <dd className="break-all">{mapping.localPath}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8 rounded-xl bg-[var(--accent)] px-5 py-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-white">{text.snippetTitle}</h2>
        <textarea
          value={snippet}
          readOnly
          rows={14}
          className="w-full rounded-none border border-white/60 bg-white px-3 py-2 font-mono text-xs text-[#3a2417]"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={copySnippet}
            disabled={!snippet}
            className="inline-flex items-center rounded-md border-2 border-[#3a2417] bg-white px-4 py-2 text-sm font-semibold text-[#3a2417] shadow-[0_3px_0_#3a2417] transition hover:-translate-y-0.5 hover:bg-[#fff4ea] active:translate-y-0 active:shadow-[0_1px_0_#3a2417] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {text.copySnippet}
          </button>
          {copiedToken === "snippet" && <p className="text-xs text-white">{text.copied}</p>}
          {copiedToken === "error" && <p className="text-xs text-white">{text.copyFailed}</p>}
        </div>
      </section>
    </div>
  );
}
