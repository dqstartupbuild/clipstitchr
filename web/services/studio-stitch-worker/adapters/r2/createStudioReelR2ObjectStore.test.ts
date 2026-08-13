import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createStudioReelR2ObjectStore } from "./createStudioReelR2ObjectStore";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { force: true, recursive: true }),
    ),
  );
});

async function workspace() {
  const directory = await mkdtemp(join(tmpdir(), "stitch-r2-test-"));
  directories.push(directory);
  return directory;
}

const config = {
  accessKeyId: "access",
  accountId: "account",
  bucketName: "bucket",
  secretAccessKey: "secret",
};

describe("createStudioReelR2ObjectStore", () => {
  it("uploads only owner-scoped bytes and verifies checksum, version, and metadata", async () => {
    const directory = await workspace();
    const localPath = join(directory, "output.mp4");
    const body = Buffer.from([1, 2, 3, 4]);
    await writeFile(localPath, body);
    const sha256Hex = createHash("sha256").update(body).digest("hex");
    const sha256Base64 = createHash("sha256").update(body).digest("base64");
    const send = vi.fn(async (command: unknown, options?: { abortSignal?: AbortSignal }) => {
      expect(options?.abortSignal).toBeInstanceOf(AbortSignal);
      if (command instanceof PutObjectCommand) {
        expect(command.input).toMatchObject({
          Bucket: "bucket",
          ChecksumAlgorithm: "SHA256",
          ChecksumSHA256: sha256Base64,
          ContentLength: 4,
          ContentType: "video/mp4",
          Key: "users/user_1/studio/output.mp4",
          Metadata: { sha256: sha256Hex },
        });
        return {};
      }
      expect(command).toBeInstanceOf(HeadObjectCommand);
      return {
        ChecksumSHA256: sha256Base64,
        ContentLength: 4,
        ContentType: "video/mp4",
        VersionId: "version-12345678",
      };
    });
    const store = createStudioReelR2ObjectStore({ client: { send }, config });
    await expect(
      store.putFileVerified({
        contentType: "video/mp4",
        localPath,
        maximumBytes: 10,
        objectKey: "users/user_1/studio/output.mp4",
        ownerId: "user_1",
        sizeBytes: 4,
      }),
    ).resolves.toEqual({
      objectKey: "users/user_1/studio/output.mp4",
      objectVersion: "version-12345678",
      sha256Base64,
      sha256Hex,
      sizeBytes: 4,
    });
  });

  it("streams and checks claimed source bytes before use", async () => {
    const directory = await workspace();
    const outputPath = join(directory, "source.mp4");
    const body = Buffer.from([5, 6, 7]);
    const sha256 = createHash("sha256").update(body).digest("hex");
    const send = vi.fn(async (command: unknown) => {
      expect(command).toBeInstanceOf(GetObjectCommand);
      return {
        Body: (async function* () {
          yield body.subarray(0, 1);
          yield body.subarray(1);
        })(),
        ContentLength: 3,
        ContentType: "video/mp4",
        VersionId: "version-12345678",
      };
    });
    const store = createStudioReelR2ObjectStore({ client: { send }, config });
    await expect(
      store.downloadFile({
        manifest: {
          contentType: "video/mp4",
          durationSeconds: 3,
          objectKey: "users/user_1/studio/source.mp4",
          objectVersion: "version-12345678",
          sha256,
          sizeBytes: 3,
          source: { kind: "videoClip", videoClipId: "clip_1" },
        },
        maximumBytes: 3,
        outputPath,
        ownerId: "user_1",
      }),
    ).resolves.toEqual({ sha256Hex: sha256 });
    expect(await readFile(outputPath)).toEqual(body);
  });

  it("rejects cross-owner keys before contacting R2", async () => {
    const send = vi.fn();
    const store = createStudioReelR2ObjectStore({ client: { send }, config });
    await expect(
      store.downloadFile({
        manifest: {
          contentType: "video/mp4",
          durationSeconds: 3,
          objectKey: "users/user_2/studio/source.mp4",
          sizeBytes: 3,
          source: { kind: "videoClip", videoClipId: "clip_1" },
        },
        maximumBytes: 3,
        outputPath: "/tmp/never-written.mp4",
        ownerId: "user_1",
      }),
    ).rejects.toMatchObject({ code: "INVALID_R2_OBJECT_KEY" });
    expect(send).not.toHaveBeenCalled();
  });
});
