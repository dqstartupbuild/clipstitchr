import { describe, expect, it, vi } from "vitest";
import { readStudioReelBoundedResponseBody } from "./readStudioReelBoundedResponseBody";

function streamedResponse(
  chunks: readonly Uint8Array[],
  contentLength?: number,
) {
  const cancel = vi.fn();
  let index = 0;
  const stream = new ReadableStream<Uint8Array>({
    cancel,
    pull(controller) {
      const chunk = chunks[index];
      index += 1;
      if (chunk) controller.enqueue(chunk);
      else controller.close();
    },
  });
  return {
    cancel,
    response: new Response(stream, {
      ...(contentLength === undefined
        ? {}
        : { headers: { "content-length": String(contentLength) } }),
    }),
  };
}

describe("readStudioReelBoundedResponseBody", () => {
  it("cancels a stream that omits Content-Length and exceeds the cap", async () => {
    const input = streamedResponse([
      new Uint8Array([1, 2, 3]),
      new Uint8Array([4, 5, 6]),
    ]);

    await expect(
      readStudioReelBoundedResponseBody({
        maximumBytes: 5,
        response: input.response,
        tooLargeMessage: "too large",
      }),
    ).rejects.toMatchObject({ code: "RESPONSE_BODY_TOO_LARGE" });
    expect(input.cancel).toHaveBeenCalledTimes(1);
  });

  it("ignores an underreported Content-Length and enforces actual bytes", async () => {
    const input = streamedResponse(
      [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])],
      2,
    );

    await expect(
      readStudioReelBoundedResponseBody({
        maximumBytes: 5,
        response: input.response,
        tooLargeMessage: "too large",
      }),
    ).rejects.toMatchObject({ code: "RESPONSE_BODY_TOO_LARGE" });
    expect(input.cancel).toHaveBeenCalledTimes(1);
  });

  it("returns a bounded body exactly at the cap", async () => {
    const input = streamedResponse([
      new Uint8Array([1, 2]),
      new Uint8Array([3, 4, 5]),
    ]);

    await expect(
      readStudioReelBoundedResponseBody({
        maximumBytes: 5,
        response: input.response,
        tooLargeMessage: "too large",
      }),
    ).resolves.toEqual(new Uint8Array([1, 2, 3, 4, 5]));
  });
});
