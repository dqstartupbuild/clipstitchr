import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createR2Client } from "@/lib/clipstitchr/server/r2/createR2Client";
import { getR2Environment } from "@/lib/clipstitchr/server/r2/getR2Environment";
import { getR2SignedUrlExpiresSeconds } from "@/lib/clipstitchr/server/r2/getR2SignedUrlExpiresSeconds";

type GetR2UploadSignedUrlOptions = {
  key: string;
  contentType: string;
  sizeBytes?: number;
};

export async function getR2UploadSignedUrl({
  key,
  contentType,
  sizeBytes,
}: GetR2UploadSignedUrlOptions) {
  if (
    sizeBytes !== undefined &&
    (!Number.isSafeInteger(sizeBytes) || sizeBytes < 1)
  ) {
    throw new Error("R2 upload size is invalid.");
  }
  const expiresIn = getR2SignedUrlExpiresSeconds();
  const environment = getR2Environment();
  const command = new PutObjectCommand({
    Bucket: environment.bucketName,
    ...(sizeBytes === undefined ? {} : { ContentLength: sizeBytes }),
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(createR2Client(), command, {
    expiresIn,
    ...(sizeBytes === undefined
      ? {}
      : { signableHeaders: new Set(["content-length"]) }),
  });

  return {
    url,
    expiresIn,
  };
}
