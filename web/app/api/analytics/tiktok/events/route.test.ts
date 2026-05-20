import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/analytics/tiktok/events/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
  };

  return {
    convex,
    createConvexHttpClient: vi.fn(() => convex),
    createTikTokEventsApiPayload: vi.fn(),
    createTikTokEventsApiRateLimitKey: vi.fn(),
    getHasMarketingConsentFromCookieHeader: vi.fn(),
    getTikTokEventsApiAccessToken: vi.fn(),
    getTikTokEventsApiPixelId: vi.fn(),
    getTikTokEventsApiTestEventCode: vi.fn(),
    readTikTokEventsApiRequest: vi.fn(),
    sendTikTokEventsApiPayload: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeTikTokEventsApi: "rateLimits.consumeTikTokEventsApi",
    },
  },
}));

vi.mock(
  "@/lib/clipstitchr/server/analytics/createTikTokEventsApiPayload",
  () => ({
    createTikTokEventsApiPayload: mocks.createTikTokEventsApiPayload,
  }),
);

vi.mock(
  "@/lib/clipstitchr/server/analytics/createTikTokEventsApiRateLimitKey",
  () => ({
    createTikTokEventsApiRateLimitKey:
      mocks.createTikTokEventsApiRateLimitKey,
  }),
);

vi.mock(
  "@/lib/clipstitchr/server/analytics/getHasMarketingConsentFromCookieHeader",
  () => ({
    getHasMarketingConsentFromCookieHeader:
      mocks.getHasMarketingConsentFromCookieHeader,
  }),
);

vi.mock(
  "@/lib/clipstitchr/server/analytics/getTikTokEventsApiAccessToken",
  () => ({
    getTikTokEventsApiAccessToken: mocks.getTikTokEventsApiAccessToken,
  }),
);

vi.mock(
  "@/lib/clipstitchr/server/analytics/getTikTokEventsApiPixelId",
  () => ({
    getTikTokEventsApiPixelId: mocks.getTikTokEventsApiPixelId,
  }),
);

vi.mock(
  "@/lib/clipstitchr/server/analytics/getTikTokEventsApiTestEventCode",
  () => ({
    getTikTokEventsApiTestEventCode: mocks.getTikTokEventsApiTestEventCode,
  }),
);

vi.mock(
  "@/lib/clipstitchr/server/analytics/readTikTokEventsApiRequest",
  () => ({
    readTikTokEventsApiRequest: mocks.readTikTokEventsApiRequest,
  }),
);

vi.mock(
  "@/lib/clipstitchr/server/analytics/sendTikTokEventsApiPayload",
  () => ({
    sendTikTokEventsApiPayload: mocks.sendTikTokEventsApiPayload,
  }),
);

vi.mock(
  "@/lib/clipstitchr/server/convex/createConvexHttpClient",
  () => ({
    createConvexHttpClient: mocks.createConvexHttpClient,
  }),
);

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest(headers: HeadersInit = {}) {
  return new Request("https://clipstitchr.test/api/analytics/tiktok/events", {
    body: JSON.stringify({ event: "ViewContent" }),
    headers,
    method: "POST",
  });
}

describe("POST /api/analytics/tiktok/events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getHasMarketingConsentFromCookieHeader.mockReturnValue(true);
    mocks.getTikTokEventsApiAccessToken.mockReturnValue("access-token");
    mocks.getTikTokEventsApiPixelId.mockReturnValue("pixel_123");
    mocks.getTikTokEventsApiTestEventCode.mockReturnValue("TEST123");
    mocks.readTikTokEventsApiRequest.mockResolvedValue({
      event: "ViewContent",
      eventId: "event_123",
    });
    mocks.createTikTokEventsApiPayload.mockReturnValue({
      event_source: "web",
      event: "ViewContent",
    });
    mocks.createTikTokEventsApiRateLimitKey.mockReturnValue(
      "tiktok-events:127.0.0.1",
    );
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.sendTikTokEventsApiPayload.mockResolvedValue({
      code: 0,
      message: "OK",
    });
  });

  it("skips sending when marketing consent is missing", async () => {
    mocks.getHasMarketingConsentFromCookieHeader.mockReturnValue(false);

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      skipped: "marketing_consent_required",
    });
    expect(response.status).toBe(200);
    expect(mocks.getTikTokEventsApiAccessToken).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("skips sending when the access token is not configured", async () => {
    mocks.getTikTokEventsApiAccessToken.mockReturnValue("");

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      skipped: "missing_tiktok_events_api_access_token",
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("rejects oversized client event payloads before parsing", async () => {
    const response = await POST(
      createRequest({
        "content-length": String(32 * 1024 + 1),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: "TikTok Events API request is too large.",
    });
    expect(response.status).toBe(413);
    expect(mocks.readTikTokEventsApiRequest).not.toHaveBeenCalled();
  });

  it("consumes quota before sending a TikTok Events API payload", async () => {
    const request = createRequest({
      cookie: "clipstitchr_cookie_consent=v1",
    });
    const response = await POST(request);

    await expect(response.json()).resolves.toEqual({
      ok: true,
      result: {
        code: 0,
        message: "OK",
      },
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeTikTokEventsApi,
      {
        key: "tiktok-events:127.0.0.1",
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.createTikTokEventsApiPayload).toHaveBeenCalledWith({
      clientRequest: {
        event: "ViewContent",
        eventId: "event_123",
      },
      cookieHeader: "clipstitchr_cookie_consent=v1",
      pixelId: "pixel_123",
      request,
      testEventCode: "TEST123",
    });
    expect(mocks.sendTikTokEventsApiPayload).toHaveBeenCalledWith({
      accessToken: "access-token",
      payload: {
        event_source: "web",
        event: "ViewContent",
      },
    });
  });

  it("returns 429 before sending when TikTok event quota is exceeded", async () => {
    mocks.convex.mutation.mockRejectedValue({
      data: {
        kind: "RateLimited",
        name: "tiktokEventsApi",
        retryAfter: 1500,
      },
    });

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      error: "Rate limit exceeded. Try again in 2 seconds.",
      message: "Rate limit exceeded. Try again in 2 seconds.",
      rateLimit: "tiktokEventsApi",
      retryAfter: 1500,
      retryAfterSeconds: 2,
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("2");
    expect(mocks.sendTikTokEventsApiPayload).not.toHaveBeenCalled();
  });

  it("returns 400 when the client request cannot be parsed", async () => {
    mocks.readTikTokEventsApiRequest.mockRejectedValue(
      new Error("Missing event name."),
    );

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      error: "Missing event name.",
    });
    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });
});
