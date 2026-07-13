import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import WhatShouldIPostRoutePage, {
  metadata,
} from "@/app/(content)/tools/what-should-i-post-decision-tree/page";

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <section>Mailing list source: {source}</section>
  ),
}));

describe("WhatShouldIPostPage", () => {
  it("shows one useful recommendation and an honest next step", () => {
    const markup = renderToStaticMarkup(<WhatShouldIPostRoutePage />);

    expect(markup).toContain("What Should I Post? Decision Tree");
    expect(markup).toContain("Voiceover app demo");
    expect(markup).toContain("Three ways to start");
    expect(markup).toContain("Captures to prepare");
    expect(markup).toContain(
      "Mailing list source: what-should-i-post-decision-tree",
    );
    expect(markup).toContain('href="/pricing"');
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/what-should-i-post-decision-tree",
    );
  });
});
