import type { AvatarImageGenerationQuality } from "../../types/AvatarImageGenerationQuality";
import type { SwaprCharacterOrientation } from "../../types/SwaprCharacterOrientation";
import type { SwaprMode } from "../../types/SwaprMode";

export type PlanGenerationProfile = {
  avatarImageConcurrency: number;
  avatarImageQuality: AvatarImageGenerationQuality;
  publicSpeedLabel: "Standard" | "Priority processing" | "Highest priority";
  swaprCharacterOrientation: SwaprCharacterOrientation;
  swaprMode: SwaprMode;
};
