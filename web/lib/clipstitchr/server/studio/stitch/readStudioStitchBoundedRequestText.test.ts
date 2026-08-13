import { describe, expect, it, vi } from "vitest";
import { readStudioStitchBoundedRequestText } from "./readStudioStitchBoundedRequestText";

function createRequest(
  chunks: readonly Uint8Array[],
  declaredBytes?: number,
) {
  const cancel = vi.fn();
  let index = 0;
  return {
    cancel,
    request: {
      headers: new Headers(
        declaredBytes === undefined
          ? undefined
          : { "content-length": String(declaredBytes) },
      ),
      body: new ReadableStream<Uint8Array>({
        cancel,
        pull(controller) {
          const chunk = chunks[index];
          index += 1;
          if (chunk) controller.enqueue(chunk);
          else controller.close();
        },
      }),
    },
  };
}

describe("readStudioStitchBoundedRequestText", () => {
  it("cancels an unbounded stream without Content-Length at the byte cap", async () => {
    const input = createRequest([
      new Uint8Array([1, 2, 3]),
      new Uint8Array([4, 5, 6]),
    ]);
    await expect(
      readStudioStitchBoundedRequestText(input.request, 5),
    ).rejects.toThrow("byte limit");
    expect(input.cancel).toHaveBeenCalledOnce();
  });

  it("does not trust an underreported Content-Length", async () => {
    const input = createRequest(
      [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])],
      2,
    );
    await expect(
      readStudioStitchBoundedRequestText(input.request, 5),
    ).rejects.toThrow("byte limit");
    expect(input.cancel).toHaveBeenCalledOnce();
  });

  it("counts multibyte UTF-8 bytes instead of JavaScript characters", async () => {
    const value = new TextEncoder().encode("💡");
    const input = createRequest([value.subarray(0, 2), value.subarray(2)]);
    await expect(
      readStudioStitchBoundedRequestText(input.request, 4),
    ).resolves.toBe("💡");

    const over = createRequest([value], 1);
    await expect(
      readStudioStitchBoundedRequestText(over.request, 3),
    ).rejects.toThrow("byte limit");
    expect(over.cancel).toHaveBeenCalledOnce();
  });
});
