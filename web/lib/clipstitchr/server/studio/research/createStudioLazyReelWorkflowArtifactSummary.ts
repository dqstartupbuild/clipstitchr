import type { LazyReelWorkflowResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowResult";
import { lazyReelArtifactSummarySchemaVersion } from "./lazyReelArtifactSummarySchemaVersion";

export function createStudioLazyReelWorkflowArtifactSummary(
  result: LazyReelWorkflowResult,
) {
  return {
    schemaVersion: lazyReelArtifactSummarySchemaVersion,
    payloadJson: JSON.stringify({
      executionStatus: result.data.executionStatus,
      manifestCount: result.data.manifest.length,
      summary: result.summary,
      title: result.title,
      workflow: result.workflow,
    }),
  };
}
