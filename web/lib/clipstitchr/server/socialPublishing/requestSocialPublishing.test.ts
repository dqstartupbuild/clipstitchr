import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";
import { reserveSocialPublishingProviderRequest } from "@/lib/clipstitchr/server/socialPublishing/reserveSocialPublishingProviderRequest";
import { waitForSocialPublishingRetry } from "@/lib/clipstitchr/server/socialPublishing/waitForSocialPublishingRetry";

vi.mock("@/lib/clipstitchr/server/socialPublishing/reserveSocialPublishingProviderRequest", () => ({
  reserveSocialPublishingProviderRequest: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/socialPublishing/waitForSocialPublishingRetry", () => ({
  waitForSocialPublishingRetry: vi.fn(),
}));

describe("requestSocialPublishing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reserves provider capacity before sending a request", async () => {
    const fetchMock = vi.fn(async () => Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await requestSocialPublishing("/v1/posts", {
      apiKey: "provider_key",
      method: "POST",
    });

    expect(reserveSocialPublishingProviderRequest).toHaveBeenCalledWith("provider_key");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("paces every fallback retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 429 }))
      .mockResolvedValueOnce(Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await requestSocialPublishing("/v1/posts", {
      apiKey: "provider_key",
      method: "POST",
    });

    expect(reserveSocialPublishingProviderRequest).toHaveBeenCalledTimes(2);
    expect(waitForSocialPublishingRetry).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
