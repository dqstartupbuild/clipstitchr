import { afterEach, describe, expect, it, vi } from "vitest";
import { cookieConsentCookieName } from "@/lib/clipstitchr/analytics/cookieConsentCookieName";
import { cookieConsentVersion } from "@/lib/clipstitchr/analytics/cookieConsentVersion";
import { getStoredCookieConsent } from "@/lib/clipstitchr/analytics/getStoredCookieConsent";

describe("getStoredCookieConsent", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses valid stored cookie consent preferences", () => {
    const preferences = {
      analytics: true,
      marketing: false,
      necessary: true,
      updatedAt: "2026-05-20T00:00:00.000Z",
      version: cookieConsentVersion,
    };

    vi.stubGlobal("document", {
      cookie: `${cookieConsentCookieName}=${encodeURIComponent(
        JSON.stringify(preferences),
      )}`,
    });

    expect(getStoredCookieConsent()).toEqual(preferences);
  });

  it("rejects missing, malformed, and stale consent cookies", () => {
    expect(getStoredCookieConsent()).toBeNull();

    vi.stubGlobal("document", {
      cookie: `${cookieConsentCookieName}=not-json`,
    });
    expect(getStoredCookieConsent()).toBeNull();

    vi.stubGlobal("document", {
      cookie: `${cookieConsentCookieName}=${encodeURIComponent(
        JSON.stringify({
          analytics: true,
          marketing: true,
          necessary: true,
          updatedAt: "2026-05-20T00:00:00.000Z",
          version: "old",
        }),
      )}`,
    });
    expect(getStoredCookieConsent()).toBeNull();
  });
});
