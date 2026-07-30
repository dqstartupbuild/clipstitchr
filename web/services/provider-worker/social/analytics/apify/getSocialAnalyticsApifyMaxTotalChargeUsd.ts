const DEFAULT_MAXIMUM_TOTAL_CHARGE_USD = 0.5;
const MINIMUM_TOTAL_CHARGE_USD = 0.5;
const MAXIMUM_TOTAL_CHARGE_USD = 2;

export function getSocialAnalyticsApifyMaxTotalChargeUsd() {
  const configured = Number(
    process.env.SOCIAL_ANALYTICS_APIFY_MAX_TOTAL_CHARGE_USD,
  );

  return Number.isFinite(configured)
    ? Math.max(
        MINIMUM_TOTAL_CHARGE_USD,
        Math.min(configured, MAXIMUM_TOTAL_CHARGE_USD),
      )
    : DEFAULT_MAXIMUM_TOTAL_CHARGE_USD;
}
