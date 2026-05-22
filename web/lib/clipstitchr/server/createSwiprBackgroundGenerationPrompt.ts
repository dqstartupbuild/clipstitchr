import { getSwiprBackgroundGenerationModelFamily } from "@/lib/clipstitchr/server/getSwiprBackgroundGenerationModelFamily";
import { getPrunaSwiprBackgroundPromptContext } from "@/lib/clipstitchr/server/getPrunaSwiprBackgroundPromptContext";
import type { SwiprBackgroundGenerationVariation } from "@/lib/clipstitchr/types/SwiprBackgroundGenerationVariation";
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

const prunaPresetDirections: Record<SwiprBackgroundPresetId, string> = {
  studio:
    "empty studio photography set, softbox lighting, polished surface, subtle depth",
  countertop:
    "empty countertop lifestyle scene, natural kitchen or desk surface, approachable daily-use setting",
  outdoor:
    "natural outdoor lifestyle backdrop, bright believable daylight, soft environmental detail",
  editorial:
    "premium lifestyle photography backdrop, intentional color styling, refined magazine-quality composition",
  minimal:
    "minimal photography backdrop, uncluttered surfaces, refined neutral space, generous open space",
};

export function createSwiprBackgroundGenerationPrompt({
  modelId = "openai/gpt-image-2",
  productContext,
  presetId,
  userPrompt,
  variation,
}: {
  modelId?: string;
  productContext: string;
  presetId: SwiprBackgroundPresetId;
  userPrompt?: string;
  variation?: SwiprBackgroundGenerationVariation;
}) {
  const context = productContext.trim().slice(0, 2400);
  const customPrompt = userPrompt?.trim().slice(0, 1000) ?? "";
  const modelFamily = getSwiprBackgroundGenerationModelFamily(modelId);
  const prunaContext = getPrunaSwiprBackgroundPromptContext(productContext);

  if (modelFamily !== "openai-gpt-image") {
    return [
      "Create one realistic vertical 9:16 portrait photography backdrop.",
      "Show an empty real-world scene with a clean center, generous open space in the upper and middle areas, natural depth, and believable lighting.",
      "Use plain unmarked surfaces, real materials, and an uncluttered composition.",
      "Keep important visual detail away from the outer edges.",
      `Visual direction: ${prunaPresetDirections[presetId]}.`,
      variation ? `Scene: ${variation.scene}.` : "",
      variation ? `Lighting: ${variation.lighting}.` : "",
      variation ? `Camera angle: ${variation.cameraAngle}.` : "",
      variation ? `Surface and texture: ${variation.surface}.` : "",
      variation ? `Color palette: ${variation.palette}.` : "",
      variation ? `Composition: ${variation.composition}.` : "",
      prunaContext ? `Scene mood notes: ${prunaContext}.` : "",
      customPrompt ? `User visual direction: ${customPrompt}.` : "",
      "Single continuous image with one uninterrupted scene.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  const sizeDirection =
    "Generate one realistic vertical 2:3 portrait background image for a TikTok carousel ad.";
  const framingDirection =
    "The image will be cropped to 9:16 and used behind app-rendered text overlays, so keep the center composition clean with large negative-space regions in the upper and middle thirds.";

  return [
    sizeDirection,
    framingDirection,
    "Do not include any visible words, typography, captions, signs, labels, logos, watermarks, UI, phone screens, posters, packaging text, or social-media interface elements.",
    "Avoid placing important details at the extreme edges.",
    `Visual direction: ${presetDirections[presetId]}.`,
    variation ? `Variation scene: ${variation.scene}.` : "",
    variation ? `Lighting: ${variation.lighting}.` : "",
    variation ? `Camera angle: ${variation.cameraAngle}.` : "",
    variation ? `Surface and material: ${variation.surface}.` : "",
    variation ? `Color palette: ${variation.palette}.` : "",
    variation ? `Composition rule: ${variation.composition}.` : "",
    context ? `Product and audience context: ${context}.` : "",
    customPrompt ? `User visual direction: ${customPrompt}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
