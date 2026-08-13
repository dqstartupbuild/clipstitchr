import { describe, expect, it, vi } from "vitest";
import { readStudioBetaBoundedJsonObject } from "./readStudioBetaBoundedJsonObject";

describe("readStudioBetaBoundedJsonObject", () => {
  it("reads a streamed JSON object with multibyte text by byte length", async () => {
    const encoded = new TextEncoder().encode('{"label":"cut ✂️"}');
    const request = new Request("https://clipstitchr.test/api/studio/example", {
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoded.slice(0, 16));
          controller.enqueue(encoded.slice(16));
          controller.close();
        },
      }),
      duplex: "half",
      method: "POST",
    } as RequestInit & { duplex: "half" });

    await expect(readStudioBetaBoundedJsonObject(request, 64)).resolves.toEqual({
      label: "cut ✂️",
    });
  });

  it("rejects an oversized declared body before reading it", async () => {
    const request = new Request("https://clipstitchr.test/api/studio/example", {
      body: "{}",
      headers: { "content-length": "65" },
      method: "POST",
    });

    await expect(readStudioBetaBoundedJsonObject(request, 64)).rejects.toThrow(
      "too large",
    );
  });

  it("cancels a missing-length stream immediately after it crosses the cap", async () => {
    const cancel = vi.fn();
    const request = new Request("https://clipstitchr.test/api/studio/example", {
      body: new ReadableStream<Uint8Array>({
        cancel,
        start(controller) {
          controller.enqueue(new Uint8Array(33));
        },
      }),
      duplex: "half",
      headers: { "content-length": "8" },
      method: "POST",
    } as RequestInit & { duplex: "half" });

    await expect(readStudioBetaBoundedJsonObject(request, 32)).rejects.toThrow(
      "too large",
    );
    expect(cancel).toHaveBeenCalledOnce();
  });
});
