import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";

export const assertPublishingApiEmptyQuery = (
  searchParams: URLSearchParams,
): void => {
  if ([...searchParams.keys()].length > 0) {
    throw new PublishingServiceHttpError(400, "invalid_query");
  }
};
