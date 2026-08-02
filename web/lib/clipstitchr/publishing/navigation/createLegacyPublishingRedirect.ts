type LegacyPublishingRoute = "analytics" | "schedule";

type LegacyPublishingSearchParams = Record<
  string,
  string | string[] | undefined
>;

const safeSearchParamNames: Record<LegacyPublishingRoute, readonly string[]> = {
  analytics: ["productId", "range"],
  schedule: ["date", "productId", "view"],
};

function readSafeSearchParamValue(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue = firstValue?.trim();

  if (
    !normalizedValue ||
    normalizedValue.length > 256 ||
    /[\u0000-\u001f\u007f]/.test(normalizedValue)
  ) {
    return null;
  }

  return normalizedValue;
}

export function createLegacyPublishingRedirect(
  route: LegacyPublishingRoute,
  searchParams: LegacyPublishingSearchParams,
) {
  const destination =
    route === "analytics"
      ? "/dashboard/publishing/analytics"
      : readSafeSearchParamValue(searchParams.display) === "list"
        ? "/dashboard/publishing/posts"
        : "/dashboard/publishing/calendar";
  const destinationSearchParams = new URLSearchParams();

  for (const name of safeSearchParamNames[route]) {
    const value = readSafeSearchParamValue(searchParams[name]);

    if (value !== null) {
      destinationSearchParams.set(name, value);
    }
  }

  const query = destinationSearchParams.toString();

  return query ? `${destination}?${query}` : destination;
}
