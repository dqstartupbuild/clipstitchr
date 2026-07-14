import { browserRecognitionCookieName } from "@/lib/clipstitchr/tools/browserRecognition/browserRecognitionCookieName";

export function readBrowserRecognitionToken(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = part.trim().split("=");

    if (rawName !== browserRecognitionCookieName) continue;

    try {
      const value = decodeURIComponent(rawValueParts.join("="));
      return /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null;
    } catch {
      return null;
    }
  }

  return null;
}
