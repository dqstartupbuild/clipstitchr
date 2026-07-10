import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SwiprCallToActionStylePicker } from "@/app/_components/swipr/SwiprCallToActionStylePicker";

describe("SwiprCallToActionStylePicker", () => {
  it("shows every final-slide CTA choice", () => {
    const markup = renderToStaticMarkup(
      <SwiprCallToActionStylePicker
        value="engagement"
        onChange={() => undefined}
      />,
    );

    expect(markup).toContain("Last-slide CTA");
    expect(markup).toContain("Any");
    expect(markup).toContain("Save this");
    expect(markup).toContain("Follow");
    expect(markup).toContain("Engagement");
    expect(markup).toContain("Promote product");
    expect(markup).toContain('aria-pressed="true"');
  });
});
