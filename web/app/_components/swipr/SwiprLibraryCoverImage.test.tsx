// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SwiprLibraryCoverImage } from "@/app/_components/swipr/SwiprLibraryCoverImage";

let intersectionCallback: IntersectionObserverCallback = () => undefined;

class TestIntersectionObserver {
  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn(() => []);
  unobserve = vi.fn();
  root = null;
  rootMargin = "240px";
  thresholds = [0];

  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }
}

describe("SwiprLibraryCoverImage", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:cover");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("waits until the cover approaches the viewport before downloading", async () => {
    const container = document.createElement("div");
    const root = createRoot(container);
    const loadBackgroundBlob = vi.fn(async () => new Blob(["cover"]));

    await act(async () => {
      root.render(
        <SwiprLibraryCoverImage
          backgroundId="background_1"
          onLoadBackgroundBlob={loadBackgroundBlob}
        />,
      );
    });

    expect(loadBackgroundBlob).not.toHaveBeenCalled();

    await act(async () => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
      await Promise.resolve();
    });

    expect(loadBackgroundBlob).toHaveBeenCalledTimes(1);
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "blob:cover",
    );

    await act(async () => root.unmount());
  });
});
