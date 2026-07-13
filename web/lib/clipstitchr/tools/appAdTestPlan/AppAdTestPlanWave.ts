import type { AppAdTestPlanWaveStatus } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanWaveStatus";

export type AppAdTestPlanWave = {
  holdConstant: string[];
  instruction: string;
  name: string;
  status: AppAdTestPlanWaveStatus;
  variantCount: number;
  variable: string;
  waveNumber: number;
};
