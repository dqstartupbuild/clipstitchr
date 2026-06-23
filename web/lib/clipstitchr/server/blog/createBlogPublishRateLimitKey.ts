import { createHash } from "node:crypto";

export function createBlogPublishRateLimitKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  return createHash("sha256")
    .update(`blog-publish:${clientIp}:${userAgent}`)
    .digest("hex");
}
