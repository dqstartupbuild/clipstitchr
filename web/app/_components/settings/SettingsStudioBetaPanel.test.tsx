// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsStudioBetaPanel } from "./SettingsStudioBetaPanel";
import { StudioBetaAccessContext } from "@/lib/clipstitchr/context/StudioBetaAccessContext";
import type { StudioBetaAccessContextValue } from "@/lib/clipstitchr/types/StudioBetaAccessContextValue";

const mocks = vi.hoisted(() => ({ setPreference: vi.fn() }));

vi.mock("convex/react", () => ({
  useMutation: () => mocks.setPreference,
}));
vi.mock("@/convex/_generated/api", () => ({
  api: {
    studioBetaAccess: {
      setStudioBetaPreference: { setStudioBetaPreference: "set-preference" },
    },
  },
}));

const baseAccess: StudioBetaAccessContextValue = {
  hasAccess: false,
  isAllowlisted: true,
  isEnabled: false,
  isGloballyEnabled: true,
  isLoading: false,
};

describe("SettingsStudioBetaPanel", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.setPreference.mockResolvedValue({});
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  async function renderPanel(value: StudioBetaAccessContextValue) {
    await act(async () => {
      root.render(
        <StudioBetaAccessContext.Provider value={value}>
          <SettingsStudioBetaPanel />
        </StudioBetaAccessContext.Provider>,
      );
    });
  }

  it("reveals nothing to a non-allowlisted account", async () => {
    await renderPanel({ ...baseAccess, isAllowlisted: false });

    expect(container.textContent).toBe("");
  });

  it("shows one opt-in control to an allowlisted account", async () => {
    await renderPanel(baseAccess);

    const checkbox = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    );

    expect(checkbox).not.toBeNull();
    expect(container.textContent).toContain("Try Studio Beta");

    await act(async () => checkbox?.click());

    expect(mocks.setPreference).toHaveBeenCalledWith({ enabled: true });
  });
});
