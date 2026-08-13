import type { LazyReelWorkflowResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowResult";
import { lazyReelResultSnapshotSchemaVersion } from "./lazyReelResultSnapshotSchemaVersion";

export function createStudioLazyReelWorkflowResultSnapshot(
  result: LazyReelWorkflowResult,
) {
  return {
    schemaVersion: lazyReelResultSnapshotSchemaVersion,
    payloadJson: JSON.stringify(result),
  };
}
