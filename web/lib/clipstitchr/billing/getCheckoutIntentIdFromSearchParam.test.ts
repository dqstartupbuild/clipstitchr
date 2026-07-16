import { describe, expect, it } from "vitest";
import { getCheckoutIntentIdFromSearchParam } from "./getCheckoutIntentIdFromSearchParam";

describe("getCheckoutIntentIdFromSearchParam", () => {
  it("accepts one UUID and rejects repeated or untrusted values", () => {
    const checkoutIntentId = "6bc7d459-5b0a-4d9f-a62f-389fdf2b4af9";

    expect(getCheckoutIntentIdFromSearchParam(checkoutIntentId)).toBe(
      checkoutIntentId,
    );
    expect(
      getCheckoutIntentIdFromSearchParam([checkoutIntentId, checkoutIntentId]),
    ).toBeUndefined();
    expect(getCheckoutIntentIdFromSearchParam("intent_owner")).toBeUndefined();
    expect(getCheckoutIntentIdFromSearchParam(undefined)).toBeUndefined();
  });
});
