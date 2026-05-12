import type { SwiprBackgroundGenerationVariation } from "@/lib/clipstitchr/types/SwiprBackgroundGenerationVariation";

export function createSwiprBackgroundGenerationMetadataText(
  variation: SwiprBackgroundGenerationVariation,
) {
  return [
    `Category: ${variation.category}`,
    `Preset: ${variation.presetId}`,
    `Scene: ${variation.scene}`,
    `Lighting: ${variation.lighting}`,
    `Camera angle: ${variation.cameraAngle}`,
    `Surface: ${variation.surface}`,
    `Palette: ${variation.palette}`,
    `Composition: ${variation.composition}`,
  ].join("; ");
}
