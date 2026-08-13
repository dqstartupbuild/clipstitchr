import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import type { PublishingConnectRequest } from "./PublishingConnectRequest.js";

export const parsePublishingConnectRequest = (
  value: unknown,
): PublishingConnectRequest => {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    Object.keys(value).length !== 1 ||
    !("returnPath" in value) ||
    value.returnPath !== "/dashboard/studio/publishing/integrations"
  ) {
    throw new PublishingServiceHttpError(400, "invalid_request");
  }

  return Object.freeze({ returnPath: value.returnPath });
};
