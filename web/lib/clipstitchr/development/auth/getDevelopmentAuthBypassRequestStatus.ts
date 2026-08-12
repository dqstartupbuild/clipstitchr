import { headers } from "next/headers";
import { developmentAuthBypassHeaderName } from "@/lib/clipstitchr/development/auth/developmentAuthBypassHeaderName";
import { isDevelopmentAuthBypassEnabled } from "@/lib/clipstitchr/development/auth/isDevelopmentAuthBypassEnabled";

export async function getDevelopmentAuthBypassRequestStatus(): Promise<boolean> {
  const requestHeaders = await headers();

  if (requestHeaders.get(developmentAuthBypassHeaderName) !== "1") {
    return false;
  }

  return isDevelopmentAuthBypassEnabled({
    enabledValue: process.env.DEV_AUTH_BYPASS_ENABLED,
    hostname:
      requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "",
    nodeEnv: process.env.NODE_ENV,
  });
}
