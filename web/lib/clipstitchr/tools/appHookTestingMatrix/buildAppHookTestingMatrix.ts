import type { AppHookTestingCell } from "@/lib/clipstitchr/tools/appHookTestingMatrix/AppHookTestingCell";
import type { AppHookTestingMatrixInput } from "@/lib/clipstitchr/tools/appHookTestingMatrix/AppHookTestingMatrixInput";
import type { AppHookTestingMatrixResult } from "@/lib/clipstitchr/tools/appHookTestingMatrix/AppHookTestingMatrixResult";
import { normalizeAppHookTestingMatrixValues } from "@/lib/clipstitchr/tools/appHookTestingMatrix/normalizeAppHookTestingMatrixValues";

export function buildAppHookTestingMatrix(
  input: AppHookTestingMatrixInput,
): AppHookTestingMatrixResult {
  const hooks = normalizeAppHookTestingMatrixValues(
    input.hooks,
    5,
    "Control hook",
  );
  const visuals = normalizeAppHookTestingMatrixValues(
    input.visuals,
    3,
    "Control visual",
  );
  const stableCta = input.stableCta.trim() || "Use one stable CTA";
  const cells: AppHookTestingCell[] = [
    {
      changedVariable: "Control baseline — nothing changes",
      cta: stableCta,
      hook: hooks[0]!,
      id: "control-1",
      instruction:
        "Publish or evaluate this baseline first. Keep the audience, offer, visual, and CTA unchanged for every Stage 1 challenger.",
      stage: "Control",
      visual: visuals[0]!,
    },
  ];

  hooks.slice(1).forEach((hook, index) => {
    cells.push({
      changedVariable: "Hook only",
      cta: stableCta,
      hook,
      id: `hook-${index + 2}`,
      instruction:
        "Compare with the control using the same audience, offer, visual, CTA, and evidence rule.",
      stage: "Hook test",
      visual: visuals[0]!,
    });
  });

  visuals.slice(1).forEach((visual, index) => {
    cells.push({
      changedVariable: "Visual only",
      cta: stableCta,
      hook: "Lock the Stage 1 winning hook",
      id: `visual-${index + 2}`,
      instruction:
        "Run only after choosing one Stage 1 hook. Keep that hook, audience, offer, CTA, and evidence rule stable while changing this visual.",
      stage: "Visual follow-up",
      visual,
    });
  });

  return {
    audience: input.audience.trim() || "One stable audience",
    cells,
    offer: input.offer.trim() || "One stable offer",
    stableCta,
  };
}
