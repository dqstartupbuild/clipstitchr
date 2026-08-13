import type { StudioStitchGroundingClaimSource } from "./StudioStitchGroundingClaimSource";

export type StudioStitchGroundingClaim = {
  readonly id: string;
  readonly text: string;
  readonly source: StudioStitchGroundingClaimSource;
};
