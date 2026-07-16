import { describe, expect, it } from "vitest";
import { getStripeGraceEndsAt } from "./getStripeGraceEndsAt";

describe("getStripeGraceEndsAt", () => {
  it("anchors grace to the first failure", () => {
    const firstDeadline = "2026-07-19T12:00:00.000Z";

    expect(getStripeGraceEndsAt(firstDeadline, 2_000_000_000)).toBe(
      firstDeadline,
    );
  });

  it("creates the first 72-hour deadline from Stripe event time", () => {
    expect(getStripeGraceEndsAt(undefined, 0)).toBe("1970-01-04T00:00:00.000Z");
  });
});
