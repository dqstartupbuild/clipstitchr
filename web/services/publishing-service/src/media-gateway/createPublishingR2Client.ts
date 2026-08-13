import { S3Client } from "@aws-sdk/client-s3";

export const createPublishingR2Client = (input: {
  accessKeyId: string;
  accountId: string;
  secretAccessKey: string;
}): S3Client =>
  new S3Client({
    credentials: {
      accessKeyId: input.accessKeyId,
      secretAccessKey: input.secretAccessKey,
    },
    endpoint: `https://${input.accountId}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    region: "auto",
  });
