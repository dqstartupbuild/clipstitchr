import type { AppAdShot } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShot";

export type AppAdShotListResult = {
  appName: string;
  objective: string;
  recordingChecklist: string[];
  shots: AppAdShot[];
  totalPlannedFiles: number;
  totalRecommendedTakes: number;
};
