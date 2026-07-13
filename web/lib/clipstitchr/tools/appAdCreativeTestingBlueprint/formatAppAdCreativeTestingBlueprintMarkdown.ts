import type { AppAdCreativeTestingBlueprintResult } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintResult";
import { formatBlueprintMetricValue } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/formatBlueprintMetricValue";

export function formatAppAdCreativeTestingBlueprintMarkdown(
  result: AppAdCreativeTestingBlueprintResult,
): string {
  const laneSections = result.lanes.map((lane) => {
    const cells = result.cells
      .filter((cell) => cell.laneKey === lane.key)
      .map(
        (cell) =>
          `- ${cell.id} [${cell.status}]: ${cell.direction}\n  - Change only: ${cell.changedVariable}\n  - Keep fixed: ${cell.fixedControls.join("; ")}`,
      )
      .join("\n");

    return [
      `## ${lane.title}`,
      `Learning question: ${lane.learningQuestion}`,
      `Hypothesis: ${lane.hypothesis}`,
      `Leading signal: ${lane.leadingSignal}`,
      `Primary signal: ${lane.primarySignal}`,
      cells,
      `Next learning action: ${lane.nextLearningAction}`,
    ].join("\n\n");
  });
  const gapLines = result.assetGaps.map(
    (gap) =>
      `- ${gap.label}: ${gap.available} available / ${gap.required} required / ${gap.gap} missing. ${gap.guidance}`,
  );
  const decisionLines = result.decisionRules.map(
    (rule) => `- ${rule.label}: ${rule.condition} ${rule.nextAction}`,
  );

  return [
    `# ${result.input.appName} App Ad Creative Testing Blueprint`,
    `Audience: ${result.input.audience}`,
    `Product outcome: ${result.input.productOutcome}`,
    `Main objection: ${result.input.mainObjection}`,
    `Active cells: ${result.activeCellCount}`,
    `Backlog cells: ${result.backlogCellCount}`,
    ...laneSections,
    "## Measurement contract",
    `Primary metric: ${result.measurementContract.primaryMetric}`,
    `Improvement direction: ${result.measurementContract.direction}`,
    `Baseline: ${formatBlueprintMetricValue(result.measurementContract.baseline)}`,
    `Target: ${formatBlueprintMetricValue(result.measurementContract.target)}`,
    result.measurementContract.insufficientEvidenceMessage,
    ...result.measurementContract.fairComparisonReminders.map(
      (reminder) => `- ${reminder}`,
    ),
    "## Source-asset gaps",
    ...gapLines,
    "## Decision rubric",
    ...decisionLines,
    "This blueprint organizes a test. It does not predict performance, choose a winner, produce media, or run an ad campaign.",
  ].join("\n\n");
}
