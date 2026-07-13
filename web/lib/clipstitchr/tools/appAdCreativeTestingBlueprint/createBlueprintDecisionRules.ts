import type { AppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintInput";
import type { BlueprintDecisionRule } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintDecisionRule";

export function createBlueprintDecisionRules(
  input: AppAdCreativeTestingBlueprintInput,
): BlueprintDecisionRule[] {
  const improvement = input.metricDirection === "higher" ? "higher" : "lower";
  const targetCondition =
    input.target === null
      ? `${input.primaryMetric} meaningfully improves in the ${improvement}-is-better direction after fair opportunity.`
      : `${input.primaryMetric} reaches the visitor-entered target of ${input.target.toLocaleString()} after fair opportunity.`;

  return [
    {
      outcome: "hold",
      label: "Hold",
      condition: "The visitor-defined evidence floor has not been reached.",
      nextAction:
        "Keep collecting comparable evidence. Do not name a winner yet.",
    },
    {
      outcome: "promote",
      label: "Promote",
      condition: targetCondition,
      nextAction:
        "Keep the winning variable and create two close iterations without changing the other controls.",
    },
    {
      outcome: "iterate",
      label: "Iterate downstream",
      condition:
        "The lane's leading signal improves, but the primary metric does not.",
      nextAction:
        "Preserve the stronger opening and change only the downstream demo, proof, or call to action.",
    },
    {
      outcome: "retire",
      label: "Retire",
      condition:
        "Both the leading signal and primary metric worsen after comparable opportunity.",
      nextAction:
        "Retire that direction and record what the team should avoid repeating.",
    },
    {
      outcome: "continue",
      label: "Continue or isolate",
      condition:
        "Evidence is mixed, flat, or the comparison changed more than one thing.",
      nextAction:
        "Run a cleaner comparison or continue until the agreed evidence floor is reached.",
    },
  ];
}
