import type { StripeCatalogKey } from "./StripeCatalogKey";
import type { StripeMode } from "./StripeMode";

export type StripeCatalogEntry = {
  catalogKey: StripeCatalogKey;
  expectedUnitAmount: number;
  mode: StripeMode;
  priceId: string;
  priceType: "one_time" | "recurring";
  productId: string;
};
