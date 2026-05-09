import type { GenerationSpeedTier } from "@/lib/clipstitchr/types/GenerationSpeedTier";
import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";
import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";
import type { SwaprPredictionStatus } from "@/lib/clipstitchr/types/SwaprPredictionStatus";

export type SwaprPredictionResponse = {
  characterOrientation?: SwaprCharacterOrientation;
  generationSpeedTier?: GenerationSpeedTier;
  id: string;
  mode?: SwaprMode;
  status: SwaprPredictionStatus;
  output?: unknown;
  error?: unknown;
  logs?: string;
  urls?: {
    get?: string;
    web?: string;
    cancel?: string;
  };
};
