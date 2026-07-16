import type Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import { assertStripeCatalogEntry } from "@/lib/clipstitchr/billing/assertStripeCatalogEntry";
import type { StripeCatalogEntry } from "@/lib/clipstitchr/billing/types/StripeCatalogEntry";

describe("assertStripeCatalogEntry", () => {
  const entry = {
    catalogKey: "starter",
    expectedUnitAmount: 3_900,
    mode: "test",
    priceId: "price_starter",
    priceType: "recurring",
    productId: "prod_starter",
  } satisfies StripeCatalogEntry;

  it("accepts a recurring price billed every month", async () => {
    const price = {
      active: true,
      currency: "usd",
      livemode: false,
      product: "prod_starter",
      recurring: { interval: "month", interval_count: 1 },
      type: "recurring",
      unit_amount: 3_900,
    } as Stripe.Price;
    const stripe = {
      prices: { retrieve: vi.fn().mockResolvedValue(price) },
    } as unknown as Stripe;

    await expect(assertStripeCatalogEntry(stripe, entry)).resolves.toBe(price);
  });

  it("rejects a recurring price billed every two months", async () => {
    const stripe = {
      prices: {
        retrieve: vi.fn().mockResolvedValue({
          active: true,
          currency: "usd",
          livemode: false,
          product: "prod_starter",
          recurring: { interval: "month", interval_count: 2 },
          type: "recurring",
          unit_amount: 3_900,
        } as Stripe.Price),
      },
    } as unknown as Stripe;

    await expect(assertStripeCatalogEntry(stripe, entry)).rejects.toThrow(
      "Subscription price must recur monthly.",
    );
  });
});
