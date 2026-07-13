import type { HookVisualPlan } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualPlan";

export function formatHookVisualPlan(plan: HookVisualPlan) {
  return [
    `Opening: ${plan.openingShot}`,
    `On-screen text: ${plan.onScreenText}`,
    ...plan.storyboard.map(
      (beat) => `${beat.timeRange} — ${beat.label}: ${beat.instruction}`,
    ),
    `Demo handoff: ${plan.demoHandoff}`,
    `CTA bridge: ${plan.ctaBridge}`,
  ].join("\n");
}
