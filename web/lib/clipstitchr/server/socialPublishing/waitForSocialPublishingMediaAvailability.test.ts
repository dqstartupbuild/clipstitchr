import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { waitForSocialPublishingMediaAvailability } from "@/lib/clipstitchr/server/socialPublishing/waitForSocialPublishingMediaAvailability";
import { waitForSocialPublishingMediaAvailabilityRetry } from "@/lib/clipstitchr/server/socialPublishing/waitForSocialPublishingMediaAvailabilityRetry";

vi.mock(
  "@/lib/clipstitchr/server/socialPublishing/waitForSocialPublishingMediaAvailabilityRetry",
  () => ({
    waitForSocialPublishingMediaAvailabilityRetry: vi.fn(),
  }),
);

describe("waitForSocialPublishingMediaAvailability", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retries until Zernio's public media URL can be read", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response("x", { status: 206 }));
    vi.stubGlobal("fetch", fetchMock);

    await waitForSocialPublishingMediaAvailability(
      "https://media.zernio.test/post.png",
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://media.zernio.test/post.png",
      {
        cache: "no-store",
        headers: { Range: "bytes=0-0" },
        signal: expect.any(AbortSignal),
      },
    );
    expect(waitForSocialPublishingMediaAvailabilityRetry).toHaveBeenCalledOnce();
  });

  it("stops the post before Zernio receives an unreadable media URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 404 })),
    );

    await expect(
      waitForSocialPublishingMediaAvailability(
        "https://media.zernio.test/missing.png",
      ),
    ).rejects.toThrow("public link is not ready yet");
    expect(waitForSocialPublishingMediaAvailabilityRetry).toHaveBeenCalledTimes(3);
  });
});
