import { describe, expect, it } from "vitest";
import { getStripeInvoiceFailureShouldApply } from "./getStripeInvoiceFailureShouldApply";

describe("getStripeInvoiceFailureShouldApply", () => {
  it("allows a newer invoice failure", () => {
    expect(getStripeInvoiceFailureShouldApply(100, 101)).toBe(true);
  });

  it("keeps paid state when a distinct failure has the same Stripe second", () => {
    expect(getStripeInvoiceFailureShouldApply(100, 100)).toBe(false);
  });

  it("rejects an out-of-order invoice failure older than paid state", () => {
    expect(getStripeInvoiceFailureShouldApply(101, 100)).toBe(false);
  });
});
