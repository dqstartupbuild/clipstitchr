import type { IncomingHttpHeaders } from "node:http";

import { PublishingServiceHttpError } from "./PublishingServiceHttpError.js";

export const readPublishingServiceAssertion = (
  headers: IncomingHttpHeaders,
): string => {
  const authorization = headers.authorization;

  if (
    typeof authorization !== "string" ||
    authorization.length > 4_096 ||
    !authorization.startsWith("Bearer ") ||
    authorization.indexOf(",") >= 0
  ) {
    throw new PublishingServiceHttpError(401, "authentication_required");
  }

  const assertion = authorization.slice("Bearer ".length);

  if (assertion.length === 0 || assertion.trim() !== assertion) {
    throw new PublishingServiceHttpError(401, "authentication_required");
  }

  return assertion;
};
