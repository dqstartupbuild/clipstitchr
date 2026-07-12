import { describe, expect, it, vi } from "vitest";
import { fetchHookLabRemoteVideo } from "@/lib/clipstitchr/server/hookLab/fetchHookLabRemoteVideo";

const publicDns = async () => [{ address: "93.184.216.34", family: 4 }];

describe("fetchHookLabRemoteVideo", () => {
  it("revalidates each redirect and streams a bounded video", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, {
          headers: { location: "https://media.example.com/final.mp4" },
          status: 302,
        }),
      )
      .mockResolvedValueOnce(
        new Response(new Uint8Array([1, 2, 3]), {
          headers: { "content-type": "video/mp4" },
          status: 200,
        }),
      );
    const resolveHostname = vi.fn(publicDns);

    await expect(
      fetchHookLabRemoteVideo({
        fetcher: fetcher as unknown as typeof fetch,
        maxBytes: 3,
        resolveHostname,
        url: "https://source.example.com/video",
      }),
    ).resolves.toEqual({
      bytes: new Uint8Array([1, 2, 3]),
      contentType: "video/mp4",
      finalUrl: "https://media.example.com/final.mp4",
    });
    expect(resolveHostname).toHaveBeenCalledTimes(2);
  });

  it("blocks a redirect to private infrastructure before the next fetch", async () => {
    const fetcher = vi.fn(async () =>
      new Response(null, {
        headers: { location: "https://127.0.0.1/private.mp4" },
        status: 302,
      }),
    );

    await expect(
      fetchHookLabRemoteVideo({
        fetcher: fetcher as unknown as typeof fetch,
        resolveHostname: publicDns,
        url: "https://source.example.com/video",
      }),
    ).rejects.toThrow("resolve to a public host");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("rejects non-video responses and content over the byte cap", async () => {
    const wrongTypeFetcher = vi.fn(async () =>
      new Response("not video", {
        headers: { "content-type": "text/html" },
      }),
    );
    const largeFetcher = vi.fn(async () =>
      new Response(new Uint8Array([1, 2, 3, 4]), {
        headers: { "content-type": "video/mp4" },
      }),
    );

    await expect(
      fetchHookLabRemoteVideo({
        fetcher: wrongTypeFetcher as unknown as typeof fetch,
        resolveHostname: publicDns,
        url: "https://source.example.com/video",
      }),
    ).rejects.toThrow("did not return a video");
    await expect(
      fetchHookLabRemoteVideo({
        fetcher: largeFetcher as unknown as typeof fetch,
        maxBytes: 3,
        resolveHostname: publicDns,
        url: "https://source.example.com/video",
      }),
    ).rejects.toThrow("too large");
  });
});
