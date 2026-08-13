import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import {
  ChecksumMode,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsWorkerRuntimeConfig } from "../../runtime/StudioClipsWorkerRuntimeConfig";
import { assertStudioClipsR2ObjectKey } from "./assertStudioClipsR2ObjectKey";
import { getStudioClipsFileSha256 } from "./getStudioClipsFileSha256";
import { normalizeStudioClipsR2Etag } from "./normalizeStudioClipsR2Etag";
import { readStudioClipsObjectBody } from "./readStudioClipsObjectBody";
import type {
  StudioClipsR2ObjectStore,
} from "./StudioClipsR2ObjectStore";
import type { StudioClipsS3Sender } from "./StudioClipsS3Sender";
import { verifyStudioClipsR2Head } from "./verifyStudioClipsR2Head";
import { writeStudioClipsObjectBody } from "./writeStudioClipsObjectBody";

export function createStudioClipsR2ObjectStore(input: {
  client?: StudioClipsS3Sender;
  config: StudioClipsWorkerRuntimeConfig["r2"];
}): StudioClipsR2ObjectStore {
  const client =
    input.client ??
    (new S3Client({
      credentials: {
        accessKeyId: input.config.accessKeyId,
        secretAccessKey: input.config.secretAccessKey,
      },
      endpoint: `https://${input.config.accountId}.r2.cloudflarestorage.com`,
      region: "auto",
    }) as unknown as StudioClipsS3Sender);

  return {
    downloadFile: async ({
      contentType,
      expectedEtag,
      key,
      maximumBytes,
      outputPath,
      sizeBytes,
    }) => {
      assertStudioClipsR2ObjectKey(key);
      const response = await client.send(
        new GetObjectCommand({ Bucket: input.config.bucketName, Key: key }),
      );
      const responseContentType =
        typeof response.ContentType === "string"
          ? response.ContentType.toLowerCase().split(";", 1)[0]
          : undefined;
      if (
        response.ContentLength !== sizeBytes ||
        responseContentType !== contentType ||
        (expectedEtag !== undefined &&
          normalizeStudioClipsR2Etag(response.ETag) !== expectedEtag)
      ) {
        throw new StudioClipsWorkerError({
          code: "SOURCE_METADATA_MISMATCH",
          kind: "permanent",
          publicMessage: "The source file changed after the claim was created.",
        });
      }
      const written = await writeStudioClipsObjectBody({
        body: response.Body,
        maximumBytes,
        outputPath,
      });
      if (written !== sizeBytes) {
        throw new StudioClipsWorkerError({
          code: "SOURCE_METADATA_MISMATCH",
          kind: "permanent",
          publicMessage: "The source file changed after the claim was created.",
        });
      }
      return { sha256Hex: (await getStudioClipsFileSha256(outputPath)).hex };
    },
    getBytes: async ({ key, maximumBytes, sha256Hex, sizeBytes }) => {
      assertStudioClipsR2ObjectKey(key);
      const response = await client.send(
        new GetObjectCommand({ Bucket: input.config.bucketName, Key: key }),
      );
      const body = await readStudioClipsObjectBody(response.Body, maximumBytes);
      const digest = createHash("sha256").update(body).digest("hex");
      if (body.byteLength !== sizeBytes || digest !== sha256Hex) {
        throw new StudioClipsWorkerError({
          code: "CHECKPOINT_OBJECT_MISMATCH",
          kind: "permanent",
          publicMessage: "The Studio Clips resume object failed integrity checks.",
        });
      }
      return body;
    },
    inspectFile: async ({ key }) => {
      assertStudioClipsR2ObjectKey(key);
      const head = await client.send(
        new HeadObjectCommand({
          Bucket: input.config.bucketName,
          ChecksumMode: ChecksumMode.ENABLED,
          Key: key,
        }),
      );
      if (
        typeof head.ContentLength !== "number" ||
        !Number.isSafeInteger(head.ContentLength) ||
        head.ContentLength < 1 ||
        typeof head.ContentType !== "string" ||
        !head.ContentType
      ) {
        throw new StudioClipsWorkerError({
          code: "R2_OBJECT_METADATA_INVALID",
          kind: "permanent",
          publicMessage: "The Studio Clips object metadata is invalid.",
        });
      }
      return {
        contentType: head.ContentType.toLowerCase().split(";", 1)[0] ?? "",
        etag: normalizeStudioClipsR2Etag(head.ETag),
        sizeBytes: head.ContentLength,
        ...(typeof head.VersionId === "string" && head.VersionId
          ? { versionId: head.VersionId }
          : {}),
      };
    },
    putBytesVerified: async ({ body, contentType, key }) => {
      assertStudioClipsR2ObjectKey(key);
      const digest = createHash("sha256").update(body).digest();
      const sha256Base64 = digest.toString("base64");
      const sha256Hex = digest.toString("hex");
      await client.send(
        new PutObjectCommand({
          Body: body,
          Bucket: input.config.bucketName,
          ChecksumAlgorithm: "SHA256",
          ChecksumSHA256: sha256Base64,
          ContentLength: body.byteLength,
          ContentType: contentType,
          Key: key,
          Metadata: { sha256: sha256Hex },
        }),
      );
      return verifyStudioClipsR2Head({
        bucketName: input.config.bucketName,
        client,
        contentType,
        key,
        sha256Base64,
        sha256Hex,
        sizeBytes: body.byteLength,
      });
    },
    putFileVerified: async ({
      contentType,
      key,
      localPath,
      maximumBytes,
      sizeBytes,
    }) => {
      assertStudioClipsR2ObjectKey(key);
      const file = await stat(localPath);
      if (!file.isFile() || file.size !== sizeBytes || file.size > maximumBytes) {
        throw new StudioClipsWorkerError({
          code: "LOCAL_ARTIFACT_MISMATCH",
          kind: "permanent",
          publicMessage: "A Studio Clips file changed before it was saved.",
        });
      }
      const digest = await getStudioClipsFileSha256(localPath);
      await client.send(
        new PutObjectCommand({
          Body: createReadStream(localPath),
          Bucket: input.config.bucketName,
          ChecksumAlgorithm: "SHA256",
          ChecksumSHA256: digest.base64,
          ContentLength: sizeBytes,
          ContentType: contentType,
          Key: key,
          Metadata: { sha256: digest.hex },
        }),
      );
      return verifyStudioClipsR2Head({
        bucketName: input.config.bucketName,
        client,
        contentType,
        key,
        sha256Base64: digest.base64,
        sha256Hex: digest.hex,
        sizeBytes,
      });
    },
  };
}
