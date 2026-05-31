"use client";

import { useEffect, useId, useMemo, useState, type MouseEvent } from "react";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { Talk } from "@/lib/talks";
import { buildTalkPathSlug } from "@/lib/talks";
import TalkCard from "@/components/TalkCard";
import MarkdownText from "@/components/MarkdownText";

type Props = {
  locale: Locale;
};

export type InitialDraft = {
  slug: string;
  title: string;
  tapNumber: string;
  date: string;
  startTime: string;
  endTime: string;
  dateTbd: boolean;
  timeTbd: boolean;
  startTimeTbd: boolean;
  endTimeTbd: boolean;
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
  slug: "",
  title: "",
  tapNumber: "",
  date: "",
  startTime: "",
  endTime: "",
  dateTbd: false,
  timeTbd: false,
  startTimeTbd: false,
  endTimeTbd: false,
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
    slug: params.get("slug") ?? "",
    title: params.get("title") ?? params.get("titleJa") ?? params.get("titleEn") ?? "",
    tapNumber: params.get("tap") ?? params.get("tapNumber") ?? "",
    date: params.get("date") ?? "",
    startTime: params.get("startTime") ?? "",
    endTime: params.get("endTime") ?? "",
    dateTbd: params.get("dateTbd") === "1" || params.get("dateTbd") === "true",
    timeTbd: params.get("timeTbd") === "1" || params.get("timeTbd") === "true",
    startTimeTbd:
      params.get("startTimeTbd") === "1"
      || params.get("startTimeTbd") === "true"
      || params.get("timeTbd") === "1"
      || params.get("timeTbd") === "true",
    endTimeTbd:
      params.get("endTimeTbd") === "1"
      || params.get("endTimeTbd") === "true"
      || params.get("timeTbd") === "1"
      || params.get("timeTbd") === "true",
    speaker: params.get("speaker") ?? params.get("speakerJa") ?? params.get("speakerEn") ?? "",
    abstract: params.get("abstract") ?? params.get("abstractJa") ?? params.get("abstractEn") ?? "",
    bio: params.get("bio") ?? params.get("bioJa") ?? params.get("bioEn") ?? "",
    speakerImage: params.get("speakerImage") ?? "",
    uploadedImages: Array.from(mergedByUrl.values()),
  };
}

function normalizeSlugInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function normalizeTimeInput(value: string): string {
  const digits = value.replace(/[^0-9]/g, "").slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
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

export default function SpeakerSubmitClient({ locale }: Props) {
  const isJa = locale === "ja";
  const emptyInputClass = (value: string, inactive = false) => (inactive || value.trim() ? "bg-white" : "bg-[#eef8ff]");

  const [slug, setSlug] = useState(EMPTY_DRAFT.slug);
  const [title, setTitle] = useState(EMPTY_DRAFT.title);
  const [tapNumber, setTapNumber] = useState(EMPTY_DRAFT.tapNumber);
  const [date, setDate] = useState(EMPTY_DRAFT.date);
  const [startTime, setStartTime] = useState(EMPTY_DRAFT.startTime);
  const [endTime, setEndTime] = useState(EMPTY_DRAFT.endTime);
  const [dateTbd, setDateTbd] = useState(EMPTY_DRAFT.dateTbd);
  const [startTimeTbd, setStartTimeTbd] = useState(EMPTY_DRAFT.startTimeTbd);
  const [endTimeTbd, setEndTimeTbd] = useState(EMPTY_DRAFT.endTimeTbd);
  const [speaker, setSpeaker] = useState(EMPTY_DRAFT.speaker);
  const [abstract, setAbstract] = useState(EMPTY_DRAFT.abstract);
  const [bio, setBio] = useState(EMPTY_DRAFT.bio);
  const [openMarkdownSection, setOpenMarkdownSection] = useState(false);
  const [speakerImage, setSpeakerImage] = useState(EMPTY_DRAFT.speakerImage);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copyNotice, setCopyNotice] = useState<"idle" | "copied" | "savedTxt" | "error">("idle");
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
    queueMicrotask(() => {
      setSlug(nextDraft.slug);
      setTitle(nextDraft.title);
      setTapNumber(nextDraft.tapNumber);
      setDate(nextDraft.date);
      setStartTime(nextDraft.startTime);
      setEndTime(nextDraft.endTime);
      setDateTbd(nextDraft.dateTbd);
      setStartTimeTbd(nextDraft.startTimeTbd);
      setEndTimeTbd(nextDraft.endTimeTbd);
      setSpeaker(nextDraft.speaker);
      setAbstract(nextDraft.abstract);
      setBio(nextDraft.bio);
      setSpeakerImage(nextDraft.speakerImage);
      setUploadedImages(buildInitialUploadedImages(nextDraft.speakerImage, nextDraft.uploadedImages));
      setGeneratedUrl(window.location.href);
    });
  }, []);

  const text = useMemo(
    () => ({
      pageLabel: "SPEAKER SUBMIT",
      pageTitle: isJa ? "スピーカー提出ページ" : "Speaker Submit Page",
      pageNote: isJa
        ? "案内ページを確認後、このページで提出内容を作成してください。"
        : "After reading the guide page, prepare your submission on this page.",
      guideLinkLabel: isJa ? "← スピーカー向けご案内（新規タブで開く）" : "← Speaker Guide (opens in new tab)",
      workflowTitle: isJa ? "手順" : "Submission Steps",
      inputStepsTitle: isJa ? "(1) 入力" : "Input Steps",
      workflowSteps: isJa
        ? [
            "入力欄を埋めてください。",
            "Abstract・Speaker Bio 入力欄は Markdown/HTML に対応しています。",
            "画像は、下の方にある「画像アップロード」セクションでアップロードし、生成された URL を用いて Markdown/HTML 形式で挿入してください。",
          ]
        : [
            "Fill in the input fields.",
            "The Abstract and Speaker Bio fields support Markdown/HTML.",
            "For images, upload them in the “Image Upload” section below and insert them using the generated URLs in Markdown/HTML format.",
          ],
      submissionItemsTitle: isJa ? "(2) 提出" : "What to Submit",
      submissionItems: isJa
        ? ["一番下の「URL を生成してコピー」ボタンを押してください。生成された URL を保管しておけば、記入内容も保持できます。その URL を世話人へ提出してください。"]
        : [
            "Click the \"Generate and copy URL\" button at the bottom. If you keep the generated URL, your entered content will also be preserved. Then share that URL with the organizer.",
          ],
      talkCardSectionTitle: "TALK CARD",
      sectionInputHeading: isJa ? "入力" : "Input",
      sectionPreviewHeading: isJa ? "プレビュー" : "Preview",
      inputSectionTitle: isJa ? "入力" : "Input",
      desktopPreviewLabel: isJa ? "TALK CARD プレビュー（デスクトップ版）" : "TALK CARD Preview (Desktop)",
      mobilePreviewLabel: isJa ? "TALK CARD プレビュー（モバイル版）" : "TALK CARD Preview (Mobile)",
      urlPreviewLabel: isJa ? "URL プレビュー" : "URL Preview",
      markdownTitle: isJa ? "対応している Markdown / HTML" : "Supported Markdown / HTML",
      markdownScrollHint: isJa ? "対応している Markdown / HTML はこちら↑" : "Supported Markdown / HTML is above ↑",
      submitTitle: isJa ? "保存・提出" : "Save & Submit",
      slugLabel: isJa ? "Slug*" : "Slug*",
      slugHint: isJa
        ? "URL に使われます。基本は 1 単語、長くても 3 単語まで。通常は family name / first name か研究に関する単語を小文字で入力してください。"
        : "Used in the URL. Prefer 1 word, at most 3. Usually use a family name, first name, or a research-related word in lowercase.",
      titleLabel: isJa ? "タイトル（共通）" : "Title (Shared)",
      titleTwoLineHint: isJa
        ? "改行する場合は、デスクトップ版表示で2行までに収まるように入力してください。"
        : "If you use line breaks, keep the title within 2 lines on the desktop preview.",
      tapNumberLabel: isJa ? "Tap #*" : "Tap #*",
      tapNumberHint: isJa ? "通し番号" : "Serial number",
      dateLabel: isJa ? "日付*" : "Date*",
      startTimeLabel: isJa ? "開始時間*" : "Start time*",
      endTimeLabel: isJa ? "終了時間*" : "End time*",
      undecidedLabel: isJa ? "未定" : "TBD",
      speakerLabel: isJa ? "スピーカー名（共通）" : "Speaker (Shared)",
      speakerHint: isJa ? "デスクトップ版表示で1行以内に収まるように入力してください。" : "Keep to one line on the desktop preview.",
      abstractLabel: isJa ? "Abstract（共通）" : "Abstract (Shared)",
      bioLabel: isJa ? "Speaker Bio（共通）" : "Speaker Bio (Shared)",
      uploadScrollHint: isJa ? "画像アップロードはこちら↓" : "Upload image below ↓",
      speakerImageLabel: isJa ? "スピーカー画像 URL*" : "Speaker image URL*",
      speakerImageAspectHint: isJa
        ? "表示比率は 2:3 です。画像はこの比率で自動クロップされます。"
        : "Display ratio is 2:3. Images are auto-cropped to this ratio.",
      uploadTitle: isJa ? "画像アップロード" : "Image Upload",
      uploadHelp: isJa
        ? "JPEG/PNG のみ、10MB まで、最大10枚。"
        : "JPEG/PNG only, up to 10MB, max 10 images.",
      uploadCopyrightNotice: isJa
        ? "本サイトでは、写真・画像に関する著作権と利用に関する注意書きを掲載しています。ご提供いただいた写真・画像は、HP や SNS などでの告知に利用します。"
        : "This site includes a copyright and usage notice for photos and images. Images and photos you provide may be used for announcements on the website and social media.",
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
      copyImageUrlButton: isJa ? "URL をコピー" : "Copy URL",
      copyImageMarkdownButton: isJa ? "Markdown" : "Markdown",
      copyImageHtmlButton: isJa ? "HTML" : "HTML",
      copyHeading: isJa ? "コピー" : "Copy",
      copyImageUrlChip: isJa ? "URL" : "URL",
      copiedImageUrlMessage: isJa ? "URL をコピーしました。" : "URL copied.",
      copiedImageMarkdownMessage: isJa ? "Markdown をコピーしました。" : "Markdown copied.",
      copiedImageHtmlMessage: isJa ? "HTMLをコピーしました。" : "HTML copied.",
      copyImageUrlError: isJa ? "URL のコピーに失敗しました。" : "Could not copy URL.",
      deleteImageButton: isJa ? "削除" : "Delete",
      deleteImageDone: isJa ? "画像を削除しました。" : "Image deleted.",
      deleteImageError: isJa ? "画像の削除に失敗しました。" : "Could not delete image.",
      deleteUnavailable: isJa ? "この画像は削除 URL がないため削除できません。" : "This image cannot be deleted because no delete URL is available.",
      deleteUnavailableInline: isJa ? "この URL では削除できません" : "Cannot delete from this URL",
      generateUrlButton: isJa ? "URL を生成してコピー" : "Generate and copy URL",
      downloadUrlButton: isJa ? "URL を生成して .txt を保存" : "Generate URL and save as .txt",
      submitHelp: isJa
        ? "生成した URL をそのまま世話人に送るか、URL を保存したテキストファイルを送ってください。"
        : "After generating the URL, either send the URL directly to the organizer or send the text file that contains the URL.",
      generatedUrlLabel: isJa ? "生成された URL" : "Generated URL",
      copiedMessage: isJa ? "コピーしました。" : "Copied.",
      savedTextFileMessage: isJa ? "テキストファイルを保存しました。" : "Saved text file.",
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
      emptyHint: isJa ? "入力するとレンダリング結果が表示されます。" : "Enter text to see the rendered output.",
      abstractHeading: isJa ? "Abstract" : "Abstract",
      bioHeading: isJa ? "Speaker Bio" : "Speaker Bio",
      abstractLengthGuide: isJa ? "文字数目安: 100〜300字程度" : "Length guide: about 100-300 chars",
      bioLengthGuide: isJa ? "文字数目安: 約100〜300字程度" : "Length guide: about 100-300 chars",
    }),
    [isJa],
  );

  const tocItems = useMemo(
    () => (isJa
      ? [
          { id: "submit-workflow", label: "手順" },
          { id: "supported-markdown", label: "Markdown / HTML" },
          { id: "submit-input", label: "入力" },
          { id: "image-upload", label: "画像アップロード" },
          { id: "submit-url", label: "保存・提出" },
        ]
      : [
          { id: "submit-workflow", label: "Submission Steps" },
          { id: "supported-markdown", label: "Markdown / HTML" },
          { id: "submit-input", label: "Input" },
          { id: "image-upload", label: "Image Upload" },
          { id: "submit-url", label: "Save & Submit" },
        ]),
    [isJa],
  );

  const normalizedTapNumber = useMemo(() => {
    const parsed = Number.parseInt(tapNumber, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [tapNumber]);
  const hasReachedUploadLimit = uploadedImages.length >= MAX_UPLOADED_IMAGES;
  const talkPathSlug = useMemo(() => buildTalkPathSlug(tapNumber, slug, "preview"), [tapNumber, slug]);
  const timeTbd = startTimeTbd && endTimeTbd;

  const previewTalk: Talk = {
    id: "preview",
    slug: talkPathSlug,
    date: date || "2099-01-01",
    startTime: startTimeTbd ? undefined : startTime.trim() || undefined,
    endTime: endTimeTbd ? undefined : endTime.trim() || undefined,
    dateTbd,
    timeTbd,
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

  const buildSubmissionUrl = (): string => {
    const url = new URL(window.location.href);
    url.search = "";

    if (slug.trim()) url.searchParams.set("slug", slug.trim());
    if (title.trim()) url.searchParams.set("title", title);
    if (tapNumber.trim()) url.searchParams.set("tap", tapNumber.trim());
    if (date.trim()) url.searchParams.set("date", date);
    if (!startTimeTbd && startTime.trim()) url.searchParams.set("startTime", startTime.trim());
    if (!endTimeTbd && endTime.trim()) url.searchParams.set("endTime", endTime.trim());
    if (dateTbd) url.searchParams.set("dateTbd", "1");
    if (startTimeTbd) url.searchParams.set("startTimeTbd", "1");
    if (endTimeTbd) url.searchParams.set("endTimeTbd", "1");
    if (timeTbd) url.searchParams.set("timeTbd", "1");
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

    return url.toString();
  };

  const createSubmissionUrl = async () => {
    const nextUrl = buildSubmissionUrl();
    setGeneratedUrl(nextUrl);
    try {
      await navigator.clipboard.writeText(nextUrl);
      setCopyNotice("copied");
    } catch {
      setCopyNotice("error");
    }
  };

  const saveSubmissionUrlAsText = () => {
    const urlToSave = buildSubmissionUrl();
    setGeneratedUrl(urlToSave);
    const blob = new Blob([`${urlToSave}\n`], { type: "text/plain;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = "speaker-submission-url.txt";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(blobUrl);
    setCopyNotice("savedTxt");
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

  const openExternalLinksInNewTab = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const anchor = target.closest("a[href]");
    if (!(anchor instanceof HTMLAnchorElement)) {
      return;
    }

    const href = anchor.getAttribute("href") ?? "";
    if (!href || href.startsWith("/") || href.startsWith("#")) {
      return;
    }

    let url: URL;
    try {
      url = new URL(href, window.location.href);
    } catch {
      return;
    }

    if (url.origin === window.location.origin) {
      return;
    }

    event.preventDefault();
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  const openMarkdownGuide = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setOpenMarkdownSection(true);
    requestAnimationFrame(() => {
      const section = document.getElementById("supported-markdown");
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const scrollToImageUpload = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    requestAnimationFrame(() => {
      const section = document.getElementById("image-upload");
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <>
      <div
        onClickCapture={openExternalLinksInNewTab}
        className="relative left-1/2 right-1/2 w-[min(1120px,calc(100vw-2rem))] -translate-x-1/2"
      >
      <p className="mb-2 text-center text-[0.7rem] font-semibold tracking-[0.32em] text-[var(--muted)]">{text.pageLabel}</p>
      <h1 className="mb-2 text-center text-xl font-semibold text-[var(--foreground)]">{text.pageTitle}</h1>
      <p className="mb-8 text-center text-sm text-[var(--muted)]">{text.pageNote}</p>

      <div className="mb-8">
        <a
          href={`/${locale}/speaker`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent-deep)]"
        >
          {text.guideLinkLabel}
        </a>
      </div>

      <section id="submit-workflow" className="mb-8 scroll-mt-24 rounded-none bg-[#e5e5e5] px-6 py-6 text-[#444] shadow-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#3f3f3f]">{text.workflowTitle}</h2>
        <h3 className="mt-4 mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#3f3f3f]">{text.inputStepsTitle}</h3>
        <ul className="space-y-2 text-sm text-[#444]">
          {text.workflowSteps.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-[0.42rem] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#8a8a8a]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-5 mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#3f3f3f]">{text.submissionItemsTitle}</h3>
        <ul className="space-y-2 text-sm text-[#444]">
          {text.submissionItems.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-[0.42rem] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#8a8a8a]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="supported-markdown"
        className="mb-8 rounded-none bg-[#e5e5e5] px-5 py-5 text-[#444] shadow-sm [&_code]:bg-[#d0d0d0] [&_code]:text-[#3f3f3f] [&_pre]:border-[#bfbfbf] [&_pre]:bg-[#d7d7d7] [&_pre_code]:bg-transparent"
      >
        <details
          open={openMarkdownSection}
          onToggle={(event) => setOpenMarkdownSection(event.currentTarget.open)}
        >
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.18em] text-[#3f3f3f]">
            {text.markdownTitle}
          </summary>
          <ul className="mt-3 space-y-1 text-xs text-[#444]">
            {text.markdownExamples.map((example) => (
              <li key={example}>
                <MarkdownText content={example} variant="inline" />
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section id="submit-input" className="mb-8 scroll-mt-24 rounded-none bg-[var(--surface)] px-5 py-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">{text.inputSectionTitle}</h2>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.slugLabel}</span>
            <input
              value={slug}
              onChange={(event) => setSlug(normalizeSlugInput(event.target.value))}
              placeholder="e.g. taro / biodiversity"
              className={`w-full rounded-none border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] ${emptyInputClass(slug)}`}
            />
            <p className="mt-1 text-xs text-[var(--muted)]">{text.slugHint}</p>
          </label>

          <div className="flex flex-wrap items-start gap-4">
            <label className="w-24 shrink-0">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.tapNumberLabel}</span>
              <input
                value={tapNumber}
                onChange={(event) => setTapNumber(event.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="0"
                className={`w-full rounded-none border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] ${emptyInputClass(tapNumber)}`}
              />
              <p className="mt-1 text-xs text-[var(--muted)]">{text.tapNumberHint}</p>
            </label>

            <div className="w-auto shrink-0">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.dateLabel}</span>
                <input
                  type="text"
                  value={date.replace(/-/g, "/")}
                  onChange={(event) => setDate(event.target.value.replace(/\//g, "-"))}
                  placeholder="yyyy/mm/dd"
                  data-empty-highlight={dateTbd ? "off" : undefined}
                  style={dateTbd ? { backgroundColor: "#ffffff" } : undefined}
                  className={`w-[11.5rem] rounded-none border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] ${emptyInputClass(date, dateTbd)}`}
                />
              </label>
              <label className="mt-1 inline-flex items-center gap-1.5 text-[0.7rem] text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={dateTbd}
                  onChange={(event) => setDateTbd(event.target.checked)}
                />
                <span>{text.undecidedLabel}</span>
              </label>
            </div>

            <div className="w-auto shrink-0">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.startTimeLabel}</span>
                <input
                  type="text"
                  maxLength={5}
                  value={startTime}
                  onChange={(event) => setStartTime(normalizeTimeInput(event.target.value))}
                  placeholder="xx:xx"
                  disabled={startTimeTbd}
                  data-empty-highlight={startTimeTbd ? "off" : undefined}
                  style={startTimeTbd ? { backgroundColor: "#ffffff" } : undefined}
                  className={`w-[8.5rem] rounded-none border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] ${emptyInputClass(startTime, startTimeTbd)}`}
                />
              </label>
              <label className="mt-1 inline-flex items-center gap-1.5 text-[0.7rem] text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={startTimeTbd}
                  onChange={(event) => setStartTimeTbd(event.target.checked)}
                />
                <span>{text.undecidedLabel}</span>
              </label>
            </div>

            <div className="w-auto shrink-0">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.endTimeLabel}</span>
                <input
                  type="text"
                  maxLength={5}
                  value={endTime}
                  onChange={(event) => setEndTime(normalizeTimeInput(event.target.value))}
                  placeholder="xx:xx"
                  disabled={endTimeTbd}
                  data-empty-highlight={endTimeTbd ? "off" : undefined}
                  style={endTimeTbd ? { backgroundColor: "#ffffff" } : undefined}
                  className={`w-[8.5rem] rounded-none border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] ${emptyInputClass(endTime, endTimeTbd)}`}
                />
              </label>
              <label className="mt-1 inline-flex items-center gap-1.5 text-[0.7rem] text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={endTimeTbd}
                  onChange={(event) => setEndTimeTbd(event.target.checked)}
                />
                <span>{text.undecidedLabel}</span>
              </label>
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.titleLabel}</span>
            <textarea
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              rows={2}
              placeholder={isJa ? "例: ポケモンと生物多様性" : "e.g. Pokémon and Biodiversity"}
              className="w-full rounded-none border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
            />
            <p className="mt-1 text-xs text-[var(--muted)]">{text.titleTwoLineHint}</p>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.speakerLabel}</span>
            <input
              value={speaker}
              onChange={(event) => setSpeaker(event.target.value)}
              placeholder={isJa ? "例: 鴨巣 太郎（麦酒大学）" : "e.g. Taro Camos (Beer University)"}
              className={`w-full rounded-none border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] ${emptyInputClass(speaker)}`}
            />
            <p className="mt-1 text-xs text-[var(--muted)]">{text.speakerHint}</p>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.speakerImageLabel}</span>
            <input
              value={speakerImage}
              onChange={(event) => setSpeakerImage(event.target.value)}
              placeholder="e.g. https://example.com/photo.jpg"
              className={`w-full rounded-none border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] ${emptyInputClass(speakerImage)}`}
            />
            <p className="mt-1 text-xs text-[var(--muted)]">
              <a href="#image-upload" onClick={scrollToImageUpload} className="underline hover:text-[var(--foreground)]">{text.uploadScrollHint}</a>
              <span> {text.speakerImageAspectHint}</span>
            </p>
          </label>
        </div>

        <div className="mt-5 border-t border-[var(--line)] pt-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">{text.sectionPreviewHeading}</h3>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">{text.urlPreviewLabel}</h4>
          <p className="mb-4 break-all text-sm text-[var(--foreground)]">.../{locale}/talks/{talkPathSlug}</p>

          <section className="w-full overflow-x-auto pb-1">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">{text.desktopPreviewLabel}</h4>
            <div className="w-[720px] min-w-[720px]">
              <TalkCard
                talk={previewTalk}
                locale={locale}
                variant="upcomingTap"
                tapNumber={normalizedTapNumber}
                disableLink
                forceDesktopTypography
                titleMaxLines={2}
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

        <div className="mt-5 space-y-5">
          <div className="flex flex-col xl:grid xl:grid-cols-2 xl:gap-0">
            <div className="pr-0 xl:pr-6">
              <label className="block">
                <div className="mb-1 flex items-start justify-between gap-3">
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.abstractLabel}</span>
                  <span className="text-[0.62rem] text-[var(--muted)]">{text.abstractLengthGuide}</span>
                </div>
                <textarea
                  value={abstract}
                  onChange={(event) => setAbstract(event.target.value)}
                  rows={16}
                  placeholder={isJa
                    ? `例:
ポケモンの世界には、さまざまな環境に適応した多様な「種」が登場します。水辺に特化したもの、火山地帯に棲むもの、他の個体と共生するもの──これらは現実の生物多様性とどこまで似ているのでしょうか？

本トークでは、ポケモンという身近な題材を入口に、生物多様性とは何か、なぜそれが重要なのかを紹介します。進化や適応、種間相互作用といった基本概念を、実在の動物や生態系の例と比較しながら解説します。また、「もしポケモンが実在したら？」という視点から、生態系のバランスや絶滅リスクについても考えます。

ビール片手に、ゲームの世界と現実の自然を行き来しながら、「多様性」が生まれる仕組みとその価値について一緒に考えてみましょう。`
                    : `e.g.
The world of Pokémon is filled with diverse “species” adapted to different environments—some live in water, others thrive in volcanic regions, and some form complex relationships with other creatures. But how similar is this fictional diversity to real-world biodiversity?

In this talk, I use Pokémon as a familiar entry point to explore what biodiversity is and why it matters. I will introduce key concepts such as evolution, adaptation, and species interactions, drawing parallels between Pokémon and real organisms and ecosystems. We will also consider a simple question: what would happen if Pokémon actually existed? This thought experiment helps us think about ecological balance and extinction risk in a new way.

Over a pint, we will move back and forth between fiction and reality, and explore how diversity emerges—and why it is worth protecting.`}
                  className="w-full rounded-none border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
                />
                <p className="mt-1 text-xs text-[var(--muted)]">
                  <a href="#supported-markdown" onClick={openMarkdownGuide} className="underline hover:text-[var(--foreground)]">{text.markdownScrollHint}</a>
                </p>
              </label>
            </div>

            <div className="mt-5 border-t border-[var(--line)] pt-5 xl:mt-0 xl:border-t-0 xl:border-l xl:pl-6 xl:pt-0">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">{text.sectionPreviewHeading}</h3>
              {abstract ? (
                <section>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent-deep)]">
                    {text.abstractHeading}
                  </h4>
                  <MarkdownText content={abstract} className="leading-relaxed text-[var(--muted)]" />
                </section>
              ) : (
                <p className="text-sm text-[var(--muted)]">{text.emptyHint}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col xl:grid xl:grid-cols-2 xl:gap-0">
            <div className="pr-0 xl:pr-6">
              <label className="block border-t border-[var(--line)] pt-4 xl:border-t-0 xl:pt-0">
                <div className="mb-1 flex items-start justify-between gap-3">
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{text.bioLabel}</span>
                  <span className="text-[0.62rem] text-[var(--muted)]">{text.bioLengthGuide}</span>
                </div>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={10}
                  placeholder={isJa
                    ? `例:
泡沫大学大学院で生態学の博士号を取得後、発酵総合研究所の研究員を経て現職。麦酒大学准教授として、森林・湿地を対象に生物多様性の維持機構と環境変動の影響を研究している。生きものと人の関わりや、日常の題材から自然を理解する方法に関心がある。趣味はクラフトビール。`
                    : `e.g.
After earning a PhD in Ecology from Utakata University, they worked as a researcher at the Fermentation Research Institute and now serve as an Associate Professor at Beer University. Their research examines the mechanisms that maintain biodiversity and the impacts of environmental change in forest and wetland ecosystems. They are interested in relationships between people and living organisms, and in ways to understand nature through everyday topics. Hobby: craft beer.`}
                  className="w-full rounded-none border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
                />
                <p className="mt-1 text-xs text-[var(--muted)]">
                  <a href="#supported-markdown" onClick={openMarkdownGuide} className="underline hover:text-[var(--foreground)]">{text.markdownScrollHint}</a>
                </p>
              </label>
            </div>

            <div className="mt-5 border-t border-[var(--line)] pt-5 xl:mt-0 xl:border-t-0 xl:border-l xl:pl-6 xl:pt-0">
              {bio ? (
                <section>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent-deep)]">
                    {text.bioHeading}
                  </h4>
                  <MarkdownText content={bio} className="leading-relaxed text-[var(--muted)]" />
                </section>
              ) : (
                <p className="text-sm text-[var(--muted)]">{text.emptyHint}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="image-upload" className="mb-8 rounded-none bg-[var(--surface)] px-5 py-5 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">{text.uploadTitle}</h2>
        <p className="text-xs mb-4 text-[var(--muted)]">{text.uploadCopyrightNotice}</p>

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
                            ? "bg-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_88%,#000)]"
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

      <section id="submit-url" className="mb-8 scroll-mt-24 rounded-none bg-[var(--accent)] px-5 py-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">{text.submitTitle}</h2>
        <p className="mb-3 text-sm font-medium text-white/90">{text.submitHelp}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={createSubmissionUrl}
            className="inline-flex items-center rounded-md border-2 border-[#3a2417] bg-white px-4 py-2.5 text-sm font-semibold text-[#3a2417] shadow-[0_3px_0_#3a2417] transition hover:-translate-y-0.5 hover:bg-[#fff4ea] active:translate-y-0 active:shadow-[0_1px_0_#3a2417] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            {text.generateUrlButton}
          </button>
          <button
            type="button"
            onClick={saveSubmissionUrlAsText}
            className="inline-flex items-center rounded-md border-2 border-[#3a2417] bg-white px-4 py-2.5 text-sm font-semibold text-[#3a2417] shadow-[0_3px_0_#3a2417] transition hover:-translate-y-0.5 hover:bg-[#fff4ea] active:translate-y-0 active:shadow-[0_1px_0_#3a2417] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            {text.downloadUrlButton}
          </button>
        </div>

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
            {copyNotice === "savedTxt" && <p className="text-xs text-white">{text.savedTextFileMessage}</p>}
            {copyNotice === "error" && <p className="text-xs text-white">{text.copyErrorMessage}</p>}
          </div>
        )}
      </section>
      </div>

      <aside
        className="fixed top-24 z-30 hidden xl:block"
        style={{ right: "max(-10rem, calc((100vw - 48rem) / 2 - 28rem))", width: "15rem" }}
      >
        <nav
          aria-label={isJa ? "目次" : "Table of contents"}
          className="rounded-none bg-[color-mix(in_srgb,var(--surface)_80%,#d7d7d7)] px-4 py-4 backdrop-blur"
        >
          <ol className="space-y-1.5 text-sm leading-relaxed text-[var(--muted)]">
            {tocItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="block border-l-2 border-transparent pl-2 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-deep)]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </aside>
    </>
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
