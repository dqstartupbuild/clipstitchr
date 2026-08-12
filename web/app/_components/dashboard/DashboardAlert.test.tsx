import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";

describe("DashboardAlert", () => {
  it("announces brand-aligned error messages without raw red utilities", () => {
    const markup = renderToStaticMarkup(
      <DashboardAlert variant="error">Unable to load results.</DashboardAlert>,
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain("border-accent/30");
    expect(markup).toContain("bg-surface-muted");
    expect(markup).toContain("text-accent-dark");
    expect(markup).not.toContain("red-");
  });
});
