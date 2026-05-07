import type { SwaprCharacterOrientation } from "@/lib/clipr/types/SwaprCharacterOrientation";
import type { SwaprMode } from "@/lib/clipr/types/SwaprMode";

export type SwaprOutputMetadata = {
  source: "swapr";
  sourcePhotoId: string;
  referenceUgcClipId: string;
  replicatePredictionId: string;
  modelId: string;
  mode: SwaprMode;
  characterOrientation: SwaprCharacterOrientation;
  prompt?: string;
  keepOriginalSound: boolean;
};
