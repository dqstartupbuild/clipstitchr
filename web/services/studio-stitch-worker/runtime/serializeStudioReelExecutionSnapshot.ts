import type { StudioReelExecutionSnapshot } from "../contracts/StudioReelExecutionSnapshot";
import { StudioReelWorkerError } from "../errors/StudioReelWorkerError";

export function serializeStudioReelExecutionSnapshot(
  snapshot: StudioReelExecutionSnapshot,
) {
  const json = JSON.stringify(snapshot);
  if (new TextEncoder().encode(json).byteLength > 128 * 1024) {
    throw new StudioReelWorkerError({
      code: "CHECKPOINT_SNAPSHOT_TOO_LARGE",
      kind: "permanent",
      publicMessage: "The Studio Stitch checkpoint snapshot is too large.",
    });
  }
  return json;
}
