import type { StudioStitchAssetRef } from "./StudioStitchAssetRef";
import type { StudioStitchSegmentRole } from "./StudioStitchSegmentRole";

export type StudioStitchSegmentPlan = {
  readonly id: string;
  readonly order: number;
  readonly role: StudioStitchSegmentRole;
  readonly source: StudioStitchAssetRef;
  readonly sourceDurationSeconds: number;
  readonly sourceOffsetSeconds: number;
  readonly playbackRate: number;
  readonly timelineStartSeconds: number;
  readonly timelineDurationSeconds: number;
  readonly fit: "cover" | "contain";
  readonly audio: "muted" | "source";
  readonly creatorContinuityKey: string | null;
};
