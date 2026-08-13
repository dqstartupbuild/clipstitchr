// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PublishingYouTubeSettings } from "@/app/_components/publishing/compose/PublishingYouTubeSettings";
import type { YouTubeComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/YouTubeComposerSettings";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const settings: YouTubeComposerSettings = {
  description: "",
  madeForKids: null,
  provider: "youtube",
  tags: ["camera setup", "vertical video"],
  thumbnail: null,
  title: "Camera setup",
  visibility: "private",
};

describe("PublishingYouTubeSettings", () => {
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

  it("keeps YouTube metadata explicit and records an audience choice", async () => {
    const onChange = vi.fn();
    await act(async () => {
      root.render(
        <PublishingYouTubeSettings
          integrationId="youtube_1"
          onChange={onChange}
          prefillError={null}
          settings={settings}
        />,
      );
    });

    expect(container.textContent).toContain(
      "the shared caption becomes the YouTube description",
    );
    expect(container.textContent).toContain(
      "A tag with spaces uses 2 extra characters.",
    );
    expect(container.textContent).toContain(
      "No custom thumbnail is selected.",
    );

    const audienceChoices = container.querySelectorAll<HTMLInputElement>(
      'input[type="radio"]',
    );
    await act(async () => audienceChoices[1]?.click());

    expect(onChange).toHaveBeenCalledWith({
      ...settings,
      madeForKids: false,
    });
  });

  it("clears a durable thumbnail without exposing its revision or an object key", async () => {
    const onChange = vi.fn();
    await act(async () => {
      root.render(
        <PublishingYouTubeSettings
          integrationId="youtube_1"
          onChange={onChange}
          prefillError={null}
          settings={{
            ...settings,
            thumbnail: {
              media: { kind: "library-media", recordId: "image_1" },
              mediaRevision: "a".repeat(64),
            },
          }}
        />,
      );
    });

    expect(container.textContent).not.toContain("a".repeat(64));
    expect(container.textContent).not.toContain("objectKey");
    const remove = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Remove custom thumbnail",
    );
    await act(async () => remove?.click());

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ thumbnail: null }),
    );
  });

  it("keeps every YouTube setting reachable by keyboard focus", async () => {
    await act(async () => {
      root.render(
        <PublishingYouTubeSettings
          integrationId="youtube_1"
          onChange={vi.fn()}
          prefillError={null}
          settings={settings}
        />,
      );
    });

    const controls = [
      container.querySelector<HTMLInputElement>('input[maxlength="100"]'),
      container.querySelector<HTMLTextAreaElement>(
        'textarea[maxlength="5000"]',
      ),
      container.querySelector<HTMLSelectElement>("select"),
      ...container.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
      container.querySelector<HTMLTextAreaElement>('textarea[maxlength="700"]'),
    ];

    expect(controls).toHaveLength(6);
    for (const control of controls) {
      expect(control).not.toBeNull();
      await act(async () => control?.focus());
      expect(document.activeElement).toBe(control);
    }
  });
});
