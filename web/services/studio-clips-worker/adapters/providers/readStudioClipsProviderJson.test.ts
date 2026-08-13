import { describe, expect, it, vi } from "vitest";
import { readStudioClipsProviderJson } from "./readStudioClipsProviderJson";

describe("readStudioClipsProviderJson", () => {
  it("rejects an oversized declared response before reading", async () => {
    const cancel = vi.fn();
    const response = new Response(
      new ReadableStream<Uint8Array>({ cancel }),
      { headers: { "content-length": "10" } },
    );
    await expect(readStudioClipsProviderJson(response, "Provider", 5)).rejects.toMatchObject({
      code: "PROVIDER_RESPONSE_TOO_LARGE",
    });
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("rejects malformed UTF-8 instead of replacement-decoding it", async () => {
    const response = new Response(new Uint8Array([0xc3, 0x28]));
    await expect(readStudioClipsProviderJson(response, "Provider")).rejects.toMatchObject({
      code: "INVALID_PROVIDER_RESPONSE",
    });
  });
});
