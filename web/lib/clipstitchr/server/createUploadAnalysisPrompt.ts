import type { UploadAssetAnalysisKind } from "@/lib/clipstitchr/types/UploadAssetAnalysisKind";

export function createUploadAnalysisPrompt({
  mediaKind,
  originalName,
}: {
  mediaKind: UploadAssetAnalysisKind;
  originalName: string;
}) {
  if (mediaKind === "photo") {
    return [
      "Analyze the uploaded avatar photo for a local marketing asset library.",
      `Original file name: ${originalName || "unknown"}.`,
      "Return compact JSON only with this exact shape:",
      '{"name":"short descriptive title","tags":["tag one","tag two"],"avatarDescription":"detailed non-sensitive visual identity description of the person only","outfitDescription":"visible clothing and accessories only","locationDescription":"visible setting or background only","poseDescription":"visible pose, body position, gesture, or action only"}',
      "Use a clear title of 2 to 6 words with no file extension.",
      "Use 3 to 8 lowercase tags for visible content, setting, action, style, or mood.",
      "For avatarDescription, describe the visible person as specifically as possible using stable, non-sensitive visual traits that help recreate the same avatar: face shape, hair style and color, facial hair when visible, eyes, brows, nose, lips, skin tone as visually apparent, build, and distinctive non-sensitive features.",
      "The avatarDescription must include zero information about clothing, accessories, background, location, pose, posture, gesture, body position, scene, camera setting, or activity.",
      "Put clothing and accessories only in outfitDescription. Put the background, location, environment, and scene context only in locationDescription. Put pose, posture, gesture, body position, and activity only in poseDescription.",
      "Do not guess private identity, race, ethnicity, nationality, religion, gender identity, health, disability, or other sensitive traits.",
      "If the image does not clearly show a person, set avatarDescription to an empty string.",
    ].join("\n");
  }

  const subject =
    "this representative frame from the uploaded video";

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
