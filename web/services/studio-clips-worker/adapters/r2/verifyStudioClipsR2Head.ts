import { ChecksumMode, HeadObjectCommand } from "@aws-sdk/client-s3";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import { normalizeStudioClipsR2Etag } from "./normalizeStudioClipsR2Etag";
import type { StudioClipsR2ObjectProof } from "./StudioClipsR2ObjectStore";
import type { StudioClipsS3Sender } from "./StudioClipsS3Sender";

export async function verifyStudioClipsR2Head(input: {
  bucketName: string;
  client: StudioClipsS3Sender;
  contentType: string;
  key: string;
  sha256Base64: string;
  sha256Hex: string;
  sizeBytes: number;
}): Promise<StudioClipsR2ObjectProof> {
  const head = await input.client.send(
    new HeadObjectCommand({
      Bucket: input.bucketName,
      ChecksumMode: ChecksumMode.ENABLED,
      Key: input.key,
    }),
  );
  if (
    head.ChecksumSHA256 !== input.sha256Base64 ||
    head.ContentLength !== input.sizeBytes ||
    head.ContentType !== input.contentType
  ) {
    throw new StudioClipsWorkerError({
      code: "R2_OBJECT_VERIFICATION_FAILED",
      kind: "retryable",
      publicMessage: "R2 could not verify the generated Studio Clips object.",
    });
  }

  return {
    etag: normalizeStudioClipsR2Etag(head.ETag),
    key: input.key,
    sha256Base64: input.sha256Base64,
    sha256Hex: input.sha256Hex,
    sizeBytes: input.sizeBytes,
    ...(typeof head.VersionId === "string" && head.VersionId
      ? { versionId: head.VersionId }
      : {}),
  };
}
