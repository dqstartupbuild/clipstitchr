import type { StitchSourceSettingsUpdate } from "@/lib/clipstitchr/types/StitchSourceSettingsUpdate";

type StitchSourceSettingsComparisonInput = Pick<
  StitchSourceSettingsUpdate,
  | "demoClipId"
  | "demoCropBounds"
  | "demoPlaybackRate"
  | "demoTrimRange"
  | "ugcClipId"
  | "ugcCropBounds"
  | "ugcPlaybackRate"
  | "ugcTrimRange"
>;

export function createStitchSourceSettingsComparisonKey(
  sourceSettings: StitchSourceSettingsComparisonInput,
) {
  return JSON.stringify(sourceSettings);
}
