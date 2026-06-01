import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSwaprGeneration } from "@/lib/clipstitchr/hooks/useSwaprGeneration";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import type { SwaprReferenceVideoSegment } from "@/lib/clipstitchr/types/SwaprReferenceVideoSegment";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

const mocks = vi.hoisted(() => ({
  createId: vi.fn(),
  createSwaprGeneration: vi.fn(),
  useStateSetter: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useState: (initialValue: unknown) => [
    typeof initialValue === "function"
      ? (initialValue as () => unknown)()
      : initialValue,
    mocks.useStateSetter,
  ],
}));

vi.mock("@/lib/clipstitchr/client/createSwaprGeneration", () => ({
  createSwaprGeneration: mocks.createSwaprGeneration,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function createPhoto() {
  return {
    id: "photo_1",
    name: "Avatar",
  } as unknown as PhotoAssetMetadata;
}

function createClip() {
  return {
    clipType: "ugc",
    id: "clip_1",
    name: "Source",
  } as unknown as VideoClipMetadata;
}

function createSegment(index = 0) {
  return {
    duration: 6,
    videoObject: {
      contentType: "video/mp4",
      key: `users/user_123/swapr/segment-${index + 1}.mp4`,
      size: 50,
    },
  } as unknown as SwaprReferenceVideoSegment;
}

describe("useSwaprGeneration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createId
      .mockReturnValueOnce("batch_1")
      .mockReturnValueOnce("generated_clip_1")
      .mockReturnValue("next_id");
    mocks.createSwaprGeneration.mockResolvedValue({
      id: "provider:swapr:batch_1",
      status: "queued",
    });
  });

  it("queues a Swapr worker generation and returns immediately", async () => {
    const onClipSaved = vi.fn();
    const state = useSwaprGeneration(onClipSaved);
    const segments = [createSegment()];

    await state.generate({
      characterOrientation: "image",
      clip: createClip(),
      generationSpeedTier: "pro",
      keepOriginalSound: true,
      mode: "pro",
      photo: createPhoto(),
      prompt: "  walk toward camera  ",
      referenceVideoSegments: segments,
    });

    expect(mocks.createSwaprGeneration).toHaveBeenCalledWith({
      batchId: "batch_1",
      characterOrientation: "image",
      clipId: "generated_clip_1",
      clipName: "Swapr - Avatar in Source",
      generationSpeedTier: "pro",
      keepOriginalSound: true,
      mode: "pro",
      photoId: "photo_1",
      prompt: "  walk toward camera  ",
      referenceClipId: "clip_1",
      referenceClipName: "Source",
      segments,
      totalEstimatedDurationSeconds: 6,
    });
    expect(onClipSaved).toHaveBeenCalledTimes(1);
    expect(mocks.useStateSetter).toHaveBeenCalledWith("succeeded");
    expect(mocks.useStateSetter).toHaveBeenCalledWith(1);
  });

  it("passes all selected segments to the provider job", async () => {
    const state = useSwaprGeneration();
    const segments = [createSegment(0), createSegment(1)];

    await state.generate({
      characterOrientation: "video",
      clip: createClip(),
      keepOriginalSound: false,
      mode: "std",
      photo: createPhoto(),
      prompt: " ",
      referenceVideoSegments: segments,
    });

    expect(mocks.createSwaprGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        segments,
        totalEstimatedDurationSeconds: 12,
      }),
    );
  });

  it("fails before queueing when no source segment is selected", async () => {
    const state = useSwaprGeneration();

    await state.generate({
      characterOrientation: "image",
      clip: createClip(),
      keepOriginalSound: true,
      mode: "pro",
      photo: createPhoto(),
      prompt: "walk",
      referenceVideoSegments: [],
    });

    expect(mocks.createSwaprGeneration).not.toHaveBeenCalled();
    expect(mocks.useStateSetter).toHaveBeenCalledWith("failed");
    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      "Choose a source video before starting Swapr.",
    );
  });
});
