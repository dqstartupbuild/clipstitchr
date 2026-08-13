import { STUDIO_CLIPS_CLAIM_SCHEMA_VERSION } from "../constants/studioClipsContractVersion";
import type { StudioClipsRenderRevisionClaimEnvelope } from "../contracts/StudioClipsRenderRevisionClaimEnvelope";

export function createStudioClipsTestRevisionClaim(
  overrides: Partial<StudioClipsRenderRevisionClaimEnvelope> = {},
): StudioClipsRenderRevisionClaimEnvelope {
  const sourceOutput = {
    audioCodec: "aac",
    contentType: "video/mp4",
    durationSeconds: 30,
    fileName: "clip.mp4",
    hasAudio: true,
    height: 1920,
    id: "output_123",
    objectKey:
      "users/user_123/studio/v1/studio-clips/product_123/task_123/clip_123/clip.mp4",
    revision: 1,
    sha256: "a".repeat(64),
    sizeBytes: 6,
    taskId: "task_123",
    videoCodec: "h264",
    width: 1080,
  };
  return {
    attempt: 1,
    leaseId: "lease_revision_123",
    mode: "render_revision",
    operation: { endSeconds: 20, kind: "trim", startSeconds: 5 },
    ownerId: "user_123",
    productId: "product_123",
    renderRevisionId: "clip_revision_123",
    requestedAt: "2026-08-12T12:00:00.000Z",
    schemaVersion: STUDIO_CLIPS_CLAIM_SCHEMA_VERSION,
    sourceOutput,
    sourceOutputs: [sourceOutput],
    taskId: "task_123",
    ...overrides,
  };
}
