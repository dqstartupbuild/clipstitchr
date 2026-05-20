import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";

const mocks = vi.hoisted(() => ({
  encodeCanvasAsPosterBlob: vi.fn(),
  getCanvasVisiblePixelRatio: vi.fn(),
  seekVideoToTime: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/media/createVideoPosterCandidateTimes",
  () => ({
    createVideoPosterCandidateTimes: () => [0.25, 0.5],
  }),
);

vi.mock("@/lib/clipstitchr/media/encodeCanvasAsPosterBlob", () => ({
  encodeCanvasAsPosterBlob: mocks.encodeCanvasAsPosterBlob,
}));

vi.mock("@/lib/clipstitchr/media/getCanvasVisiblePixelRatio", () => ({
  getCanvasVisiblePixelRatio: mocks.getCanvasVisiblePixelRatio,
}));

vi.mock("@/lib/clipstitchr/media/seekVideoToTime", () => ({
  seekVideoToTime: mocks.seekVideoToTime,
}));

type MockVideo = {
  duration: number;
  load: ReturnType<typeof vi.fn>;
  muted: boolean;
  onerror: (() => void) | null;
  onloadedmetadata: (() => void) | null;
  playsInline: boolean;
  preload: string;
  removeAttribute: ReturnType<typeof vi.fn>;
  videoHeight: number;
  videoWidth: number;
};

function createVideo(width = 1080, height = 1920): MockVideo {
  const video: MockVideo = {
    duration: 4,
    load: vi.fn(),
    muted: false,
    onerror: null,
    onloadedmetadata: null,
    playsInline: false,
    preload: "",
    removeAttribute: vi.fn(),
    videoHeight: height,
    videoWidth: width,
  };

  Object.defineProperty(video, "src", {
    set: () => {
      video.onloadedmetadata?.();
    },
  });

  return video;
}

function createCanvas() {
  return {
    getContext: vi.fn(() => ({ drawImage: vi.fn() })),
    height: 0,
    width: 0,
  };
}

describe("createVideoPosterBlob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.encodeCanvasAsPosterBlob.mockResolvedValue(
      new Blob(["poster"], { type: "image/jpeg" }),
    );
    mocks.getCanvasVisiblePixelRatio.mockReturnValue(0.05);
    mocks.seekVideoToTime.mockResolvedValue(undefined);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:video"),
      revokeObjectURL: vi.fn(),
    });
    vi.stubGlobal("window", {
      clearTimeout: vi.fn(),
      setTimeout: vi.fn(() => 123),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("captures and encodes the first visible poster frame", async () => {
    const video = createVideo();
    const canvas = createCanvas();
    vi.stubGlobal("document", {
      createElement: vi.fn((tagName: string) =>
        tagName === "video" ? video : canvas,
      ),
    });

    await expect(createVideoPosterBlob(new Blob(["video"]))).resolves.toBeInstanceOf(
      Blob,
    );
    expect(video.muted).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(canvas.width).toBe(1080);
    expect(canvas.height).toBe(1920);
    expect(mocks.seekVideoToTime).toHaveBeenCalledWith(video, 0.25);
    expect(mocks.encodeCanvasAsPosterBlob).toHaveBeenCalledWith(canvas);
    expect(video.removeAttribute).toHaveBeenCalledWith("src");
    expect(video.load).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:video");
  });

  it("falls back to the best candidate if no frame crosses the visibility threshold", async () => {
    const video = createVideo();
    vi.stubGlobal("document", {
      createElement: vi.fn((tagName: string) =>
        tagName === "video" ? video : createCanvas(),
      ),
    });
    mocks.getCanvasVisiblePixelRatio
      .mockReturnValueOnce(0.01)
      .mockReturnValueOnce(0.02);

    await createVideoPosterBlob(new Blob(["video"]));

    expect(mocks.seekVideoToTime).toHaveBeenNthCalledWith(1, video, 0.25);
    expect(mocks.seekVideoToTime).toHaveBeenNthCalledWith(2, video, 0.5);
    expect(mocks.seekVideoToTime).toHaveBeenNthCalledWith(3, video, 0.5);
  });

  it("rejects videos without readable dimensions or canvas context", async () => {
    vi.stubGlobal("document", {
      createElement: vi.fn((tagName: string) =>
        tagName === "video" ? createVideo(0, 0) : createCanvas(),
      ),
    });

    await expect(createVideoPosterBlob(new Blob(["video"]))).rejects.toThrow(
      "Unable to read video dimensions for poster capture.",
    );

    vi.stubGlobal("document", {
      createElement: vi.fn((tagName: string) =>
        tagName === "video"
          ? createVideo()
          : { getContext: vi.fn(() => null), height: 0, width: 0 },
      ),
    });

    await expect(createVideoPosterBlob(new Blob(["video"]))).rejects.toThrow(
      "Unable to create canvas context for poster capture.",
    );
  });
});
