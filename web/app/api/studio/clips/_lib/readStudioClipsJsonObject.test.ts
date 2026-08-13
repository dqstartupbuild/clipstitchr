import { describe, expect, it, vi } from "vitest";
import { readStudioClipsJsonObject } from "./readStudioClipsJsonObject";

function createStudioClipsJsonRequest(input: {
  chunks: readonly Uint8Array[];
  contentLength?: number;
}) {
  const cancel = vi.fn();
  let index = 0;
  const body = new ReadableStream<Uint8Array>({
    cancel,
    pull(controller) {
      const chunk = input.chunks[index];
      index += 1;
      if (chunk) controller.enqueue(chunk);
      else controller.close();
    },
  });
  return {
    cancel,
    request: {
      body,
      headers: new Headers(
        input.contentLength === undefined
          ? undefined
          : { "content-length": String(input.contentLength) },
      ),
    } as unknown as Request,
  };
}

describe("readStudioClipsJsonObject", () => {
  it("cancels a body without Content-Length as soon as it crosses the byte cap", async () => {
    const input = createStudioClipsJsonRequest({
      chunks: [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])],
    });

    await expect(readStudioClipsJsonObject(input.request, 5)).rejects.toThrow(
      "request body is invalid",
    );
    expect(input.cancel).toHaveBeenCalledOnce();
  });

  it("does not trust an underreported Content-Length", async () => {
    const input = createStudioClipsJsonRequest({
      chunks: [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])],
      contentLength: 2,
    });

    await expect(readStudioClipsJsonObject(input.request, 5)).rejects.toThrow(
      "request body is invalid",
    );
    expect(input.cancel).toHaveBeenCalledOnce();
  });

  it("rejects an oversized declared length before reading", async () => {
    const input = createStudioClipsJsonRequest({
      chunks: [new TextEncoder().encode("{}")],
      contentLength: 6,
    });

    await expect(readStudioClipsJsonObject(input.request, 5)).rejects.toThrow(
      "request body is invalid",
    );
    expect(input.cancel).toHaveBeenCalledOnce();
  });

  it("counts multibyte UTF-8 bytes and decodes split code points", async () => {
    const encoded = new TextEncoder().encode('{"label":"💡"}');
    const input = createStudioClipsJsonRequest({
      chunks: [encoded.subarray(0, 11), encoded.subarray(11)],
    });

    await expect(
      readStudioClipsJsonObject(input.request, encoded.byteLength),
    ).resolves.toEqual({ label: "💡" });

    const over = createStudioClipsJsonRequest({ chunks: [encoded] });
    await expect(
      readStudioClipsJsonObject(over.request, encoded.byteLength - 1),
    ).rejects.toThrow("request body is invalid");
    expect(over.cancel).toHaveBeenCalledOnce();
  });
});
