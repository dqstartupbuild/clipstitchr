"use client";

import { ChevronDown } from "lucide-react";
import { HookPlanOptionItem } from "@/app/_components/hooks/HookPlanOptionItem";
import type { StitchrHookVariant } from "@/lib/clipstitchr/types/StitchrHookVariant";

type HookPlanOptionsDetailsProps = {
  isSaving: boolean;
  options: StitchrHookVariant[];
  planId: string;
  selectedHook: string;
  onAccept: (id: string, hookText?: string) => Promise<void>;
  onReject: (id: string, hookText?: string) => Promise<void>;
  onSelectOption: (id: string, hookText: string) => Promise<void>;
};

export function HookPlanOptionsDetails({
  isSaving,
  options,
  planId,
  selectedHook,
  onAccept,
  onReject,
  onSelectOption,
}: HookPlanOptionsDetailsProps) {
  if (!options.length) {
    return null;
  }

  return (
    <details className="group mt-4 rounded-lg border border-border bg-surface-muted">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-bold text-text-primary marker:hidden">
        <span>
          View all {options.length} hook {options.length === 1 ? "option" : "options"}
        </span>
        <ChevronDown
          aria-hidden
          className="h-4 w-4 shrink-0 text-text-tertiary transition-transform group-open:rotate-180"
        />
      </summary>
      <ul className="grid gap-2 border-t border-border p-3">
        {options.map((option) => (
          <HookPlanOptionItem
            key={option.text}
            isSaving={isSaving}
            option={option}
            planId={planId}
            selectedHook={selectedHook}
            onAccept={onAccept}
            onReject={onReject}
            onSelectOption={onSelectOption}
          />
        ))}
      </ul>
    </details>
  );
}
