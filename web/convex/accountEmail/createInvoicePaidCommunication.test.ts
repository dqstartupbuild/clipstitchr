import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInvoicePaidCommunication } from "./createInvoicePaidCommunication";

const mocks = vi.hoisted(() => ({
  enqueueAccountCommunication: vi.fn(),
}));

vi.mock("./enqueueAccountCommunication", () => ({
  enqueueAccountCommunication: mocks.enqueueAccountCommunication,
}));

describe("createInvoicePaidCommunication", () => {
  beforeEach(() => vi.clearAllMocks());

  it("combines activation and monthly credits into one communication", async () => {
    await createInvoicePaidCommunication({} as never, {
      creditsAdded: 20_000,
      disabledDailyDraftCount: 0,
      eventId: "evt_paid",
      invoiceId: "in_paid",
      kind: "activation",
      lockedProductCount: 0,
      now: "2026-07-16T12:00:00.000Z",
      ownerId: "user_123",
      periodEnd: "2026-08-16T12:00:00.000Z",
      planKey: "agency",
    });

    expect(mocks.enqueueAccountCommunication).toHaveBeenCalledOnce();
    expect(mocks.enqueueAccountCommunication).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        communicationKey: "invoice:in_paid:paid",
        sourceType: "billing",
        templateKey: "subscription-status",
        title: "Your Agency plan is active",
      }),
    );
  });

  it("uses the credits template for a normal renewal", async () => {
    await createInvoicePaidCommunication({} as never, {
      creditsAdded: 8_000,
      disabledDailyDraftCount: 0,
      eventId: "evt_renewal",
      invoiceId: "in_renewal",
      kind: "renewal",
      lockedProductCount: 0,
      now: "2026-08-16T12:00:00.000Z",
      ownerId: "user_123",
      periodEnd: "2026-09-16T12:00:00.000Z",
      planKey: "pro",
    });

    expect(mocks.enqueueAccountCommunication).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        sourceType: "credit",
        templateKey: "credits-updated",
        title: "Your monthly credits are ready",
      }),
    );
  });
});
