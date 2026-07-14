import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AppHookTestingMatrixRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-hook-testing-matrix/page";
import { AppHookTestingMatrixPage } from "@/app/_components/tools/app-hook-testing-matrix/AppHookTestingMatrixPage";

const mocks = vi.hoisted(() => ({
  isBrowserUnlocked: false,
}));

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

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/usePublicToolBrowserUnlock",
  () => ({
    usePublicToolBrowserUnlock: () => mocks.isBrowserUnlocked,
  }),
);

describe("AppHookTestingMatrixPage", () => {
  beforeEach(() => {
    mocks.isBrowserUnlocked = false;
  });

  it("renders a controlled matrix with named variables", async () => {
    const markup = renderToStaticMarkup(
      await AppHookTestingMatrixRoutePage(),
    );

    expect(markup).toContain("App Hook Testing Matrix");
    expect(markup).toContain("4 test cells in two stages");
    expect(markup).toContain("Changed variable: Hook only");
    expect(markup).toContain("Changed variable: Visual only");
    expect(markup).toContain("Download matrix");
    expect(markup).toContain("Mailing list source: app-hook-testing-matrix");
    expect(markup).toContain('href="/pricing"');
  });

  it("gates the exact CSV matrix until browser unlock", () => {
    const lockedMarkup = renderToStaticMarkup(
      <AppHookTestingMatrixPage variant="hybrid-v1" />,
    );
    mocks.isBrowserUnlocked = true;
    const unlockedMarkup = renderToStaticMarkup(
      <AppHookTestingMatrixPage variant="hybrid-v1" />,
    );

    expect(lockedMarkup).not.toContain("Download matrix");
    expect(lockedMarkup).not.toContain("Download CSV matrix");
    expect(unlockedMarkup).toContain("Download CSV matrix");
    expect(unlockedMarkup).not.toContain("Download matrix");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-hook-testing-matrix",
    );
  });
});
