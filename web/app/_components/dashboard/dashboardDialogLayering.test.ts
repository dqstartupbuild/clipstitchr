import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const globalsCss = readFileSync(
  join(process.cwd(), "app", "globals.css"),
  "utf8",
);
const dashboardShellRule = globalsCss.match(
  /\.dashboard-shell\s*\{([^}]*)\}/,
)?.[1];
const dashboardMainRule = globalsCss.match(
  /\.dashboard-main\s*\{([^}]*)\}/,
)?.[1];
const dashboardDialogViewportRule = globalsCss.match(
  /@utility dashboard-dialog-viewport\s*\{([^}]*)\}/,
)?.[1];

describe("dashboard dialog layering", () => {
  it("keeps route dialogs in the shell stacking context above the mobile header", () => {
    expect(dashboardShellRule).toContain("isolation: isolate");
    expect(dashboardMainRule).not.toContain("isolation:");
    expect(dashboardDialogViewportRule).toContain("z-index: 50");
  });
});
