"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { HookOptionFeedbackBadge } from "@/app/_components/hooks/HookOptionFeedbackBadge";
import { Button } from "@/app/_components/ui/Button";
import type { StitchrHookVariant } from "@/lib/clipstitchr/types/StitchrHookVariant";

type HookPlanOptionItemProps = {
  isSaving: boolean;
  option: StitchrHookVariant;
  planId: string;
  selectedHook: string;
  onAccept: (id: string, hookText?: string) => Promise<void>;
  onReject: (id: string, hookText?: string) => Promise<void>;
  onSelectOption: (id: string, hookText: string) => Promise<void>;
};

export function HookPlanOptionItem({
  isSaving,
  option,
  planId,
  selectedHook,
  onAccept,
  onReject,
  onSelectOption,
}: HookPlanOptionItemProps) {
  return (
    <li className="rounded-md border border-border bg-white p-3 text-sm text-text-secondary">
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
          disabled={option.text === selectedHook || isSaving}
          title="Make active hook"
          onClick={() => onSelectOption(planId, option.text)}
        >
          {option.text === selectedHook ? "Active" : "Use"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={<ThumbsUp aria-hidden className="h-4 w-4" />}
          disabled={!option.text.trim() || option.feedbackStatus === "accepted"}
          isLoading={isSaving}
          title="Save as winner"
          onClick={() => onAccept(planId, option.text)}
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
          onClick={() => onReject(planId, option.text)}
        >
          Reject
        </Button>
      </div>
    </li>
  );
}
