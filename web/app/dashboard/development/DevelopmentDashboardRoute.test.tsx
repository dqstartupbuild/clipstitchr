// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DevelopmentDashboardRoute } from "./DevelopmentDashboardRoute";

const mocks = vi.hoisted(() => ({ pathname: "/dashboard/studio" }));

vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname }));
vi.mock("./DevelopmentDashboardShell", () => ({
  DevelopmentDashboardShell: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("DevelopmentDashboardRoute", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mocks.pathname = "/dashboard/studio";
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("never grants Studio through development auth bypass", async () => {
    await act(async () => root.render(<DevelopmentDashboardRoute />));

    expect(container.textContent).toContain(
      "Studio is not available in preview mode",
    );
    expect(container.textContent).not.toContain("Studio cut room");
  });
});
