import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import { assertExactPublishingApiKeys } from "./assertExactPublishingApiKeys.js";
import { readPublishingApiIdentifier } from "./readPublishingApiIdentifier.js";
import { readPublishingApiRecord } from "./readPublishingApiRecord.js";

export const readPublishingApiAnalyticsRefreshRequest = (
  value: unknown,
): Readonly<{ postId: string }> => {
  const record = readPublishingApiRecord(
    value,
    "invalid_analytics_refresh_request",
  );
  assertExactPublishingApiKeys(
    record,
    ["postId"],
    [],
    "invalid_analytics_refresh_request",
  );
  try {
    return Object.freeze({
      postId: readPublishingApiIdentifier(
        record["postId"],
        "invalid_analytics_refresh_request",
      ),
    });
  } catch (error) {
    if (error instanceof PublishingServiceHttpError) {
      throw error;
    }
    throw new PublishingServiceHttpError(
      400,
      "invalid_analytics_refresh_request",
    );
  }
};
