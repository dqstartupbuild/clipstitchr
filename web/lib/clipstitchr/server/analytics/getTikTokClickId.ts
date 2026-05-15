import type { FirstPartyAttribution } from "@/lib/clipstitchr/analytics/FirstPartyAttribution";
import { lastTouchCookieName } from "@/lib/clipstitchr/analytics/analyticsCookieNames";
import { getServerCookieValue } from "@/lib/clipstitchr/server/analytics/getServerCookieValue";

function getClickIdFromAttributionCookie(cookieHeader: string | null) {
  const storedValue = getServerCookieValue(cookieHeader, lastTouchCookieName);

  if (!storedValue) {
    return undefined;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Partial<FirstPartyAttribution>;

    return parsedValue.clickIdType === "ttclid" ? parsedValue.clickId : undefined;
  } catch {
    return undefined;
  }
}

export function getTikTokClickId({
  cookieHeader,
  pageUrl,
}: {
  cookieHeader: string | null;
  pageUrl?: string;
}) {
  if (pageUrl) {
    try {
      const ttclid = new URL(pageUrl).searchParams.get("ttclid")?.trim();

      if (ttclid) {
        return ttclid;
      }
    } catch {
      return getClickIdFromAttributionCookie(cookieHeader);
    }
  }

  return getClickIdFromAttributionCookie(cookieHeader);
}
