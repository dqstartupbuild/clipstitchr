import { describe, expect, it, vi } from "vitest";

import { FetchYouTubeUploadTransport } from "../src/provider-runtime/youtube/FetchYouTubeUploadTransport.js";

describe("FetchYouTubeUploadTransport", () => {
  it("streams an exact media-gateway range into the resumable session", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(new Uint8Array([1, 2, 3, 4]), {
          status: 206,
          headers: {
            "content-length": "4",
            "content-range": "bytes 0-3/10",
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 308,
          headers: { range: "bytes=0-3" },
        }),
      );
    const transport = new FetchYouTubeUploadTransport(
      "https://media.clipstitchr.example",
      fetchImplementation,
    );
    const sessionUri =
      "https://www.googleapis.com/upload/youtube/v3/videos?upload_id=session_1&uploadType=resumable";

    await expect(
      transport.uploadRange({
        accessToken: "access-secret",
        contentType: "video/mp4",
        endOffsetInclusive: 3,
        mediaUrl:
          "https://media.clipstitchr.example/api/studio/publishing/media/sealed-token",
        sessionUri,
        startOffset: 0,
        totalBytes: 10,
      }),
    ).resolves.toEqual({ kind: "active", committedOffset: 4 });
    expect(fetchImplementation).toHaveBeenCalledTimes(2);
    expect(fetchImplementation.mock.calls[0]?.[1]).toMatchObject({
      method: "GET",
      headers: { Range: "bytes=0-3" },
      redirect: "error",
    });
    const upload = fetchImplementation.mock.calls[1];
    expect(String(upload?.[0])).toBe(sessionUri);
    expect(upload?.[1]).toMatchObject({
      method: "PUT",
      headers: expect.objectContaining({
        "Content-Length": "4",
        "Content-Range": "bytes 0-3/10",
        "Content-Type": "video/mp4",
      }),
      redirect: "error",
    });
    expect(upload?.[1]?.body).toBeInstanceOf(ReadableStream);
  });

  it("probes before resume and rejects non-gateway source URLs", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, {
        status: 308,
        headers: { range: "bytes=0-7" },
      }),
    );
    const transport = new FetchYouTubeUploadTransport(
      "https://media.clipstitchr.example",
      fetchImplementation,
    );
    const sessionUri =
      "https://www.googleapis.com/upload/youtube/v3/videos?upload_id=session_1";
    await expect(
      transport.probe({
        accessToken: "access-secret",
        sessionUri,
        totalBytes: 20,
      }),
    ).resolves.toEqual({ kind: "active", committedOffset: 8 });
    expect(fetchImplementation.mock.calls[0]?.[1]).toMatchObject({
      method: "PUT",
      headers: expect.objectContaining({
        "Content-Length": "0",
        "Content-Range": "bytes */20",
      }),
      redirect: "error",
    });
    await expect(
      transport.uploadRange({
        accessToken: "access-secret",
        contentType: "video/mp4",
        endOffsetInclusive: 9,
        mediaUrl: "https://evil.example/api/studio/publishing/media/token",
        sessionUri,
        startOffset: 8,
        totalBytes: 20,
      }),
    ).rejects.toMatchObject({ code: "invalid_request" });
  });
});
