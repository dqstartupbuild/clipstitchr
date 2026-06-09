import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAvatarPhotoGeneration } from "@/lib/clipstitchr/hooks/useAvatarPhotoGeneration";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";

const mocks = vi.hoisted(() => ({
  generateAvatarPhotos: vi.fn(),
  stateSetter: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useState: (initialValue: unknown) => [initialValue, mocks.stateSetter],
}));

vi.mock("@/lib/clipstitchr/client/generateAvatarPhotos", () => ({
  generateAvatarPhotos: mocks.generateAvatarPhotos,
}));

function createGenerateInput(overrides: Record<string, unknown> = {}) {
  return {
    avatar: {
      cliprVoiceId: "Rachel",
      createdAt: "2026-05-20T00:00:00.000Z",
      description: " Confident founder ",
      id: "avatar_1",
      name: "Founder",
      updatedAt: "2026-05-20T00:00:00.000Z",
      wardrobeStyle: "female",
    },
    context: "holding product",
    count: 3,
    lighting: "studio",
    location: "office",
    outfit: "navy activewear",
    referencePhoto: { id: "photo_1" },
    style: "ugc",
    ...overrides,
  } as unknown as Parameters<
    ReturnType<typeof useAvatarPhotoGeneration>["generate"]
  >[0];
}

describe("useAvatarPhotoGeneration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.generateAvatarPhotos.mockResolvedValue({
      generatedPhotos: [
        {
          blob: new Blob(["generated"], { type: "image/jpeg" }),
          variant: { style: "ugc" },
        },
      ],
      queuedCount: 3,
    });
  });

  it("requires an avatar description before loading the reference photo", async () => {
    const loadPhoto = vi.fn();
    const state = useAvatarPhotoGeneration({
      loadPhoto,
      saveGeneratedPhotos: vi.fn(),
    });

    await state.generate(
      createGenerateInput({
        avatar: { description: " ", id: "avatar_1", name: "Founder" },
      }),
    );

    expect(mocks.stateSetter).toHaveBeenCalledWith(
      "Add an avatar description before generating photos.",
    );
    expect(loadPhoto).not.toHaveBeenCalled();
  });

  it("loads the selected photo and queues worker generation", async () => {
    const referencePhoto = new Blob(["photo"], {
      type: "image/jpeg",
    }) as unknown as PhotoAsset;
    const loadPhoto = vi.fn(async () => referencePhoto);
    const saveGeneratedPhotos = vi.fn(async () => undefined);
    const state = useAvatarPhotoGeneration({
      loadPhoto,
      saveGeneratedPhotos,
    });

    await state.generate(createGenerateInput());

    expect(loadPhoto).toHaveBeenCalledWith("photo_1");
    expect(mocks.generateAvatarPhotos).toHaveBeenCalledWith(
      expect.objectContaining({
        avatar: referencePhoto,
        avatarId: "avatar_1",
        avatarName: "Founder",
        avatarDescription: "Confident founder",
        outfit: "navy activewear",
        wardrobeStyle: "female",
      }),
    );
    expect(saveGeneratedPhotos).not.toHaveBeenCalled();
    expect(mocks.stateSetter).toHaveBeenCalledWith(3);
    expect(mocks.stateSetter).toHaveBeenCalledWith(false);
  });

  it("surfaces missing photos and provider failures", async () => {
    const missingState = useAvatarPhotoGeneration({
      loadPhoto: vi.fn(async () => null),
      saveGeneratedPhotos: vi.fn(),
    });

    await missingState.generate(createGenerateInput());

    mocks.generateAvatarPhotos.mockRejectedValueOnce(new Error("provider down"));
    const failingState = useAvatarPhotoGeneration({
      loadPhoto: vi.fn(
        async () => new Blob(["photo"]) as unknown as PhotoAsset,
      ),
      saveGeneratedPhotos: vi.fn(),
    });

    await failingState.generate(createGenerateInput());

    expect(mocks.stateSetter).toHaveBeenCalledWith(
      "Unable to load the selected avatar.",
    );
    expect(mocks.stateSetter).toHaveBeenCalledWith("provider down");
  });
});
