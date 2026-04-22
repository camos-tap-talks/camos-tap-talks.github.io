"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { Talk } from "@/lib/talks";
import TalkCard from "@/components/TalkCard";
import MarkdownText from "@/components/MarkdownText";

type Props = {
  locale: Locale;
};

export type InitialDraft = {
  title: string;
  tapNumber: string;
  date: string;
  dateTbd: boolean;
  speaker: string;
  abstract: string;
  bio: string;
  speakerImage: string;
  uploadedImages: Array<{ url: string; deleteUrl?: string }>;
};

type UploadTarget = "speakerImage";

type SignUploadResponse = {
  uploadUrl: string;
  deleteUrl?: string;
  publicUrl: string;
  method?: "PUT" | "POST";
  headers?: Record<string, string>;
};

type ErrorResponse = {
  error?: string;
};

type UploadedImage = {
  id: string;
  url: string;
  label: string;
  deleteUrl?: string;
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_UPLOADED_IMAGES = 10;
const ACCEPTED_UPLOAD_TYPES = new Set(["image/jpeg", "image/png"]);
const UPLOAD_SIGN_ENDPOINT = process.env.NEXT_PUBLIC_UPLOAD_SIGN_ENDPOINT ?? "";
const EMPTY_DRAFT: InitialDraft = {
  title: "",
  tapNumber: "",
  date: "",
  dateTbd: false,
  speaker: "",
  abstract: "",
  bio: "",
  speakerImage: "",
  uploadedImages: [],
};

function readDraftFromSearchParams(params: URLSearchParams): InitialDraft {
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
      // Ignore malformed legacy query values and keep parsing the rest.
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
    title: params.get("title") ?? "",
    tapNumber: params.get("tap") ?? params.get("tapNumber") ?? "",
    date: params.get("date") ?? "",
    dateTbd: params.get("dateTbd") === "1" || params.get("dateTbd") === "true",
    speaker: params.get("speaker") ?? "",
    abstract: params.get("abstract") ?? "",
    bio: params.get("bio") ?? "",
    speakerImage: params.get("speakerImage") ?? "",
    uploadedImages: Array.from(mergedByUrl.values()),
  };
}

function buildInitialUploadedImages(
  speakerImage: string,
  uploadedImages: Array<{ url: string; deleteUrl?: string }> | undefined,
): UploadedImage[] {
  const mergedByUrl = new Map<string, { url: string; deleteUrl?: string }>();
  const safeUploadedImages = Array.isArray(uploadedImages) ? uploadedImages : [];

  if (speakerImage.trim()) {
    mergedByUrl.set(speakerImage, { url: speakerImage });
  }

  for (const image of safeUploadedImages) {
    const imageUrl = image.url?.trim() ?? "";
    if (!imageUrl) {
      continue;
    }

    const existing = mergedByUrl.get(imageUrl);
    mergedByUrl.set(imageUrl, {
      url: imageUrl,
      deleteUrl: image.deleteUrl ?? existing?.deleteUrl,
    });
  }

  return Array.from(mergedByUrl.values()).map((image, index) => ({
    id: `initial-uploaded-image-${index}`,
    url: image.url,
    label: image.url.split("/").pop() ?? image.url,
    deleteUrl: image.deleteUrl,
  }));
}

