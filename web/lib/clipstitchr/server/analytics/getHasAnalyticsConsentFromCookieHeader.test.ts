import { describe, expect, it } from "vitest";
import { cookieConsentCookieName } from "@/lib/clipstitchr/analytics/cookieConsentCookieName";
import { cookieConsentVersion } from "@/lib/clipstitchr/analytics/cookieConsentVersion";
import { getHasAnalyticsConsentFromCookieHeader } from "@/lib/clipstitchr/server/analytics/getHasAnalyticsConsentFromCookieHeader";
import { getHasMarketingConsentFromCookieHeader } from "@/lib/clipstitchr/server/analytics/getHasMarketingConsentFromCookieHeader";

function createConsentCookieHeader({
  analytics,
  marketing,
  version = cookieConsentVersion,
}: {
  analytics: boolean;
  marketing: boolean;
  version?: string;
}) {
  const value = encodeURIComponent(
    JSON.stringify({
      analytics,
      marketing,
      necessary: true,
      updatedAt: "2026-05-16T00:00:00.000Z",
      version,
    }),
  );

  return `${cookieConsentCookieName}=${value}`;
}

describe("getHasAnalyticsConsentFromCookieHeader", () => {
  it("reads analytics consent from the shared consent cookie", () => {
    const cookieHeader = createConsentCookieHeader({
      analytics: true,
      marketing: false,
    });

    expect(getHasAnalyticsConsentFromCookieHeader(cookieHeader)).toBe(true);
    expect(getHasMarketingConsentFromCookieHeader(cookieHeader)).toBe(false);
  });

  it("does not grant consent for stale or missing preferences", () => {
    expect(getHasAnalyticsConsentFromCookieHeader(null)).toBe(false);
    expect(
      getHasAnalyticsConsentFromCookieHeader(
        createConsentCookieHeader({
          analytics: true,
          marketing: true,
          version: "stale",
        }),
      ),
    ).toBe(false);
  });
});
