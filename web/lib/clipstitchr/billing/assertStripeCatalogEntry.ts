import type Stripe from "stripe";
import type { StripeCatalogEntry } from "./types/StripeCatalogEntry";
import type { StripeMode } from "./types/StripeMode";

function getProductId(product: string | Stripe.Product | Stripe.DeletedProduct) {
  return typeof product === "string" ? product : product.id;
}

export async function assertStripeCatalogEntry(
  stripe: Stripe,
  entry: StripeCatalogEntry,
) {
  const price = await stripe.prices.retrieve(entry.priceId);
  const expectedLivemode = entry.mode === ("live" satisfies StripeMode);

  if (price.livemode !== expectedLivemode) {
    throw new Error(`Stripe price does not match ${entry.mode} mode.`);
  }

  if (!price.active || price.currency !== "usd") {
    throw new Error("Stripe price must be active and denominated in USD.");
  }

  if (price.unit_amount !== entry.expectedUnitAmount) {
    throw new Error("Stripe price amount does not match the billing policy.");
  }

  if (getProductId(price.product) !== entry.productId) {
    throw new Error("Stripe price is attached to the wrong product.");
  }

  if (entry.priceType === "recurring") {
    if (
      price.type !== "recurring" ||
      price.recurring?.interval !== "month" ||
      price.recurring.interval_count !== 1
    ) {
      throw new Error("Subscription price must recur monthly.");
    }
  } else if (price.type !== "one_time") {
    throw new Error("Credit refill price must be a one-time price.");
  }

  return price;
}
