import type { LazyReelToolResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolResult";
import { lazyReelArtifactSummarySchemaVersion } from "./lazyReelArtifactSummarySchemaVersion";

export function createStudioLazyReelArtifactSummary(
  result: LazyReelToolResult,
) {
  return {
    schemaVersion: lazyReelArtifactSummarySchemaVersion,
    payloadJson: JSON.stringify({
      evidenceKinds: [...new Set(result.evidence.map((item) => item.kind))],
      linkCount: result.links.length,
      sectionCount: result.sections.length,
      summary: result.summary,
      title: result.title,
      tool: result.tool,
    }),
  };
}
