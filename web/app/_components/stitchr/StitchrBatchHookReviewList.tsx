"use client";

import { StitchrHookOptionSelector } from "@/app/_components/stitchr/StitchrHookOptionSelector";
import type { StitchrHookPlan } from "@/lib/clipstitchr/types/StitchrHookPlan";

type StitchrBatchHookReviewListProps = {
  hookPlans: StitchrHookPlan[];
  savingPlanId: string | null;
  onAcceptHookVariant: (planId: string, hookText: string) => void;
  onRejectHookVariant: (planId: string, hookText: string) => void;
  onSelectHookVariant: (planId: string, hookText: string) => void;
};

export function StitchrBatchHookReviewList({
  hookPlans,
  savingPlanId,
  onAcceptHookVariant,
  onRejectHookVariant,
  onSelectHookVariant,
}: StitchrBatchHookReviewListProps) {
  if (!hookPlans.length) {
    return null;
  }

  return (
    <section className="mt-4 rounded-lg border border-border bg-white p-4">
      <h3 className="text-sm font-bold text-text-primary">
        Recent batch hooks
      </h3>
      <div className="mt-3 grid gap-3">
        {hookPlans.map((plan) => (
          <article
            key={plan.id}
            className="rounded-lg border border-border bg-surface p-3"
          >
            <div className="min-w-0">
              <p className="break-words text-sm font-bold text-text-primary">
                {[plan.ugcClipName, plan.demoClipName].filter(Boolean).join(" + ")}
              </p>
              {plan.productName ? (
                <p className="mt-1 text-xs font-semibold text-text-tertiary">
                  {plan.productName}
                </p>
              ) : null}
            </div>
            <StitchrHookOptionSelector
              hookPlanId={plan.id}
              hookVariants={plan.hookOptions}
              isSaving={savingPlanId === plan.id}
              selectedHook={plan.selectedHook}
              onAcceptHookVariant={(hookText) =>
                onAcceptHookVariant(plan.id, hookText)
              }
              onRejectHookVariant={(hookText) =>
                onRejectHookVariant(plan.id, hookText)
              }
              onSelectHookVariant={(hookText) =>
                onSelectHookVariant(plan.id, hookText)
              }
            />
          </article>
        ))}
      </div>
    </section>
  );
}
