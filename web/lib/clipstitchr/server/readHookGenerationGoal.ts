import { hookGenerationGoalOptions } from "@/lib/clipstitchr/constants/hookGenerationGoalOptions";
import type { HookGenerationGoal } from "@/lib/clipstitchr/types/HookGenerationGoal";

const hookGenerationGoals = new Set<string>(
  hookGenerationGoalOptions.map((option) => option.value),
);

export function readHookGenerationGoal(value: unknown): HookGenerationGoal | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const goal = value.trim();

  return hookGenerationGoals.has(goal) ? (goal as HookGenerationGoal) : undefined;
}
