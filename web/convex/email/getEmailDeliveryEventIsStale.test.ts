import { describe, expect, it } from "vitest";
import type { Doc } from "../_generated/dataModel";
import { getEmailDeliveryEventIsStale } from "./getEmailDeliveryEventIsStale";

describe("email delivery event precedence", () => {
  it("uses conservative severity for every equal-time permutation", () => {
    const statuses = ["delivered", "bounced", "complained"] as const;

    for (const [storedIndex, storedStatus] of statuses.entries()) {
      for (const [incomingIndex, incomingStatus] of statuses.entries()) {
        const operation = {
          deliveryChangedAt: 100,
          deliveryStatus: storedStatus,
        } as Doc<"emailProviderOperations">;

        expect(
          getEmailDeliveryEventIsStale(operation, 100, incomingStatus),
        ).toBe(storedIndex > incomingIndex);
      }
    }
  });
});
