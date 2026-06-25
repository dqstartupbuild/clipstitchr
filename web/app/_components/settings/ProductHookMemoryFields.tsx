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
  winningHookExamplesText: string;
  isWinningRequired?: boolean;
  onHookEdgeLevelChange: (value: HookEdgeLevel) => void;
  onHookGenerationGoalChange: (value: HookGenerationGoal) => void;
  onRejectedHookExamplesTextChange: (value: string) => void;
  onWinningHookExamplesTextChange: (value: string) => void;
};

export function ProductHookMemoryFields({
  hookEdgeLevel,
  hookGenerationGoal,
  rejectedHookExamplesText,
  winningHookExamplesText,
  isWinningRequired = false,
  onHookEdgeLevelChange,
  onHookGenerationGoalChange,
  onRejectedHookExamplesTextChange,
  onWinningHookExamplesTextChange,
}: ProductHookMemoryFieldsProps) {
  const hasWinningExample = winningHookExamplesText.trim().length > 0;

  return (
    <section className="rounded-lg border border-border bg-surface-muted p-4">
      <div>
        <p className="text-sm font-semibold text-accent-dark">Hook Lab</p>
        <h3 className="mt-1 text-base font-bold text-text-primary">
          Teach ClipStitchr what does not sound fake.
        </h3>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Tip: paste lines from posts that made you stop scrolling. Add your own
          winners too, especially the ones you would actually post.
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
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-text-primary">
            Hooks to learn from
          </span>
          <textarea
            value={winningHookExamplesText}
            rows={5}
            className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
            placeholder={"One hook per line.\nI thought my boyfriend was a 10/10\nGirls, if your boyfriend can't do 5 pushups..."}
            onChange={(event) =>
              onWinningHookExamplesTextChange(event.currentTarget.value)
            }
          />
          {isWinningRequired && !hasWinningExample ? (
            <p className="mt-2 text-xs font-semibold text-red-600">
              Add at least one hook before you continue.
            </p>
          ) : null}
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-text-primary">
            Hooks to avoid
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
        </label>
      </div>
    </section>
  );
}
