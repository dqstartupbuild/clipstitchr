import type { StudioClipsCancellationGateway } from "../contracts/StudioClipsCancellationGateway";
import type { StudioClipsCheckpoint } from "../contracts/StudioClipsCheckpoint";
import type { StudioClipsClaimEnvelope } from "../contracts/StudioClipsClaimEnvelope";
import { getStudioClipsClaimWorkId } from "../contracts/getStudioClipsClaimWorkId";
import { StudioClipsCancellationError } from "../errors/StudioClipsCancellationError";

export async function throwIfStudioClipsCancelled(
  claim: StudioClipsClaimEnvelope,
  checkpoint: StudioClipsCheckpoint,
  cancellation: StudioClipsCancellationGateway,
): Promise<void> {
  const cancelled = await cancellation.getIsCancellationRequested({
    checkpoint,
    ownerId: claim.ownerId,
    productId: claim.productId,
    taskId: getStudioClipsClaimWorkId(claim),
  });

  if (cancelled) {
    throw new StudioClipsCancellationError(checkpoint);
  }
}
