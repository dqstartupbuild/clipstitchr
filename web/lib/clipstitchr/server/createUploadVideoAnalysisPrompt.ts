import { createClipPerformanceScorePromptLines } from "@/lib/clipstitchr/server/createClipPerformanceScorePromptLines";
import type { UploadAssetAnalysisKind } from "@/lib/clipstitchr/types/UploadAssetAnalysisKind";

export function createUploadVideoAnalysisPrompt({
  mediaKind,
  originalName,
}: {
  mediaKind: UploadAssetAnalysisKind;
  originalName: string;
}) {
  if (mediaKind === "ugc-video") {
    return [
      "Analyze the full uploaded UGC video for a local marketing asset library.",
      `Original file name: ${originalName || "unknown"}.`,
      "Return compact JSON only with this exact shape:",
      '{"name":"short descriptive title","tags":["tag one","tag two"],"videoDescription":"plain-language full-video summary followed by a timestamped play-by-play of what happens in order","mainPersonDescription":"detailed non-sensitive visual description of the main visible person only","outfitDescription":"visible clothing and accessories only","locationDescription":"visible setting or background only","poseDescription":"timestamped action, body movement, gesture, product handling, camera movement, or scene-change breakdown only","performanceScore":{"overall":0,"hook":0,"cameraPresence":0,"pacing":0,"clarity":0,"platformFit":0,"stitchFit":0,"summary":"one short reason for the score","bestUse":"where this UGC fits best","strengths":["short strength"],"fixes":["short fix"]}}',
      "Use a clear title of 2 to 6 words with no file extension.",
      "Use 3 to 8 lowercase tags for visible content, setting, product/category cues, action, style, or mood.",
      "For videoDescription, analyze the actual video over time, not a single frame. Include a concise summary, then a timestamped play-by-play using approximate time ranges such as 0-2s, 2-5s, and 5-8s.",
      "For poseDescription, describe the visible action sequence only: gestures, posture shifts, object handling, scene cuts, camera movement, and interaction beats in chronological order.",
      "For mainPersonDescription, describe the main visible person as specifically as possible using stable, non-sensitive visual traits: face shape, hair style and color, facial hair when visible, eyes, brows, nose, lips, skin tone as visually apparent, build, and distinctive non-sensitive features.",
      "The mainPersonDescription must include zero information about clothing, accessories, background, location, pose, posture, gesture, body position, scene, camera setting, or activity.",
      "Put clothing and accessories only in outfitDescription. Put the background, location, environment, and scene context only in locationDescription.",
      "Do not guess private identity, race, ethnicity, nationality, religion, gender identity, health, disability, or other sensitive traits.",
      "If a person is not clearly visible, set mainPersonDescription to an empty string.",
      ...createClipPerformanceScorePromptLines(mediaKind),
    ].join("\n");
  }

  return [
    "Analyze the full uploaded product demo video for a local marketing asset library.",
    `Original file name: ${originalName || "unknown"}.`,
    "Return compact JSON only with this exact shape:",
    '{"name":"short descriptive title","tags":["tag one","tag two"],"videoDescription":"plain-language full-demo summary followed by a timestamped play-by-play of what happens in order","productDescription":"detailed grounded description of the visible product, interface, packaging, or service being demonstrated","locationDescription":"visible setting, screen, surface, or background only","poseDescription":"timestamped demo action, movement, interaction, screen step, hand action, camera movement, or scene-change breakdown only","performanceScore":{"overall":0,"hook":0,"cameraPresence":0,"pacing":0,"clarity":0,"platformFit":0,"stitchFit":0,"summary":"one short reason for the score","bestUse":"where this demo fits best","strengths":["short strength"],"fixes":["short fix"]}}',
    "Use a clear title of 2 to 6 words with no file extension.",
    "Use 3 to 8 lowercase tags for visible content, setting, product/category cues, action, style, or mood.",
    "For videoDescription, analyze the actual video over time, not a single frame. Include a concise summary, then a timestamped play-by-play using approximate time ranges such as 0-2s, 2-5s, and 5-8s.",
    "For productDescription, describe the visible product or demonstrated offering in detail: shape, color, packaging, screen/UI state, labels only if clearly legible, product category, components, and any visible before/after or result.",
    "For poseDescription, describe the demo sequence only: user interactions, screen steps, hand actions, product use, scene cuts, camera movement, and result beats in chronological order.",
    "Put visible surroundings only in locationDescription.",
    "Do not guess private identity, demographics, brands, pricing, claims, or sensitive traits.",
    ...createClipPerformanceScorePromptLines(mediaKind),
  ].join("\n");
}
