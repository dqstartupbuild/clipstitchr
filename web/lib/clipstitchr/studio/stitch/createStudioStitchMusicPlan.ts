import type { StudioStitchAssetRef } from "../../types/studioStitch/StudioStitchAssetRef";
import type { StudioStitchMusicPlan } from "../../types/studioStitch/StudioStitchMusicPlan";
import { isStudioStitchAssetRef } from "./isStudioStitchAssetRef";

type StudioStitchMusicDefaults = {
  readonly volume: number;
  readonly targetLufs: number | null;
  readonly fadeInSeconds: number;
  readonly fadeOutSeconds: number;
};

export function createStudioStitchMusicPlan(
  source: StudioStitchAssetRef | null,
  requestedVolume: number | undefined,
  defaults: StudioStitchMusicDefaults,
): StudioStitchMusicPlan {
  if (source === null) {
    return {
      state: "omitted",
      source: null,
      volume: 0,
      targetLufs: null,
      fadeInSeconds: 0,
      fadeOutSeconds: 0,
      loopToDuration: false,
    };
  }
  if (!isStudioStitchAssetRef(source)) {
    throw new Error("Music must use a supported durable asset reference.");
  }
  const volume = requestedVolume ?? defaults.volume;
  if (!Number.isFinite(volume) || volume < 0 || volume > 1) {
    throw new Error("Music volume must be between 0 and 1.");
  }
  return {
    state: "enabled",
    source,
    volume,
    targetLufs: defaults.targetLufs,
    fadeInSeconds: defaults.fadeInSeconds,
    fadeOutSeconds: defaults.fadeOutSeconds,
    loopToDuration: true,
  };
}
