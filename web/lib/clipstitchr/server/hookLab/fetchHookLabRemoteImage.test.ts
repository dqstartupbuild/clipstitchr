import { describe, expect, it, vi } from "vitest";
import { fetchHookLabRemoteImage } from "./fetchHookLabRemoteImage";

const publicDns = async () => [{ address: "93.184.216.34", family: 4 }];

describe("fetchHookLabRemoteImage", () => {
  it("accepts a bounded public image", async () => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      new Response(new Uint8Array([1, 2, 3]), {
        headers: { "content-type": "image/jpeg" },
      }),
    );

    await expect(
      fetchHookLabRemoteImage({
        fetcher: fetcher as unknown as typeof fetch,
        resolveHostname: publicDns,
        url: "https://cdn.example.com/slide.jpg",
      }),
    ).resolves.toEqual({
      bytes: new Uint8Array([1, 2, 3]),
      contentType: "image/jpeg",
      finalUrl: "https://cdn.example.com/slide.jpg",
    });
    expect(
      new Headers(fetcher.mock.calls[0]?.[1]?.headers).get("accept"),
    ).toBe("image/*");
  });

  it("rejects a non-image response", async () => {
    await expect(
      fetchHookLabRemoteImage({
        fetcher: (async () =>
          new Response("not an image", {
            headers: { "content-type": "text/html" },
          })) as typeof fetch,
        resolveHostname: publicDns,
        url: "https://cdn.example.com/slide.jpg",
      }),
    ).rejects.toThrow("did not return an image");
  });
});
