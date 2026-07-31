import { afterEach, describe, expect, it } from "vitest";
import { getR2Environment } from "./getR2Environment";

const r2EnvironmentNames = [
  "R2_ENDPOINT",
  "R2_BUCKET",
  "R2_ACCOUNT_ID",
  "R2_BUCKET_NAME",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
] as const;
const originalR2Environment = Object.fromEntries(
  r2EnvironmentNames.map((name) => [name, process.env[name]]),
);

describe("getR2Environment", () => {
  afterEach(() => {
    for (const name of r2EnvironmentNames) {
      const originalValue = originalR2Environment[name];

      if (originalValue === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = originalValue;
      }
    }
  });

  it("reads the Blogr S3-compatible endpoint and bucket variables", () => {
    process.env.R2_ENDPOINT =
      "https://account-id.r2.cloudflarestorage.com";
    process.env.R2_BUCKET = "clipstitchr";
    process.env.R2_ACCESS_KEY_ID = "access-key";
    process.env.R2_SECRET_ACCESS_KEY = "secret-key";

    expect(getR2Environment()).toEqual({
      endpoint: "https://account-id.r2.cloudflarestorage.com",
      bucketName: "clipstitchr",
      accessKeyId: "access-key",
      secretAccessKey: "secret-key",
    });
  });

  it("keeps the existing account and bucket names as compatibility fallbacks", () => {
    process.env.R2_ACCOUNT_ID = "account-id";
    process.env.R2_BUCKET_NAME = "clipstitchr";
    process.env.R2_ACCESS_KEY_ID = "access-key";
    process.env.R2_SECRET_ACCESS_KEY = "secret-key";

    expect(getR2Environment()).toMatchObject({
      endpoint: "https://account-id.r2.cloudflarestorage.com",
      bucketName: "clipstitchr",
    });
  });
});
