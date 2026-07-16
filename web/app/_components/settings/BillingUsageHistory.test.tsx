import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BillingUsageHistory } from "@/app/_components/settings/BillingUsageHistory";

describe("BillingUsageHistory", () => {
  it("makes horizontally overflowing usage data keyboard accessible", () => {
    const markup = renderToStaticMarkup(
      <BillingUsageHistory
        entries={[
          {
            availableDelta: 0,
            consumedDelta: 25,
            createdAt: "2026-07-16T06:44:15.827Z",
            entryType: "commit",
            operation: "background_photo",
            quantity: 25,
            reservedDelta: -25,
            resource: "creation_credit",
          },
        ]}
      />,
    );

    expect(markup).toContain('role="region"');
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain('aria-label="Recent credit and video usage"');
    expect(markup).toContain("<caption");
    expect(markup).toContain('scope="col"');
  });
});
