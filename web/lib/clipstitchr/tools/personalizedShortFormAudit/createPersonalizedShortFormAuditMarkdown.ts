import type { ShortFormAuditResult } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditResult";

export function createPersonalizedShortFormAuditMarkdown(
  result: ShortFormAuditResult,
) {
  return [
    "# Personalized Short-Form Content Audit",
    "",
    `**Score: ${result.overallScore}/100 — ${result.scoreLabel}**`,
    "",
    "## Five-dimension score",
    ...result.dimensions.map(
      (dimension) =>
        `- ${dimension.label}: ${dimension.score}/20 (${dimension.lostPoints} points still available)`,
    ),
    "",
    "## Priorities",
    ...(result.priorities.length > 0
      ? result.priorities.map(
          (priority, index) =>
            `${index + 1}. **${priority.label}:** ${priority.action}`,
        )
      : [
          "Keep documenting the strong system and look for the next real bottleneck.",
        ]),
    "",
    "## Asset gaps",
    ...(result.assetGaps.length > 0
      ? result.assetGaps.map((gap) => `- ${gap}`)
      : ["No asset gap was flagged by these self-reported answers."]),
    "",
    "## Dependency-ordered 14-day plan",
    ...result.plan.map(
      (day) => `### Day ${day.day}: ${day.title}\n${day.action}`,
    ),
    "",
    "This is a self-audit based only on your answers. It does not inspect accounts, media, or performance.",
  ].join("\n");
}
