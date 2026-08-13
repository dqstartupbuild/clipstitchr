// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioEditorSourceCard } from "./StudioEditorSourceCard";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("StudioEditorSourceCard", () => {
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

  it("offers both visual and audio insertion for a source with sound", async () => {
    const descriptor = {
      kind: "videoClip" as const,
      id: "clip_1",
      name: "Product reveal",
      durationSeconds: 5,
      width: 1080,
      height: 1920,
      hasAudio: true,
      objectKey: "users/u/product-reveal.mp4",
    };
    const onAddVideo = vi.fn();
    const onAddAudio = vi.fn();

    await act(async () => {
      root.render(
        <StudioEditorSourceCard
          descriptor={descriptor}
          disabled={false}
          onAddAudio={onAddAudio}
          onAddVideo={onAddVideo}
        />,
      );
    });

    const buttons = [...container.querySelectorAll("button")];
    await act(async () => {
      buttons[0]?.click();
      buttons[1]?.click();
    });

    expect(onAddVideo).toHaveBeenCalledWith(descriptor);
    expect(onAddAudio).toHaveBeenCalledWith(descriptor);
  });
});
