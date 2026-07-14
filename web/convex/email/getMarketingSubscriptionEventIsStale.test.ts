import { describe, expect, it } from "vitest";
import type { Doc } from "../_generated/dataModel";
import { getMarketingSubscriptionEventIsStale } from "./getMarketingSubscriptionEventIsStale";

describe("global subscription event precedence", () => {
  it("always ends an equal-time subscribe/unsubscribe permutation unsubscribed", () => {
    const subscribed = {
      subscriptionChangedAt: 100,
      subscriptionStatus: "subscribed",
    } as Doc<"marketingContacts">;
    const unsubscribed = {
      subscriptionChangedAt: 100,
      subscriptionStatus: "unsubscribed",
    } as Doc<"marketingContacts">;

    expect(
      getMarketingSubscriptionEventIsStale(
        unsubscribed,
        100,
        "subscribed",
      ),
    ).toBe(true);
    expect(
      getMarketingSubscriptionEventIsStale(
        subscribed,
        100,
        "unsubscribed",
      ),
    ).toBe(false);
  });
});
