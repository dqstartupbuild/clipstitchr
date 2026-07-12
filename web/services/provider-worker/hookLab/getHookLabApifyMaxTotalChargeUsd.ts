const DEFAULT_HOOK_LAB_APIFY_MAX_TOTAL_CHARGE_USD = 0.5;
const MINIMUM_HOOK_LAB_APIFY_MAX_TOTAL_CHARGE_USD = 0.5;
const MAXIMUM_HOOK_LAB_APIFY_MAX_TOTAL_CHARGE_USD = 2;

export function getHookLabApifyMaxTotalChargeUsd() {
  const configured = Number(process.env.HOOK_LAB_APIFY_MAX_TOTAL_CHARGE_USD);

  return Number.isFinite(configured) && configured > 0
    ? Math.max(
        MINIMUM_HOOK_LAB_APIFY_MAX_TOTAL_CHARGE_USD,
        Math.min(configured, MAXIMUM_HOOK_LAB_APIFY_MAX_TOTAL_CHARGE_USD),
      )
    : DEFAULT_HOOK_LAB_APIFY_MAX_TOTAL_CHARGE_USD;
}
