import { describe, expect, it, vi } from "vitest";

import { FetchProviderHttpClient } from "../src/provider-runtime/http/FetchProviderHttpClient.js";

describe("FetchProviderHttpClient", () => {
  it("parses a bounded provider JSON response", async () => {
    const fetchImplementation = vi.fn(async () =>
      new Response('{"ok":true}', {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ) as unknown as typeof fetch;
    const client = new FetchProviderHttpClient(
      ["https://open.tiktokapis.com"],
      1_000,
      fetchImplementation,
    );

    await expect(
      client.request({
        provider: "tiktok",
        url: "https://open.tiktokapis.com/v2/test",
        method: "GET",
      }),
    ).resolves.toMatchObject({ body: { ok: true } });
  });

  it("cancels the stream as soon as the one MiB ceiling is crossed", async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(700_000));
        controller.enqueue(new Uint8Array(700_000));
      },
      cancel,
    });
    const fetchImplementation = vi.fn(async () =>
      new Response(stream, { status: 200 }),
    ) as unknown as typeof fetch;
    const client = new FetchProviderHttpClient(
      ["https://graph.facebook.com"],
      1_000,
      fetchImplementation,
    );

    await expect(
      client.request({
        provider: "instagram",
        url: "https://graph.facebook.com/v26.0/me",
        method: "GET",
      }),
    ).rejects.toMatchObject({ code: "invalid_response" });
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("refuses a foreign origin before invoking fetch", async () => {
    const fetchImplementation = vi.fn() as unknown as typeof fetch;
    const client = new FetchProviderHttpClient(
      ["https://graph.facebook.com"],
      1_000,
      fetchImplementation,
    );
    await expect(
      client.request({
        provider: "instagram",
        url: "https://attacker.invalid/provider",
        method: "GET",
      }),
    ).rejects.toMatchObject({ code: "invalid_configuration" });
    expect(fetchImplementation).not.toHaveBeenCalled();
  });
});
