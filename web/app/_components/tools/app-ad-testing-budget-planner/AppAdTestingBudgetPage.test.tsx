import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppAdTestingBudgetRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-ad-testing-budget-planner/page";

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <section>Mailing list source: {source}</section>
  ),
}));

vi.mock(
  "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest",
  () => ({
    resolvePublicToolGateVariantForRequest: vi.fn(async () => "control"),
  }),
);

describe("AppAdTestingBudgetPage", () => {
  it("renders the entered allocation and paid boundary", async () => {
    const markup = renderToStaticMarkup(await AppAdTestingBudgetRoutePage());

    expect(markup).toContain("App-Ad Creative Testing Budget Planner");
    expect(markup).toContain("$3,250.00 for active media");
    expect(markup).toContain("6 of 6");
    expect(markup).toContain("8 additional cells remain in the backlog");
    expect(markup).toContain(
      "Mailing list source: app-ad-testing-budget-planner",
    );
    expect(markup).toContain('href="/pricing"');
    expect(markup).not.toContain("recommended budget");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-ad-testing-budget-planner",
    );
  });
});
