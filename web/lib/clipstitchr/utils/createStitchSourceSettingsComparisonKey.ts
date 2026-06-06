import type { StitchSourceSettingsUpdate } from "@/lib/clipstitchr/types/StitchSourceSettingsUpdate";

type StitchSourceSettingsComparisonInput = Pick<
  StitchSourceSettingsUpdate,
  | "demoClipId"
  | "demoPlaybackRate"
  | "demoTrimRange"
  | "ugcClipId"
  | "ugcPlaybackRate"
  | "ugcTrimRange"
>;

export function createStitchSourceSettingsComparisonKey(
  sourceSettings: StitchSourceSettingsComparisonInput,
) {
  return JSON.stringify(sourceSettings);
}
