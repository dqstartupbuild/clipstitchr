import type { HookLabReviewOption } from "@/lib/clipstitchr/types/HookLabReviewOption";
import type { HookLabReviewState } from "@/lib/clipstitchr/types/HookLabReviewState";
import type { StitchrHookPlanSource } from "@/lib/clipstitchr/types/StitchrHookPlanSource";

type HookLabReviewOptionDocument = {
  angle: string;
  createdAt: string;
  hook: string;
  id: string;
  isSelected: boolean;
  linkedIdeaId?: string;
  planCreatedAt: string;
  planId: string;
  planSource: string;
  productId?: string;
  productName?: string;
  rank: number;
  reason: string;
  reviewState: string;
  stitchId?: string;
  updatedAt: string;
};

export function createHookLabReviewOptionFromConvexDocument(
  document: HookLabReviewOptionDocument,
): HookLabReviewOption {
  return {
    ...document,
    planSource: document.planSource as StitchrHookPlanSource,
    reviewState: document.reviewState as HookLabReviewState,
  };
}
