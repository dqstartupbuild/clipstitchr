import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";
import { getPlanChangeCreditAdjustment } from "./getPlanChangeCreditAdjustment";

export function getUpgradeAllowanceDelta(args: {
  currentPlanKey: PlanKey;
  nextPlanKey: PlanKey;
  now: string;
  periodEnd: string;
  periodStart: string;
}) {
  const currentPolicy = getPlanPolicy(args.currentPlanKey);
  const nextPolicy = getPlanPolicy(args.nextPlanKey);

  return {
    aiVideos: Math.max(
      0,
      nextPolicy.aiVideoLimit - currentPolicy.aiVideoLimit,
    ),
    creationCredits: getPlanChangeCreditAdjustment({
      currentCredits: currentPolicy.monthlyCreationCredits,
      nextCredits: nextPolicy.monthlyCreationCredits,
      now: args.now,
      periodEnd: args.periodEnd,
      periodStart: args.periodStart,
    }),
  };
}
