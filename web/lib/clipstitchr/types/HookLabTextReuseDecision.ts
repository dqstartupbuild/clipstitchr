import type { HookLabTextDecision } from "@/lib/clipstitchr/types/HookLabTextDecision";

export type HookLabTextReuseDecision = {
  decision: HookLabTextDecision;
  failedGates: string[];
  reason: string;
};
