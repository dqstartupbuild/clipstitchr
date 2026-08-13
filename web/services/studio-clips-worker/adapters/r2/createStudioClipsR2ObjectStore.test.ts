import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { createStudioClipsR2ObjectStore } from "./createStudioClipsR2ObjectStore";

describe("createStudioClipsR2ObjectStore", () => {
  it("sends canonical SHA-256 and HEAD-verifies immutable output identity", async () => {
    const workspace = await mkdtemp(join(tmpdir(), "studio-clips-r2-test-"));
    const localPath = join(workspace, "clip.mp4");
    const body = Buffer.from("verified-video");
    await writeFile(localPath, body);
    let putInput: Record<string, unknown> | undefined;
    const send = vi.fn(async (command: unknown) => {
      const candidate = command as { constructor: { name: string }; input: Record<string, unknown> };
      if (candidate.constructor.name === "PutObjectCommand") {
        putInput = candidate.input;
        return {};
      }
      if (candidate.constructor.name === "HeadObjectCommand") {
        return {
          ChecksumSHA256: putInput?.ChecksumSHA256,
          ContentLength: body.byteLength,
          ContentType: "video/mp4",
          ETag: '"0123456789abcdef"',
          VersionId: "version-1",
        };
      }
      throw new Error("Unexpected command");
    });
    const store = createStudioClipsR2ObjectStore({
      client: { send },
      config: {
        accessKeyId: "key",
        accountId: "a".repeat(32),
        bucketName: "clips",
        secretAccessKey: "secret",
      },
    });

    try {
      const proof = await store.putFileVerified({
        contentType: "video/mp4",
        key: "users/user/studio/v1/studio-clips/product/task/clip/clip.mp4",
        localPath,
        maximumBytes: 1_000,
        sizeBytes: body.byteLength,
      });
      const expectedBase64 = createHash("sha256").update(body).digest("base64");
      expect(putInput).toMatchObject({
        ChecksumAlgorithm: "SHA256",
        ChecksumSHA256: expectedBase64,
      });
      expect(proof).toMatchObject({
        etag: "0123456789abcdef",
        sha256Base64: expectedBase64,
        versionId: "version-1",
      });
      expect(
        send.mock.calls.map(
          ([command]) =>
            (command as { constructor: { name: string } }).constructor.name,
        ),
      ).toEqual(["PutObjectCommand", "HeadObjectCommand"]);
    } finally {
      await rm(workspace, { force: true, recursive: true });
    }
  });

  it("fails closed when HeadObject omits the canonical checksum", async () => {
    const store = createStudioClipsR2ObjectStore({
      client: {
        send: vi.fn(async (command: unknown) =>
          (command as { constructor: { name: string } }).constructor.name ===
          "HeadObjectCommand"
            ? { ContentLength: 2, ContentType: "application/json", ETag: '"identity123"' }
            : {},
        ),
      },
      config: {
        accessKeyId: "key",
        accountId: "a".repeat(32),
        bucketName: "clips",
        secretAccessKey: "secret",
      },
    });

    await expect(
      store.putBytesVerified({
        body: Buffer.from("{}"),
        contentType: "application/json",
        key: "users/user/studio/v1/studio-clips/product/task/_checkpoints/one.json",
      }),
    ).rejects.toMatchObject({ code: "R2_OBJECT_VERIFICATION_FAILED" });
  });
});
