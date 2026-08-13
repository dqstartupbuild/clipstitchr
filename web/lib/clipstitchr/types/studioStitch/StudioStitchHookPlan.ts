import type { StudioStitchHookFamily } from "./StudioStitchHookFamily";

export type StudioStitchHookPlan<Family extends StudioStitchHookFamily> = {
  readonly family: Family;
  readonly text: string;
  readonly groundingClaimIds: readonly string[];
};
