import { describe, expect, it } from "vitest";
import { readLazyReelBoundedJsonBody } from "./readLazyReelBoundedJsonBody";

describe("readLazyReelBoundedJsonBody", () => {
  it("reads valid JSON within the request cap", async () => {
    await expect(
      readLazyReelBoundedJsonBody(
        new Request("https://clipstitchr.test", {
          body: JSON.stringify({ tool: "get_status" }),
          method: "POST",
        }),
      ),
    ).resolves.toEqual({ tool: "get_status" });
  });

  it("rejects a lying streamed body and cancels at the raw byte cap", async () => {
    let cancelled = false;
    const request = new Request("https://clipstitchr.test", {
      body: new ReadableStream<Uint8Array>({
        cancel() {
          cancelled = true;
        },
        start(controller) {
          controller.enqueue(new Uint8Array(32_769));
        },
      }),
      duplex: "half",
      headers: { "content-length": "8" },
      method: "POST",
    } as RequestInit & { duplex: "half" });

    await expect(readLazyReelBoundedJsonBody(request)).rejects.toThrow(
      "Research request is too large.",
    );
    expect(cancelled).toBe(true);
  });

  it("rejects malformed UTF-8 instead of replacing bytes", async () => {
    const request = new Request("https://clipstitchr.test", {
      body: new Uint8Array([0x7b, 0x22, 0x78, 0x22, 0x3a, 0x22, 0xc3, 0x28, 0x22, 0x7d]),
      method: "POST",
    });

    await expect(readLazyReelBoundedJsonBody(request)).rejects.toThrow(
      "Research request must be valid JSON.",
    );
  });

  it("rejects invalid JSON and oversized request bodies", async () => {
    await expect(
      readLazyReelBoundedJsonBody(
        new Request("https://clipstitchr.test", {
          body: "not-json",
          method: "POST",
        }),
      ),
    ).rejects.toThrow("Research request must be valid JSON.");

    await expect(
      readLazyReelBoundedJsonBody(
        new Request("https://clipstitchr.test", {
          body: JSON.stringify({ input: "x".repeat(33_000) }),
          method: "POST",
        }),
      ),
    ).rejects.toThrow("Research request is too large.");
  });
});
