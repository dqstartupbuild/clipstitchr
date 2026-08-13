import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import {
  PUBLISHING_API_POST_STATUSES,
  type PublishingApiPostStatus,
} from "./PublishingApiPostStatus.js";
import { readPublishingApiIdentifier } from "./readPublishingApiIdentifier.js";

export const readPublishingApiPostsQuery = (
  searchParams: URLSearchParams,
): Readonly<{ productId: string; status?: PublishingApiPostStatus }> => {
  if (
    [...searchParams.keys()].some(
      (key) => key !== "productId" && key !== "status",
    ) ||
    searchParams.getAll("productId").length !== 1 ||
    searchParams.getAll("status").length > 1
  ) {
    throw new PublishingServiceHttpError(400, "invalid_query");
  }
  const status = searchParams.get("status");
  if (status === null) {
    return Object.freeze({
      productId: readPublishingApiIdentifier(
        searchParams.get("productId"),
        "invalid_query",
      ),
    });
  }
  if (!(PUBLISHING_API_POST_STATUSES as readonly string[]).includes(status)) {
    throw new PublishingServiceHttpError(400, "invalid_query");
  }
  return Object.freeze({
    productId: readPublishingApiIdentifier(
      searchParams.get("productId"),
      "invalid_query",
    ),
    status: status as PublishingApiPostStatus,
  });
};
