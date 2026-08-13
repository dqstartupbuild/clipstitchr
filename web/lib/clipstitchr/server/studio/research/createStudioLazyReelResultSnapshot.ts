import type { LazyReelToolResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolResult";
import { lazyReelResultSnapshotSchemaVersion } from "./lazyReelResultSnapshotSchemaVersion";

export function createStudioLazyReelResultSnapshot(
  result: LazyReelToolResult,
) {
  return {
    schemaVersion: lazyReelResultSnapshotSchemaVersion,
    payloadJson: JSON.stringify(result),
  };
}
