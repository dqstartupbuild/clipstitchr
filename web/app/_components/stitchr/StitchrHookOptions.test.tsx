/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StitchrHookOptions } from "@/app/_components/stitchr/StitchrHookOptions";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

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

describe("StitchrHookOptions", () => {
  it("shows generated angles and selects one with a native radio control", async () => {
    const onSelect = vi.fn();

    await act(async () => {
      root.render(
        <StitchrHookOptions
          options={[
            {
              angle: "Relatable",
              caption: "The first rep can tell you where to start.",
              socialCaption:
                "The first rep can tell you where to start.\n\n#calisthenics",
              templateId: "DD-001",
              text: "When your first rep tells the truth",
            },
            {
              angle: "Curiosity",
              caption: "A clearer workout starts with the missing step.",
              socialCaption:
                "A clearer workout starts with the missing step.\n\n#calisthenics",
              templateId: "MG-001",
              text: "The part your workout was missing",
            },
            {
              angle: "Bold",
              caption: "Structure beats another random workout.",
              socialCaption:
                "Structure beats another random workout.\n\n#calisthenics",
              templateId: "PB-001",
              text: "Random workouts are not a plan",
            },
          ]}
          selectedText="When your first rep tells the truth"
          onSelect={onSelect}
        />,
      );
    });

    expect(container.textContent).toContain("Choose a hook angle");
    expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(3);
    expect(
      (container.querySelectorAll('input[type="radio"]')[0] as HTMLInputElement)
        .checked,
    ).toBe(true);

    await act(async () => {
      (
        container.querySelectorAll('input[type="radio"]')[1] as HTMLInputElement
      ).click();
    });

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        angle: "Curiosity",
        text: "The part your workout was missing",
      }),
    );
  });

  it("stays hidden when there is no meaningful choice", async () => {
    await act(async () => {
      root.render(
        <StitchrHookOptions
          options={[
            {
              angle: "Best match",
              caption: "The first rep can tell you where to start.",
              socialCaption:
                "The first rep can tell you where to start.\n\n#calisthenics",
              templateId: "DD-001",
              text: "When your first rep tells the truth",
            },
          ]}
          selectedText="When your first rep tells the truth"
          onSelect={() => undefined}
        />,
      );
    });

    expect(container.textContent).toBe("");
  });
});
