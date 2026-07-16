import type Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import { attachStripeChargeRecoveryContext } from "./attachStripeChargeRecoveryContext";
import { getExpandedStripeChargeInvoice } from "./getExpandedStripeChargeInvoice";
import { getExpandedStripeChargePaymentIntent } from "./getExpandedStripeChargePaymentIntent";

describe("attachStripeChargeRecoveryContext", () => {
  it("attaches authoritative invoice and PaymentIntent objects", async () => {
    const invoice = {
      id: "in_monthly",
      status: "paid",
    } as unknown as Stripe.Invoice;
    const paymentIntent = {
      id: "pi_monthly",
      latest_charge: "ch_monthly",
    } as Stripe.PaymentIntent;
    const stripe = {
      invoicePayments: {
        list: vi.fn(async () => ({ data: [{ invoice: "in_monthly" }] })),
      },
      invoices: { retrieve: vi.fn(async () => invoice) },
      paymentIntents: { retrieve: vi.fn(async () => paymentIntent) },
    };

    const charge = await attachStripeChargeRecoveryContext(
      stripe as never,
      {
        id: "ch_monthly",
        payment_intent: "pi_monthly",
      } as Stripe.Charge,
    );

    expect(getExpandedStripeChargeInvoice(charge)).toBe(invoice);
    expect(getExpandedStripeChargePaymentIntent(charge)).toBe(paymentIntent);
  });
});
