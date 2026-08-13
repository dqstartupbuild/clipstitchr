import type { StudioClipsAccessGateway } from "../contracts/StudioClipsAccessGateway";
import type { StudioClipsClaimEnvelope } from "../contracts/StudioClipsClaimEnvelope";
import { getStudioClipsClaimWorkId } from "../contracts/getStudioClipsClaimWorkId";

export async function assertStudioClipsClaimAccess(
  claim: StudioClipsClaimEnvelope,
  access: StudioClipsAccessGateway,
): Promise<void> {
  const workId = getStudioClipsClaimWorkId(claim);
  await access.assertStudioAccess({
    ownerId: claim.ownerId,
    taskId: workId,
  });
  await access.assertProductOwnership({
    ownerId: claim.ownerId,
    productId: claim.productId,
    taskId: workId,
  });
  await access.assertClaimLease({
    attempt: claim.attempt,
    leaseId: claim.leaseId,
    ownerId: claim.ownerId,
    productId: claim.productId,
    taskId: workId,
  });
}
