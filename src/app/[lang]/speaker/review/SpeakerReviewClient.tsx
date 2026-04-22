"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { formatTimeRange } from "@/lib/talks";

type Props = {
  locale: Locale;
};

type ParsedDraft = {
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

const EMPTY_DRAFT: ParsedDraft = {
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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function codeString(value: string): string {
  return JSON.stringify(value);
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
      extractedTitle: isJa ? "抽出結果" : "Extracted Draft",
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
    }),
    [isJa],
  );

  const hasLoadedDraft = useMemo(
    () => Object.values(draft).some((value) => (Array.isArray(value) ? value.length > 0 : Boolean(value))),
    [draft],
  );

  const snippet = useMemo(() => {
    if (!hasLoadedDraft) {
      return "";
    }

    const tapPart = draft.tapNumber.trim() || "x";
    const slugCore = slugify(`${tapPart}-${draft.speakerEn || draft.speakerJa}-${draft.titleEn || draft.titleJa}`) || "new-talk";

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
      `  abstractEn: ${codeString(draft.abstractEn || "")},`,
      `  abstractJa: ${codeString(draft.abstractJa || "")},`,
      `  speakerBioEn: ${codeString(draft.bioEn || "")},`,
      `  speakerBioJa: ${codeString(draft.bioJa || "")},`,
      draft.speakerImage.trim() ? `  speakerImage: ${codeString(draft.speakerImage)},` : "",
      "},",
    ]
      .filter(Boolean)
      .join("\n");
  }, [draft, hasLoadedDraft]);

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
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">{text.extractedTitle}</h2>
        {!hasLoadedDraft ? (
          <p className="text-sm text-[var(--muted)]">{text.emptyHint}</p>
        ) : (
          <dl className="grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-[var(--foreground)]">{text.fields.titleJa}</dt>
              <dd>{draft.titleJa || "-"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--foreground)]">{text.fields.titleEn}</dt>
              <dd>{draft.titleEn || "-"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--foreground)]">{text.fields.tap}</dt>
              <dd>{draft.tapNumber || "-"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--foreground)]">{text.fields.date}</dt>
              <dd>{draft.dateTbd ? "TBD" : draft.date || "-"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--foreground)]">{text.fields.time}</dt>
              <dd>{draft.dateTbd ? "-" : formatTimeRange(draft.startTime, draft.endTime, draft.timeTbd, locale) || "-"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--foreground)]">{text.fields.speakerJa}</dt>
              <dd>{draft.speakerJa || "-"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--foreground)]">{text.fields.speakerEn}</dt>
              <dd>{draft.speakerEn || "-"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-[var(--foreground)]">{text.fields.speakerImage}</dt>
              <dd className="break-all">{draft.speakerImage || "-"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-[var(--foreground)]">{text.fields.uploadedImages}</dt>
              <dd>
                {draft.uploadedImages.length === 0 ? (
                  "-"
                ) : (
                  <ul className="space-y-1">
                    {draft.uploadedImages.map((image) => (
                      <li key={image.url} className="break-all">{image.url}</li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
          </dl>
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
