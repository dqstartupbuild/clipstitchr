import { describe, expect, it, vi } from "vitest";
import { readStudioClipsHttpResponse } from "./readStudioClipsHttpResponse";

describe("readStudioClipsHttpResponse", () => {
  it("rejects an oversized declared coordinator response before reading", async () => {
    const cancel = vi.fn();
    const response = new Response(
      new ReadableStream<Uint8Array>({ cancel }),
      { headers: { "content-length": "1048577" } },
    );
    await expect(readStudioClipsHttpResponse(response)).rejects.toMatchObject({
      code: "WORKER_API_RESPONSE_TOO_LARGE",
    });
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("rejects malformed UTF-8", async () => {
    const response = new Response(new Uint8Array([0xc3, 0x28]));
    await expect(readStudioClipsHttpResponse(response)).rejects.toMatchObject({
      code: "INVALID_WORKER_API_RESPONSE",
    });
  });

  it("does not surface a coordinator error body", async () => {
    const response = Response.json(
      { error: "internal secret: abc123" },
      { status: 500 },
    );
    await expect(readStudioClipsHttpResponse(response)).rejects.toMatchObject({
      publicMessage: "The coordinator rejected the worker request.",
    });
  });
});
