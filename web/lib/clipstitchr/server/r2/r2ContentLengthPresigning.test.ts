import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { describe, expect, it } from "vitest";

describe("R2 PUT content-length presigning contract", () => {
  it("includes the validated byte length in SigV4 signed headers", async () => {
    const client = new S3Client({
      credentials: {
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key",
      },
      endpoint: "https://example.r2.cloudflarestorage.com",
      region: "auto",
    });
    const url = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: "test-bucket",
        ContentLength: 123,
        ContentType: "image/png",
        Key: "test.png",
      }),
      { expiresIn: 60 },
    );
    const signedHeaders = new URL(url).searchParams.get("X-Amz-SignedHeaders");

    expect(signedHeaders?.split(";")).toContain("content-length");
  });
});
