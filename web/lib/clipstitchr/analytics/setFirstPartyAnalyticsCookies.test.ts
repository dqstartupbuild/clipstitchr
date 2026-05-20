import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  firstTouchCookieName,
  lastTouchCookieName,
  sessionIdCookieName,
  visitorIdCookieName,
} from "@/lib/clipstitchr/analytics/analyticsCookieNames";
import { setFirstPartyAnalyticsCookies } from "@/lib/clipstitchr/analytics/setFirstPartyAnalyticsCookies";

const mocks = vi.hoisted(() => ({
  createAnalyticsId: vi.fn(),
  createFirstPartyAttribution: vi.fn(),
  getCookieValue: vi.fn(),
  setCookieValue: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/analytics/createAnalyticsId", () => ({
  createAnalyticsId: mocks.createAnalyticsId,
}));

vi.mock("@/lib/clipstitchr/analytics/createFirstPartyAttribution", () => ({
  createFirstPartyAttribution: mocks.createFirstPartyAttribution,
}));

vi.mock("@/lib/clipstitchr/analytics/getCookieValue", () => ({
  getCookieValue: mocks.getCookieValue,
}));

vi.mock("@/lib/clipstitchr/analytics/setCookieValue", () => ({
  setCookieValue: mocks.setCookieValue,
}));

describe("setFirstPartyAnalyticsCookies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createAnalyticsId
      .mockReturnValueOnce("visitor_generated")
      .mockReturnValueOnce("session_generated");
    mocks.createFirstPartyAttribution.mockReturnValue({
      capturedAt: "2026-05-20T00:00:00.000Z",
      landingPage: "/",
    });
    mocks.getCookieValue.mockReturnValue(null);
  });

  it("creates visitor, session, first-touch, and last-touch cookies", () => {
    setFirstPartyAnalyticsCookies();

    expect(mocks.setCookieValue).toHaveBeenCalledWith(
      visitorIdCookieName,
      "visitor_generated",
      expect.any(Number),
    );
    expect(mocks.setCookieValue).toHaveBeenCalledWith(
      sessionIdCookieName,
      "session_generated",
      expect.any(Number),
    );
    expect(mocks.setCookieValue).toHaveBeenCalledWith(
      firstTouchCookieName,
      JSON.stringify({
        capturedAt: "2026-05-20T00:00:00.000Z",
        landingPage: "/",
      }),
      expect.any(Number),
    );
    expect(mocks.setCookieValue).toHaveBeenCalledWith(
      lastTouchCookieName,
      expect.any(String),
      expect.any(Number),
    );
  });

  it("reuses existing ids and preserves the existing first touch", () => {
    mocks.getCookieValue.mockImplementation((name: string) => {
      if (name === visitorIdCookieName) {
        return "visitor_existing";
      }

      if (name === sessionIdCookieName) {
        return "session_existing";
      }

      if (name === firstTouchCookieName) {
        return "first_existing";
      }

      return null;
    });

    setFirstPartyAnalyticsCookies();

    expect(mocks.createAnalyticsId).not.toHaveBeenCalled();
    expect(mocks.setCookieValue).toHaveBeenCalledWith(
      visitorIdCookieName,
      "visitor_existing",
      expect.any(Number),
    );
    expect(mocks.setCookieValue).not.toHaveBeenCalledWith(
      firstTouchCookieName,
      expect.any(String),
      expect.any(Number),
    );
    expect(mocks.setCookieValue).toHaveBeenCalledWith(
      lastTouchCookieName,
      expect.any(String),
      expect.any(Number),
    );
  });

  it("skips attribution cookies when attribution is unavailable", () => {
    mocks.createFirstPartyAttribution.mockReturnValue(null);

    setFirstPartyAnalyticsCookies();

    expect(mocks.setCookieValue).toHaveBeenCalledTimes(2);
  });
});
