import { afterEach, describe, expect, it, vi } from "vitest";
import { putBlobToR2 } from "@/lib/clipstitchr/client/r2/putBlobToR2";

describe("putBlobToR2", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects a Blob whose actual bytes do not match the signed size", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      putBlobToR2({
        blob: new Blob(["four"]),
        contentType: "image/png",
        key: "slide.png",
        size: 1,
        url: "https://upload",
      }),
    ).rejects.toThrow("does not match its signed grant");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lets two creators converge on one immutable checksum-addressed object", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 412 }));
    vi.stubGlobal("fetch", fetchMock);
    const blob = new Blob(["same bytes"], { type: "image/png" });
    const checksumSha256 = `${"A".repeat(43)}=`;
    const options = {
      blob,
      checksumSha256,
      contentType: "image/png",
      key: "users/user_123/swipes/swipe_123/checksum-slide.png",
      preventOverwrite: true,
      size: blob.size,
      url: "https://upload",
    };

    await expect(
      Promise.all([putBlobToR2(options), putBlobToR2(options)]),
    ).resolves.toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://upload",
      expect.objectContaining({
        headers: expect.objectContaining({ "If-None-Match": "*" }),
      }),
    );
  });
});
