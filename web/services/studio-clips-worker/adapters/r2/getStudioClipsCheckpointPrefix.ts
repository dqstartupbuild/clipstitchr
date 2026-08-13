import { getStudioClipsClaimWorkId } from "../../contracts/getStudioClipsClaimWorkId";

export function getStudioClipsCheckpointPrefix(
  input: Parameters<typeof getStudioClipsClaimWorkId>[0],
): string {
  return [
    `users/${encodeURIComponent(input.ownerId)}/studio/v1/studio-clips`,
    encodeURIComponent(input.productId),
    encodeURIComponent(getStudioClipsClaimWorkId(input)),
    "_checkpoints",
  ].join("/");
}
