import type { StudioClipsClaimEnvelope } from "../contracts/StudioClipsClaimEnvelope";
import { getStudioClipsClaimWorkId } from "../contracts/getStudioClipsClaimWorkId";
import type { StudioClipsOutputTarget } from "../contracts/StudioClipsOutputTarget";
import type { StudioClipsRenderArtifact } from "../contracts/StudioClipsRenderArtifact";
import { assertStudioClipsOutputObjectKey } from "../security/assertStudioClipsOutputObjectKey";

export function createStudioClipsOutputTargets(
  claim: StudioClipsClaimEnvelope,
  renders: StudioClipsRenderArtifact[],
): StudioClipsOutputTarget[] {
  const workId = getStudioClipsClaimWorkId(claim);
  return renders.map((render) => {
    const objectKey = [
      `users/${encodeURIComponent(claim.ownerId)}/studio/v1/studio-clips`,
      encodeURIComponent(claim.productId),
      encodeURIComponent(workId),
      encodeURIComponent(render.artifactId),
      encodeURIComponent(render.fileName),
    ].join("/");
    const cleanMasterObjectKey = render.cleanMaster
      ? [
          `users/${encodeURIComponent(claim.ownerId)}/studio/v1/studio-clips`,
          encodeURIComponent(claim.productId),
          encodeURIComponent(workId),
          encodeURIComponent(render.artifactId),
          "_clean",
          encodeURIComponent(render.cleanMaster.fileName),
        ].join("/")
      : undefined;

    assertStudioClipsOutputObjectKey({
      objectKey,
      ownerId: claim.ownerId,
      productId: claim.productId,
      taskId: workId,
    });

    return {
      artifactId: render.artifactId,
      contentType: render.contentType,
      localPath: render.localPath,
      objectKey,
      sizeBytes: render.sizeBytes,
      ...(render.sourceOutputId ? { sourceOutputId: render.sourceOutputId } : {}),
      ...(render.cleanMaster && cleanMasterObjectKey
        ? {
            cleanMaster: {
              ...render.cleanMaster,
              objectKey: cleanMasterObjectKey,
            },
          }
        : {}),
    };
  });
}
