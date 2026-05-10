import type { SwiprBackgroundPresetId } from "@/lib/clipstitchr/types/SwiprBackgroundPresetId";

const presetDirections: Record<SwiprBackgroundPresetId, string> = {
  studio:
    "clean product studio, realistic softbox lighting, polished commercial surface, subtle depth",
  countertop:
    "realistic countertop lifestyle scene, natural kitchen or desk surface, approachable daily-use setting",
  outdoor:
    "natural outdoor lifestyle backdrop, bright believable daylight, soft environment detail",
  editorial:
    "premium editorial advertising backdrop, intentional color styling, high-end magazine composition",
  minimal:
    "minimal commercial backdrop, uncluttered surfaces, refined neutral space, generous negative space",
};

export function createSwiprBackgroundGenerationPrompt({
  productContext,
  presetId,
}: {
  productContext: string;
  presetId: SwiprBackgroundPresetId;
}) {
  const context = productContext.trim().slice(0, 2400);

  return [
    "Generate one realistic vertical 2:3 portrait background image for a TikTok carousel ad.",
    "The image will be cropped to 9:16 and used behind app-rendered text overlays, so keep the center composition clean with large negative-space regions in the upper and middle thirds.",
    "Do not include any visible words, typography, captions, signs, labels, logos, watermarks, UI, phone screens, posters, packaging text, or social-media interface elements.",
    "Avoid placing important details at the extreme edges.",
    `Visual direction: ${presetDirections[presetId]}.`,
    context ? `Product and audience context: ${context}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
