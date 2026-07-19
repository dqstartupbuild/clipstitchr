import type { PostBridgeBatchJobInput } from "@/lib/clipstitchr/types/PostBridgeBatchJobInput";

export function parsePostBridgeBatchJobInput(
  inputSnapshotJson: string,
): PostBridgeBatchJobInput {
  return JSON.parse(inputSnapshotJson) as PostBridgeBatchJobInput;
}
