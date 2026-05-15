import {
  attributionCookieMaxAgeSeconds,
  sessionCookieMaxAgeSeconds,
  visitorCookieMaxAgeSeconds,
} from "@/lib/clipstitchr/analytics/cookieMaxAgeSeconds";
import { createAnalyticsId } from "@/lib/clipstitchr/analytics/createAnalyticsId";
import { createFirstPartyAttribution } from "@/lib/clipstitchr/analytics/createFirstPartyAttribution";
import { getCookieValue } from "@/lib/clipstitchr/analytics/getCookieValue";
import { setCookieValue } from "@/lib/clipstitchr/analytics/setCookieValue";
import {
  firstTouchCookieName,
  lastTouchCookieName,
  sessionIdCookieName,
  visitorIdCookieName,
} from "@/lib/clipstitchr/analytics/analyticsCookieNames";

export function setFirstPartyAnalyticsCookies() {
  const visitorId = getCookieValue(visitorIdCookieName) ?? createAnalyticsId();
  const sessionId = getCookieValue(sessionIdCookieName) ?? createAnalyticsId();

  setCookieValue(visitorIdCookieName, visitorId, visitorCookieMaxAgeSeconds);
  setCookieValue(
    sessionIdCookieName,
    sessionId,
    sessionCookieMaxAgeSeconds,
  );

  const attribution = createFirstPartyAttribution();

  if (!attribution) {
    return;
  }

  const attributionValue = JSON.stringify(attribution);

  if (!getCookieValue(firstTouchCookieName)) {
    setCookieValue(
      firstTouchCookieName,
      attributionValue,
      attributionCookieMaxAgeSeconds,
    );
  }

  setCookieValue(
    lastTouchCookieName,
    attributionValue,
    attributionCookieMaxAgeSeconds,
  );
}
