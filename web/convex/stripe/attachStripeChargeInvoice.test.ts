import type Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import { attachStripeChargeInvoice } from "./attachStripeChargeInvoice";
import { getStripeChargeInvoiceId } from "./getStripeChargeInvoiceId";

describe("attachStripeChargeInvoice", () => {
  it("resolves the invoice through the PaymentIntent on current Stripe APIs", async () => {
    const stripe = {
      invoicePayments: {
        list: vi.fn(async () => ({
          data: [{ invoice: "in_monthly" }],
        })),
      },
    };

    const charge = await attachStripeChargeInvoice(
      stripe as never,
      { id: "ch_monthly", payment_intent: "pi_monthly" } as Stripe.Charge,
    );

    expect(getStripeChargeInvoiceId(charge)).toBe("in_monthly");
  });
});
