import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createR2Client } from "@/lib/clipstitchr/server/r2/createR2Client";
import { getR2Environment } from "@/lib/clipstitchr/server/r2/getR2Environment";
import { getR2SignedUrlExpiresSeconds } from "@/lib/clipstitchr/server/r2/getR2SignedUrlExpiresSeconds";

type GetR2UploadSignedUrlOptions = {
  key: string;
  contentType: string;
};

export async function getR2UploadSignedUrl({
  key,
  contentType,
}: GetR2UploadSignedUrlOptions) {
  const expiresIn = getR2SignedUrlExpiresSeconds();
  const environment = getR2Environment();
  const command = new PutObjectCommand({
    Bucket: environment.bucketName,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(createR2Client(), command, { expiresIn });

  return {
    url,
    expiresIn,
  };
}
