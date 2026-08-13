import type { StudioStitchAssetRef } from "./StudioStitchAssetRef";

export type StudioStitchMusicPlan = {
  readonly state: "enabled" | "omitted";
  readonly source: StudioStitchAssetRef | null;
  readonly volume: number;
  readonly targetLufs: number | null;
  readonly fadeInSeconds: number;
  readonly fadeOutSeconds: number;
  readonly loopToDuration: boolean;
};
