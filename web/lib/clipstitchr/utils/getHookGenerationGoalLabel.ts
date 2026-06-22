import { hookGenerationGoalOptions } from "@/lib/clipstitchr/constants/hookGenerationGoalOptions";
import type { HookGenerationGoal } from "@/lib/clipstitchr/types/HookGenerationGoal";

export function getHookGenerationGoalLabel(value?: HookGenerationGoal) {
  return (
    hookGenerationGoalOptions.find((option) => option.value === value)?.label ??
    "Get more views"
  );
}
