// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioStitchCreativeBriefOption } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchCreativeBriefOption";
import { StudioStitchRecipeBuilder } from "./StudioStitchRecipeBuilder";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("@/lib/clipstitchr/hooks/studioStitch/useCreateStudioStitchRecipe", () => ({
  useCreateStudioStitchRecipe: () => ({
    createRecipe: vi.fn(),
    error: null,
    isCreating: false,
    statusMessage: null,
  }),
}));

function createBriefOption(
  id: string,
  title: string,
  source: StudioStitchCreativeBriefOption["source"],
): StudioStitchCreativeBriefOption {
  return {
    brief: {
      beatScript: ["Show the proof."],
      callToAction: "Try it.",
      directionName: title,
      footageNeeds: ["Product demo"],
      hook: "Start with the problem.",
      openingVisual: "The problem in use.",
      productProof: "Saved Product proof.",
      soundOffOverlay: "See the difference.",
    },
    id,
    note: `${title} note`,
    source,
    title,
  };
}

describe("StudioStitchRecipeBuilder", () => {
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

  it("preselects an approved Research brief from the route handoff", async () => {
    await act(async () => {
      root.render(
        <StudioStitchRecipeBuilder
          briefOptions={[
            createBriefOption("product-grounding", "Product foundation", "product"),
            createBriefOption("brief_1", "Research direction", "lazyReel"),
          ]}
          initialBriefId="brief_1"
          musicTracks={[]}
          onSaved={vi.fn()}
          productId="product_1"
          sources={[
            {
              durationSeconds: 15,
              hasAudio: true,
              height: 1920,
              id: "clip_1",
              kind: "videoClip",
              name: "Product demo",
              objectKey: "products/product_1/clip.mp4",
              width: 1080,
            },
          ]}
        />,
      );
    });

    const researchLabel = [...container.querySelectorAll("label")].find(
      (label) => label.textContent?.includes("Research direction"),
    );
    const researchRadio = researchLabel?.querySelector<HTMLInputElement>(
      'input[type="radio"]',
    );

    expect(researchRadio?.checked).toBe(true);
    researchRadio?.focus();
    expect(document.activeElement).toBe(researchRadio);
  });

  it("keeps every recipe input controlled while switching pipelines", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      await act(async () => {
        root.render(
          <StudioStitchRecipeBuilder
            briefOptions={[
              createBriefOption("product-grounding", "Product foundation", "product"),
            ]}
            musicTracks={[]}
            onSaved={vi.fn()}
            productId="product_1"
            sources={[
              {
                durationSeconds: 15,
                hasAudio: true,
                height: 1920,
                id: "clip_1",
                kind: "videoClip",
                name: "Product demo",
                objectKey: "products/product_1/clip.mp4",
                width: 1080,
              },
            ]}
          />,
        );
      });

      const talkingPipeline = container.querySelector<HTMLInputElement>(
        'input[name="pipeline"]:last-of-type',
      );
      await act(async () => talkingPipeline?.click());

      const classicPipeline = container.querySelector<HTMLInputElement>(
        'input[name="pipeline"]:first-of-type',
      );
      await act(async () => classicPipeline?.click());

      const controlledWarning = consoleError.mock.calls.find((call) =>
        call.some(
          (value) =>
            typeof value === "string" &&
            value.includes("controlled input to be uncontrolled"),
        ),
      );

      expect(controlledWarning).toBeUndefined();
      expect(classicPipeline?.checked).toBe(true);
    } finally {
      consoleError.mockRestore();
    }
  });
});
