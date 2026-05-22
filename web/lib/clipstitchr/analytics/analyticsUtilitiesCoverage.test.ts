import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyCookieConsentPreferences } from "@/lib/clipstitchr/analytics/applyCookieConsentPreferences";
import { applyPostHogCookieConsent } from "@/lib/clipstitchr/analytics/applyPostHogCookieConsent";
import { createCookieConsentPreferences } from "@/lib/clipstitchr/analytics/createCookieConsentPreferences";
import { createTikTokEventId } from "@/lib/clipstitchr/analytics/createTikTokEventId";
import { disableTikTokTracking } from "@/lib/clipstitchr/analytics/disableTikTokTracking";
import { getHasAnalyticsConsent } from "@/lib/clipstitchr/analytics/getHasAnalyticsConsent";
import { getHasMarketingConsent } from "@/lib/clipstitchr/analytics/getHasMarketingConsent";
import { getTikTokPayloadEventId } from "@/lib/clipstitchr/analytics/getTikTokPayloadEventId";
import { setStoredCookieConsent } from "@/lib/clipstitchr/analytics/setStoredCookieConsent";
import { trackSubscriptionPurchase } from "@/lib/clipstitchr/analytics/trackSubscriptionPurchase";
import { trackTikTokButtonClick } from "@/lib/clipstitchr/analytics/trackTikTokButtonClick";
import { trackTikTokEvent } from "@/lib/clipstitchr/analytics/trackTikTokEvent";
import { trackTikTokEventsApiEvent } from "@/lib/clipstitchr/analytics/trackTikTokEventsApiEvent";
import { trackTikTokPageView } from "@/lib/clipstitchr/analytics/trackTikTokPageView";
import { trackTikTokViewContent } from "@/lib/clipstitchr/analytics/trackTikTokViewContent";

const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  posthog: {
    capture: vi.fn(),
    opt_in_capturing: vi.fn(),
    opt_out_capturing: vi.fn(),
    reset: vi.fn(),
  },
  ttq: {
    disableCookie: vi.fn(),
    enableCookie: vi.fn(),
    grantConsent: vi.fn(),
    identify: vi.fn(),
    page: vi.fn(),
    revokeConsent: vi.fn(),
    track: vi.fn(),
  },
}));

vi.mock("posthog-js", () => ({
  default: mocks.posthog,
}));

function createDocumentStub() {
  return {
    cookie: "",
    referrer: "https://referrer.example/source",
  };
}

function createWindowStub() {
  return {
    location: {
      href: "https://clipstitchr.test/dashboard?utm_source=newsletter&ttclid=click_1",
      pathname: "/dashboard",
      protocol: "https:",
      search: "?utm_source=newsletter&ttclid=click_1",
    },
    ttq: mocks.ttq,
  };
}

