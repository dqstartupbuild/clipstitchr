import { createHash } from "node:crypto";
import { getTikTokEventsApiClientIp } from "@/lib/clipstitchr/server/analytics/getTikTokEventsApiClientIp";

export function createTikTokEventsApiRateLimitKey(request: Request) {
  const clientIp = getTikTokEventsApiClientIp(request) ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  return createHash("sha256")
    .update(`${clientIp}:${userAgent}`)
    .digest("hex");
}
