import type { AppAdTestPlanInput } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanInput";
import type { AppAdTestPlanWave } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanWave";

export function createAppAdTestPlanWaves(
  input: AppAdTestPlanInput,
): AppAdTestPlanWave[] {
  const waveOneReady =
    input.ugcOpeningCount >= 2 &&
    input.demoCount >= 1 &&
    input.hookCount >= 1 &&
    input.callToActionCount >= 1;
  const waveTwoReady = waveOneReady && input.hookCount >= 2;
  const waveThreeReady =
    waveTwoReady &&
    (input.demoCount >= 2 || input.callToActionCount >= 2);
  const waveThreeVariantCount = Math.max(
    input.demoCount + input.callToActionCount - 1,
    0,
  );

  return [
    {
      waveNumber: 1,
      name: "Find the strongest UGC opening",
      variable: "UGC opening",
      variantCount: waveOneReady ? input.ugcOpeningCount : 0,
      status: waveOneReady ? "ready" : "needs-assets",
      instruction:
        "Pair each UGC opening with the same product demo, hook, and call to action. Keep the strongest two openings for the next wave.",
      holdConstant: ["Product demo", "Hook direction", "Call to action"],
    },
    {
      waveNumber: 2,
      name: "Test hook directions",
      variable: "Hook direction",
      variantCount: waveTwoReady ? input.hookCount : 0,
      status: waveTwoReady ? "ready" : "needs-assets",
      instruction:
        "Use the strongest footage pairing from Wave 1 and change only the hook direction. Keep the strongest combination for the final wave.",
      holdConstant: ["UGC opening", "Product demo", "Call to action"],
    },
    {
      waveNumber: 3,
      name: "Rotate demos and calls to action",
      variable: "Demo, then call to action",
      variantCount: waveThreeReady ? waveThreeVariantCount : 0,
      status: waveThreeReady ? "ready" : "needs-assets",
      instruction:
        "Keep the strongest opening and hook. Compare demos first, then return to the strongest demo and compare calls to action so only one variable changes at a time.",
      holdConstant: ["Winning UGC opening", "Winning hook direction"],
    },
  ];
}
