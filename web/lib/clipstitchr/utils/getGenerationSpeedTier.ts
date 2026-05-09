import { DEFAULT_GENERATION_SPEED_TIER } from "@/lib/clipstitchr/constants/defaultGenerationSpeedTier";
import type { GenerationSpeedTier } from "@/lib/clipstitchr/types/GenerationSpeedTier";

export function getGenerationSpeedTier(value: string): GenerationSpeedTier {
  return value === "creator" || value === "pro" || value === "studio"
    ? value
    : DEFAULT_GENERATION_SPEED_TIER;
}
