"use client";

import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { HookOptionFeedbackBadge } from "@/app/_components/hooks/HookOptionFeedbackBadge";
import { HookPlanStatusBadge } from "@/app/_components/library/HookPlanStatusBadge";
import { Button } from "@/app/_components/ui/Button";
import type { StitchrHookPlan } from "@/lib/clipstitchr/types/StitchrHookPlan";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { getStitchrHookPlanSourceLabel } from "@/lib/clipstitchr/utils/getStitchrHookPlanSourceLabel";

type HookPlanCardProps = {
  isSaving: boolean;
  plan: StitchrHookPlan;
  onAccept: (id: string, hookText?: string) => Promise<void>;
  onReject: (id: string, hookText?: string) => Promise<void>;
  onSelectOption: (id: string, hookText: string) => Promise<void>;
};

export function HookPlanCard({
  isSaving,
  plan,
  onAccept,
  onReject,
  onSelectOption,
}: HookPlanCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const canUseHook = Boolean(
    plan.status !== "failed" && plan.selectedHook.trim(),
  );

  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm shadow-slate-200/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <HookPlanStatusBadge
              feedbackStatus={plan.feedbackStatus}
              status={plan.status}
            />
            <span className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
              {getStitchrHookPlanSourceLabel(plan.source)}
            </span>
            <span className="text-xs font-semibold text-text-tertiary">
              {formatDate(plan.createdAt)}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-bold leading-snug text-text-primary">
            {plan.selectedHook || "Hook planning fell back to the worker"}
          </h3>
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-text-secondary">
        {plan.productName ? <p>{plan.productName}</p> : null}
        {plan.ugcClipName || plan.demoClipName ? (
          <p>
            {[plan.ugcClipName, plan.demoClipName].filter(Boolean).join(" + ")}
          </p>
        ) : null}
        {plan.caption ? <p>{plan.caption}</p> : null}
        {plan.hashtags.length ? (
          <p className="font-semibold text-text-primary">
            {plan.hashtags.join(" ")}
          </p>
        ) : null}
      </div>
      {plan.hookOptions.length ? (
        <div className="mt-4 rounded-lg border border-border bg-surface-muted p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
            Options
          </p>
          <ul className="mt-2 grid gap-2">
            {plan.hookOptions.map((option) => (
              <li
                key={option.text}
                className="rounded-md border border-border bg-white p-3 text-sm text-text-secondary"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-text-primary">
                      {option.text}
                    </p>
                    {option.angle ? (
                      <p className="mt-1 text-xs font-semibold text-accent-dark">
                        {option.angle}
                      </p>
                    ) : null}
                  </div>
                  <HookOptionFeedbackBadge status={option.feedbackStatus} />
                </div>
                {option.reason ? (
                  <p className="mt-2 text-xs leading-5 text-text-secondary">
                    {option.reason}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={option.text === plan.selectedHook || isSaving}
                    title="Make active hook"
                    onClick={() => onSelectOption(plan.id, option.text)}
                  >
                    {option.text === plan.selectedHook ? "Active" : "Use"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    icon={<ThumbsUp aria-hidden className="h-4 w-4" />}
                    disabled={!option.text.trim() || option.feedbackStatus === "accepted"}
                    isLoading={isSaving}
                    title="Save as winner"
                    onClick={() => onAccept(plan.id, option.text)}
                  >
                    Accept
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    icon={<ThumbsDown aria-hidden className="h-4 w-4" />}
                    disabled={!option.text.trim() || option.feedbackStatus === "rejected"}
                    isLoading={isSaving}
                    title="Add to avoid list"
                    onClick={() => onReject(plan.id, option.text)}
                  >
                    Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={
            isCopied ? (
              <Check aria-hidden className="h-4 w-4" />
            ) : (
              <Copy aria-hidden className="h-4 w-4" />
            )
          }
          disabled={!canUseHook}
          title="Copy hook"
          onClick={async () => {
            await navigator.clipboard.writeText(plan.selectedHook);
            setIsCopied(true);
            window.setTimeout(() => setIsCopied(false), 1500);
          }}
        >
          {isCopied ? "Copied" : "Copy"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={<ThumbsUp aria-hidden className="h-4 w-4" />}
          disabled={!canUseHook || plan.feedbackStatus === "accepted"}
          isLoading={isSaving}
          title="Save as winner"
          onClick={() => onAccept(plan.id)}
        >
          Accept hook
        </Button>
        <Button
          type="button"
          size="sm"
          variant="danger"
          icon={<ThumbsDown aria-hidden className="h-4 w-4" />}
          disabled={!canUseHook || plan.feedbackStatus === "rejected"}
          isLoading={isSaving}
          title="Add to avoid list"
          onClick={() => onReject(plan.id)}
        >
          Reject hook
        </Button>
      </div>
    </article>
  );
}
