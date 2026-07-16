import { describe, expect, it } from "vitest";
import { getStripeInvoiceFailureEventIsSupported } from "./getStripeInvoiceFailureEventIsSupported";

describe("getStripeInvoiceFailureEventIsSupported", () => {
  it.each(["invoice.finalization_failed", "invoice.payment_failed"])(
    "routes %s through invoice failure handling",
    (eventType) => {
      expect(getStripeInvoiceFailureEventIsSupported(eventType)).toBe(true);
    },
  );

  it("does not classify successful or unrelated invoice events as failures", () => {
    expect(getStripeInvoiceFailureEventIsSupported("invoice.paid")).toBe(false);
    expect(getStripeInvoiceFailureEventIsSupported("invoice.updated")).toBe(
      false,
    );
  });
});
