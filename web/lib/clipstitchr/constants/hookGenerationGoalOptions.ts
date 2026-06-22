import type { HookGenerationGoal } from "@/lib/clipstitchr/types/HookGenerationGoal";

export const hookGenerationGoalOptions: {
  label: string;
  value: HookGenerationGoal;
}[] = [
  { label: "Get more views", value: "views" },
  { label: "Get more clicks", value: "clicks" },
  { label: "Get more comments", value: "comments" },
  { label: "Build trust", value: "trust" },
  { label: "Make people watch the demo", value: "demo_watch" },
];
