import { join } from "node:path";
import { STUDIO_CLIPS_LIMITS } from "../../constants/studioClipsLimits";
import type { StudioClipsInitialClaimEnvelope } from "../../contracts/StudioClipsInitialClaimEnvelope";
import type { StudioClipsSourceArtifact } from "../../contracts/StudioClipsSourceArtifact";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import { assertStudioClipsProductUploadObjectKey } from "../../security/assertStudioClipsProductUploadObjectKey";
import type { StudioClipsR2ObjectStore } from "../r2/StudioClipsR2ObjectStore";
import { getStudioClipsVideoExtension } from "../media/getStudioClipsVideoExtension";

export function createStudioClipsR2SourceAcquirer(
  objects: StudioClipsR2ObjectStore,
) {
  return async (input: {
    claim: StudioClipsInitialClaimEnvelope;
    workspacePath: string;
  }): Promise<StudioClipsSourceArtifact> => {
    if (input.claim.source.kind !== "r2") {
      throw new StudioClipsWorkerError({
        code: "INVALID_SOURCE_KIND",
        kind: "permanent",
        publicMessage: "The Studio Clips source type is invalid.",
      });
    }
    const source = input.claim.source;
    assertStudioClipsProductUploadObjectKey({
      kind: "media-source",
      objectKey: source.objectKey,
      ownerId: input.claim.ownerId,
      productId: input.claim.productId,
    });
    const localPath = join(
      input.workspacePath,
      `source${getStudioClipsVideoExtension(source.contentType)}`,
    );
    await objects.downloadFile({
      contentType: source.contentType,
      key: source.objectKey,
      maximumBytes: STUDIO_CLIPS_LIMITS.inputSizeBytes,
      outputPath: localPath,
      sizeBytes: source.sizeBytes,
    });
    return {
      contentType: source.contentType,
      localPath,
      sizeBytes: source.sizeBytes,
    };
  };
}
