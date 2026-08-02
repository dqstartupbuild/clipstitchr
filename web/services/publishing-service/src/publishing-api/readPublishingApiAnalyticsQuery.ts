import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";

export const readPublishingApiAnalyticsQuery = (
  searchParams: URLSearchParams,
): "7d" | "30d" | "90d" => {
  if (
    [...searchParams.keys()].some((key) => key !== "range") ||
    searchParams.getAll("range").length !== 1
  ) {
    throw new PublishingServiceHttpError(400, "invalid_query");
  }
  const range = searchParams.get("range");
  if (range !== "7d" && range !== "30d" && range !== "90d") {
    throw new PublishingServiceHttpError(400, "invalid_query");
  }
  return range;
};
