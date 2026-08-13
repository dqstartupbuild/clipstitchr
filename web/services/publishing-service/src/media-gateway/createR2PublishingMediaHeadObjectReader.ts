import {
  HeadObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";

import type { PublishingMediaHeadObject } from "./PublishingMediaHeadObject.js";

export const createR2PublishingMediaHeadObjectReader = (
  client: S3Client,
  bucketName: string,
): ((objectKey: string) => Promise<PublishingMediaHeadObject>) => {
  const normalizedBucketName = bucketName.trim();

  if (normalizedBucketName.length === 0) {
    throw new Error("Publishing media requires an R2 bucket.");
  }

  return async (objectKey) => {
    const response = await client.send(
      new HeadObjectCommand({
        Bucket: normalizedBucketName,
        Key: objectKey,
      }),
    );
    const checksumSha256 =
      response.ChecksumSHA256?.trim() ||
      response.Metadata?.["checksum-sha256"]?.trim() ||
      response.Metadata?.["sha256"]?.trim();
    const etag = response.ETag?.trim();
    const versionId = response.VersionId?.trim();

    return Object.freeze({
      byteLength: response.ContentLength ?? -1,
      ...(checksumSha256 === undefined ? {} : { checksumSha256 }),
      contentType: response.ContentType?.trim().toLowerCase() ?? "",
      ...(etag === undefined ? {} : { etag }),
      ...(versionId === undefined ? {} : { versionId }),
    });
  };
};
