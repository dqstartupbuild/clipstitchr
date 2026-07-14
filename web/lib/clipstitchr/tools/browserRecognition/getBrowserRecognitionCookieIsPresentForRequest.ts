import "server-only";

import { cookies } from "next/headers";
import { browserRecognitionCookieName } from "@/lib/clipstitchr/tools/browserRecognition/browserRecognitionCookieName";

export async function getBrowserRecognitionCookieIsPresentForRequest() {
  const value = (await cookies()).get(browserRecognitionCookieName)?.value;

  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}