describe("analytics utilities", () => {
  const originalPostHogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("document", createDocumentStub());
    vi.stubGlobal("window", createWindowStub());
    vi.stubGlobal("fetch", mocks.fetch);
    vi.setSystemTime(new Date("2026-05-20T12:00:00.000Z"));
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = "posthog_token";
    mocks.fetch.mockResolvedValue(new Response(null, { status: 204 }));
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = originalPostHogToken;
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("applies analytics and marketing consent decisions", () => {
    const grantedPreferences = createCookieConsentPreferences({
      analytics: true,
      marketing: true,
    });
    const deniedPreferences = createCookieConsentPreferences({
      analytics: false,
      marketing: false,
    });

    applyCookieConsentPreferences(grantedPreferences);
    expect(mocks.posthog.opt_in_capturing).toHaveBeenCalledWith({
      captureEventName: false,
    });

    applyCookieConsentPreferences(deniedPreferences);

    expect(mocks.ttq.disableCookie).toHaveBeenCalledOnce();
    expect(mocks.ttq.revokeConsent).toHaveBeenCalledOnce();
    expect(mocks.posthog.opt_out_capturing).toHaveBeenCalledOnce();
    expect(mocks.posthog.reset).toHaveBeenCalledOnce();
  });

  it("returns early for server-side or unconfigured PostHog consent", () => {
    vi.unstubAllGlobals();
    applyPostHogCookieConsent(
      createCookieConsentPreferences({ analytics: true, marketing: true }),
    );

    vi.stubGlobal("window", createWindowStub());
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = "";
    applyPostHogCookieConsent(
      createCookieConsentPreferences({ analytics: true, marketing: true }),
    );

    expect(mocks.posthog.opt_in_capturing).not.toHaveBeenCalled();
  });

  it("reads stored cookie consent and disables TikTok tracking", () => {
    setStoredCookieConsent(
      createCookieConsentPreferences({
        analytics: true,
        marketing: false,
      }),
    );

    expect(getHasAnalyticsConsent()).toBe(true);
    expect(getHasMarketingConsent()).toBe(false);

    disableTikTokTracking();

    expect(mocks.ttq.disableCookie).toHaveBeenCalledOnce();
    expect(mocks.ttq.revokeConsent).toHaveBeenCalledOnce();
  });

  it("tracks TikTok browser and events API payloads when marketing is allowed", () => {
    setStoredCookieConsent(
      createCookieConsentPreferences({
        analytics: true,
        marketing: true,
      }),
    );

    trackTikTokEvent(
      "ViewContent",
      {
        content_id: "clip_1",
        event_id: "event_1",
      },
      {
        user: {
          email: "creator@example.com",
        },
      },
    );
    trackTikTokEventsApiEvent("ClickButton", {});
    trackTikTokEventsApiEvent("ClickButton", {
      event_id: "event_2",
    });
    trackTikTokPageView();
    trackTikTokButtonClick({
      contentCategory: "Waitlist",
      contentId: "waitlist_submit_button",
      contentName: "Join waitlist",
    });
    trackTikTokViewContent("/docs");

    expect(mocks.ttq.track).toHaveBeenCalledWith(
      "ViewContent",
      expect.objectContaining({ event_id: "event_1" }),
    );
    expect(mocks.fetch).toHaveBeenCalledWith(
      "/api/analytics/tiktok/events",
      expect.objectContaining({
        body: expect.stringContaining('"eventId":"event_1"'),
        keepalive: true,
      }),
    );
    expect(mocks.fetch).toHaveBeenCalledWith(
      "/api/analytics/tiktok/events",
      expect.objectContaining({
        body: expect.stringContaining('"eventId":"event_2"'),
      }),
    );
    expect(mocks.ttq.page).toHaveBeenCalledOnce();
    expect(mocks.ttq.track).toHaveBeenCalledWith(
      "ClickButton",
      expect.objectContaining({
        contents: expect.arrayContaining([
          expect.objectContaining({
            content_id: "waitlist_submit_button",
          }),
        ]),
      }),
    );
    expect(mocks.ttq.track).toHaveBeenCalledWith(
      "ViewContent",
      expect.objectContaining({
        contents: expect.arrayContaining([
          expect.objectContaining({
            content_id: "docs",
          }),
        ]),
      }),
    );
  });

  it("skips TikTok tracking without marketing consent or browser globals", () => {
    setStoredCookieConsent(
      createCookieConsentPreferences({
        analytics: true,
        marketing: false,
      }),
    );

    trackTikTokEvent("ClickButton", { content_id: "blocked" });
    trackTikTokEventsApiEvent("ClickButton", { event_id: "blocked" });
    trackTikTokPageView();

    vi.unstubAllGlobals();
    trackTikTokEvent("ClickButton", { content_id: "server" });
    trackTikTokEventsApiEvent("ClickButton", { event_id: "server" });
    trackTikTokPageView();

    expect(mocks.ttq.track).not.toHaveBeenCalled();
    expect(mocks.ttq.page).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("creates and reads TikTok event ids and purchase tracking", () => {
    expect(getTikTokPayloadEventId({ event_id: "event_123" })).toBe("event_123");
    expect(getTikTokPayloadEventId({ event_id: "" })).toBeNull();
    expect(getTikTokPayloadEventId()).toBeNull();
    expect(createTikTokEventId("Click Button")).toMatch(/^cs_click_button_/);

    setStoredCookieConsent(
      createCookieConsentPreferences({
        analytics: true,
        marketing: true,
      }),
    );
    trackSubscriptionPurchase({
      currency: "USD",
      externalId: "external_1",
      planName: "Pro",
      value: 49,
    });

    expect(mocks.ttq.track).toHaveBeenCalledWith(
      "Purchase",
      expect.objectContaining({
        contents: expect.arrayContaining([
          expect.objectContaining({
            content_id: "subscription_purchase",
            content_name: "Pro",
          }),
        ]),
        value: 49,
      }),
    );
  });
});
