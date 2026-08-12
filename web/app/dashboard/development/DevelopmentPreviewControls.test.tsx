// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DevelopmentAccountSummary } from "@/app/dashboard/development/DevelopmentAccountSummary";
import { DevelopmentBlockedActionButton } from "@/app/dashboard/development/DevelopmentBlockedActionButton";

describe("development preview controls", () => {
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

  it("shows the deterministic development identity", async () => {
    await act(async () => root.render(<DevelopmentAccountSummary />));

    expect(container.textContent).toContain("dev_user");
    expect(container.textContent).toContain("dev_user@localhost");
  });

  it("intercepts paid and destructive actions with a local-only message", async () => {
    await act(async () =>
      root.render(
        <DevelopmentBlockedActionButton message="Paid generation is paused locally.">
          Generate paid result
        </DevelopmentBlockedActionButton>,
      ),
    );

    const button = container.querySelector("button");

    await act(async () => button?.click());

    expect(container.querySelector('[role="status"]')?.textContent).toContain(
      "Paid generation is paused locally.",
    );
  });
});
