import { getStripeCatalogEntry } from "./getStripeCatalogEntry";
import type { PlanKey } from "./types/PlanKey";

const planKeys: PlanKey[] = ["starter", "pro", "agency"];

export function getPlanKeyForStripePrice(priceId: string) {
  return planKeys.find(
    (planKey) => getStripeCatalogEntry(planKey).priceId === priceId,
  );
}
