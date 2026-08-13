import type { LazyReelWorkflowRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowRequest";
import type { LazyReelWorkflowResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowResult";
import { createLazyReelWorkflowManifest } from "./createLazyReelWorkflowManifest";
import { getLazyReelWorkflowDefinition } from "./getLazyReelWorkflowDefinition";
import { getLazyReelWorkflowDuration } from "./getLazyReelWorkflowDuration";
import { getLazyReelWorkflowProviderRequirements } from "./getLazyReelWorkflowProviderRequirements";
import { lazyReelSnapshotVersion } from "./lazyReelSnapshotVersion";
import { readLazyReelOptionalText } from "./readLazyReelOptionalText";
import { readLazyReelRequiredText } from "./readLazyReelRequiredText";

export function executeLazyReelWorkflow(
  request: LazyReelWorkflowRequest,
): LazyReelWorkflowResult {
  const definition = getLazyReelWorkflowDefinition(request.workflow);
  const brief = readLazyReelRequiredText(request.brief, "Brief", 20_000);
  const product = readLazyReelOptionalText(request.product, 500);
  const targetDurationSeconds = getLazyReelWorkflowDuration(request.targetDurationSeconds);
  const providerRequirements = getLazyReelWorkflowProviderRequirements(request.workflow);
  const manifest = createLazyReelWorkflowManifest({
    brief,
    definition,
    product,
    targetDurationSeconds,
  });

  return {
    data: {
      executionStatus: "plan_only",
      manifest,
      outputContract: [...definition.outputSections],
      providerRequirements,
      stages: definition.stages.map((stage) => ({ ...stage })),
      targetDurationSeconds,
    },
    evidence: [
      {
        detail: `This plan follows ${definition.sourceFiles.join(" and ")}.`,
        kind: "heuristic",
        label: "Vendored workflow method",
        snapshotVersion: lazyReelSnapshotVersion,
        source: definition.sourceFiles.join(", "),
      },
      {
        detail: "Opening and pacing choices are framed as quality gates, not virality guarantees.",
        kind: "derived",
        label: "Breakout-law application",
        sample: 5,
        snapshotVersion: lazyReelSnapshotVersion,
        source: "mcp/data/breakout-vs-dud.json",
      },
    ],
    limitations: [
      ...definition.limitations,
      "Execution status is plan_only: no provider request, URL fetch, upstream script, shell command, media process, or paid action occurred.",
    ],
    links: [],
    methodology:
      "The planner converts a bounded brief and duration into the named upstream workflow stages and an inspectable manifest. Provider-dependent work stops before execution.",
    sections: [
      {
        id: "stages",
        items: definition.stages.map((stage) => `${stage.name}: ${stage.instruction}`),
        title: "Workflow",
      },
      {
        id: "manifest",
        items: manifest.map(
          (item) =>
            `${item.id}${item.durationSeconds ? ` (${item.durationSeconds}s)` : ""}: ${item.instruction}`,
        ),
        title: "Approved-ready manifest",
      },
      {
        id: "requirements",
        items: providerRequirements.length
          ? providerRequirements
          : ["No paid provider is required for this plan-only workflow."],
        title: "Before execution",
      },
    ],
    summary: `${definition.title} produced ${manifest.length} inspectable manifest items with execution held at plan-only.`,
    title: definition.title,
    workflow: definition.key,
  };
}
