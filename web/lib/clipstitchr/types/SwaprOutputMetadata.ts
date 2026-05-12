import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";
import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";

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
