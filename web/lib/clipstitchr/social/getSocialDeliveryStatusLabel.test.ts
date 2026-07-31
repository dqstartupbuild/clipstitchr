import { describe, expect, it } from "vitest";
import { getSocialDeliveryStatusLabel } from "./getSocialDeliveryStatusLabel";

describe("getSocialDeliveryStatusLabel", () => {
  it("uses plain language for a partially successful logical post", () => {
    expect(getSocialDeliveryStatusLabel("partially_published")).toBe(
      "Partially posted",
    );
  });
});
