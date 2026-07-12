"use client";

import { SelectInput } from "@/app/_components/ui/SelectInput";
import { hookEdgeLevelOptions } from "@/lib/clipstitchr/constants/hookEdgeLevelOptions";
import { hookGenerationGoalOptions } from "@/lib/clipstitchr/constants/hookGenerationGoalOptions";
import type { HookEdgeLevel } from "@/lib/clipstitchr/types/HookEdgeLevel";
import type { HookGenerationGoal } from "@/lib/clipstitchr/types/HookGenerationGoal";

type ProductHookMemoryFieldsProps = {
  hookEdgeLevel: HookEdgeLevel;
  hookGenerationGoal: HookGenerationGoal;
  rejectedHookExamplesText: string;
  onHookEdgeLevelChange: (value: HookEdgeLevel) => void;
  onHookGenerationGoalChange: (value: HookGenerationGoal) => void;
  onRejectedHookExamplesTextChange: (value: string) => void;
};

export function ProductHookMemoryFields({
  hookEdgeLevel,
  hookGenerationGoal,
  rejectedHookExamplesText,
  onHookEdgeLevelChange,
  onHookGenerationGoalChange,
  onRejectedHookExamplesTextChange,
}: ProductHookMemoryFieldsProps) {
  return (
    <section className="rounded-lg border border-border bg-surface-muted p-4">
      <div>
        <p className="text-sm font-semibold text-accent-dark">Hook Lab</p>
        <h3 className="mt-1 text-balance text-base font-bold text-text-primary">
          Set your writing guardrails.
        </h3>
        <p className="mt-2 text-pretty text-sm leading-6 text-text-secondary">
          Choose what you want each hook to do, then add any phrases you never
          want to see.
        </p>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SelectInput
          label="Main goal"
          value={hookGenerationGoal}
          options={hookGenerationGoalOptions}
          onChange={(event) =>
            onHookGenerationGoalChange(
              event.currentTarget.value as HookGenerationGoal,
            )
          }
        />
        <SelectInput
          label="Tone"
          value={hookEdgeLevel}
          options={hookEdgeLevelOptions}
          onChange={(event) =>
            onHookEdgeLevelChange(event.currentTarget.value as HookEdgeLevel)
          }
        />
      </div>
      <div className="mt-4">
        <label className="block">
          <span className="text-sm font-semibold text-text-primary">
            Phrases to avoid
          </span>
          <textarea
            value={rejectedHookExamplesText}
            rows={5}
            className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
            placeholder={"One hook per line.\nStop scrolling\nThis changes everything"}
            onChange={(event) =>
              onRejectedHookExamplesTextChange(event.currentTarget.value)
            }
          />
          <p className="mt-2 text-pretty text-xs leading-5 text-text-tertiary">
            Add one phrase per line. Saved Ideas handle the examples you want
            ClipStitchr to learn from.
          </p>
        </label>
      </div>
    </section>
  );
}
