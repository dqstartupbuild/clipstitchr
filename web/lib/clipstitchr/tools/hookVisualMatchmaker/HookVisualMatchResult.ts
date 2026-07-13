import type { HookVisualPlan } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualPlan";
import type { PublicHookIntent } from "@/lib/clipstitchr/tools/publicHooks/PublicHookIntent";

export type HookVisualMatchResult = {
  alternate: HookVisualPlan;
  claimNotice?: string;
  explanation: string;
  intent: PublicHookIntent;
  primary: HookVisualPlan;
};
