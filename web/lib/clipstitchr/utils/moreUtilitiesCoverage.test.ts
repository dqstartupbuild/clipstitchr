import { afterEach, describe, expect, it, vi } from "vitest";
import { HIDE_UPLOAD_CONTROLS_EVENT_NAME } from "@/lib/clipstitchr/constants/hideUploadControlsEventName";
import { SHOW_UPLOAD_CONTROLS_EVENT_NAME } from "@/lib/clipstitchr/constants/showUploadControlsEventName";
import { UPLOAD_CONTROLS_SEARCH_PARAM_VALUE } from "@/lib/clipstitchr/constants/uploadControlsSearchParam";
import { applyCssColorAlpha } from "@/lib/clipstitchr/utils/applyCssColorAlpha";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { createBlobFromDataUrl } from "@/lib/clipstitchr/utils/createBlobFromDataUrl";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { createSwaprSegmentTrimRanges } from "@/lib/clipstitchr/utils/createSwaprSegmentTrimRanges";
import { dispatchHideUploadControlsEvent } from "@/lib/clipstitchr/utils/dispatchHideUploadControlsEvent";
import { dispatchShowUploadControlsEvent } from "@/lib/clipstitchr/utils/dispatchShowUploadControlsEvent";
import { filterSwipesBySearchQuery } from "@/lib/clipstitchr/utils/filterSwipesBySearchQuery";
import { filterSwiprBackgroundsBySearchQuery } from "@/lib/clipstitchr/utils/filterSwiprBackgroundsBySearchQuery";
import { getAvatarLightingPrompt } from "@/lib/clipstitchr/utils/getAvatarLightingPrompt";
import { getAvatarStylePrompt } from "@/lib/clipstitchr/utils/getAvatarStylePrompt";
import { getCliprFinalClipName } from "@/lib/clipstitchr/utils/getCliprFinalClipName";
import { getCliprVoiceId } from "@/lib/clipstitchr/utils/getCliprVoiceId";
import { getCssColorAlpha } from "@/lib/clipstitchr/utils/getCssColorAlpha";
import { getCssColorHex } from "@/lib/clipstitchr/utils/getCssColorHex";
import { getGeneratedAvatarPhotoName } from "@/lib/clipstitchr/utils/getGeneratedAvatarPhotoName";
import { getHexColorLuminance } from "@/lib/clipstitchr/utils/getHexColorLuminance";
import { getInitialUploadLibraryTab } from "@/lib/clipstitchr/utils/getInitialUploadLibraryTab";
import { getRecentStitches } from "@/lib/clipstitchr/utils/getRecentStitches";
import { getStitchTrimRangeLabel } from "@/lib/clipstitchr/utils/getStitchTrimRangeLabel";
import { getSwiprBackgroundSearchText } from "@/lib/clipstitchr/utils/getSwiprBackgroundSearchText";
import { getSwiprExportMessage } from "@/lib/clipstitchr/utils/getSwiprExportMessage";
import { getSwiprSwipeName } from "@/lib/clipstitchr/utils/getSwiprSwipeName";
import { getUploadLibraryTabFromSearchParams } from "@/lib/clipstitchr/utils/getUploadLibraryTabFromSearchParams";
import { readSwaprPredictionResponse } from "@/lib/clipstitchr/utils/readSwaprPredictionResponse";
import { resizeSwiprSlides } from "@/lib/clipstitchr/utils/resizeSwiprSlides";
import { waitForSwaprPollInterval } from "@/lib/clipstitchr/utils/waitForSwaprPollInterval";
import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

function createTextOverlay(overrides: Partial<TextOverlay> = {}): TextOverlay {
  return {
    endTime: 5,
    fontSize: 48,
    startTime: 1,
    styleId: "hook",
    text: "Hook",
    width: 0.8,
    x: 0.5,
    y: 0.5,
    ...overrides,
  };
}

