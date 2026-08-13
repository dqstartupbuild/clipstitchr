import { join } from "node:path";
import { STUDIO_CLIPS_LIMITS } from "../../constants/studioClipsLimits";
import type { StudioClipsRenderRevisionClaimEnvelope } from "../../contracts/StudioClipsRenderRevisionClaimEnvelope";
import type { StudioClipsRevisionSourceArtifact } from "../../contracts/StudioClipsRevisionSourceArtifact";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import { assertStudioClipsOwnedObjectKey } from "../../security/assertStudioClipsOwnedObjectKey";
import { getStudioClipsVideoExtension } from "../media/getStudioClipsVideoExtension";
import type { StudioClipsR2ObjectStore } from "../r2/StudioClipsR2ObjectStore";

export async function acquireStudioClipsRevisionSources(input: {
  claim: StudioClipsRenderRevisionClaimEnvelope;
  objects: StudioClipsR2ObjectStore;
  workspacePath: string;
}): Promise<StudioClipsRevisionSourceArtifact[]> {
  const artifacts: StudioClipsRevisionSourceArtifact[] = [];
  for (const [index, source] of input.claim.sourceOutputs.entries()) {
    const useCleanMaster =
      (input.claim.operation.kind === "captions" ||
        input.claim.operation.kind === "project_style") &&
      Boolean(source.cleanMaster);
    const selected = useCleanMaster ? source.cleanMaster! : source;
    assertStudioClipsOwnedObjectKey(input.claim.ownerId, selected.objectKey);
    const localPath = join(
      input.workspacePath,
      `revision-source-${String(index + 1).padStart(3, "0")}${getStudioClipsVideoExtension(selected.contentType)}`,
    );
    const downloaded = await input.objects.downloadFile({
      contentType: selected.contentType,
      key: selected.objectKey,
      maximumBytes: STUDIO_CLIPS_LIMITS.outputSizeBytes,
      outputPath: localPath,
      sizeBytes: selected.sizeBytes,
    });
    if (downloaded.sha256Hex !== selected.sha256) {
      throw new StudioClipsWorkerError({
        code: "REVISION_SOURCE_DIGEST_MISMATCH",
        kind: "permanent",
        publicMessage: "A saved Studio clip changed before the revision started.",
      });
    }
    artifacts.push({
      contentType: selected.contentType,
      localPath,
      sizeBytes: selected.sizeBytes,
      sourceOutputId: source.id,
    });
  }
  return artifacts;
}
