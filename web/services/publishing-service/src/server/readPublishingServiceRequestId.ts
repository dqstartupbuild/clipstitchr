import type { IncomingHttpHeaders } from "node:http";

import { PublishingServiceHttpError } from "./PublishingServiceHttpError.js";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;

export const readPublishingServiceRequestId = (
  headers: IncomingHttpHeaders,
): string => {
  const value = headers["x-clipstitchr-request-id"];

  if (typeof value !== "string" || !REQUEST_ID_PATTERN.test(value)) {
    throw new PublishingServiceHttpError(400, "invalid_request_id");
  }

  return value;
};
