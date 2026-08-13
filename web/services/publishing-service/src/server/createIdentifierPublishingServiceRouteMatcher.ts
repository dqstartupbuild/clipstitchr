import type { PublishingServiceRouteMatch } from "./PublishingServiceRouteMatch.js";

const ROUTE_IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~-]{0,127}$/u;

export const createIdentifierPublishingServiceRouteMatcher = (
  prefix: string,
  parameterName: string,
  suffix = "",
): ((pathname: string) => PublishingServiceRouteMatch | null) => {
  if (
    !/^\/v1(?:\/[a-z][a-z0-9-]*)+\/$/u.test(prefix) ||
    !/^[a-z][A-Za-z0-9]{0,31}$/u.test(parameterName) ||
    (suffix.length > 0 && !/^(?:\/[a-z][a-z0-9-]*)+$/u.test(suffix))
  ) {
    throw new TypeError("The publishing route matcher is invalid.");
  }

  return (pathname) => {
    if (!pathname.startsWith(prefix) || !pathname.endsWith(suffix)) {
      return null;
    }

    const endIndex = suffix.length === 0 ? pathname.length : -suffix.length;
    const encodedIdentifier = pathname.slice(prefix.length, endIndex);

    if (
      encodedIdentifier.includes("/") ||
      !ROUTE_IDENTIFIER_PATTERN.test(encodedIdentifier)
    ) {
      return null;
    }

    return Object.freeze({ [parameterName]: encodedIdentifier });
  };
};
