import type { PlanGenerationProfile } from "./types/PlanGenerationProfile";
import type { PlanKey } from "./types/PlanKey";

const planGenerationProfiles = {
  starter: {
    avatarImageConcurrency: 1,
    avatarImageQuality: "auto",
    publicSpeedLabel: "Standard",
    swaprCharacterOrientation: "image",
    swaprMode: "pro",
  },
  pro: {
    avatarImageConcurrency: 2,
    avatarImageQuality: "medium",
    publicSpeedLabel: "Priority processing",
    swaprCharacterOrientation: "image",
    swaprMode: "std",
  },
  agency: {
    avatarImageConcurrency: 4,
    avatarImageQuality: "medium",
    publicSpeedLabel: "Highest priority",
    swaprCharacterOrientation: "image",
    swaprMode: "std",
  },
} satisfies Record<PlanKey, PlanGenerationProfile>;

export function getPlanGenerationProfile(planKey: PlanKey) {
  return planGenerationProfiles[planKey];
}
