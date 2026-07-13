import type { PublicHookIntent } from "@/lib/clipstitchr/tools/publicHooks/PublicHookIntent";

const labels: Record<PublicHookIntent, string> = {
  audience: "Audience callout",
  comparison: "Comparison",
  curiosity: "Curiosity gap",
  demonstration: "Demonstration",
  discovery: "Product discovery",
  objection: "Objection answer",
  outcome: "Desired outcome",
  problem: "Problem recognition",
};

export function getPublicHookIntentLabel(intent: PublicHookIntent) {
  return labels[intent];
}
