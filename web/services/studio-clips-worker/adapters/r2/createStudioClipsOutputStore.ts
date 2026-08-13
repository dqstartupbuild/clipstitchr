import { STUDIO_CLIPS_LIMITS } from "../../constants/studioClipsLimits";
import type { StudioClipsR2OutputStore } from "../../contracts/StudioClipsR2OutputStore";
import type { StudioClipsCompletionEvidence } from "../../runtime/StudioClipsCompletionEvidence";
import type { StudioClipsLeaseHeartbeat } from "../../runtime/StudioClipsLeaseHeartbeat";
import type { StudioClipsR2ObjectStore } from "./StudioClipsR2ObjectStore";

export function createStudioClipsOutputStore(input: {
  evidence: StudioClipsCompletionEvidence;
  heartbeat: StudioClipsLeaseHeartbeat;
  objects: StudioClipsR2ObjectStore;
}): StudioClipsR2OutputStore {
  return {
    store: async ({ targets }) => {
      const outputs = [];
      for (const target of targets) {
        const cleanMasterProof = target.cleanMaster
          ? await input.heartbeat.run({
              checkpoint: "rendered",
              code: "rendered",
              operation: () => input.objects.putFileVerified({
                contentType: target.cleanMaster!.contentType,
                key: target.cleanMaster!.objectKey,
                localPath: target.cleanMaster!.localPath,
                maximumBytes: STUDIO_CLIPS_LIMITS.outputSizeBytes,
                sizeBytes: target.cleanMaster!.sizeBytes,
              }),
            })
          : undefined;
        const proof = await input.heartbeat.run({
          checkpoint: "rendered",
          code: "rendered",
          operation: () => input.objects.putFileVerified({
            contentType: target.contentType,
            key: target.objectKey,
            localPath: target.localPath,
            maximumBytes: STUDIO_CLIPS_LIMITS.outputSizeBytes,
            sizeBytes: target.sizeBytes,
          }),
        });
        input.evidence.recordStorageProof(target.artifactId, {
          etag: proof.etag,
          key: proof.key,
          ...(proof.versionId ? { versionId: proof.versionId } : {}),
        });
        outputs.push({
          artifactId: target.artifactId,
          contentType: target.contentType,
          objectKey: target.objectKey,
          sha256: proof.sha256Hex,
          sizeBytes: target.sizeBytes,
          ...(target.sourceOutputId ? { sourceOutputId: target.sourceOutputId } : {}),
          ...(target.cleanMaster && cleanMasterProof
            ? {
                cleanMaster: {
                  contentType: target.cleanMaster.contentType,
                  objectKey: target.cleanMaster.objectKey,
                  sha256: cleanMasterProof.sha256Hex,
                  sizeBytes: target.cleanMaster.sizeBytes,
                },
              }
            : {}),
        });
      }
      return outputs;
    },
  };
}
