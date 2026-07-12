import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createR2Client } from "@/lib/clipstitchr/server/r2/createR2Client";
import { getR2Environment } from "@/lib/clipstitchr/server/r2/getR2Environment";

export async function deleteR2Object(
  key: string,
  { abortSignal }: { abortSignal?: AbortSignal } = {},
) {
  const environment = getR2Environment();

  await createR2Client().send(
    new DeleteObjectCommand({
      Bucket: environment.bucketName,
      Key: key,
    }),
    { abortSignal },
  );
}
