import { extname } from "node:path";
import type { StudioClipsLeaseHeartbeat } from "../../runtime/StudioClipsLeaseHeartbeat";
import { getStudioClipsFileSha256 } from "./getStudioClipsFileSha256";
import type { StudioClipsR2ObjectStore } from "./StudioClipsR2ObjectStore";
import {
  STUDIO_CLIPS_CHECKPOINT_FILE_TOKEN_PREFIX,
  type StudioClipsCheckpointFileReference,
} from "./studioClipsCheckpointFormat";
import type { studioClipsPreviousCheckpointProgress } from "./studioClipsPreviousCheckpointProgress";

export async function persistStudioClipsCheckpointArtifact(input: {
  artifact: unknown;
  cachedFiles: Map<string, StudioClipsCheckpointFileReference>;
  fallbackName: string;
  fileKeyPrefix: string;
  files: StudioClipsCheckpointFileReference[];
  heartbeat: StudioClipsLeaseHeartbeat;
  heartbeatProgress: (typeof studioClipsPreviousCheckpointProgress)[keyof typeof studioClipsPreviousCheckpointProgress];
  id: string;
  maximumBytes: number;
  objects: StudioClipsR2ObjectStore;
}): Promise<void> {
  if (
    !input.artifact ||
    typeof input.artifact !== "object" ||
    Array.isArray(input.artifact)
  )
    return;
  const record = input.artifact as Record<string, unknown>;
  if (
    typeof record.localPath !== "string" ||
    typeof record.contentType !== "string" ||
    typeof record.sizeBytes !== "number"
  ) {
    return;
  }
  const localPath = record.localPath;
  const digest = await getStudioClipsFileSha256(localPath);
  let reference = input.cachedFiles.get(localPath);
  if (!reference || reference.sha256Hex !== digest.hex) {
    const extension = /^[.][a-z0-9]{1,8}$/i.test(extname(localPath))
      ? extname(localPath).toLowerCase()
      : ".bin";
    const fileName = `${input.fallbackName}${extension}`;
    const key = `${input.fileKeyPrefix}/${digest.hex}/${encodeURIComponent(fileName)}`;
    const proof = await input.heartbeat.run({
      ...input.heartbeatProgress,
      operation: () =>
        input.objects.putFileVerified({
          contentType: record.contentType as string,
          key,
          localPath,
          maximumBytes: input.maximumBytes,
          sizeBytes: record.sizeBytes as number,
        }),
    });
    reference = {
      contentType: record.contentType,
      fileName,
      id: input.id,
      key,
      sha256Hex: proof.sha256Hex,
      sizeBytes: record.sizeBytes,
    } as StudioClipsCheckpointFileReference;
    input.cachedFiles.set(localPath, reference);
  }
  input.files.push(reference);
  record.localPath = `${STUDIO_CLIPS_CHECKPOINT_FILE_TOKEN_PREFIX}${reference.id}`;
}
