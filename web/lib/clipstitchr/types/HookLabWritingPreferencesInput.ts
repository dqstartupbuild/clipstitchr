import type { HookEdgeLevel } from "@/lib/clipstitchr/types/HookEdgeLevel";
import type { HookGenerationGoal } from "@/lib/clipstitchr/types/HookGenerationGoal";

export type HookLabWritingPreferencesInput = {
  hookEdgeLevel: HookEdgeLevel;
  hookGenerationGoal: HookGenerationGoal;
  rejectedHookExamples: string[];
};
