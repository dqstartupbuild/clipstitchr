// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioStitchOutput } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchOutput";
import { StudioStitchOutputCard } from "./StudioStitchOutputCard";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("StudioStitchOutputCard interaction", () => {
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

  it("accepts pointer and keyboard focus on the real materialization action", async () => {
    const onMaterialize = vi.fn();
    await act(async () => {
      root.render(
        <StudioStitchOutputCard
          isBusy={false}
          onMaterialize={onMaterialize}
          output={{
            byteLength: 4_194_304,
            durationSeconds: 15,
            id: "output_1",
            objectKey: "products/product_1/stitch/output_1.mp4",
            recipeId: "recipe_1",
            revision: 1,
            status: "generated",
          } as StudioStitchOutput}
        />,
      );
    });

    const button = container.querySelector<HTMLButtonElement>("button");
    button?.focus();
    expect(document.activeElement).toBe(button);

    await act(async () => button?.click());
    expect(onMaterialize).toHaveBeenCalledOnce();
  });
});
