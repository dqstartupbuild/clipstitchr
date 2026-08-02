import type { PublishingMediaGatewayByteRange } from "@/lib/clipstitchr/publishing/media/gateway/PublishingMediaGatewayByteRange";
import type { PublishingMediaGatewayTokenClaims } from "@/lib/clipstitchr/publishing/media/gateway/PublishingMediaGatewayTokenClaims";

export function createPublishingMediaGatewayResponseHeaders(
  claims: PublishingMediaGatewayTokenClaims,
  range: PublishingMediaGatewayByteRange | null,
) {
  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store, max-age=0",
    "Content-Disposition": "inline",
    "Content-Length": String(range?.length ?? claims.sizeBytes),
    "Content-Type": claims.contentType,
    "Cross-Origin-Resource-Policy": "cross-origin",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });

  if (range) {
    headers.set("Content-Range", range.contentRange);
  }

  return headers;
}
