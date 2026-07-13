import type { AppAdTestPlanInput } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanInput";
import type { AppAdTestPlanResult } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanResult";
import { createAppAdTestPlanPreparationItems } from "@/lib/clipstitchr/tools/appAdTestPlan/createAppAdTestPlanPreparationItems";
import { createAppAdTestPlanSchedule } from "@/lib/clipstitchr/tools/appAdTestPlan/createAppAdTestPlanSchedule";
import { createAppAdTestPlanWaves } from "@/lib/clipstitchr/tools/appAdTestPlan/createAppAdTestPlanWaves";
import { normalizeAppAdTestPlanInput } from "@/lib/clipstitchr/tools/appAdTestPlan/normalizeAppAdTestPlanInput";
import { calculateAdVariantPlan } from "@/lib/clipstitchr/tools/adVariantCalculator/calculateAdVariantPlan";

export function createAppAdTestPlan(
  input: AppAdTestPlanInput,
): AppAdTestPlanResult {
  const normalizedInput = normalizeAppAdTestPlanInput(input);
  const opportunity = calculateAdVariantPlan({
    ugcClipCount: normalizedInput.ugcOpeningCount,
    demoClipCount: normalizedInput.demoCount,
    hookCount: normalizedInput.hookCount,
    callToActionCount: normalizedInput.callToActionCount,
  });
  const waves = createAppAdTestPlanWaves(normalizedInput);
  const schedule = createAppAdTestPlanSchedule({
    waves,
    weeklyBudget: normalizedInput.weeklyTestingBudget,
    weeklyCapacity: normalizedInput.weeklyProductionCapacity,
  });

  return {
    appName: normalizedInput.appName,
    audience: normalizedInput.audience,
    goal: normalizedInput.goal,
    hypothesis: `For ${normalizedInput.audience}, changing one creative variable at a time will make it easier to learn which version best supports the goal: ${normalizedInput.goal}.`,
    possibleCombinationCount: opportunity.possibleCombinationCount,
    practicalFirstBatchCount: opportunity.practicalFirstBatchCount,
    preparationItems: createAppAdTestPlanPreparationItems(normalizedInput),
    waves,
    schedule,
    totalPlannedVariantCount: waves.reduce(
      (total, wave) => total + wave.variantCount,
      0,
    ),
  };
}
