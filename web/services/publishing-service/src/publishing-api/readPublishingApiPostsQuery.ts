import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import {
  PUBLISHING_API_POST_STATUSES,
  type PublishingApiPostStatus,
} from "./PublishingApiPostStatus.js";

export const readPublishingApiPostsQuery = (
  searchParams: URLSearchParams,
): PublishingApiPostStatus | undefined => {
  if (
    [...searchParams.keys()].some((key) => key !== "status") ||
    searchParams.getAll("status").length > 1
  ) {
    throw new PublishingServiceHttpError(400, "invalid_query");
  }
  const status = searchParams.get("status");
  if (status === null) {
    return undefined;
  }
  if (!(PUBLISHING_API_POST_STATUSES as readonly string[]).includes(status)) {
    throw new PublishingServiceHttpError(400, "invalid_query");
  }
  return status as PublishingApiPostStatus;
};
