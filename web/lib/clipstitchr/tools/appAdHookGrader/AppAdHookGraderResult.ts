import type { AppAdHookGradeDimension } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGradeDimension";
import type { PublicHookClaimSignal } from "@/lib/clipstitchr/tools/publicHooks/PublicHookClaimSignal";

export type AppAdHookGraderResult = {
  claimSignals: PublicHookClaimSignal[];
  dimensions: AppAdHookGradeDimension[];
  fixes: string[];
  overallScore: number;
  status: "Needs a sharper angle" | "Strong start" | "Worth testing";
};
