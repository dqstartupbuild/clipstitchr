import { S3Client } from "@aws-sdk/client-s3";
import { getR2Environment } from "@/lib/clipstitchr/server/r2/getR2Environment";

export function createR2Client() {
  const environment = getR2Environment();

  return new S3Client({
    region: "auto",
    endpoint: environment.endpoint,
    credentials: {
      accessKeyId: environment.accessKeyId,
      secretAccessKey: environment.secretAccessKey,
    },
  });
}
