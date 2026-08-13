import type { PublishingServiceRoute } from "./PublishingServiceRoute.js";
import type { PublishingServiceRouteMatch } from "./PublishingServiceRouteMatch.js";

export const findPublishingServiceRoute = (
  routes: readonly PublishingServiceRoute[],
  method: string,
  pathname: string,
): Readonly<{
  route: PublishingServiceRoute;
  match: PublishingServiceRouteMatch;
}> | null => {
  for (const route of routes) {
    if (route.method !== method) {
      continue;
    }

    const match = route.match(pathname);

    if (match !== null) {
      return Object.freeze({ route, match });
    }
  }

  return null;
};
