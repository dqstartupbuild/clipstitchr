import type { HookLabExactReuseEvidence } from "@/lib/clipstitchr/types/HookLabExactReuseEvidence";
import type { HookLabExactReuseGates } from "@/lib/clipstitchr/types/HookLabExactReuseGates";
import type { HookLabTextDecision } from "@/lib/clipstitchr/types/HookLabTextDecision";
import { HOOK_LAB_EXACT_REUSE_GATE_NAMES } from "./hookLabExactReuseGateNames";

export function createHookLabTextDecisionReason({
  decision,
  evidence,
  gates,
}: {
  decision: HookLabTextDecision;
  evidence: HookLabExactReuseEvidence;
  gates: HookLabExactReuseGates;
}) {
  if (decision === "reused") {
    return "Every exact-reuse check passed with specific evidence.";
  }

  const failedGate = HOOK_LAB_EXACT_REUSE_GATE_NAMES.find(
    (gate) => !gates[gate],
  );

  return failedGate && evidence[failedGate]
    ? evidence[failedGate]
    : "At least one exact-reuse check lacked specific evidence.";
}
