import { createPersonalizedShortFormAuditPlan } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/createPersonalizedShortFormAuditPlan";
import { getShortFormAuditScoreLabel } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/getShortFormAuditScoreLabel";
import type { ShortFormAuditDimensionResult } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditDimensionResult";
import type { ShortFormAuditPriority } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditPriority";
import type { ShortFormAuditResult } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditResult";
import type { ShortFormAuditResponses } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditResponses";
import { shortFormAuditDimensionLabels } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/shortFormAuditDimensionLabels";
import { shortFormAuditDimensionOrder } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/shortFormAuditDimensionOrder";
import { shortFormAuditQuestions } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/shortFormAuditQuestions";

export function calculatePersonalizedShortFormAudit(
  responses: ShortFormAuditResponses,
): ShortFormAuditResult {
  const dimensions: ShortFormAuditDimensionResult[] =
    shortFormAuditDimensionOrder.map((dimension) => {
      const score = shortFormAuditQuestions
        .filter((question) => question.dimension === dimension)
        .reduce((total, question) => total + (responses[question.id] ?? 0), 0);

      return {
        dimension,
        label: shortFormAuditDimensionLabels[dimension],
        lostPoints: 20 - score,
        score,
      };
    });
  const priorities: ShortFormAuditPriority[] = dimensions
    .filter((dimension) => dimension.lostPoints > 0)
    .map((dimension) => {
      const weakestQuestion = shortFormAuditQuestions
        .filter((question) => question.dimension === dimension.dimension)
        .sort(
          (left, right) =>
            (responses[left.id] ?? 0) - (responses[right.id] ?? 0),
        )[0];

      return {
        action: weakestQuestion?.action ?? "Document the next improvement.",
        dimension: dimension.dimension,
        label: dimension.label,
        lostPoints: dimension.lostPoints,
      };
    })
    .sort((left, right) => {
      if (right.lostPoints !== left.lostPoints) {
        return right.lostPoints - left.lostPoints;
      }

      return (
        shortFormAuditDimensionOrder.indexOf(left.dimension) -
        shortFormAuditDimensionOrder.indexOf(right.dimension)
      );
    });
  const assetGaps = shortFormAuditQuestions
    .filter(
      (question) => question.assetGap && (responses[question.id] ?? 0) < 10,
    )
    .map((question) => question.assetGap as string);
  const overallScore = dimensions.reduce(
    (total, dimension) => total + dimension.score,
    0,
  );

  return {
    assetGaps,
    dimensions,
    overallScore,
    plan: createPersonalizedShortFormAuditPlan(priorities),
    priorities,
    scoreLabel: getShortFormAuditScoreLabel(overallScore),
  };
}
