import type { HookLabReviewState } from "@/lib/clipstitchr/types/HookLabReviewState";
import type { StitchrHookPlanSource } from "@/lib/clipstitchr/types/StitchrHookPlanSource";

export type HookLabReviewOption = {
  angle: string;
  createdAt: string;
  hook: string;
  id: string;
  isSelected: boolean;
  linkedIdeaId?: string;
  planCreatedAt: string;
  planId: string;
  planSource: StitchrHookPlanSource;
  productId?: string;
  productName?: string;
  rank: number;
  reason: string;
  reviewState: HookLabReviewState;
  stitchId?: string;
  updatedAt: string;
};
