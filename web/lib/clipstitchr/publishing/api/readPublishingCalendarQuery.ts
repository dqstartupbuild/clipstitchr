import { isPublishingTimeZone } from "@/lib/clipstitchr/publishing/client/schedule/isPublishingTimeZone";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";

const TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/u;

export function readPublishingCalendarQuery(request: Request): Readonly<{
  from: string;
  timeZone: string;
  to: string;
}> {
  if (request.url.length > 4_096) {
    throw new PublishingProxyRequestError(414, "request_uri_too_long");
  }
  const searchParams = new URL(request.url).searchParams;
  if (
    [...searchParams.keys()].some(
      (key) => key !== "from" && key !== "timeZone" && key !== "to",
    ) ||
    searchParams.getAll("from").length !== 1 ||
    searchParams.getAll("timeZone").length !== 1 ||
    searchParams.getAll("to").length !== 1
  ) {
    throw new PublishingProxyRequestError(400, "invalid_query");
  }

  const from = searchParams.get("from") ?? "";
  const timeZone = searchParams.get("timeZone") ?? "";
  const to = searchParams.get("to") ?? "";
  const fromEpoch = Date.parse(from);
  const toEpoch = Date.parse(to);
  if (
    from.length > 64 ||
    to.length > 64 ||
    timeZone.length > 128 ||
    !TIMESTAMP_PATTERN.test(from) ||
    !TIMESTAMP_PATTERN.test(to) ||
    !Number.isFinite(fromEpoch) ||
    !Number.isFinite(toEpoch) ||
    fromEpoch >= toEpoch ||
    toEpoch - fromEpoch > 366 * 24 * 60 * 60 * 1_000 ||
    !isPublishingTimeZone(timeZone)
  ) {
    throw new PublishingProxyRequestError(400, "invalid_query");
  }

  return Object.freeze({ from, timeZone, to });
}
