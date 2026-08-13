import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import { readPublishingApiIdentifier } from "./readPublishingApiIdentifier.js";

export const readPublishingApiAnalyticsQuery = (
  searchParams: URLSearchParams,
): Readonly<{ productId: string; range: "7d" | "30d" | "90d" }> => {
  if (
    [...searchParams.keys()].some(
      (key) => key !== "productId" && key !== "range",
    ) ||
    searchParams.getAll("productId").length !== 1 ||
    searchParams.getAll("range").length !== 1
  ) {
    throw new PublishingServiceHttpError(400, "invalid_query");
  }
  const range = searchParams.get("range");
  if (range !== "7d" && range !== "30d" && range !== "90d") {
    throw new PublishingServiceHttpError(400, "invalid_query");
  }
  return Object.freeze({
    productId: readPublishingApiIdentifier(
      searchParams.get("productId"),
      "invalid_query",
    ),
    range,
  });
};
