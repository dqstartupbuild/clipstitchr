import { readSafePublishingSearchParamValue } from "@/lib/clipstitchr/publishing/navigation/readSafePublishingSearchParamValue";

type LegacyPublishingRoute = "analytics" | "schedule";

type LegacyPublishingSearchParams = Record<
  string,
  string | string[] | undefined
>;

const safeSearchParamNames: Record<LegacyPublishingRoute, readonly string[]> = {
  analytics: ["productId", "range"],
  schedule: ["date", "productId", "view"],
};

export function createLegacyPublishingRedirect(
  route: LegacyPublishingRoute,
  searchParams: LegacyPublishingSearchParams,
) {
  const destination =
    route === "analytics"
      ? "/dashboard/studio/publishing/analytics"
      : readSafePublishingSearchParamValue(searchParams.display) === "list"
        ? "/dashboard/studio/publishing/posts"
        : "/dashboard/studio/publishing/calendar";
  const destinationSearchParams = new URLSearchParams();

  for (const name of safeSearchParamNames[route]) {
    const value = readSafePublishingSearchParamValue(searchParams[name]);

    if (value !== null) {
      destinationSearchParams.set(name, value);
    }
  }

  const query = destinationSearchParams.toString();

  return query ? `${destination}?${query}` : destination;
}
