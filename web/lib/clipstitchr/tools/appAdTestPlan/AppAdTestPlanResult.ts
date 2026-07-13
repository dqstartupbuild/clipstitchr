import type { AppAdTestPlanWave } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanWave";
import type { AppAdTestPlanWeek } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanWeek";

export type AppAdTestPlanResult = {
  appName: string;
  audience: string;
  goal: string;
  hypothesis: string;
  possibleCombinationCount: number;
  practicalFirstBatchCount: number;
  preparationItems: string[];
  schedule: AppAdTestPlanWeek[];
  totalPlannedVariantCount: number;
  waves: AppAdTestPlanWave[];
};
