import { createHash } from "node:crypto";

export function createCliClientRateLimitKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const realIp =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    "";
  const userAgent = request.headers.get("user-agent") ?? "";

  return createHash("sha256")
    .update([forwardedFor.split(",")[0].trim(), realIp, userAgent].join("|"))
    .digest("hex");
}
