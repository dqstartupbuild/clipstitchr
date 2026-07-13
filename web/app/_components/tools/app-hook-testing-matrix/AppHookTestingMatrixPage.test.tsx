import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppHookTestingMatrixRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-hook-testing-matrix/page";

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <section>Mailing list source: {source}</section>
  ),
}));

describe("AppHookTestingMatrixPage", () => {
  it("renders a controlled matrix with named variables", () => {
    const markup = renderToStaticMarkup(<AppHookTestingMatrixRoutePage />);

    expect(markup).toContain("App Hook Testing Matrix");
    expect(markup).toContain("4 test cells in two stages");
    expect(markup).toContain("Changed variable: Hook only");
    expect(markup).toContain("Changed variable: Visual only");
    expect(markup).toContain("Download matrix");
    expect(markup).toContain("Mailing list source: app-hook-testing-matrix");
    expect(markup).toContain('href="/pricing"');
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-hook-testing-matrix",
    );
  });
});