export default function SpeakerRoomClient({ locale }: Props) {
  const isJa = locale === "ja";

  const [title, setTitle] = useState(EMPTY_DRAFT.title);
  const [tapNumber, setTapNumber] = useState(EMPTY_DRAFT.tapNumber);
  const [date, setDate] = useState(EMPTY_DRAFT.date);
  const [dateTbd, setDateTbd] = useState(EMPTY_DRAFT.dateTbd);
  const [speaker, setSpeaker] = useState(EMPTY_DRAFT.speaker);
  const [abstract, setAbstract] = useState(EMPTY_DRAFT.abstract);
  const [bio, setBio] = useState(EMPTY_DRAFT.bio);
  const [speakerImage, setSpeakerImage] = useState(EMPTY_DRAFT.speakerImage);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copyNotice, setCopyNotice] = useState<"idle" | "copied" | "error">("idle");
  const [copiedImageToken, setCopiedImageToken] = useState<string | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<UploadTarget | null>(null);
  const [uploadNotice, setUploadNotice] = useState("");
  const speakerUploadInputId = useId();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.toString()) {
      return;
    }

    const nextDraft = readDraftFromSearchParams(params);
    setTitle(nextDraft.title);
    setTapNumber(nextDraft.tapNumber);
    setDate(nextDraft.date);
    setDateTbd(nextDraft.dateTbd);
    setSpeaker(nextDraft.speaker);
    setAbstract(nextDraft.abstract);
    setBio(nextDraft.bio);
    setSpeakerImage(nextDraft.speakerImage);
    setUploadedImages(buildInitialUploadedImages(nextDraft.speakerImage, nextDraft.uploadedImages));
    setGeneratedUrl(window.location.href);
  }, []);

  const text = useMemo(
    () => ({
      pageLabel: "SPEAKER ROOM",
      pageTitle: isJa ? "スピーカー用ページ" : "Speaker Draft Page",
      pageNote: isJa
        ? "このページはリンクされていません。共有された URL からのみアクセスできます。"
        : "This page is intentionally unlinked. Access is available only via the shared URL.",
      requestsTitle: isJa ? "お願いごと" : "Requests",
      requests: isJa
        ? ["下書きができたら、最終テキストを管理者に共有してください。"]
        : [
            "When your draft is ready, share the final text with the organizer.",
          ],
      talkCardSectionTitle: "TALK CARD",
      abstractSectionTitle: isJa ? "Abstract" : "Abstract",
      inputHeading: isJa ? "入力" : "Input",
      previewHeading: isJa ? "プレビュー" : "Preview",
      desktopPreviewLabel: isJa ? "デスクトップ版プレビュー" : "Desktop Preview",
      mobilePreviewLabel: isJa ? "モバイル版" : "Mobile",
      markdownTitle: isJa ? "対応している Markdown / HTML" : "Supported Markdown / HTML",
      submitTitle: isJa ? "提出用 URL" : "Submission URL",
      titleLabel: isJa ? "タイトル" : "Title",
      titleTwoLineHint: isJa
        ? "改行する場合は、デスクトップ版表示で2行までに収まるように入力してください。"
        : "If you use line breaks, keep the title within 2 lines on the desktop preview.",
      tapNumberLabel: isJa ? "Tap #" : "Tap #",
      dateLabel: isJa ? "日付" : "Date",
      dateTbdLabel: isJa ? "日付未定 (TBD)" : "Date TBD",
      speakerLabel: isJa ? "スピーカー名" : "Speaker",
      abstractLabel: isJa ? "アブストラクト" : "Abstract",
      bioLabel: isJa ? "スピーカープロフィール" : "Speaker Bio",
      speakerImageLabel: isJa ? "スピーカー画像 URL" : "Speaker image URL",
      uploadTitle: isJa ? "画像アップロード" : "Image Upload",
      uploadHelp: isJa
        ? "JPEG/PNG のみ、10MB まで。"
        : "JPEG/PNG only, up to 10MB.",
      uploadMissingEndpoint: isJa
        ? "アップロード設定が未完了です。管理者が署名 URL 発行エンドポイントを設定してください。"
        : "Upload is not configured yet. The admin needs to set a signed URL endpoint.",
      uploadImageButton: isJa ? "画像をアップロード" : "Upload image",
      uploadInProgress: isJa ? "アップロード中..." : "Uploading...",
      uploadTypeError: isJa ? "JPEG/PNG のみアップロードできます。" : "Only JPEG/PNG files are allowed.",
      uploadSizeError: isJa ? "10MB 以下の画像を選んでください。" : "Please choose an image up to 10MB.",
      uploadLimitError: isJa
        ? `アップロード済み画像は最大${MAX_UPLOADED_IMAGES}枚までです。削除すると再アップロードできます。`
        : `You can upload up to ${MAX_UPLOADED_IMAGES} images. Delete one to upload another.`,
      uploadFailed: isJa ? "アップロードに失敗しました。時間をおいて再度お試しください。" : "Upload failed. Please try again shortly.",
      uploadDone: isJa ? "画像をアップロードしました。" : "Image uploaded.",
      uploadedImagesTitle: isJa ? "アップロード済み画像" : "Uploaded images",
      uploadedImagesEmpty: isJa ? "まだ画像はアップロードされていません。" : "No uploaded images yet.",
      copyImageUrlButton: isJa ? "URLをコピー" : "Copy URL",
      copyImageMarkdownButton: isJa ? "Markdown" : "Markdown",
      copyImageHtmlButton: isJa ? "HTML" : "HTML",
      copyHeading: isJa ? "コピー" : "Copy",
      copyImageUrlChip: isJa ? "URL" : "URL",
      copiedImageUrlMessage: isJa ? "URLをコピーしました。" : "URL copied.",
      copiedImageMarkdownMessage: isJa ? "Markdownをコピーしました。" : "Markdown copied.",
      copiedImageHtmlMessage: isJa ? "HTMLをコピーしました。" : "HTML copied.",
      copyImageUrlError: isJa ? "URL のコピーに失敗しました。" : "Could not copy URL.",
      deleteImageButton: isJa ? "削除" : "Delete",
      deleteImageDone: isJa ? "画像を削除しました。" : "Image deleted.",
      deleteImageError: isJa ? "画像の削除に失敗しました。" : "Could not delete image.",
      deleteUnavailable: isJa ? "この画像は削除 URL がないため削除できません。" : "This image cannot be deleted because no delete URL is available.",
      deleteUnavailableInline: isJa ? "この URL では削除できません" : "Cannot delete from this URL",
      generateUrlButton: isJa ? "提出用 URL を生成してコピー" : "Generate and copy submission URL",
      generatedUrlLabel: isJa ? "生成された URL" : "Generated URL",
      copiedMessage: isJa ? "コピーしました。" : "Copied.",
      copyErrorMessage: isJa ? "コピーに失敗しました。手動でコピーしてください。" : "Could not copy. Please copy manually.",
      markdownExamples: isJa
        ? [
            "斜体: `*italic*`",
            "太字: `**bold**`",
            "取消線: `~~取り消し~~`",
            "インラインコード: `` `code` ``",
            "リンク: `[リンク文字](https://example.com)`",
            "箇条書き: `- item` / `1. item`",
            "引用: `> 引用文`",
            "改行: Enter で改行（タイトルなどの入力欄も同様）",
            "画像（Markdown）: `![alt](/logo-color.svg)`",
            "画像（HTML）: `<img src=\"/logo-color.svg\" width=\"120\" align=\"center\" />`",
            "キャプション: `<figure align=\"left|center|right\"><img src=\"/logo-color.svg\" width=\"120\" /><figcaption>説明</figcaption></figure>`",
          ]
        : [
            "Italic: `*italic*`",
            "Bold: `**bold**`",
            "Strikethrough: `~~strikethrough~~`",
            "Inline code: `` `code` ``",
            "Link: `[link text](https://example.com)`",
            "List: `- item` / `1. item`",
            "Quote: `> quote`",
            "Table: `| col | col |` format (GFM)",
            "Line break: use Enter (same for title and other inputs)",
            "Image (Markdown): `![alt](/logo-color.svg)`",
            "Image (HTML): `<img src=\"/logo-color.svg\" width=\"120\" align=\"center\" />`",
            "Caption: `<figure align=\"left|center|right\"><img src=\"/logo-color.svg\" width=\"120\" /><figcaption>caption</figcaption></figure>`",
          ],
      emptyHint: isJa ? "右側にレンダリング結果が表示されます。" : "Rendered output appears on the right.",
      abstractHeading: "Abstract",
      bioHeading: "Speaker Bio",
    }),
    [isJa],
  );

  const normalizedTapNumber = useMemo(() => {
    const parsed = Number.parseInt(tapNumber, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [tapNumber]);
  const hasReachedUploadLimit = uploadedImages.length >= MAX_UPLOADED_IMAGES;

  const previewTalk: Talk = {
    id: "preview",
    slug: "preview",
    date: date || "2099-01-01",
    dateTbd,
    titleEn: title || "Title preview",
    titleJa: title || "タイトルプレビュー",
    speakerEn: speaker || "Speaker name",
    speakerJa: speaker || "スピーカー名",
    abstractEn: abstract,
    abstractJa: abstract,
    speakerBioEn: bio,
    speakerBioJa: bio,
    speakerImage: speakerImage || undefined,
  };

  const createSubmissionUrl = async () => {
    const url = new URL(window.location.href);
    url.search = "";

    if (title.trim()) url.searchParams.set("title", title);
    if (tapNumber.trim()) url.searchParams.set("tap", tapNumber.trim());
    if (date.trim()) url.searchParams.set("date", date);
    if (dateTbd) url.searchParams.set("dateTbd", "1");
    if (speaker.trim()) url.searchParams.set("speaker", speaker);
    if (abstract.trim()) url.searchParams.set("abstract", abstract);
    if (bio.trim()) url.searchParams.set("bio", bio);
    if (speakerImage.trim()) url.searchParams.set("speakerImage", speakerImage);
    for (const image of uploadedImages) {
      url.searchParams.append("uploadedImage", image.url);
      if (image.deleteUrl) {
        url.searchParams.append(
          "uploadedImageData",
          JSON.stringify({
            url: image.url,
            deleteUrl: image.deleteUrl,
          }),
        );
      }
    }

    const nextUrl = url.toString();
    setGeneratedUrl(nextUrl);
    try {
      await navigator.clipboard.writeText(nextUrl);
      setCopyNotice("copied");
    } catch {
      setCopyNotice("error");
    }
  };

  const uploadImage = async (target: UploadTarget, file: File | null) => {
    if (!file) {
      return;
    }

    setUploadNotice("");

    if (uploadedImages.length >= MAX_UPLOADED_IMAGES) {
      setUploadNotice(text.uploadLimitError);
      return;
    }

    if (!ACCEPTED_UPLOAD_TYPES.has(file.type)) {
      setUploadNotice(text.uploadTypeError);
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadNotice(text.uploadSizeError);
      return;
    }

    if (!UPLOAD_SIGN_ENDPOINT) {
      setUploadNotice(text.uploadMissingEndpoint);
      return;
    }

    setUploadingTarget(target);

    try {
      const signRes = await fetch(UPLOAD_SIGN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
          target,
        }),
      });

      if (!signRes.ok) {
        throw new Error(await readErrorMessage(signRes, text.uploadFailed));
      }

      const signed = (await signRes.json()) as SignUploadResponse;
      const method = signed.method ?? "PUT";
      const uploadHeaders = signed.headers ?? { "Content-Type": file.type };

      const uploadRes = await fetch(signed.uploadUrl, {
        method,
        headers: uploadHeaders,
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(await readErrorMessage(uploadRes, text.uploadFailed));
      }

      if (target === "speakerImage") {
        setUploadedImages((current) => {
          if (current.some((image) => image.url === signed.publicUrl)) {
            return current;
          }

          return [
            ...current,
            {
              id: crypto.randomUUID(),
              url: signed.publicUrl,
              label: file.name,
              deleteUrl: signed.deleteUrl,
            },
          ];
        });
        if (!speakerImage.trim()) {
          setSpeakerImage(signed.publicUrl);
        }
        setUploadNotice(text.uploadDone);
      }
    } catch (error) {
      setUploadNotice(error instanceof Error ? error.message : text.uploadFailed);
    } finally {
      setUploadingTarget(null);
    }
  };

  const copyImageUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedImageToken(`${url}:url`);
    } catch {
      setCopiedImageToken(null);
    }
  };

  const copyImageMarkdown = async (url: string) => {
    try {
      await navigator.clipboard.writeText(`![image](${url})`);
      setCopiedImageToken(`${url}:markdown`);
    } catch {
      setCopiedImageToken(null);
    }
  };

  const copyImageHtml = async (url: string) => {
    try {
      await navigator.clipboard.writeText(`<img src="${url}" alt="" />`);
      setCopiedImageToken(`${url}:html`);
    } catch {
      setCopiedImageToken(null);
    }
  };

  const deleteUploadedImage = async (image: UploadedImage) => {
    if (!image.deleteUrl) {
      setUploadNotice(text.deleteUnavailable);
      return;
    }

    try {
      const res = await fetch(image.deleteUrl, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(text.deleteImageError);
      }

      setUploadedImages((current) => current.filter((item) => item.id !== image.id));
      if (speakerImage === image.url) {
        setSpeakerImage("");
      }
      setUploadNotice(text.deleteImageDone);
    } catch {
      setUploadNotice(text.deleteImageError);
    }
  };

  return (
    <div>
      <p className="mb-2 text-center text-[0.7rem] font-semibold tracking-[0.32em] text-[var(--muted)]">{text.pageLabel}</p>
      <h1 className="mb-2 text-center text-xl font-semibold text-[var(--foreground)]">{text.pageTitle}</h1>
      <p className="mb-8 text-center text-sm text-[var(--muted)]">{text.pageNote}</p>

      <section className="mb-8 rounded-xl bg-[var(--surface)] px-6 py-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">{text.requestsTitle}</h2>
        <ul className="space-y-2 text-sm text-[var(--muted)]">
          {text.requests.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8 rounded-xl bg-[var(--surface)] px-5 py-5 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">{text.markdownTitle}</h2>
        <ul className="space-y-1 text-xs text-[var(--muted)]">
          {text.markdownExamples.map((example) => (
            <li key={example}>
              <MarkdownText content={example} variant="inline" />
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">{text.talkCardSectionTitle}</h2>

        <div className="rounded-xl bg-[var(--surface)] px-5 py-5 shadow-sm">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">{text.inputHeading}</h3>

          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <label className="w-24 shrink-0">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.tapNumberLabel}</span>
                <input
                  value={tapNumber}
                  onChange={(event) => setTapNumber(event.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric"
                  placeholder="0"
                  className="w-full rounded-none border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
                />
              </label>

              <label className="w-auto shrink-0">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.dateLabel}</span>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-[11.5rem] rounded-none border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
                />
              </label>

              <label className="flex shrink-0 items-center gap-2 pb-2 text-sm text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={dateTbd}
                  onChange={(event) => setDateTbd(event.target.checked)}
                />
                <span>{text.dateTbdLabel}</span>
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.titleLabel}</span>
              <textarea
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                rows={2}
                placeholder={isJa ? "例: ポケモンと生物多様性" : "e.g. Pokemon and Biodiversity"}
                className="w-full rounded-none border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
              />
              <p className="mt-1 text-xs text-[var(--muted)]">{text.titleTwoLineHint}</p>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.speakerLabel}</span>
              <input
                value={speaker}
                onChange={(event) => setSpeaker(event.target.value)}
                placeholder={isJa ? "例: 鴨巣 太郎（麦酒大学）" : "e.g. Taro Camosu (Bakushu University)"}
                className="w-full rounded-none border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.speakerImageLabel}</span>
              <input
                value={speakerImage}
                onChange={(event) => setSpeakerImage(event.target.value)}
                placeholder="https://img.yuesugi.com/uploads/2026-04-21/icon-orange.png"
                className="w-full rounded-none border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
              />
            </label>

            <div className="border-t border-[var(--line)] pt-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">{text.previewHeading}</h3>

              <section className="w-full overflow-x-auto pb-1">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">{text.desktopPreviewLabel}</h4>
                <div className="w-[720px] min-w-[720px]">
                  <TalkCard
                    talk={previewTalk}
                    locale={locale}
                    variant="upcomingTap"
                    tapNumber={normalizedTapNumber}
                    disableLink
                    titleMaxLines={2}
                    titleDataField="desktop-title"
                  />
                </div>
              </section>

              <section className="mt-5 w-full overflow-x-auto pb-1">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">{text.mobilePreviewLabel}</h4>
                <div className="w-[342px] min-w-[342px]">
                  <TalkCard
                    talk={previewTalk}
                    locale={locale}
                    variant="upcomingTap"
                    tapNumber={normalizedTapNumber}
                    disableLink
                    forceMobileTypography
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">{text.abstractSectionTitle}</h2>

        <div className="rounded-xl bg-[var(--surface)] px-5 py-5 shadow-sm">
          <div className="flex flex-col xl:grid xl:grid-cols-2 xl:gap-0">
            <div className="pr-0 xl:pr-6">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">{text.inputHeading}</h3>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.abstractLabel}</span>
                  <textarea
                    value={abstract}
                    onChange={(event) => setAbstract(event.target.value)}
                    rows={8}
                    className="w-full rounded-none border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.bioLabel}</span>
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    rows={5}
                    className="w-full rounded-none border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
                  />
                </label>
              </div>
            </div>

            <div className="mt-5 border-t border-[var(--line)] pt-5 xl:mt-0 xl:border-t-0 xl:border-l xl:pl-6 xl:pt-0">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">{text.previewHeading}</h3>

              {!abstract && !bio ? (
                <p className="text-sm text-[var(--muted)]">{text.emptyHint}</p>
              ) : (
                <div className="space-y-6">
                  {abstract && (
                    <section>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent-deep)]">
                        {text.abstractHeading}
                      </h4>
                      <MarkdownText content={abstract} className="leading-relaxed text-[var(--muted)]" />
                    </section>
                  )}

                  {bio && (
                    <section>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent-deep)]">
                        {text.bioHeading}
                      </h4>
                      <MarkdownText content={bio} className="leading-relaxed text-[var(--muted)]" />
                    </section>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-xl bg-[var(--surface)] px-5 py-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">{text.uploadTitle}</h2>

        <div className="flex flex-wrap items-center gap-3">
          <input
            id={speakerUploadInputId}
            type="file"
            accept="image/jpeg,image/png"
            disabled={uploadingTarget !== null || hasReachedUploadLimit}
            onChange={(event) => {
              void uploadImage("speakerImage", event.target.files?.[0] ?? null);
              event.currentTarget.value = "";
            }}
            className="sr-only"
          />
          <label
            htmlFor={speakerUploadInputId}
            className={`inline-flex items-center rounded-none border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors ${
              uploadingTarget !== null || hasReachedUploadLimit
                ? "cursor-not-allowed bg-[color-mix(in_srgb,var(--line)_18%,white)]"
                : "cursor-pointer bg-white hover:bg-[color-mix(in_srgb,var(--accent)_8%,white)]"
            }`}
          >
            {text.uploadImageButton}
          </label>
          <p className="text-xs text-[var(--muted)]">{text.uploadHelp}</p>
        </div>

        {uploadingTarget !== null && <p className="mt-2 text-xs text-[var(--accent-deep)]">{text.uploadInProgress}</p>}
        {hasReachedUploadLimit && <p className="mt-2 text-xs text-[var(--accent-deep)]">{text.uploadLimitError}</p>}
        {uploadNotice && <p className="mt-2 text-xs text-[var(--accent-deep)]">{uploadNotice}</p>}

        <div className="mt-5 border-t border-[var(--line)] pt-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">{text.uploadedImagesTitle}</h3>

          {uploadedImages.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{text.uploadedImagesEmpty}</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {uploadedImages.map((image) => {
                return (
                  <div
                    key={image.id}
                    className="w-[10.5rem] border border-[var(--line)] bg-white px-2.5 py-2.5"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface)]">
                      <Image src={image.url} alt={image.label} fill sizes="168px" className="object-contain" />
                    </div>

                    <div className="mt-2 min-w-0">
                      <p className="truncate text-[0.7rem] text-[var(--muted)]">{image.label}</p>
                      <p className="mt-1 line-clamp-3 break-all text-[0.65rem] text-[var(--muted)]">{image.url}</p>
                      <p className="mt-2 text-[0.62rem] font-semibold tracking-[0.08em] text-[var(--muted)]">{text.copyHeading}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => void copyImageUrl(image.url)}
                          className="inline-flex items-center rounded-none border border-[var(--line)] bg-white px-1.5 py-0.5 text-[0.62rem] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--accent)_8%,white)]"
                        >
                          {text.copyImageUrlChip}
                        </button>
                        <button
                          type="button"
                          onClick={() => void copyImageMarkdown(image.url)}
                          className="inline-flex items-center rounded-none border border-[var(--line)] bg-white px-1.5 py-0.5 text-[0.62rem] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--accent)_8%,white)]"
                        >
                          {text.copyImageMarkdownButton}
                        </button>
                        <button
                          type="button"
                          onClick={() => void copyImageHtml(image.url)}
                          className="inline-flex items-center rounded-none border border-[var(--line)] bg-white px-1.5 py-0.5 text-[0.62rem] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--accent)_8%,white)]"
                        >
                          {text.copyImageHtmlButton}
                        </button>
                      </div>
                      {copiedImageToken === `${image.url}:url` && (
                        <p className="mt-1 text-[0.65rem] text-[var(--accent-deep)]">{text.copiedImageUrlMessage}</p>
                      )}
                      {copiedImageToken === `${image.url}:markdown` && (
                        <p className="mt-1 text-[0.65rem] text-[var(--accent-deep)]">{text.copiedImageMarkdownMessage}</p>
                      )}
                      {copiedImageToken === `${image.url}:html` && (
                        <p className="mt-1 text-[0.65rem] text-[var(--accent-deep)]">{text.copiedImageHtmlMessage}</p>
                      )}
                      {!image.deleteUrl && (
                        <p className="mt-1 text-[0.65rem] text-[var(--muted)]">{text.deleteUnavailableInline}</p>
                      )}
                      <button
                        type="button"
                        disabled={!image.deleteUrl}
                        onClick={() => void deleteUploadedImage(image)}
                        className={`mt-2 inline-flex w-full items-center justify-center rounded-none px-2 py-1 text-[0.65rem] font-semibold text-white ${
                          image.deleteUrl
                            ? "bg-[#d1773b] hover:bg-[color-mix(in_srgb,#d1773b_88%,#000)]"
                            : "cursor-not-allowed bg-[color-mix(in_srgb,var(--line)_70%,#fff)] text-[var(--muted)]"
                        }`}
                      >
                        {text.deleteImageButton}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="mb-8 rounded-xl bg-[#d1773b] px-5 py-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">{text.submitTitle}</h2>
        <button
          type="button"
          onClick={createSubmissionUrl}
          className="inline-flex items-center rounded-md border-2 border-[#3a2417] bg-white px-4 py-2.5 text-sm font-semibold text-[#3a2417] shadow-[0_3px_0_#3a2417] transition hover:-translate-y-0.5 hover:bg-[#fff4ea] active:translate-y-0 active:shadow-[0_1px_0_#3a2417] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        >
          {text.generateUrlButton}
        </button>

        {generatedUrl && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/85">{text.generatedUrlLabel}</p>
            <textarea
              value={generatedUrl}
              readOnly
              rows={3}
              className="w-full rounded-none border border-white/60 bg-white px-3 py-2 text-xs text-[#3a2417]"
            />
            {copyNotice === "copied" && <p className="text-xs text-white">{text.copiedMessage}</p>}
            {copyNotice === "error" && <p className="text-xs text-white">{text.copyErrorMessage}</p>}
          </div>
        )}
      </section>
    </div>
  );
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as ErrorResponse;
    return payload.error?.trim() || fallback;
  }

  const text = (await response.text()).trim();
  return text || fallback;
}
