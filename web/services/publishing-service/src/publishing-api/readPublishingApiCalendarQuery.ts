import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import { isPublishingApiTimeZone } from "./isPublishingApiTimeZone.js";
import { readPublishingApiIdentifier } from "./readPublishingApiIdentifier.js";

const TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/u;

export const readPublishingApiCalendarQuery = (
  searchParams: URLSearchParams,
): Readonly<{ from: string; fromDate: Date; productId: string; timeZone: string; to: string; toDate: Date }> => {
  if (
    [...searchParams.keys()].some(
      (key) =>
        key !== "from" &&
        key !== "productId" &&
        key !== "timeZone" &&
        key !== "to",
    ) ||
    searchParams.getAll("from").length !== 1 ||
    searchParams.getAll("productId").length !== 1 ||
    searchParams.getAll("timeZone").length !== 1 ||
    searchParams.getAll("to").length !== 1
  ) {
    throw new PublishingServiceHttpError(400, "invalid_query");
  }
  const from = searchParams.get("from") ?? "";
  const timeZone = searchParams.get("timeZone") ?? "";
  const to = searchParams.get("to") ?? "";
  const fromEpoch = Date.parse(from);
  const toEpoch = Date.parse(to);
  if (
    from.length > 64 ||
    to.length > 64 ||
    !TIMESTAMP_PATTERN.test(from) ||
    !TIMESTAMP_PATTERN.test(to) ||
    !Number.isFinite(fromEpoch) ||
    !Number.isFinite(toEpoch) ||
    fromEpoch >= toEpoch ||
    toEpoch - fromEpoch > 366 * 24 * 60 * 60 * 1_000 ||
    !isPublishingApiTimeZone(timeZone)
  ) {
    throw new PublishingServiceHttpError(400, "invalid_query");
  }
  return Object.freeze({
    from,
    fromDate: new Date(fromEpoch),
    productId: readPublishingApiIdentifier(
      searchParams.get("productId"),
      "invalid_query",
    ),
    timeZone,
    to,
    toDate: new Date(toEpoch),
  });
};
