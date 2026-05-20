import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSwiprExport } from "@/lib/clipstitchr/hooks/useSwiprExport";
import type { SwiprBackground } from "@/lib/clipstitchr/types/SwiprBackground";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";

const mocks = vi.hoisted(() => ({
  createZipBlob: vi.fn(),
  downloadBlob: vi.fn(),
  renderSwiprSlideBlob: vi.fn(),
  stateSetter: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useState: (initialValue: unknown) => [initialValue, mocks.stateSetter],
}));

vi.mock("@/lib/clipstitchr/media/renderSwiprSlideBlob", () => ({
  renderSwiprSlideBlob: mocks.renderSwiprSlideBlob,
}));

vi.mock("@/lib/clipstitchr/utils/createZipBlob", () => ({
  createZipBlob: mocks.createZipBlob,
}));

vi.mock("@/lib/clipstitchr/utils/downloadBlob", () => ({
  downloadBlob: mocks.downloadBlob,
}));

function createBackground() {
  return {
    blob: new Blob(["background"], { type: "image/jpeg" }),
    id: "background_1",
    name: "Studio",
    source: "upload" as const,
  } as unknown as SwiprBackground;
}

function createSlide(index: number) {
  return {
    id: `slide_${index}`,
    textOverlay: {
      color: "#ffffff",
      fontSize: 0.1,
      styleId: "hook",
      text: `Slide ${index}`,
      x: 0.1,
      y: 0.1,
    },
  } as unknown as SwiprSlide;
}

describe("useSwiprExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.renderSwiprSlideBlob.mockResolvedValue(
      new Blob(["slide"], { type: "image/png" }),
    );
    mocks.createZipBlob.mockResolvedValue(
      new Blob(["zip"], { type: "application/zip" }),
    );
  });

  it("requires a background before exporting", async () => {
    const state = useSwiprExport();

    await state.exportCarousel({
      background: null,
      productName: "Launch Kit",
      slides: [createSlide(1)],
    });

    expect(mocks.stateSetter).toHaveBeenCalledWith("error");
    expect(mocks.stateSetter).toHaveBeenCalledWith(
      "Choose a background before exporting.",
    );
    expect(mocks.renderSwiprSlideBlob).not.toHaveBeenCalled();
  });

  it("renders slides into a zip and downloads it", async () => {
    const state = useSwiprExport();
    const background = createBackground();

    await state.exportCarousel({
      background,
      productName: "Launch Kit",
      slides: [createSlide(1), createSlide(2)],
    });

    expect(mocks.renderSwiprSlideBlob).toHaveBeenCalledTimes(2);
    expect(mocks.createZipBlob).toHaveBeenCalledWith([
      expect.objectContaining({ name: "swipr-slide-01.png" }),
      expect.objectContaining({ name: "swipr-slide-02.png" }),
    ]);
    expect(mocks.downloadBlob).toHaveBeenCalledWith(
      expect.any(Object),
      "swipr-launch-kit-carousel.zip",
    );
    expect(mocks.stateSetter).toHaveBeenCalledWith("rendering");
    expect(mocks.stateSetter).toHaveBeenCalledWith(1);
    expect(mocks.stateSetter).toHaveBeenCalledWith("complete");
  });

  it("surfaces render failures", async () => {
    mocks.renderSwiprSlideBlob.mockRejectedValueOnce(new Error("render failed"));
    const state = useSwiprExport();

    await state.exportCarousel({
      background: createBackground(),
      productName: "Launch Kit",
      slides: [createSlide(1)],
    });

    expect(mocks.stateSetter).toHaveBeenCalledWith("error");
    expect(mocks.stateSetter).toHaveBeenCalledWith("render failed");
    expect(mocks.downloadBlob).not.toHaveBeenCalled();
  });
});
