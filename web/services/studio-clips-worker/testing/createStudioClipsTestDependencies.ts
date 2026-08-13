import { stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { vi } from "vitest";
import type { StudioClipsCheckpoint } from "../contracts/StudioClipsCheckpoint";
import type { StudioClipsOutputTarget } from "../contracts/StudioClipsOutputTarget";
import type { StudioClipsProgressEvent } from "../contracts/StudioClipsProgressEvent";
import type { StudioClipsWorkerDependencies } from "../contracts/StudioClipsWorkerDependencies";

export function createStudioClipsTestDependencies() {
  const progressEvents: StudioClipsProgressEvent[] = [];
  const savedCheckpoints: StudioClipsCheckpoint[] = [];
  const workspacePaths: string[] = [];
  let revision = 0;

  const dependencies: StudioClipsWorkerDependencies = {
    access: {
      assertClaimLease: vi.fn().mockResolvedValue(undefined),
      assertProductOwnership: vi.fn().mockResolvedValue(undefined),
      assertStudioAccess: vi.fn().mockResolvedValue(undefined),
    },
    cancellation: {
      getIsCancellationRequested: vi.fn().mockResolvedValue(false),
    },
    checkpoints: {
      restore: vi.fn().mockResolvedValue({}),
      save: vi.fn(async ({ checkpoint, claim }) => {
        revision = Math.max(revision, claim.resume?.revision ?? 0) + 1;
        savedCheckpoints.push(checkpoint);
        return { revision };
      }),
    },
    clock: {
      nowIso: () => "2026-08-12T12:00:01.000Z",
    },
    costGate: {
      assertOwnerAndGlobalAllowed: vi.fn().mockResolvedValue(undefined),
    },
    output: {
      store: vi.fn(async ({ targets }) =>
        targets.map((target: StudioClipsOutputTarget) => ({
          artifactId: target.artifactId,
          contentType: target.contentType,
          objectKey: target.objectKey,
          sha256: "a".repeat(64),
          sizeBytes: target.sizeBytes,
        })),
      ),
    },
    pipeline: {
      acquireSource: vi.fn(async ({ workspace }) => {
        workspacePaths.push(workspace.path);
        const localPath = join(workspace.path, "source.mp4");
        await writeFile(localPath, Buffer.alloc(32));
        return { contentType: "video/mp4", localPath, sizeBytes: 32 };
      }),
      analyze: vi.fn().mockResolvedValue({
        payload: {
          segments: [{ endSeconds: 30, startSeconds: 10 }],
          summary: "One useful moment.",
        },
        snapshotVersion: 1,
      }),
      fetchBroll: vi.fn(async ({ workspace }) => {
        const localPath = join(workspace.path, "broll.jpg");
        await writeFile(localPath, Buffer.alloc(16));
        return [
          {
            artifactId: "broll_1",
            contentType: "image/jpeg",
            localPath,
            sizeBytes: 16,
          },
        ];
      }),
      preflightSource: vi.fn().mockResolvedValue({
        contentType: "video/mp4",
        durationSeconds: 120,
        estimatedSizeBytes: 32,
      }),
      probeMedia: vi.fn(async ({ localPath }) => {
        const metadata = await stat(localPath);
        return {
          audioCodec: "aac",
          container: "mp4",
          contentType: "video/mp4",
          durationSeconds: 30,
          hasAudio: true,
          hasVideo: true,
          height: 1920,
          sizeBytes: metadata.size,
          videoCodec: "h264",
          width: 1080,
        };
      }),
      render: vi.fn(async ({ workspace }) => {
        const localPath = join(workspace.path, "clip.mp4");
        await writeFile(localPath, Buffer.alloc(24));
        return [
          {
            artifactId: "clip_1",
            contentType: "video/mp4",
            fileName: "clip-1.mp4",
            localPath,
            sizeBytes: 24,
          },
        ];
      }),
      transcribe: vi.fn().mockResolvedValue({
        languageCode: "en",
        text: "A useful transcript.",
      }),
    },
    progress: {
      publish: vi.fn(async (event) => {
        progressEvents.push(event);
      }),
    },
  };

  return { dependencies, progressEvents, savedCheckpoints, workspacePaths };
}
