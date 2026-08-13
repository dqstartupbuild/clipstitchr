import type { StudioStitchTextOverlayRole } from "./StudioStitchTextOverlayRole";
import type { StudioStitchTextStyle } from "./StudioStitchTextStyle";

export type StudioStitchTextOverlayPlan = {
  readonly id: string;
  readonly role: StudioStitchTextOverlayRole;
  readonly text: string;
  readonly startSeconds: number;
  readonly endSeconds: number;
  readonly centerXPixels: number;
  readonly centerYPixels: number;
  readonly style: StudioStitchTextStyle;
  readonly emphasis: boolean;
  readonly groundingClaimIds: readonly string[];
};
