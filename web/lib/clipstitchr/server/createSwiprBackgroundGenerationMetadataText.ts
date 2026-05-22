import type { SwiprBackgroundGenerationVariation } from "@/lib/clipstitchr/types/SwiprBackgroundGenerationVariation";

export function createSwiprBackgroundGenerationMetadataText(
  variation: SwiprBackgroundGenerationVariation,
  userPrompt = "",
) {
  const customPrompt = userPrompt.trim().slice(0, 1000);

  return [
    `Category: ${variation.category}`,
    `Preset: ${variation.presetId}`,
    `Scene: ${variation.scene}`,
    `Lighting: ${variation.lighting}`,
    `Camera angle: ${variation.cameraAngle}`,
    `Surface: ${variation.surface}`,
    `Palette: ${variation.palette}`,
    `Composition: ${variation.composition}`,
    customPrompt ? `User prompt: ${customPrompt}` : "",
  ]
    .filter(Boolean)
    .join("; ");
}
