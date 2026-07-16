import { creditRefillPolicy } from "./creditRefillPolicy";
import { getPlanPolicy } from "./getPlanPolicy";
import { getRequiredBillingEnvironmentValue } from "./getRequiredBillingEnvironmentValue";
import { getStripeMode } from "./getStripeMode";
import { isPlanKey } from "./isPlanKey";
import type { StripeCatalogEntry } from "./types/StripeCatalogEntry";
import type { StripeCatalogKey } from "./types/StripeCatalogKey";

const environmentPrefixByCatalogKey = {
  starter: "STRIPE_STARTER",
  pro: "STRIPE_PRO",
  agency: "STRIPE_AGENCY",
  "creation-credit-refill": "STRIPE_CREATION_CREDIT_REFILL",
} as const satisfies Record<StripeCatalogKey, string>;

export function getStripeCatalogEntry(
  catalogKey: StripeCatalogKey,
): StripeCatalogEntry {
  const environmentPrefix = environmentPrefixByCatalogKey[catalogKey];
  const expectedUnitAmount = isPlanKey(catalogKey)
    ? getPlanPolicy(catalogKey).monthlyPriceUsd * 100
    : creditRefillPolicy.priceUsd * 100;

  return {
    catalogKey,
    expectedUnitAmount,
    mode: getStripeMode(),
    priceId: getRequiredBillingEnvironmentValue(
      `${environmentPrefix}_PRICE_ID`,
    ),
    priceType: isPlanKey(catalogKey) ? "recurring" : "one_time",
    productId: getRequiredBillingEnvironmentValue(
      `${environmentPrefix}_PRODUCT_ID`,
    ),
  };
}
