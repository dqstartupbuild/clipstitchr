import type { Doc } from "@/convex/_generated/dataModel";
import type { StitchrHookFeedbackStatus } from "@/lib/clipstitchr/types/StitchrHookFeedbackStatus";
import type { StitchrHookPlan } from "@/lib/clipstitchr/types/StitchrHookPlan";
import type { StitchrHookPlanSource } from "@/lib/clipstitchr/types/StitchrHookPlanSource";
import type { StitchrHookPlanStatus } from "@/lib/clipstitchr/types/StitchrHookPlanStatus";

export function createStitchrHookPlanFromConvexDocument(
  plan: Doc<"stitchrHookPlans">,
): StitchrHookPlan {
  return {
    acceptedAt: plan.acceptedAt,
    angle: plan.angle,
    automationRunId: plan.automationRunId,
    automationTaskId: plan.automationTaskId,
    caption: plan.caption,
    createdAt: plan.createdAt,
    demoClipId: plan.demoClipId,
    demoClipName: plan.demoClipName,
    feedbackStatus: plan.feedbackStatus as StitchrHookFeedbackStatus | undefined,
    hashtags: plan.hashtags,
    hookOptions: plan.hookOptions,
    id: plan.id,
    productId: plan.productId,
    productName: plan.productName,
    providerModel: plan.providerModel,
    providerPredictionId: plan.providerPredictionId,
    reason: plan.reason,
    rejectedAt: plan.rejectedAt,
    rejectionReason: plan.rejectionReason,
    selectedHook: plan.selectedHook,
    socialCaption: plan.socialCaption,
    source: plan.source as StitchrHookPlanSource,
    status: plan.status as StitchrHookPlanStatus,
    stitchId: plan.stitchId,
    ugcClipId: plan.ugcClipId,
    ugcClipName: plan.ugcClipName,
    updatedAt: plan.updatedAt,
  };
}
