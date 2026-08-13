import "server-only";

import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { createR2Client } from "@/lib/clipstitchr/server/r2/createR2Client";
import { getR2Environment } from "@/lib/clipstitchr/server/r2/getR2Environment";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import type { StudioStitchMaterializationProof } from "@/lib/clipstitchr/types/studioStitch/StudioStitchMaterializationProof";

type StudioStitchVerifiableOutput = {
  readonly audioCodec?: string;
  readonly byteLength: number;
  readonly contentType: string;
  readonly durationSeconds: number;
  readonly hasAudio?: boolean;
  readonly height?: number;
  readonly objectKey: string;
  readonly ownerId: string;
  readonly objectVersion?: string;
  readonly sha256?: string;
  readonly videoCodec?: string;
  readonly width?: number;
};

export async function verifyStudioStitchOutputObject(
  output: StudioStitchVerifiableOutput,
): Promise<StudioStitchMaterializationProof> {
  assertR2ObjectKeyBelongsToUser(output.objectKey, output.ownerId);
  if (
    output.contentType !== "video/mp4" ||
    !output.objectVersion ||
    !output.sha256 ||
    !/^[a-f0-9]{64}$/u.test(output.sha256) ||
    !output.videoCodec ||
    output.width === undefined ||
    output.height === undefined ||
    output.hasAudio === undefined
  ) {
    throw new Error("This Studio Stitch output is missing verified media facts.");
  }

  const environment = getR2Environment();
  const head = await createR2Client().send(
    new HeadObjectCommand({
      Bucket: environment.bucketName,
      ChecksumMode: "ENABLED",
      Key: output.objectKey,
    }),
    { abortSignal: AbortSignal.timeout(15_000) },
  );
  const contentType = head.ContentType?.toLowerCase().split(";", 1)[0];
  const etag = head.ETag?.replace(/^"|"$/gu, "");
  const versionMatches =
    head.VersionId === output.objectVersion || etag === output.objectVersion;
  const checksumMatches = head.ChecksumSHA256
    ? Buffer.from(head.ChecksumSHA256, "base64").toString("hex") === output.sha256
    : head.Metadata?.sha256 === output.sha256;

  if (
    head.ContentLength !== output.byteLength ||
    contentType !== output.contentType ||
    !versionMatches ||
    !checksumMatches
  ) {
    throw new Error(
      "The durable Studio Stitch object no longer matches its saved checksum, version, size, or media type.",
    );
  }

  return {
    ...(output.audioCodec ? { audioCodec: output.audioCodec } : {}),
    byteLength: output.byteLength,
    contentType: "video/mp4",
    durationSeconds: output.durationSeconds,
    hasAudio: output.hasAudio,
    height: output.height,
    objectKey: output.objectKey,
    objectVersion: output.objectVersion,
    sha256: output.sha256,
    videoCodec: output.videoCodec,
    width: output.width,
  };
}
