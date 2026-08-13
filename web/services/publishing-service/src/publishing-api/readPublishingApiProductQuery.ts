import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import { readPublishingApiIdentifier } from "./readPublishingApiIdentifier.js";

export const readPublishingApiProductQuery = (
  searchParams: URLSearchParams,
): string => {
  if (
    [...searchParams.keys()].some((key) => key !== "productId") ||
    searchParams.getAll("productId").length !== 1
  ) {
    throw new PublishingServiceHttpError(400, "invalid_query");
  }
  return readPublishingApiIdentifier(
    searchParams.get("productId"),
    "invalid_query",
  );
};
