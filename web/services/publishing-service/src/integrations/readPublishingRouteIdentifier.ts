import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";

const ROUTE_IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~-]{0,127}$/u;

export const readPublishingRouteIdentifier = (
  value: string | undefined,
): string => {
  if (value === undefined || !ROUTE_IDENTIFIER_PATTERN.test(value)) {
    throw new PublishingServiceHttpError(400, "invalid_request");
  }

  return value;
};
