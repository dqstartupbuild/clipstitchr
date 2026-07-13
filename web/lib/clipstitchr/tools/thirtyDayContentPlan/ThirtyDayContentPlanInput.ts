import type { ThirtyDayCameraComfort } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/ThirtyDayCameraComfort";
import type { ThirtyDayContentGoal } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/ThirtyDayContentGoal";
import type { ThirtyDayLaunchStage } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/ThirtyDayLaunchStage";

export type ThirtyDayContentPlanInput = {
  appName: string;
  startDate: string;
  goal: ThirtyDayContentGoal;
  launchStage: ThirtyDayLaunchStage;
  postsPerWeek: 2 | 3 | 5;
  cameraComfort: ThirtyDayCameraComfort;
  hasUgc: boolean;
  hasDemo: boolean;
  hasScreenshots: boolean;
};
