import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";

export function readPublishingAnalyticsQuery(
  request: Request,
): "30d" | "7d" | "90d" {
  if (request.url.length > 4_096) {
    throw new PublishingProxyRequestError(414, "request_uri_too_long");
  }
  const searchParams = new URL(request.url).searchParams;
  if (
    [...searchParams.keys()].some((key) => key !== "range") ||
    searchParams.getAll("range").length !== 1
  ) {
    throw new PublishingProxyRequestError(400, "invalid_query");
  }
  const range = searchParams.get("range");
  if (range !== "7d" && range !== "30d" && range !== "90d") {
    throw new PublishingProxyRequestError(400, "invalid_query");
  }
  return range;
}
