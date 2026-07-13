import type { AppAdTestPlanInput } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanInput";
import { appAdTestPlanFieldLimits } from "@/lib/clipstitchr/tools/appAdTestPlan/appAdTestPlanFieldLimits";
import { normalizeAdVariantCount } from "@/lib/clipstitchr/tools/adVariantCalculator/normalizeAdVariantCount";

export function normalizeAppAdTestPlanInput(
  input: AppAdTestPlanInput,
): AppAdTestPlanInput {
  const weeklyCapacity = normalizeAdVariantCount(
    input.weeklyProductionCapacity,
  );
  const weeklyBudget = Number.isFinite(input.weeklyTestingBudget)
    ? Math.min(
        Math.max(input.weeklyTestingBudget, 0),
        appAdTestPlanFieldLimits.weeklyTestingBudget,
      )
    : 0;

  return {
    appName: input.appName.trim(),
    goal: input.goal.trim(),
    audience: input.audience.trim(),
    ugcOpeningCount: normalizeAdVariantCount(input.ugcOpeningCount),
    demoCount: normalizeAdVariantCount(input.demoCount),
    hookCount: normalizeAdVariantCount(input.hookCount),
    callToActionCount: normalizeAdVariantCount(input.callToActionCount),
    weeklyProductionCapacity: Math.min(
      Math.max(weeklyCapacity, 1),
      appAdTestPlanFieldLimits.weeklyProductionCapacity,
    ),
    weeklyTestingBudget: Math.round(weeklyBudget * 100) / 100,
  };
}
