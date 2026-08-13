import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";

export function assertPublishingEmptyQuery(request: Request): void {
  if (request.url.length > 4_096) {
    throw new PublishingProxyRequestError(414, "request_uri_too_long");
  }
  if (new URL(request.url).searchParams.size !== 0) {
    throw new PublishingProxyRequestError(400, "invalid_query");
  }
}
