import type { UploadAssetAnalysisKind } from "@/lib/clipstitchr/types/UploadAssetAnalysisKind";

export function createUploadAnalysisPrompt({
  mediaKind,
  originalName,
}: {
  mediaKind: UploadAssetAnalysisKind;
  originalName: string;
}) {
  const subject =
    mediaKind === "photo"
      ? "the uploaded photo"
      : "this representative frame from the uploaded video";

  return [
    `Analyze ${subject} for a local marketing asset library.`,
    `Original file name: ${originalName || "unknown"}.`,
    "Return compact JSON only with this exact shape:",
    '{"name":"short descriptive title","tags":["tag one","tag two"]}',
    "Use a clear title of 2 to 6 words with no file extension.",
    "Use 3 to 8 lowercase tags for visible content, setting, product/category cues, action, style, or mood.",
    "Avoid guessing private identity, demographics, brands, or sensitive traits.",
  ].join("\n");
}
