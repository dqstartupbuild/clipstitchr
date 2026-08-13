// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LazyReelReadOnlyResultDetails } from "./LazyReelReadOnlyResultDetails";
import type { LazyReelToolResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolResult";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const result: LazyReelToolResult = {
  tool: "niche_report",
  title: "Fitness report",
  summary: "The complete summary.",
  data: {},
  evidence: [
    {
      label: "Opening pattern",
      kind: "observed",
      detail: "Found in the committed examples.",
      snapshotVersion: "v1",
      source: "corpus",
    },
  ],
  sections: [
    { id: "one", title: "First", items: ["First complete finding"] },
    { id: "two", title: "Last", items: ["Final complete finding"] },
  ],
  links: [
    { label: "TikTok", context: "Supported", url: "https://www.tiktok.com/@a/video/1" },
    { label: "Unsafe", context: "Unsupported", url: "https://example.com/private" },
  ],
  methodology: "Complete methodology.",
  limitations: ["Complete limitation."],
};

describe("LazyReelReadOnlyResultDetails", () => {
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

  it("renders the complete structured result and only safe source links", async () => {
    await act(async () => {
      root.render(<LazyReelReadOnlyResultDetails result={result} />);
    });

    expect(container.textContent).toContain("First complete finding");
    expect(container.textContent).toContain("Final complete finding");
    expect(container.textContent).toContain("Found in the committed examples");
    expect(container.textContent).toContain("Complete methodology");
    expect(container.textContent).toContain("Complete limitation");
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(container.querySelector("a")?.hostname).toBe("www.tiktok.com");
  });
});
