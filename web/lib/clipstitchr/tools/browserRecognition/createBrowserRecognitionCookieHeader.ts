import { browserRecognitionCookieName } from "@/lib/clipstitchr/tools/browserRecognition/browserRecognitionCookieName";
import { browserRecognitionTtlSeconds } from "@/lib/clipstitchr/tools/browserRecognition/browserRecognitionTtlSeconds";

export function createBrowserRecognitionCookieHeader(
  token: string,
  secure: boolean,
) {
  const attributes = [
    `${browserRecognitionCookieName}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${browserRecognitionTtlSeconds}`,
    "HttpOnly",
    "SameSite=Strict",
  ];

  if (secure) attributes.push("Secure");

  return attributes.join("; ");
}
