// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LazyReelWikiLibrary } from "./LazyReelWikiLibrary";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("LazyReelWikiLibrary", () => {
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

  it("shows one chosen Wiki document instead of dumping the full corpus", async () => {
    await act(async () => {
      root.render(
        <LazyReelWikiLibrary
          documents={[
            {
              kind: "niche",
              slug: "fitness",
              title: "Fitness",
              content: "Fitness note body",
              sourcePath: "wiki/niches/fitness.md",
            },
            {
              kind: "pattern",
              slug: "curiosity-gap",
              title: "Curiosity gap",
              content: "Curiosity pattern body",
              sourcePath: "wiki/patterns/curiosity-gap.md",
            },
          ]}
        />,
      );
    });

    expect(container.textContent).toContain("Fitness note body");
    expect(container.textContent).not.toContain("Curiosity pattern body");

    const select = container.querySelector("select");

    await act(async () => {
      if (select) {
        select.value = "curiosity-gap";
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    expect(container.textContent).not.toContain("Fitness note body");
    expect(container.textContent).toContain("Curiosity pattern body");
    expect(container.querySelector("details")?.open).toBe(true);
  });
});
