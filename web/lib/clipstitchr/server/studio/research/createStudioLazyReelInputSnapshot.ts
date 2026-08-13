import type { LazyReelToolRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolRequest";
import { lazyReelInputSnapshotSchemaVersion } from "./lazyReelInputSnapshotSchemaVersion";

export function createStudioLazyReelInputSnapshot(
  request: LazyReelToolRequest,
) {
  return {
    schemaVersion: lazyReelInputSnapshotSchemaVersion,
    payloadJson: JSON.stringify(request),
  };
}
