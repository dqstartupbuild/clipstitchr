import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudioBetaWorkspacePageClient } from "./StudioBetaWorkspacePageClient";

const mocks = vi.hoisted(() => ({
  product: {
    activeProduct: null as { id: string; name: string } | null,
    activeProductId: null as string | null,
  },
  summary: undefined as
    | undefined
    | {
        productName: string;
        recentMedia: never[];
        sourceCount: number;
        stitchCount: number;
      },
}));

vi.mock("convex/react", () => ({ useQuery: () => mocks.summary }));
vi.mock("@/lib/clipstitchr/hooks/useDashboardProduct", () => ({
  useDashboardProduct: () => mocks.product,
}));
vi.mock("@/lib/clipstitchr/hooks/useStudioBetaPosterUrls", () => ({
  useStudioBetaPosterUrls: () => new Map(),
}));
vi.mock("@/app/_components/dashboard/DashboardShell", () => ({
  DashboardShell: ({ children }: { children: React.ReactNode }) => children,
}));

describe("StudioBetaWorkspacePageClient", () => {
  beforeEach(() => {
    mocks.product.activeProduct = null;
    mocks.product.activeProductId = null;
    mocks.summary = undefined;
  });

  it("shows a Product choice instead of an endless loading state", () => {
    const markup = renderToStaticMarkup(<StudioBetaWorkspacePageClient />);

    expect(markup).toContain("Choose a Product first");
    expect(markup).not.toContain("Setting the cut room");
  });

  it("shows the empty cut room after the active Product summary loads", () => {
    mocks.product.activeProduct = { id: "product_1", name: "Garden camera" };
    mocks.product.activeProductId = "product_1";
    mocks.summary = {
      productName: "Garden camera",
      recentMedia: [],
      sourceCount: 0,
      stitchCount: 0,
    };

    const markup = renderToStaticMarkup(<StudioBetaWorkspacePageClient />);

    expect(markup).toContain("Your cut room is ready");
    expect(markup).toContain("Garden camera");
  });
});
