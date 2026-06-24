import { GetObjectCommand } from "@aws-sdk/client-s3";
import { createR2Client } from "@/lib/clipstitchr/server/r2/createR2Client";
import { getR2Environment } from "@/lib/clipstitchr/server/r2/getR2Environment";

export async function readBlogImageObject(key: string) {
  const environment = getR2Environment();
  const output = await createR2Client().send(
    new GetObjectCommand({
      Bucket: environment.bucketName,
      Key: key,
    }),
  );

  if (!output.Body) {
    throw new Error("Blog image not found.");
  }

  const contentType = output.ContentType ?? "application/octet-stream";

  if (!contentType.startsWith("image/")) {
    throw new Error("Blog image object is not an image.");
  }

  return {
    body: await output.Body.transformToByteArray(),
    contentType,
  };
}
