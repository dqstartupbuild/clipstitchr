import type { AppAdTestPlanWave } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanWave";
import type { AppAdTestPlanWeek } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanWeek";

export function createAppAdTestPlanSchedule({
  waves,
  weeklyBudget,
  weeklyCapacity,
}: {
  waves: AppAdTestPlanWave[];
  weeklyBudget: number;
  weeklyCapacity: number;
}): AppAdTestPlanWeek[] {
  const schedule: AppAdTestPlanWeek[] = [];
  let weekNumber = 1;

  for (const wave of waves) {
    let remainingVariants = wave.variantCount;

    while (remainingVariants > 0) {
      const variantCount = Math.min(remainingVariants, weeklyCapacity);
      schedule.push({
        weekNumber,
        waveNumber: wave.waveNumber,
        waveName: wave.name,
        variantCount,
        budgetPerLiveVariant:
          weeklyBudget > 0 ? weeklyBudget / variantCount : undefined,
      });
      remainingVariants -= variantCount;
      weekNumber += 1;
    }
  }

  return schedule;
}
