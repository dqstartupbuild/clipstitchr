import type { SwiprBackgroundGenerationCategory } from "@/lib/clipstitchr/types/SwiprBackgroundGenerationCategory";
import type { SwiprBackgroundPresetId } from "@/lib/clipstitchr/types/SwiprBackgroundPresetId";

export type SwiprBackgroundGenerationVariation = {
  cameraAngle: string;
  category: SwiprBackgroundGenerationCategory;
  composition: string;
  lighting: string;
  palette: string;
  presetId: SwiprBackgroundPresetId;
  scene: string;
  surface: string;
};
