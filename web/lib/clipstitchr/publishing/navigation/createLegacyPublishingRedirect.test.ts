import { describe, expect, it } from "vitest";
import { createLegacyPublishingRedirect } from "@/lib/clipstitchr/publishing/navigation/createLegacyPublishingRedirect";

describe("createLegacyPublishingRedirect", () => {
  it("maps the old Schedule calendar and list views to retained shell routes", () => {
    expect(
      createLegacyPublishingRedirect("schedule", {
        date: "2026-08-08",
        display: "calendar",
        productId: "product_123",
      }),
    ).toBe(
      "/dashboard/publishing/calendar?date=2026-08-08&productId=product_123",
    );
    expect(
      createLegacyPublishingRedirect("schedule", {
        display: "list",
        view: "failed",
      }),
    ).toBe("/dashboard/publishing/posts?view=failed");
  });

  it("maps the old Analytics route and keeps only equivalent parameters", () => {
    expect(
      createLegacyPublishingRedirect("analytics", {
        next: "https://attacker.invalid",
        productId: "product_123",
        range: "30d",
      }),
    ).toBe(
      "/dashboard/publishing/analytics?productId=product_123&range=30d",
    );
  });

  it("drops empty, oversized, and control-character values", () => {
    expect(
      createLegacyPublishingRedirect("schedule", {
        date: " ",
        productId: "x".repeat(257),
        view: "failed\nredirect",
      }),
    ).toBe("/dashboard/publishing/calendar");
  });
});
