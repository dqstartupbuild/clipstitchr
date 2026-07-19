import { formatQuickEditDetectorCandidatesForPrompt } from "@/lib/clipstitchr/server/formatQuickEditDetectorCandidatesForPrompt";
import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";
import type { UploadAssetAnalysisKind } from "@/lib/clipstitchr/types/UploadAssetAnalysisKind";

export function createUploadVideoFallbackAnalysisPrompt({
  detectorCandidates = [],
  mediaKind,
  originalName,
}: {
  detectorCandidates?: QuickEditCandidate[];
  mediaKind: UploadAssetAnalysisKind;
  originalName: string;
}) {
  const fileName = originalName || "unknown";

  if (mediaKind === "demo-video" || mediaKind === "video") {
    return [
      "Analyze the uploaded product demo video for a local marketing asset library.",
      `Original file name: ${fileName}.`,
      "Return compact JSON only with this shape:",
      '{"name":"short title","tags":["tag"],"videoDescription":"summary plus short timestamped play-by-play","productDescription":"visible product, interface, packaging, or service only","locationDescription":"visible setting only","poseDescription":"visible action or demo steps in order","performanceScore":{"overall":0,"hook":0,"cameraPresence":0,"pacing":0,"clarity":0,"platformFit":0,"stitchFit":0,"summary":"short reason","bestUse":"best use","strengths":["short strength"],"fixes":["short fix"],"quickEditSuggestions":{"trimStart":0,"trimEnd":null,"candidates":[{"start":3.5,"end":6.2,"confidence":0.82,"signals":["static-frame","low-motion"],"reason":"Nothing changes visually.","stats":"Little visible motion."}],"removeRanges":[{"start":3.7,"end":6,"reason":"Nothing changes visually."}],"crop":{"mode":"smart-9x16","removeBlackBars":true,"reason":"Better vertical framing."},"summary":"Tighten the slow parts."}}}',
      "Keep every field short enough to fit under 512 output tokens.",
      "Use lowercase tags. Do not guess private identity, demographics, brands, pricing, or claims.",
      "Return an empty string for product, location, or action fields that do not fit the visible demo. Do not fill fields with unrelated details.",
      "Every score is 0 to 100, not 0 to 10. Use 50 to 75 for an average usable clip and only use very low scores for unusable clips.",
      "Base the score only on visible short-form posting usefulness.",
      "Do not suggest new text overlay copy.",
      ...formatQuickEditDetectorCandidatesForPrompt(detectorCandidates),
      "Use quickEditSuggestions.candidates for detector-style ranges, then use removeRanges only for ranges worth reviewing in the manual cut editor.",
    ].join("\n");
  }

  return [
    "Analyze the uploaded UGC video for a local marketing asset library.",
    `Original file name: ${fileName}.`,
    "Return compact JSON only with this shape:",
    '{"name":"short title","tags":["tag"],"videoDescription":"summary plus short timestamped play-by-play","mainPersonDescription":"non-sensitive visual description of the main visible person only","outfitDescription":"visible clothing and accessories only","locationDescription":"visible setting only","poseDescription":"visible action sequence in order","performanceScore":{"overall":0,"hook":0,"cameraPresence":0,"pacing":0,"clarity":0,"platformFit":0,"stitchFit":0,"summary":"short reason","bestUse":"best use","strengths":["short strength"],"fixes":["short fix"],"quickEditSuggestions":{"trimStart":0,"trimEnd":null,"candidates":[{"start":3.5,"end":6.2,"confidence":0.82,"signals":["static-frame","low-motion"],"reason":"Nothing changes visually.","stats":"Little visible motion."}],"removeRanges":[{"start":3.7,"end":6,"reason":"Nothing changes visually."}],"crop":{"mode":"smart-9x16","removeBlackBars":true,"reason":"Better vertical framing."},"summary":"Tighten the slow parts."}}}',
    "Keep every field short enough to fit under 512 output tokens.",
    "Do not guess private identity, race, ethnicity, nationality, religion, gender identity, health, disability, or other sensitive traits.",
    "Return an empty string for person, outfit, location, or action fields that do not fit the visible UGC. Do not fill fields with unrelated details.",
    "Every score is 0 to 100, not 0 to 10. Use 50 to 75 for an average usable clip and only use very low scores for unusable clips.",
    "Base the score only on visible short-form posting usefulness.",
    "Do not suggest new text overlay copy.",
    ...formatQuickEditDetectorCandidatesForPrompt(detectorCandidates),
    "Use quickEditSuggestions.candidates for detector-style ranges, then use removeRanges only for ranges worth reviewing in the manual cut editor.",
  ].join("\n");
}
