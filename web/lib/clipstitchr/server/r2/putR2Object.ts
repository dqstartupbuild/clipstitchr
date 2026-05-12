import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createR2Client } from "@/lib/clipstitchr/server/r2/createR2Client";
import { getR2Environment } from "@/lib/clipstitchr/server/r2/getR2Environment";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type PutR2ObjectOptions = {
  body: ArrayBuffer;
  contentType: string;
  key: string;
};

export async function putR2Object({
  body,
  contentType,
  key,
}: PutR2ObjectOptions): Promise<R2ObjectReference> {
  const environment = getR2Environment();
  const buffer = Buffer.from(body);

  await createR2Client().send(
    new PutObjectCommand({
      Bucket: environment.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return {
    key,
    contentType,
    size: buffer.byteLength,
  };
}
