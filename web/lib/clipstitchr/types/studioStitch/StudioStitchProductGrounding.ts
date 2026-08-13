import type { StudioStitchGroundingClaim } from "./StudioStitchGroundingClaim";

export type StudioStitchProductGrounding = {
  readonly productId: string;
  readonly productName: string;
  readonly claims: readonly StudioStitchGroundingClaim[];
};
