import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { recoverCreditRefillFromCharge } from "./recoverCreditRefillFromCharge";

const mocks = vi.hoisted(() => ({ grantConfirmedCreditRefill: vi.fn() }));

vi.mock("./grantConfirmedCreditRefill", () => ({
  grantConfirmedCreditRefill: mocks.grantConfirmedCreditRefill,
}));

describe("recoverCreditRefillFromCharge", () => {
  beforeEach(() => vi.clearAllMocks());

  it("replays the validated PaymentIntent through the idempotent refill path", async () => {
    mocks.grantConfirmedCreditRefill.mockResolvedValueOnce("refill:pi_refill");
    const paymentIntent = {
      id: "pi_refill",
      latest_charge: "ch_refill",
    } as Stripe.PaymentIntent;
    const charge = {
      id: "ch_refill",
      payment_intent: paymentIntent,
    } as Stripe.Charge;
    const event = {
      created: 300,
      id: "evt_dispute_won",
      type: "charge.dispute.closed",
    } as Stripe.Event;

    await expect(
      recoverCreditRefillFromCharge({} as never, event, charge),
    ).resolves.toBe("refill:pi_refill");

    expect(mocks.grantConfirmedCreditRefill).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        id: "stripe-recovery:payment-intent:pi_refill",
        type: "payment_intent.succeeded",
      }),
      paymentIntent,
      { allowBillingReviewForRecovery: true },
    );
  });

  it("fails closed when the expanded PaymentIntent is not the charge payment", async () => {
    await expect(
      recoverCreditRefillFromCharge(
        {} as never,
        { created: 300, id: "evt_won" } as Stripe.Event,
        {
          id: "ch_refill",
          payment_intent: { id: "pi_refill", latest_charge: "ch_other" },
        } as Stripe.Charge,
      ),
    ).rejects.toThrow("recovery context is unavailable");

    expect(mocks.grantConfirmedCreditRefill).not.toHaveBeenCalled();
  });
});
