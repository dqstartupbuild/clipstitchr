import {
  firstTouchCookieName,
  lastTouchCookieName,
  sessionIdCookieName,
  visitorIdCookieName,
} from "@/lib/clipstitchr/analytics/analyticsCookieNames";
import { deleteCookieValue } from "@/lib/clipstitchr/analytics/deleteCookieValue";

export function deleteFirstPartyAnalyticsCookies() {
  deleteCookieValue(visitorIdCookieName);
  deleteCookieValue(sessionIdCookieName);
  deleteCookieValue(firstTouchCookieName);
  deleteCookieValue(lastTouchCookieName);
}
