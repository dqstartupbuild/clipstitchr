import type { LazyReelWorkflowRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowRequest";
import { lazyReelInputSnapshotSchemaVersion } from "./lazyReelInputSnapshotSchemaVersion";

export function createStudioLazyReelWorkflowInputSnapshot(
  request: LazyReelWorkflowRequest,
) {
  return {
    schemaVersion: lazyReelInputSnapshotSchemaVersion,
    payloadJson: JSON.stringify(request),
  };
}
