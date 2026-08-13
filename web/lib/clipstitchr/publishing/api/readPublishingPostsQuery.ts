import type { PublishingPostStatus } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostStatus";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";

const PUBLISHING_POST_STATUSES = new Set<PublishingPostStatus>([
  "action-required",
  "canceled",
  "draft",
  "failed",
  "processing",
  "published",
  "queued",
  "uncertain",
]);

export function readPublishingPostsQuery(
  request: Request,
): PublishingPostStatus | undefined {
  if (request.url.length > 4_096) {
    throw new PublishingProxyRequestError(414, "request_uri_too_long");
  }
  const searchParams = new URL(request.url).searchParams;
  if (
    [...searchParams.keys()].some((key) => key !== "status") ||
    searchParams.getAll("status").length > 1
  ) {
    throw new PublishingProxyRequestError(400, "invalid_query");
  }
  const status = searchParams.get("status");
  if (status === null) {
    return undefined;
  }
  if (!PUBLISHING_POST_STATUSES.has(status as PublishingPostStatus)) {
    throw new PublishingProxyRequestError(400, "invalid_query");
  }
  return status as PublishingPostStatus;
}
