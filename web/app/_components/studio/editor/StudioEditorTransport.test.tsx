// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioEditorTransport } from "./StudioEditorTransport";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("StudioEditorTransport", () => {
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

  it("exposes a frame-stepped seek control and working playback action", async () => {
    const onSeek = vi.fn();
    const onToggle = vi.fn();

    await act(async () => {
      root.render(
        <StudioEditorTransport
          durationSeconds={6}
          fps={30}
          isPlaying={false}
          playheadSeconds={1}
          onSeek={onSeek}
          onToggle={onToggle}
        />,
      );
    });

    const play = container.querySelector<HTMLButtonElement>("button");
    const range = container.querySelector<HTMLInputElement>('input[type="range"]');

    expect(play?.textContent).toBe("Play");
    expect(range?.step).toBe(String(1 / 30));

    await act(async () => {
      play?.click();
      if (range) {
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )?.set?.call(range, "2.5");
        range.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onSeek).toHaveBeenCalledWith(2.5);
  });
});
