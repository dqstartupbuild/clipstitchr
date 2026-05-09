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

  if (mediaKind === "ugc-video") {
    return [
      "Analyze this representative frame from the uploaded UGC video for a local marketing asset library.",
      `Original file name: ${originalName || "unknown"}.`,
      "Return compact JSON only with this exact shape:",
      '{"name":"short descriptive title","tags":["tag one","tag two"],"videoDescription":"plain-language description of the visible video scene and likely marketing moment","mainPersonDescription":"detailed non-sensitive visual description of the main visible person only","outfitDescription":"visible clothing and accessories only","locationDescription":"visible setting or background only","poseDescription":"visible pose, body position, gesture, or action only"}',
      "Use a clear title of 2 to 6 words with no file extension.",
      "Use 3 to 8 lowercase tags for visible content, setting, product/category cues, action, style, or mood.",
      "For videoDescription, describe the visible scene as a useful UGC clip summary: what is happening, the main subject, product/category cues, mood, and framing. Keep it grounded in what is visible.",
      "For mainPersonDescription, describe the visible person as specifically as possible using stable, non-sensitive visual traits: face shape, hair style and color, facial hair when visible, eyes, brows, nose, lips, skin tone as visually apparent, build, and distinctive non-sensitive features.",
      "The mainPersonDescription must include zero information about clothing, accessories, background, location, pose, posture, gesture, body position, scene, camera setting, or activity.",
      "Put clothing and accessories only in outfitDescription. Put the background, location, environment, and scene context only in locationDescription. Put pose, posture, gesture, body position, and activity only in poseDescription.",
      "Do not guess private identity, race, ethnicity, nationality, religion, gender identity, health, disability, or other sensitive traits.",
      "If a person is not clearly visible, set mainPersonDescription to an empty string.",
    ].join("\n");
  }

  if (mediaKind === "demo-video" || mediaKind === "video") {
    return [
      "Analyze this representative frame from the uploaded product demo video for a local marketing asset library.",
      `Original file name: ${originalName || "unknown"}.`,
      "Return compact JSON only with this exact shape:",
      '{"name":"short descriptive title","tags":["tag one","tag two"],"videoDescription":"plain-language description of what is happening in the demo","productDescription":"detailed grounded description of the visible product, interface, packaging, or service being demonstrated","locationDescription":"visible setting, screen, surface, or background only","poseDescription":"visible action, movement, interaction, or demo step only"}',
      "Use a clear title of 2 to 6 words with no file extension.",
      "Use 3 to 8 lowercase tags for visible content, setting, product/category cues, action, style, or mood.",
      "For videoDescription, describe the demo moment: what the viewer sees, what is being shown, how it is framed, and what part of the product or workflow is happening.",
      "For productDescription, describe the visible product or demonstrated offering in detail: shape, color, packaging, screen/UI state, labels only if clearly legible, product category, components, and any visible before/after or result.",
      "Put visible surroundings only in locationDescription. Put motion, user interaction, screen step, hand action, or product use only in poseDescription.",
      "Do not guess private identity, demographics, brands, pricing, claims, or sensitive traits.",
    ].join("\n");
  }

  return [
    "Analyze this representative frame from the uploaded video for a local marketing asset library.",
    `Original file name: ${originalName || "unknown"}.`,
    "Return compact JSON only with this exact shape:",
    '{"name":"short descriptive title","tags":["tag one","tag two"]}',
    "Use a clear title of 2 to 6 words with no file extension.",
    "Use 3 to 8 lowercase tags for visible content, setting, product/category cues, action, style, or mood.",
    "Avoid guessing private identity, demographics, brands, or sensitive traits.",
  ].join("\n");
}
