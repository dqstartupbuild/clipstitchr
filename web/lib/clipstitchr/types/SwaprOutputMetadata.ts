import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";
import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";

export type SwaprOutputMetadata = {
  source: "swapr";
  sourcePhotoId: string;
  referenceUgcClipId: string;
  replicatePredictionId: string;
  replicatePredictionIds?: string[];
  modelId: string;
  mode: SwaprMode;
  characterOrientation: SwaprCharacterOrientation;
  prompt?: string;
  keepOriginalSound: boolean;
  sourceSegmentIndex?: number;
  sourceSegmentCount?: number;
  sourceSegmentStartSeconds?: number;
  sourceSegmentEndSeconds?: number;
  segmentClipIds?: string[];
};
