// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioBetaSidebarLink } from "./StudioBetaSidebarLink";
import { StudioBetaAccessContext } from "@/lib/clipstitchr/context/StudioBetaAccessContext";
import type { StudioBetaAccessContextValue } from "@/lib/clipstitchr/types/StudioBetaAccessContextValue";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: vi.fn(),
}));

const baseAccess: StudioBetaAccessContextValue = {
  hasAccess: false,
  isAllowlisted: true,
  isEnabled: false,
  isGloballyEnabled: true,
  isLoading: false,
};

describe("StudioBetaSidebarLink", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  async function renderLink(value: StudioBetaAccessContextValue) {
    await act(async () => {
      root.render(
        <StudioBetaAccessContext.Provider value={value}>
          <StudioBetaSidebarLink pathname="/dashboard" onNavigate={() => {}} />
        </StudioBetaAccessContext.Provider>,
      );
    });
  }

  it("hides navigation until all three gates pass", async () => {
    await renderLink(baseAccess);

    expect(container.querySelector("a")).toBeNull();
  });

  it("reveals the real Studio route to an opted-in account", async () => {
    await renderLink({ ...baseAccess, hasAccess: true, isEnabled: true });

    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "/dashboard/studio",
    );
  });
});
