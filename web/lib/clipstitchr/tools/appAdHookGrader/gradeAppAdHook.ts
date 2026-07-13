import type { AppAdHookGraderInput } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGraderInput";
import type { AppAdHookGraderResult } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGraderResult";
import { getAppAdHookGraderFix } from "@/lib/clipstitchr/tools/appAdHookGrader/getAppAdHookGraderFix";
import { scoreAppAdHookAudienceFit } from "@/lib/clipstitchr/tools/appAdHookGrader/scoreAppAdHookAudienceFit";
import { scoreAppAdHookClaimSafety } from "@/lib/clipstitchr/tools/appAdHookGrader/scoreAppAdHookClaimSafety";
import { scoreAppAdHookClarity } from "@/lib/clipstitchr/tools/appAdHookGrader/scoreAppAdHookClarity";
import { scoreAppAdHookCuriosity } from "@/lib/clipstitchr/tools/appAdHookGrader/scoreAppAdHookCuriosity";
import { scoreAppAdHookSpecificity } from "@/lib/clipstitchr/tools/appAdHookGrader/scoreAppAdHookSpecificity";
import { scoreAppAdHookVisualBridge } from "@/lib/clipstitchr/tools/appAdHookGrader/scoreAppAdHookVisualBridge";
import { findPublicHookClaimSignals } from "@/lib/clipstitchr/tools/publicHooks/findPublicHookClaimSignals";

export function gradeAppAdHook(
  input: AppAdHookGraderInput,
): AppAdHookGraderResult {
  const dimensions = [
    scoreAppAdHookClarity(input),
    scoreAppAdHookSpecificity(input),
    scoreAppAdHookAudienceFit(input),
    scoreAppAdHookCuriosity(input),
    scoreAppAdHookVisualBridge(input),
    scoreAppAdHookClaimSafety(input.hook),
  ];
  const overallScore = Math.round(
    dimensions.reduce((sum, dimension) => sum + dimension.score, 0) /
      dimensions.length,
  );
  const status =
    overallScore >= 80
      ? "Strong start"
      : overallScore >= 60
        ? "Worth testing"
        : "Needs a sharper angle";

  return {
    claimSignals: findPublicHookClaimSignals(input.hook),
    dimensions,
    fixes: [...dimensions]
      .sort((left, right) => left.score - right.score)
      .slice(0, 3)
      .map(getAppAdHookGraderFix),
    overallScore,
    status,
  };
}
