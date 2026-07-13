import type { AppHookTestingStage } from "@/lib/clipstitchr/tools/appHookTestingMatrix/AppHookTestingStage";

export type AppHookTestingCell = {
  changedVariable: string;
  cta: string;
  hook: string;
  id: string;
  instruction: string;
  stage: AppHookTestingStage;
  visual: string;
};
