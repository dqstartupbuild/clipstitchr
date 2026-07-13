import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ClientContentCapacityRoutePage, {
  metadata,
} from "@/app/(content)/tools/client-content-capacity-calculator/page";

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <section>Mailing list source: {source}</section>
  ),
}));

describe("ClientContentCapacityPage", () => {
  it("shows the limiting stage and transparent capacity", () => {
    const markup = renderToStaticMarkup(<ClientContentCapacityRoutePage />);

    expect(markup).toContain("Client Content Capacity Calculator");
    expect(markup).toContain("12 deliverables");
    expect(markup).toContain("Editing is the current limiting stage");
    expect(markup).toContain("100.0%");
    expect(markup).toContain(
      "Mailing list source: client-content-capacity-calculator",
    );
    expect(markup).toContain('href="/pricing"');
    expect(markup).not.toContain("guaranteed capacity");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/client-content-capacity-calculator",
    );
  });
});
