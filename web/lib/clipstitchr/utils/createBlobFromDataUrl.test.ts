import { describe, expect, it } from "vitest";
import { createBlobFromDataUrl } from "@/lib/clipstitchr/utils/createBlobFromDataUrl";

describe("createBlobFromDataUrl", () => {
  it("decodes base64 data URLs without fetching them", async () => {
    const blob = await createBlobFromDataUrl("data:text/plain;base64,SGVsbG8=");

    expect(blob.type).toBe("text/plain");
    await expect(blob.text()).resolves.toBe("Hello");
  });

  it("decodes escaped text data URLs", async () => {
    const blob = await createBlobFromDataUrl("data:text/plain,Hello%20there");

    await expect(blob.text()).resolves.toBe("Hello there");
  });
});
