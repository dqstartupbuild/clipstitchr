import { describe, expect, it } from "vitest";
import { getCanceledCheckoutIntentIdFromSearch } from "./getCanceledCheckoutIntentIdFromSearch";

describe("getCanceledCheckoutIntentIdFromSearch", () => {
  it("returns an exact canceled Checkout intent only on a canceled return", () => {
    const checkoutIntentId = "6bc7d459-5b0a-4d9f-a62f-389fdf2b4af9";

    expect(
      getCanceledCheckoutIntentIdFromSearch(
        `?billing=canceled&checkout_intent=${checkoutIntentId}`,
      ),
    ).toBe(checkoutIntentId);
    expect(
      getCanceledCheckoutIntentIdFromSearch(
        `?billing=success&checkout_intent=${checkoutIntentId}`,
      ),
    ).toBeUndefined();
    expect(
      getCanceledCheckoutIntentIdFromSearch(
        "?billing=canceled&checkout_intent=not-an-intent",
      ),
    ).toBeUndefined();
  });
});
