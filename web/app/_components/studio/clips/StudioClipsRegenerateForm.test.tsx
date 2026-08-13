// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioClipsRegenerateForm } from "./StudioClipsRegenerateForm";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("StudioClipsRegenerateForm", () => {
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

  it("requests only the supported clean rerender", async () => {
    const onSave = vi.fn();
    await act(async () => {
      root.render(
        <StudioClipsRegenerateForm disabled={false} onSave={onSave} />,
      );
    });

    const button = container.querySelector("button");
    button?.focus();
    expect(document.activeElement).toBe(button);
    expect(container.querySelector("textarea")).toBeNull();
    await act(async () => button?.click());

    expect(onSave).toHaveBeenCalledWith({ kind: "regenerate" });
    expect(container.textContent).toContain(
      "New written instructions are not supported here.",
    );
  });
});
