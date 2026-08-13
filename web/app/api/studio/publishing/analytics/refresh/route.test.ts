import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/studio/publishing/analytics/refresh/route";

const mocks = vi.hoisted(() => ({
  requestPublishingService: vi.fn(),
  requirePublishingProxyAuthentication: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/publishing/service/requestPublishingService",
  () => ({ requestPublishingService: mocks.requestPublishingService }),
);
vi.mock(
  "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication",
  () => ({
    requirePublishingProxyAuthentication:
      mocks.requirePublishingProxyAuthentication,
  }),
);

describe("Studio publishing analytics refresh route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePublishingProxyAuthentication.mockResolvedValue({
      productId: "product_123",
    });
    mocks.requestPublishingService.mockResolvedValue({
      body: { status: "queued" },
      retryAfterSeconds: undefined,
      status: 202,
    });
  });

  it("binds the refresh to the trusted active Product", async () => {
    const response = await POST(
      new Request(
        "https://clipstitchr.test/api/studio/publishing/analytics/refresh",
        {
          body: JSON.stringify({ postId: "post_123" }),
          headers: { "content-type": "application/json" },
          method: "POST",
        },
      ),
    );

    expect(mocks.requestPublishingService).toHaveBeenCalledWith({
      action: "publishing.analytics.refresh",
      body: { postId: "post_123", productId: "product_123" },
      method: "POST",
      path: "/v1/analytics/refresh",
    });
    expect(response.status).toBe(202);
  });

  it("rejects browser-supplied Product or malformed post identifiers", async () => {
    for (const body of [
      { postId: "post_123", productId: "product_other" },
      { postId: "../post_123" },
    ]) {
      const response = await POST(
        new Request(
          "https://clipstitchr.test/api/studio/publishing/analytics/refresh",
          {
            body: JSON.stringify(body),
            headers: { "content-type": "application/json" },
            method: "POST",
          },
        ),
      );
      expect(response.status).toBe(400);
    }
    expect(mocks.requestPublishingService).not.toHaveBeenCalled();
  });
});
