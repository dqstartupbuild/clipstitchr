import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSubscriptionCommunication } from "./createSubscriptionCommunication";

const mocks = vi.hoisted(() => ({
  enqueueAccountCommunication: vi.fn(),
}));

vi.mock("./enqueueAccountCommunication", () => ({
  enqueueAccountCommunication: mocks.enqueueAccountCommunication,
}));

const baseArgs = {
  eventId: "evt_subscription",
  now: "2026-07-16T12:00:00.000Z",
  ownerId: "user_123",
  periodEnd: "2026-08-16T12:00:00.000Z",
  planKey: "agency" as const,
  subscriptionId: "sub_123",
};

describe("createSubscriptionCommunication", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the event time as the effective date when access has ended", async () => {
    await createSubscriptionCommunication({} as never, {
      ...baseArgs,
      kind: "ended",
    });

    expect(mocks.enqueueAccountCommunication).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        dataVariables: expect.objectContaining({
          effectiveDate: "2026-07-16",
        }),
      }),
    );
  });

  it.each(["cancel-scheduled", "cancel-reversed"] as const)(
    "uses the period end as the effective date when cancellation is %s",
    async (kind) => {
      await createSubscriptionCommunication({} as never, {
        ...baseArgs,
        kind,
      });

      expect(mocks.enqueueAccountCommunication).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          dataVariables: expect.objectContaining({
            effectiveDate: "2026-08-16",
          }),
        }),
      );
    },
  );
});
