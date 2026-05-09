import type { AvatarImageGenerationQuality } from "@/lib/clipstitchr/types/AvatarImageGenerationQuality";
import type { GenerationSpeedTier } from "@/lib/clipstitchr/types/GenerationSpeedTier";
import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";
import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";

type GenerationSpeedTierProfile = {
  avatarImageConcurrency: number;
  avatarImageQuality: AvatarImageGenerationQuality;
  publicSpeedLabel: "Slow" | "Fast" | "Faster";
  swaprCharacterOrientation: SwaprCharacterOrientation;
  swaprMode: SwaprMode;
};

const GENERATION_SPEED_TIER_PROFILES = {
  creator: {
    avatarImageConcurrency: 1,
    avatarImageQuality: "auto",
    publicSpeedLabel: "Slow",
    swaprCharacterOrientation: "image",
    swaprMode: "pro",
  },
  pro: {
    avatarImageConcurrency: 2,
    avatarImageQuality: "medium",
    publicSpeedLabel: "Fast",
    swaprCharacterOrientation: "image",
    swaprMode: "std",
  },
  studio: {
    avatarImageConcurrency: 4,
    avatarImageQuality: "medium",
    publicSpeedLabel: "Faster",
    swaprCharacterOrientation: "image",
    swaprMode: "std",
  },
} satisfies Record<GenerationSpeedTier, GenerationSpeedTierProfile>;

export function getGenerationSpeedTierProfile(
  tier: GenerationSpeedTier,
): GenerationSpeedTierProfile {
  return GENERATION_SPEED_TIER_PROFILES[tier];
}
