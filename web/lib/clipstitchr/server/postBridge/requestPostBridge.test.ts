import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestPostBridge } from "@/lib/clipstitchr/server/postBridge/requestPostBridge";
import { reservePostBridgeProviderRequest } from "@/lib/clipstitchr/server/postBridge/reservePostBridgeProviderRequest";
import { waitForPostBridgeRetry } from "@/lib/clipstitchr/server/postBridge/waitForPostBridgeRetry";

vi.mock("@/lib/clipstitchr/server/postBridge/reservePostBridgeProviderRequest", () => ({
  reservePostBridgeProviderRequest: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/postBridge/waitForPostBridgeRetry", () => ({
  waitForPostBridgeRetry: vi.fn(),
}));

describe("requestPostBridge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reserves provider capacity before sending a request", async () => {
    const fetchMock = vi.fn(async () => Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await requestPostBridge("/v1/posts", {
      apiKey: "provider_key",
      method: "POST",
    });

    expect(reservePostBridgeProviderRequest).toHaveBeenCalledWith("provider_key");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("paces every fallback retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 429 }))
      .mockResolvedValueOnce(Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await requestPostBridge("/v1/posts", {
      apiKey: "provider_key",
      method: "POST",
    });

    expect(reservePostBridgeProviderRequest).toHaveBeenCalledTimes(2);
    expect(waitForPostBridgeRetry).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
