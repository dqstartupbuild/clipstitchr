import { describe, expect, it } from "vitest";
import { readStudioReelProviderJson } from "./readStudioReelProviderJson";

describe("readStudioReelProviderJson", () => {
  it("rejects malformed UTF-8 instead of decoding replacement characters", async () => {
    const malformed = new Uint8Array([
      0x7b,
      0x22,
      0x76,
      0x61,
      0x6c,
      0x75,
      0x65,
      0x22,
      0x3a,
      0x22,
      0xc3,
      0x28,
      0x22,
      0x7d,
    ]);

    await expect(
      readStudioReelProviderJson(
        new Response(malformed, { status: 200 }),
        "Provider",
      ),
    ).rejects.toMatchObject({ code: "INVALID_PROVIDER_JSON" });
  });
});
