import { tiktokPixelId } from "@/lib/clipstitchr/analytics/tiktokPixelId";
import { deleteCookieValue } from "@/lib/clipstitchr/analytics/deleteCookieValue";

export function deleteTikTokFirstPartyCookies() {
  if (typeof document === "undefined") {
    return;
  }

  const knownCookieNames = new Set([
    "_ttp",
    "_tt_enable_cookie",
    "ttclid",
    "ttcsid",
    `ttcsid_${tiktokPixelId}`,
  ]);

  for (const cookiePart of document.cookie.split("; ")) {
    const [cookieName] = cookiePart.split("=");

    if (cookieName?.startsWith("ttcsid_")) {
      knownCookieNames.add(cookieName);
    }
  }

  for (const cookieName of knownCookieNames) {
    deleteCookieValue(cookieName);
  }
}
