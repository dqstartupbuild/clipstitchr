import type { PublishingServiceRoute } from "./PublishingServiceRoute.js";

export const hasPublishingServiceRoutePath = (
  routes: readonly PublishingServiceRoute[],
  pathname: string,
): boolean => routes.some((route) => route.match(pathname) !== null);
