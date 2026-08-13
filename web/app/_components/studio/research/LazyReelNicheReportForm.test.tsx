// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LazyReelNicheReportForm } from "./LazyReelNicheReportForm";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("LazyReelNicheReportForm", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.replaceChildren();
  });

  it("requires a niche only for niche-bound focuses and matches the parser cap", async () => {
    await act(async () => {
      root.render(
        <LazyReelNicheReportForm
          catalog={null}
          isRunning={false}
          onSubmit={vi.fn()}
        />,
      );
    });

    const niche = container.querySelector<HTMLInputElement>('input[name="niche"]');
    const limit = container.querySelector<HTMLInputElement>('input[name="limit"]');
    const focus = container.querySelector<HTMLSelectElement>('select[name="focus"]');

    expect(niche?.required).toBe(true);
    expect(limit?.max).toBe("18");

    await act(async () => {
      if (focus) {
        focus.value = "trends";
        focus.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    expect(niche?.required).toBe(false);

    await act(async () => {
      if (focus) {
        focus.value = "combos";
        focus.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    expect(niche?.required).toBe(true);
  });
});
