import { describe, expect, it } from "vitest";
import type { Doc } from "../_generated/dataModel";
import { getMarketingMailingListEventIsStale } from "./getMarketingMailingListEventIsStale";

describe("mailing-list event precedence", () => {
  it("always ends an equal-time subscribe/unsubscribe permutation unsubscribed", () => {
    const subscribed = {
      eventAt: 100,
      status: "subscribed",
    } as Doc<"marketingMailingListMemberships">;
    const unsubscribed = {
      eventAt: 100,
      status: "unsubscribed",
    } as Doc<"marketingMailingListMemberships">;

    expect(
      getMarketingMailingListEventIsStale(
        unsubscribed,
        100,
        "subscribed",
      ),
    ).toBe(true);
    expect(
      getMarketingMailingListEventIsStale(
        subscribed,
        100,
        "unsubscribed",
      ),
    ).toBe(false);
  });
});
