import type { PublishingServiceRouteMatch } from "./PublishingServiceRouteMatch.js";

export const createExactPublishingServiceRouteMatcher = (
  expectedPathname: string,
): ((pathname: string) => PublishingServiceRouteMatch | null) => {
  if (!/^\/v1(?:\/[a-z][a-z0-9-]*)+$/u.test(expectedPathname)) {
    throw new TypeError("The publishing route path is invalid.");
  }

  return (pathname) => (pathname === expectedPathname ? Object.freeze({}) : null);
};
