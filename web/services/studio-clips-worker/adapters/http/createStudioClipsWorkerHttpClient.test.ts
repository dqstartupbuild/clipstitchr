import { describe, expect, it, vi } from "vitest";
import { createStudioClipsWorkerHttpClient } from "./createStudioClipsWorkerHttpClient";

describe("createStudioClipsWorkerHttpClient", () => {
  it("posts only to a fixed worker path with the shared secret header", async () => {
    const request = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      void url;
      void init;
      return Response.json({ accepted: true });
    });
    const client = createStudioClipsWorkerHttpClient({
      config: {
        origin: "https://clipstitchr.test",
        requestTimeoutMs: 1_000,
        secret: "worker-secret",
      },
      fetch: request as typeof fetch,
    });

    await expect(client.post("/api/studio/clips/worker/progress", { value: 1 })).resolves.toEqual({
      accepted: true,
    });
    const [url, init] = request.mock.calls[0] ?? [];
    expect(init).toBeDefined();
    expect(url).toBe("https://clipstitchr.test/api/studio/clips/worker/progress");
    expect(new Headers(init?.headers).get("x-studio-clips-worker-secret")).toBe(
      "worker-secret",
    );
    expect(init?.redirect).toBe("error");
  });

  it("does not expose a coordinator-supplied error body", async () => {
    const client = createStudioClipsWorkerHttpClient({
      config: {
        origin: "https://clipstitchr.test",
        requestTimeoutMs: 1_000,
        secret: "worker-secret",
      },
      fetch: vi.fn(async () =>
        Response.json({ error: "token=do-not-leak" }, { status: 429 }),
      ),
    });

    await expect(
      client.post("/api/studio/clips/worker/claim", {}),
    ).rejects.toMatchObject({
      kind: "retryable",
      publicMessage: "The coordinator rejected the worker request.",
    });
  });
});
