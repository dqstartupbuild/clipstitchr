import { describe, expect, it } from "vitest";
import { createSha256Base64ChecksumForBlob } from "@/lib/clipstitchr/publishing/media/createSha256Base64ChecksumForBlob";

describe("createSha256Base64ChecksumForBlob", () => {
  it("creates the base64 SHA-256 form required by R2", async () => {
    await expect(
      createSha256Base64ChecksumForBlob(new Blob(["hello"])),
    ).resolves.toBe("LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=");
  });
});
