import { beforeEach, describe, expect, it, vi } from "vitest";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";

const mocks = vi.hoisted(() => ({
  getHasAnalyticsConsentFromCookieHeader: vi.fn(),
  getPostHogClient: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/server/analytics/getHasAnalyticsConsentFromCookieHeader",
  () => ({
    getHasAnalyticsConsentFromCookieHeader:
      mocks.getHasAnalyticsConsentFromCookieHeader,
  }),
);

vi.mock("@/lib/posthog-server", () => ({
  getPostHogClient: mocks.getPostHogClient,
}));

function createRequest(cookieHeader: string | null = "cookie=value") {
  return new Request("https://example.test", {
    headers: cookieHeader
      ? {
          cookie: cookieHeader,
        }
      : undefined,
  });
}

describe("capturePostHogServerEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getHasAnalyticsConsentFromCookieHeader.mockReturnValue(true);
    mocks.getPostHogClient.mockReturnValue({
      capture: vi.fn(),
      shutdown: vi.fn(async () => undefined),
    });
  });

  it("skips capture when consent or the PostHog client is unavailable", async () => {
    mocks.getHasAnalyticsConsentFromCookieHeader.mockReturnValueOnce(false);

    await capturePostHogServerEvent({
      distinctId: "user_1",
      event: "Viewed page",
      request: createRequest(null),
    });

    expect(mocks.getPostHogClient).not.toHaveBeenCalled();

    mocks.getPostHogClient.mockReturnValueOnce(null);

    await capturePostHogServerEvent({
      distinctId: "user_1",
      event: "Viewed page",
      request: createRequest(),
    });

    expect(mocks.getPostHogClient).toHaveBeenCalledTimes(1);
  });

  it("captures and flushes consented events", async () => {
    const posthog = {
      capture: vi.fn(),
      shutdown: vi.fn(async () => undefined),
    };
    mocks.getPostHogClient.mockReturnValueOnce(posthog);

    await capturePostHogServerEvent({
      distinctId: "user_1",
      event: "Uploaded video",
      properties: {
        clipId: "clip_1",
      },
      request: createRequest("clipstitchr-cookie-consent=%7B%7D"),
    });

    expect(mocks.getHasAnalyticsConsentFromCookieHeader).toHaveBeenCalledWith(
      "clipstitchr-cookie-consent=%7B%7D",
    );
    expect(posthog.capture).toHaveBeenCalledWith({
      distinctId: "user_1",
      event: "Uploaded video",
      properties: {
        clipId: "clip_1",
      },
    });
    expect(posthog.shutdown).toHaveBeenCalled();
  });

  it("logs capture failures only in development", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const originalNodeEnv = process.env.NODE_ENV;
    const posthog = {
      capture: vi.fn(() => {
        throw new Error("capture failed");
      }),
      shutdown: vi.fn(async () => undefined),
    };

    vi.stubEnv("NODE_ENV", "test");
    mocks.getPostHogClient.mockReturnValueOnce(posthog);
    await capturePostHogServerEvent({
      distinctId: "user_1",
      event: "Uploaded video",
      request: createRequest(),
    });
    expect(warn).not.toHaveBeenCalled();

    vi.stubEnv("NODE_ENV", "development");
    mocks.getPostHogClient.mockReturnValueOnce(posthog);
    await capturePostHogServerEvent({
      distinctId: "user_1",
      event: "Uploaded video",
      request: createRequest(),
    });
    expect(warn).toHaveBeenCalledWith(
      "PostHog server capture failed.",
      expect.any(Error),
    );

    vi.stubEnv("NODE_ENV", originalNodeEnv);
    warn.mockRestore();
  });
});