function createSwipe(overrides: Partial<SwiprSwipe> = {}): SwiprSwipe {
  return {
    backgroundId: "background_1",
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "swipe_1",
    name: "Launch carousel",
    productContext: "For startup founders",
    productName: "Launch Kit",
    productSourceId: "product_1",
    productSourceType: "saved-product",
    slides: [{ id: "slide_1", textOverlay: createTextOverlay({ text: "Ship faster" }) }],
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createBackground(
  overrides: Partial<SwiprBackgroundAsset> = {},
): SwiprBackgroundAsset {
  return {
    createdAt: "2026-01-01T00:00:00.000Z",
    description: "Clean studio wall",
    details: "Blue wall with open copy space",
    height: 1920,
    id: "background_1",
    imageObject: {
      contentType: "image/jpeg",
      key: "shared/backgrounds/background_1.jpg",
      size: 100,
    },
    mimeType: "image/jpeg",
    name: "Studio Blue",
    size: 100,
    source: "upload",
    tags: ["studio", "blue"],
    width: 1080,
    ...overrides,
  };
}

describe("additional utility coverage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("normalizes colors, opacity, and text overlay bounds", () => {
    expect(getCssColorHex("#abc")).toBe("#aabbcc");
    expect(getCssColorHex("rgb(12, 34, 56)")).toBe("#0c2238");
    expect(getCssColorHex("not a color", "#ffffff")).toBe("#ffffff");
    expect(applyCssColorAlpha("#ff0000", 1)).toBe("#ff0000");
    expect(applyCssColorAlpha("#00ff00", 0.25)).toBe("rgba(0, 255, 0, 0.25)");
    expect(getCssColorAlpha("rgba(1, 2, 3, 1.5)")).toBe(1);
    expect(getCssColorAlpha("rgba(1, 2, 3, -1)")).toBe(1);
    expect(getCssColorAlpha("not rgba")).toBe(1);
    expect(getHexColorLuminance("ffffff")).toBeCloseTo(1);
    expect(getHexColorLuminance("bad")).toBe(1);

    expect(
      clampTextOverlay(
        createTextOverlay({
          endTime: 20,
          fontSize: 400,
          startTime: -1,
          width: 2,
          x: 1,
          y: 2,
        }),
        0.5,
      ),
    ).toEqual(
      expect.objectContaining({
        endTime: 0.5,
        startTime: 0,
        width: 0.92,
        x: 0.07999999999999996,
        y: 0.9,
      }),
    );
    expect(
      clampTextOverlay(createTextOverlay({ endTime: 1, startTime: 9 }), 10),
    ).toEqual(expect.objectContaining({ endTime: 9.25, startTime: 9 }));
  });

  it("decodes data URLs, creates IDs, and builds segmented trim ranges", async () => {
    await expect(createBlobFromDataUrl("not-data")).rejects.toThrow(
      "Invalid generated image data URL.",
    );
    const defaultBlob = await createBlobFromDataUrl("data:,plain%20text");

    expect(defaultBlob.type).toBe("application/octet-stream");
    await expect(defaultBlob.text()).resolves.toBe("plain text");

    vi.stubGlobal("crypto", {
      randomUUID: vi.fn(() => "uuid_1"),
    });
    expect(createId()).toBe("uuid_1");

    vi.stubGlobal("crypto", undefined);
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    expect(createId()).toBe("loyw3v28-i");
    expect(createSwaprSegmentTrimRanges(-1, 10)).toEqual([]);
    expect(createSwaprSegmentTrimRanges(Number.NaN, 10)).toEqual([]);
    expect(createSwaprSegmentTrimRanges(5, 0)).toEqual([{ start: 0, end: 5 }]);
  });

  it("returns avatar, Clipr, upload, and export labels from option helpers", () => {
    expect(getAvatarLightingPrompt("studio")).toContain("studio");
    expect(getAvatarLightingPrompt("unknown" as AvatarLightingOption)).toContain(
      "any realistic",
    );
    expect(getAvatarStylePrompt("editorial")).toContain("editorial");
    expect(getAvatarStylePrompt("unknown" as AvatarStyleOption)).toContain(
      "selfie",
    );
    expect(getCliprVoiceId("Puck (Male)")).toBe("Puck (Male)");
    expect(getCliprVoiceId("missing")).toBe("Zephyr (Female)");
    expect(getCliprVoiceId(null)).toBe("Zephyr (Female)");
    expect(
      getGeneratedAvatarPhotoName({
        index: 2,
        location: " Rooftop ",
        sourceName: "Ari",
      }),
    ).toBe("Ari - Rooftop 2");
    expect(
      getGeneratedAvatarPhotoName({
        index: 3,
        location: "   ",
        sourceName: "Ari",
      }),
    ).toBe("Ari - Avatar Photo 3");
    expect(getCliprFinalClipName(" Launch Kit ", "2026-05-20T12:00:00Z")).toBe(
      "Clipr - Launch Kit - 2026-05-20",
    );
    expect(getCliprFinalClipName("", "not a date")).toBe(
      "Clipr - Product - clip",
    );
    expect(getSwiprExportMessage("idle")).toBe("Ready to export.");
    expect(getSwiprExportMessage("rendering")).toBe("Rendering carousel images.");
    expect(getSwiprExportMessage("complete")).toBe("Carousel ZIP is ready.");
    expect(getSwiprExportMessage("error")).toBe(
      "Unable to export this carousel.",
    );
    expect(getSwiprSwipeName(" Launch Kit ")).toBe("Launch Kit carousel");
    expect(getSwiprSwipeName("   ")).toBe("Product carousel");
    expect(getUploadLibraryTabFromSearchParams(new URLSearchParams("tab=ugc"))).toBe(
      "ugc",
    );
    expect(
      getUploadLibraryTabFromSearchParams(new URLSearchParams("tab=missing")),
    ).toBe("all");
  });

  it("filters saved media and computes timeline labels", () => {
    const swipe = createSwipe();
    const background = createBackground();

    expect(filterSwipesBySearchQuery([swipe], "")).toEqual([swipe]);
    expect(filterSwipesBySearchQuery([swipe], "ship")).toEqual([swipe]);
    expect(filterSwipesBySearchQuery([swipe], "absent")).toEqual([]);
    expect(filterSwiprBackgroundsBySearchQuery([background], "")).toEqual([
      background,
    ]);
    expect(filterSwiprBackgroundsBySearchQuery([background], "copy space")).toEqual(
      [background],
    );
    expect(getSwiprBackgroundSearchText(background)).toContain("studio blue");
    expect(
      getRecentStitches(
        [
          { createdAt: "2026-01-01T00:00:00.000Z", id: "old" } as Stitch,
          { createdAt: "2026-02-01T00:00:00.000Z", id: "new" } as Stitch,
        ],
        1,
      ),
    ).toEqual([{ createdAt: "2026-02-01T00:00:00.000Z", id: "new" }]);
    expect(
      getStitchTrimRangeLabel({
        end: 12,
        start: 3,
      }),
    ).toBe("00:03 - 00:12 (00:09)");
    expect(getStitchTrimRangeLabel()).toBeUndefined();
  });

  it("resizes Swipr slides", () => {
    const slides: SwiprSlide[] = [
      { id: "slide_1", textOverlay: createTextOverlay() },
      { id: "slide_2", textOverlay: createTextOverlay() },
      { id: "slide_3", textOverlay: createTextOverlay() },
      { id: "slide_4", textOverlay: createTextOverlay() },
    ];

    expect(resizeSwiprSlides(slides, 3)).toHaveLength(3);
    expect(resizeSwiprSlides(slides.slice(0, 1), 3)).toHaveLength(3);
  });

  it("reads prediction responses and dispatches upload-control events", async () => {
    await expect(
      readSwaprPredictionResponse(
        new Response(JSON.stringify({ outputUrl: "https://example.com/out.mp4" })),
      ),
    ).resolves.toEqual({ outputUrl: "https://example.com/out.mp4" });
    await expect(
      readSwaprPredictionResponse(
        new Response(JSON.stringify({ message: "Provider failed" }), {
          status: 500,
        }),
      ),
    ).rejects.toThrow("Provider failed");

    class TestCustomEvent extends Event {
      detail: unknown;

      constructor(type: string, init?: CustomEventInit) {
        super(type);
        this.detail = init?.detail;
      }
    }

    const dispatchEvent = vi.fn();
    const replaceState = vi.fn();

    vi.stubGlobal("CustomEvent", TestCustomEvent);
    vi.stubGlobal("window", {
      dispatchEvent,
      history: {
        replaceState,
      },
      location: {
        hash: "#upload",
        href: `https://clipstitchr.test/dashboard/uploads?upload=${UPLOAD_CONTROLS_SEARCH_PARAM_VALUE}#upload`,
        search: `?upload=${UPLOAD_CONTROLS_SEARCH_PARAM_VALUE}`,
      },
      setTimeout: vi.fn((callback: () => void) => {
        callback();
        return 1;
      }),
    });

    dispatchShowUploadControlsEvent("ugc");
    dispatchHideUploadControlsEvent();
    await waitForSwaprPollInterval();

    expect(dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { assetType: "ugc" },
        type: SHOW_UPLOAD_CONTROLS_EVENT_NAME,
      }),
    );
    expect(dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: HIDE_UPLOAD_CONTROLS_EVENT_NAME,
      }),
    );
    expect(replaceState).toHaveBeenCalled();
    expect(window.setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);
  });

  it("reads initial upload tabs", () => {
    expect(getInitialUploadLibraryTab()).toBe("all");

    vi.stubGlobal("window", {
      location: {
        search: "?tab=swipes",
      },
    });
    expect(getInitialUploadLibraryTab()).toBe("swipes");
  });
});
