import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { createStudioClipsTestClaim } from "../../testing/createStudioClipsTestClaim";
import { createStudioClipsCompletionEvidence } from "../../runtime/createStudioClipsCompletionEvidence";
import type { StudioClipsR2ObjectStore } from "./StudioClipsR2ObjectStore";
import { createStudioClipsCheckpointStore } from "./createStudioClipsCheckpointStore";

describe("createStudioClipsCheckpointStore", () => {
  it("rejects malformed UTF-8 in a checkpoint document", async () => {
    const workspace = await mkdtemp(join(tmpdir(), "studio-clips-invalid-checkpoint-"));
    const malformed = new Uint8Array([0xc3, 0x28]);
    const digest = createHash("sha256").update(malformed).digest("hex");
    const claim = createStudioClipsTestClaim();
    const store = createStudioClipsCheckpointStore({
      evidence: createStudioClipsCompletionEvidence(),
      heartbeat: {
        run: async <Result>({ operation }: { operation: () => Promise<Result> }) =>
          operation(),
      },
      http: {
        post: vi.fn(async () => ({
          checkpoint: "source_acquired",
          revision: 1,
          snapshotJson: JSON.stringify({
            key: "users/user_123/studio/v1/studio-clips/product_123/task_123/_checkpoints/attempt-1/revisions/1.json",
            schemaVersion: "studio-clips-r2-checkpoint-v1",
            sha256Hex: digest,
            sizeBytes: malformed.byteLength,
          }),
        })),
      },
      objects: {
        downloadFile: vi.fn(),
        getBytes: vi.fn(async () => malformed),
        inspectFile: vi.fn(),
        putBytesVerified: vi.fn(),
        putFileVerified: vi.fn(),
      },
      startingRevision: 1,
    });

    try {
      await expect(
        store.restore({
          claim,
          resume: { checkpoint: "source_acquired", revision: 1 },
          workspace: { assertWithinBudget: vi.fn(), maxBytes: 1_000, path: workspace },
        }),
      ).rejects.toMatchObject({ code: "INVALID_CHECKPOINT_DOCUMENT" });
    } finally {
      await rm(workspace, { force: true, recursive: true });
    }
  });

  it("persists file bytes outside the bounded JSON snapshot and restores them by digest", async () => {
    const firstWorkspace = await mkdtemp(join(tmpdir(), "studio-clips-save-test-"));
    const secondWorkspace = await mkdtemp(join(tmpdir(), "studio-clips-restore-test-"));
    const sourcePath = join(firstWorkspace, "source.mp4");
    await writeFile(sourcePath, "source-bytes");
    const objects = new Map<string, { body: Buffer; contentType: string }>();
    let snapshotJson = "";
    const objectStore: StudioClipsR2ObjectStore = {
      downloadFile: vi.fn(async ({ contentType, key, outputPath, sizeBytes }) => {
        const object = objects.get(key);
        if (!object || object.contentType !== contentType || object.body.length !== sizeBytes) {
          throw new Error("Object mismatch");
        }
        await writeFile(outputPath, object.body);
        return { sha256Hex: createHash("sha256").update(object.body).digest("hex") };
      }),
      getBytes: vi.fn(async ({ key }) => objects.get(key)?.body ?? Buffer.alloc(0)),
      inspectFile: vi.fn(),
      putBytesVerified: vi.fn(async ({ body, contentType, key }) => {
        const buffer = Buffer.from(body);
        objects.set(key, { body: buffer, contentType });
        const digest = createHash("sha256").update(buffer).digest();
        return {
          etag: "checkpoint-etag",
          key,
          sha256Base64: digest.toString("base64"),
          sha256Hex: digest.toString("hex"),
          sizeBytes: buffer.length,
        };
      }),
      putFileVerified: vi.fn(async ({ contentType, key, localPath }) => {
        const buffer = await readFile(localPath);
        objects.set(key, { body: buffer, contentType });
        const digest = createHash("sha256").update(buffer).digest();
        return {
          etag: "checkpoint-file-etag",
          key,
          sha256Base64: digest.toString("base64"),
          sha256Hex: digest.toString("hex"),
          sizeBytes: buffer.length,
        };
      }),
    };
    const http = {
      post: vi.fn(async (path: string, body: unknown) => {
        if (path.endsWith("/save")) {
          snapshotJson = (body as { snapshotJson: string }).snapshotJson;
          return { checkpoint: "media_validated", revision: 1 };
        }
        return { checkpoint: "media_validated", revision: 1, snapshotJson };
      }),
    };
    const heartbeat = {
      run: async <Result>({ operation }: { operation: () => Promise<Result> }) =>
        operation(),
    };
    const claim = createStudioClipsTestClaim();
    const evidence = createStudioClipsCompletionEvidence();
    evidence.recordAnalysis({ summary: "restored" });
    const store = createStudioClipsCheckpointStore({
      evidence,
      heartbeat,
      http,
      objects: objectStore,
      startingRevision: 0,
    });

    try {
      await expect(
        store.save({
          checkpoint: "media_validated",
          claim,
          state: {
            media: {
              audioCodec: "aac",
              container: "mp4",
              contentType: "video/mp4",
              durationSeconds: 30,
              hasAudio: true,
              hasVideo: true,
              height: 1080,
              sizeBytes: 12,
              videoCodec: "h264",
              width: 1920,
            },
            source: { contentType: "video/mp4", localPath: sourcePath, sizeBytes: 12 },
          },
          workspace: {
            assertWithinBudget: vi.fn(),
            maxBytes: 1_000,
            path: firstWorkspace,
          },
        }),
      ).resolves.toEqual({ revision: 1 });

      const restoredEvidence = createStudioClipsCompletionEvidence();
      const restored = await createStudioClipsCheckpointStore({
        evidence: restoredEvidence,
        heartbeat,
        http,
        objects: objectStore,
        startingRevision: 1,
      }).restore({
        claim,
        resume: { checkpoint: "media_validated", revision: 1 },
        workspace: {
          assertWithinBudget: vi.fn(),
          maxBytes: 1_000,
          path: secondWorkspace,
        },
      });
      expect(await readFile(restored.source!.localPath, "utf8")).toBe("source-bytes");
      expect(restoredEvidence.getAnalysis()).toEqual({ summary: "restored" });
      expect(snapshotJson).not.toContain(firstWorkspace);
    } finally {
      await rm(firstWorkspace, { force: true, recursive: true });
      await rm(secondWorkspace, { force: true, recursive: true });
    }
  });
});
