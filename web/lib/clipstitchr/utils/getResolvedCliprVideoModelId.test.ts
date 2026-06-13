import { afterEach, describe, expect, it } from "vitest";
import { getResolvedCliprVideoModelId } from "@/lib/clipstitchr/utils/getResolvedCliprVideoModelId";

const originalCliprVisualVideoModelId =
  process.env.CLIPR_VISUAL_VIDEO_MODEL_ID;

function restoreCliprVisualVideoModelId() {
  if (originalCliprVisualVideoModelId === undefined) {
    delete process.env.CLIPR_VISUAL_VIDEO_MODEL_ID;

    return;
  }

  process.env.CLIPR_VISUAL_VIDEO_MODEL_ID = originalCliprVisualVideoModelId;
}

describe("getResolvedCliprVideoModelId", () => {
  afterEach(() => {
    restoreCliprVisualVideoModelId();
  });

  it("uses Kling as the fallback for visual Clipr modes", () => {
    delete process.env.CLIPR_VISUAL_VIDEO_MODEL_ID;

    expect(
      getResolvedCliprVideoModelId({
        mode: "reaction",
        requestedModelId: "auto",
      }),
    ).toBe("kwaivgi/kling-v3-video");
    expect(
      getResolvedCliprVideoModelId({
        mode: "broll",
        requestedModelId: "google/veo-3.1",
      }),
    ).toBe("kwaivgi/kling-v3-video");
  });

  it("uses the visual model environment override when it supports the mode", () => {
    process.env.CLIPR_VISUAL_VIDEO_MODEL_ID = "google/veo-3.1";

    expect(
      getResolvedCliprVideoModelId({
        mode: "reaction",
        requestedModelId: "auto",
      }),
    ).toBe("google/veo-3.1");
    expect(
      getResolvedCliprVideoModelId({
        mode: "broll",
        requestedModelId: "auto",
      }),
    ).toBe("google/veo-3.1");
  });

  it("ignores stale or unsupported visual model values", () => {
    process.env.CLIPR_VISUAL_VIDEO_MODEL_ID = "openai/sora-2";

    expect(
      getResolvedCliprVideoModelId({
        mode: "reaction",
        requestedModelId: "openai/sora-2-pro",
      }),
    ).toBe("kwaivgi/kling-v3-video");

    process.env.CLIPR_VISUAL_VIDEO_MODEL_ID = "bytedance/seedance-2.0";

    expect(
      getResolvedCliprVideoModelId({
        mode: "broll",
        requestedModelId: "bytedance/seedance-2.0",
      }),
    ).toBe("kwaivgi/kling-v3-video");
  });

  it("keeps Script and Demo modes on their dedicated models", () => {
    process.env.CLIPR_VISUAL_VIDEO_MODEL_ID = "google/veo-3.1";

    expect(
      getResolvedCliprVideoModelId({
        mode: "script",
        requestedModelId: "auto",
      }),
    ).toBe("prunaai/p-video-avatar");
    expect(
      getResolvedCliprVideoModelId({
        mode: "demo",
        requestedModelId: "auto",
      }),
    ).toBe("bytedance/seedance-2.0");
  });
});
