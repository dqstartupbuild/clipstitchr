const DEFAULT_URL_LIMIT = 100;
const MAXIMUM_URL_LIMIT = 500;

export function getSocialAnalyticsApifyUrlLimit() {
  const configured = Number(process.env.SOCIAL_ANALYTICS_APIFY_URL_LIMIT);

  return Number.isInteger(configured) && configured > 0
    ? Math.min(configured, MAXIMUM_URL_LIMIT)
    : DEFAULT_URL_LIMIT;
}
