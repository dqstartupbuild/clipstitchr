import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import {
  ChecksumMode,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { StudioReelWorkerR2ObjectStore } from "../../contracts/StudioReelWorkerR2ObjectStore";
import type { StudioReelWorkerRuntimeConfig } from "../../contracts/StudioReelWorkerRuntimeConfig";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { assertStudioReelWorkerObjectKey } from "../../security/assertStudioReelWorkerObjectKey";
import { getStudioReelFileSha256 } from "./getStudioReelFileSha256";
import { normalizeStudioReelObjectVersion } from "./normalizeStudioReelObjectVersion";
import { writeStudioReelObjectBody } from "./writeStudioReelObjectBody";

export type StudioReelS3Sender = {
  send: (
    command: unknown,
    options?: { readonly abortSignal?: AbortSignal },
  ) => Promise<Record<string, unknown>>;
};

export function createStudioReelR2ObjectStore(input: {
  client?: StudioReelS3Sender;
  config: StudioReelWorkerRuntimeConfig["r2"];
}): StudioReelWorkerR2ObjectStore {
  const client =
    input.client ??
    (new S3Client({
      credentials: {
        accessKeyId: input.config.accessKeyId,
        secretAccessKey: input.config.secretAccessKey,
      },
      endpoint: `https://${input.config.accountId}.r2.cloudflarestorage.com`,
      region: "auto",
    }) as unknown as StudioReelS3Sender);
  return {
    downloadFile: async ({ manifest, maximumBytes, outputPath, ownerId }) => {
      assertStudioReelWorkerObjectKey(ownerId, manifest.objectKey);
      const response = await client.send(
        new GetObjectCommand({
          Bucket: input.config.bucketName,
          Key: manifest.objectKey,
        }),
        { abortSignal: AbortSignal.timeout(120_000) },
      );
      const contentType =
        typeof response.ContentType === "string"
          ? response.ContentType.toLowerCase().split(";", 1)[0]
          : "";
      const objectVersion = normalizeStudioReelObjectVersion({
        etag: response.ETag,
        versionId: response.VersionId,
      });
      if (
        response.ContentLength !== manifest.sizeBytes ||
        contentType !== manifest.contentType.toLowerCase().split(";", 1)[0] ||
        (manifest.objectVersion && manifest.objectVersion !== objectVersion)
      ) {
        throw new StudioReelWorkerError({
          code: "SOURCE_METADATA_MISMATCH",
          kind: "permanent",
          publicMessage: "A Studio Stitch source changed after its claim.",
        });
      }
      const size = await writeStudioReelObjectBody({
        body: response.Body,
        maximumBytes,
        outputPath,
      });
      const digest = await getStudioReelFileSha256(outputPath);
      if (
        size !== manifest.sizeBytes ||
        (manifest.sha256 && digest.hex !== manifest.sha256)
      ) {
        throw new StudioReelWorkerError({
          code: "SOURCE_CHECKSUM_MISMATCH",
          kind: "permanent",
          publicMessage: "A Studio Stitch source failed its integrity check.",
        });
      }
      return { sha256Hex: digest.hex };
    },
    putFileVerified: async ({
      contentType,
      localPath,
      maximumBytes,
      objectKey,
      ownerId,
      sizeBytes,
    }) => {
      assertStudioReelWorkerObjectKey(ownerId, objectKey);
      const file = await stat(localPath);
      if (
        !file.isFile() ||
        file.size !== sizeBytes ||
        file.size < 1 ||
        file.size > maximumBytes
      ) {
        throw new StudioReelWorkerError({
          code: "LOCAL_OUTPUT_MISMATCH",
          kind: "permanent",
          publicMessage: "A Studio Stitch output changed before upload.",
        });
      }
      const digest = await getStudioReelFileSha256(localPath);
      await client.send(
        new PutObjectCommand({
          Body: createReadStream(localPath),
          Bucket: input.config.bucketName,
          ChecksumAlgorithm: "SHA256",
          ChecksumSHA256: digest.base64,
          ContentLength: sizeBytes,
          ContentType: contentType,
          Key: objectKey,
          Metadata: { sha256: digest.hex },
        }),
        { abortSignal: AbortSignal.timeout(120_000) },
      );
      const head = await client.send(
        new HeadObjectCommand({
          Bucket: input.config.bucketName,
          ChecksumMode: ChecksumMode.ENABLED,
          Key: objectKey,
        }),
        { abortSignal: AbortSignal.timeout(30_000) },
      );
      if (
        head.ChecksumSHA256 !== digest.base64 ||
        head.ContentLength !== sizeBytes ||
        head.ContentType !== contentType
      ) {
        throw new StudioReelWorkerError({
          code: "R2_OUTPUT_VERIFICATION_FAILED",
          kind: "retryable",
          publicMessage: "R2 could not verify the generated Studio Stitch object.",
        });
      }
      return {
        objectKey,
        objectVersion: normalizeStudioReelObjectVersion({
          etag: head.ETag,
          versionId: head.VersionId,
        }),
        sha256Base64: digest.base64,
        sha256Hex: digest.hex,
        sizeBytes,
      };
    },
  };
}
