// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioClipsTrimForm } from "./StudioClipsTrimForm";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("StudioClipsTrimForm", () => {
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

  it("keeps an invalid trim local instead of starting doomed work", async () => {
    const onSave = vi.fn();
    await act(async () => {
      root.render(<StudioClipsTrimForm disabled={false} onSave={onSave} />);
    });

    const inputs = container.querySelectorAll("input");
    await act(async () => {
      inputs[0]!.value = "10";
      inputs[0]!.dispatchEvent(new Event("change", { bubbles: true }));
      inputs[1]!.value = "5";
      inputs[1]!.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await act(async () => {
      container.querySelector("form")?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });

    expect(onSave).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "after the start time",
    );
  });
});
