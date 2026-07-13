import type { AppAdTestPlanInput } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanInput";

export const defaultAppAdTestPlanInput: AppAdTestPlanInput = {
  appName: "FocusFlow",
  goal: "find the opening that earns enough attention for the product demo",
  audience: "indie app founders who make their own short-form ads",
  ugcOpeningCount: 8,
  demoCount: 2,
  hookCount: 4,
  callToActionCount: 2,
  weeklyProductionCapacity: 8,
  weeklyTestingBudget: 0,
};
