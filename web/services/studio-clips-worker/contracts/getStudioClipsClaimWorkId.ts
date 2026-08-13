import type { StudioClipsClaimEnvelope } from "./StudioClipsClaimEnvelope";

export function getStudioClipsClaimWorkId(
  claim: StudioClipsClaimEnvelope,
): string {
  return claim.mode === "render_revision"
    ? claim.renderRevisionId
    : claim.taskId;
}
