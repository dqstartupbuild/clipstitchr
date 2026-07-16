import type { PlanKey } from "./PlanKey";

export type PlanPolicy = {
  activeGenerationLimit: number;
  aiVideoLimit: number;
  dailyDraftProductLimit: number;
  monthlyCreationCredits: number;
  monthlyPriceUsd: number;
  name: string;
  planKey: PlanKey;
  productLimit: number;
  queueLabel: "Standard" | "Priority processing" | "Highest priority";
  queueWeight: number;
  standalonePhotoCreditCost: number;
  stitchCreditCost: number;
  swiprCreditCost: number;
};
