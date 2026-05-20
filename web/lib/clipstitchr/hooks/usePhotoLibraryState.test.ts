import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePhotoLibraryState } from "@/lib/clipstitchr/hooks/usePhotoLibraryState";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

const mocks = vi.hoisted(() => {
  const mutationFns = new Map<string, ReturnType<typeof vi.fn>>();

  return {
    analyzeUploadAsset: vi.fn(),
    convex: {
      query: vi.fn(),
    },
    createAvatarFromConvexDocument: vi.fn(),
    createId: vi.fn(),
    createImageThumbnailBlob: vi.fn(),
    createPhotoAssetFromConvexDocument: vi.fn(),
    createPhotoAssetMetadataFromConvexDocument: vi.fn(),
    createSwaprOutpaintInputs: vi.fn(),
    createSwaprPortraitPhotoBlob: vi.fn(),
    deleteObjectsFromR2: vi.fn(),
    downloadBlobFromR2: vi.fn(),
    expandSwaprPhotoWithAi: vi.fn(),
    getImageDimensions: vi.fn(),
    mutationFns,
    uploadBlobsToR2: vi.fn(),
    useConvex: vi.fn(),
    useConvexAuth: vi.fn(),
    useEffect: vi.fn(),
    useMutation: vi.fn((mutationId: string) => {
      const mutation = mutationFns.get(mutationId) ?? vi.fn();

      mutationFns.set(mutationId, mutation);
      return mutation;
    }),
    useQuery: vi.fn(),
    useStateSetter: vi.fn(),
  };
});

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useEffect: mocks.useEffect,
  useMemo: (factory: () => unknown) => factory(),
  useRef: (value: unknown) => ({ current: value }),
  useState: (initialValue: unknown) => [
    typeof initialValue === "function"
      ? (initialValue as () => unknown)()
      : initialValue,
    mocks.useStateSetter,
  ],
}));

vi.mock("convex/react", () => ({
  useConvex: mocks.useConvex,
  useConvexAuth: mocks.useConvexAuth,
  useMutation: mocks.useMutation,
  useQuery: mocks.useQuery,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    avatars: {
      list: "avatars.list",
      save: "avatars.save",
      update: "avatars.update",
    },
    photoAssets: {
      get: "photoAssets.get",
      list: "photoAssets.list",
      remove: "photoAssets.remove",
      save: "photoAssets.save",
      updateMetadata: "photoAssets.updateMetadata",
    },
  },
}));

vi.mock("@/lib/clipstitchr/backend/createAvatarFromConvexDocument", () => ({
  createAvatarFromConvexDocument: mocks.createAvatarFromConvexDocument,
}));

vi.mock("@/lib/clipstitchr/backend/createPhotoAssetFromConvexDocument", () => ({
  createPhotoAssetFromConvexDocument: mocks.createPhotoAssetFromConvexDocument,
}));

vi.mock(
  "@/lib/clipstitchr/backend/createPhotoAssetMetadataFromConvexDocument",
  () => ({
    createPhotoAssetMetadataFromConvexDocument:
      mocks.createPhotoAssetMetadataFromConvexDocument,
  }),
);

vi.mock("@/lib/clipstitchr/client/analyzeUploadAsset", () => ({
  analyzeUploadAsset: mocks.analyzeUploadAsset,
}));

vi.mock("@/lib/clipstitchr/client/expandSwaprPhotoWithAi", () => ({
  expandSwaprPhotoWithAi: mocks.expandSwaprPhotoWithAi,
}));

vi.mock("@/lib/clipstitchr/client/r2/deleteObjectsFromR2", () => ({
  deleteObjectsFromR2: mocks.deleteObjectsFromR2,
}));

vi.mock("@/lib/clipstitchr/client/r2/downloadBlobFromR2", () => ({
  downloadBlobFromR2: mocks.downloadBlobFromR2,
}));

vi.mock("@/lib/clipstitchr/client/r2/uploadBlobsToR2", () => ({
  uploadBlobsToR2: mocks.uploadBlobsToR2,
}));

vi.mock("@/lib/clipstitchr/media/createImageThumbnailBlob", () => ({
  createImageThumbnailBlob: mocks.createImageThumbnailBlob,
}));

vi.mock("@/lib/clipstitchr/media/createSwaprOutpaintInputs", () => ({
  createSwaprOutpaintInputs: mocks.createSwaprOutpaintInputs,
}));

vi.mock("@/lib/clipstitchr/media/createSwaprPortraitPhotoBlob", () => ({
  createSwaprPortraitPhotoBlob: mocks.createSwaprPortraitPhotoBlob,
}));

vi.mock("@/lib/clipstitchr/media/getImageDimensions", () => ({
  getImageDimensions: mocks.getImageDimensions,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function getMutation(id: string) {
  const mutation = mocks.mutationFns.get(id);

  if (!mutation) {
    throw new Error(`Missing mocked mutation ${id}.`);
  }

  return mutation;
}

function createPhotoDocument(overrides: Record<string, unknown> = {}) {
  return {
    avatarId: "avatar_1",
    createdAt: "2026-05-20T00:00:00.000Z",
    height: 1920,
    id: "photo_1",
    mimeType: "image/jpeg",
    name: "Photo",
    originalHeight: 2000,
    originalMimeType: "image/png",
    originalName: "photo.png",
    originalObject: {
      contentType: "image/png",
      key: "users/user_123/photos/photo_1/original.png",
      size: 200,
    },
    originalSize: 200,
    originalWidth: 1200,
    photoObject: {
      contentType: "image/jpeg",
      key: "users/user_123/photos/photo_1/photo.jpg",
      size: 100,
    },
    preparation: "original-portrait",
    size: 100,
    tags: ["photo"],
    thumbnailObject: {
      contentType: "image/jpeg",
      key: "users/user_123/photos/photo_1/thumbnail.jpg",
      size: 10,
    },
    updatedAt: "2026-05-20T00:00:00.000Z",
    width: 1080,
    ...overrides,
  } as unknown as PhotoAssetMetadata;
}

function createAvatar(overrides: Record<string, unknown> = {}) {
  return {
    cliprVoiceId: "Zephyr (Female)",
    createdAt: "2026-05-20T00:00:00.000Z",
    description: "Existing description",
    id: "avatar_1",
    name: "Avatar",
    updatedAt: "2026-05-20T00:00:00.000Z",
    wardrobeStyle: "any" as const,
    ...overrides,
  } as unknown as Avatar;
}

function createImageFile(name = "avatar.png", type = "image/png") {
  return new File(["image"], name, { type });
}

describe("usePhotoLibraryState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutationFns.clear();
    mocks.createId.mockReset();
    mocks.useConvex.mockReturnValue(mocks.convex);
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    mocks.useQuery.mockImplementation((queryId: string) => {
      if (queryId === "photoAssets.list") {
        return [];
      }

      if (queryId === "avatars.list") {
        return [{ id: "avatar_doc_1" }];
      }

      return undefined;
    });
    mocks.createAvatarFromConvexDocument.mockReturnValue(createAvatar());
    mocks.createId
      .mockReturnValueOnce("generated_1")
      .mockReturnValueOnce("generated_2")
      .mockReturnValue("generated_next");
    mocks.convex.query.mockResolvedValue(createPhotoDocument());
    mocks.downloadBlobFromR2.mockResolvedValue(new Blob(["photo"], {
      type: "image/jpeg",
    }));
    mocks.createPhotoAssetFromConvexDocument.mockReturnValue({
      id: "photo_1",
      name: "Loaded photo",
    });
    mocks.getImageDimensions.mockResolvedValue({ height: 1920, width: 1080 });
    mocks.createSwaprPortraitPhotoBlob.mockResolvedValue(
      new Blob(["normalized"], { type: "image/jpeg" }),
    );
    mocks.createImageThumbnailBlob.mockResolvedValue(
      new Blob(["thumbnail"], { type: "image/jpeg" }),
    );
    mocks.analyzeUploadAsset.mockResolvedValue({
      avatarDescription: "Generated avatar",
      locationDescription: "Studio",
      name: "Analyzed photo",
      tags: ["ugc"],
    });
    mocks.uploadBlobsToR2.mockResolvedValue([
      { key: "photo-key" },
      { key: "original-key" },
      { key: "thumbnail-key" },
    ]);
  });

  it("maps authenticated avatar documents into library state", () => {
    const state = usePhotoLibraryState();

    expect(state.avatars).toEqual([createAvatar()]);
    expect(state.photos).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(mocks.useQuery).toHaveBeenCalledWith("photoAssets.list", {});
    expect(mocks.useQuery).toHaveBeenCalledWith("avatars.list", {});
  });

  it("skips library queries while signed out", () => {
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    const state = usePhotoLibraryState();

    expect(state.isLoading).toBe(false);
    expect(mocks.useQuery).toHaveBeenCalledWith("photoAssets.list", "skip");
    expect(mocks.useQuery).toHaveBeenCalledWith("avatars.list", "skip");
  });

  it("creates an avatar with trimmed text and normalized defaults", async () => {
    const state = usePhotoLibraryState();

    await expect(
      state.createAvatar({
        description: "  Ready for clips  ",
        name: "  Creator  ",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        cliprVoiceId: "Zephyr (Female)",
        description: "Ready for clips",
        id: "generated_1",
        name: "Creator",
        wardrobeStyle: "any",
      }),
    );
    expect(getMutation("avatars.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Ready for clips",
        id: "generated_1",
        name: "Creator",
      }),
    );
  });

  it("rejects blank avatar names before saving", async () => {
    const state = usePhotoLibraryState();

    await expect(
      state.createAvatar({
        description: "No name",
        name: "   ",
      }),
    ).rejects.toThrow("Avatar name is required.");
    expect(getMutation("avatars.save")).not.toHaveBeenCalled();
  });

  it("loads and caches a photo from Convex and R2", async () => {
    const state = usePhotoLibraryState();

    await expect(state.loadPhoto("photo_1")).resolves.toEqual({
      id: "photo_1",
      name: "Loaded photo",
    });
    await expect(state.loadPhoto("photo_1")).resolves.toEqual({
      id: "photo_1",
      name: "Loaded photo",
    });
    expect(mocks.convex.query).toHaveBeenCalledTimes(1);
    expect(mocks.downloadBlobFromR2).toHaveBeenCalledTimes(3);
    expect(mocks.createPhotoAssetFromConvexDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        blob: expect.any(Blob),
        originalBlob: expect.any(Blob),
        thumbnailBlob: expect.any(Blob),
      }),
    );
  });

  it("rejects empty or unsupported upload batches", async () => {
    const state = usePhotoLibraryState();

    await expect(state.saveFiles([])).resolves.toBe(false);
    await expect(
      state.saveFiles([createImageFile("notes.txt", "text/plain")], {
        avatarName: "Avatar",
      }),
    ).resolves.toBe(false);
    expect(getMutation("photoAssets.save")).not.toHaveBeenCalled();
  });

  it("saves accepted photos and creates a new avatar when needed", async () => {
    const state = usePhotoLibraryState();

    await expect(
      state.saveFiles([createImageFile()], {
        avatarName: " New Avatar ",
      }),
    ).resolves.toBe(true);
    expect(getMutation("avatars.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Generated avatar",
        id: "generated_1",
        name: "New Avatar",
      }),
    );
    expect(mocks.uploadBlobsToR2).toHaveBeenCalledWith([
      expect.objectContaining({ kind: "photo", recordId: "generated_2" }),
      expect.objectContaining({
        kind: "photo-original",
        recordId: "generated_2",
      }),
      expect.objectContaining({
        kind: "photo-thumbnail",
        recordId: "generated_2",
      }),
    ]);
    expect(getMutation("photoAssets.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        avatarId: "generated_1",
        id: "generated_2",
        name: "Analyzed photo",
        tags: ["photo", "ugc"],
      }),
    );
  });

  it("updates photo metadata with the required photo tag", async () => {
    const state = usePhotoLibraryState();

    await state.updatePhotoMetadata(createPhotoDocument(), {
      locationDescription: "Cafe",
      name: "Updated",
      tags: ["ugc"],
    });
    expect(getMutation("photoAssets.updateMetadata")).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "photo_1",
        locationDescription: "Cafe",
        name: "Updated",
        tags: ["photo", "ugc"],
      }),
    );
  });

  it("renames avatar settings and voice preferences", async () => {
    const state = usePhotoLibraryState();
    const avatar = createAvatar();

    await state.renameAvatar(avatar, " Updated Avatar ");
    await state.updateAvatarWardrobeStyle(avatar, "female");
    await state.updateAvatarCliprVoice(avatar, "Puck (Male)");

    expect(getMutation("avatars.update")).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "avatar_1",
        name: "Updated Avatar",
      }),
    );
    expect(getMutation("avatars.update")).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "avatar_1",
        wardrobeStyle: "female",
      }),
    );
    expect(getMutation("avatars.update")).toHaveBeenCalledWith(
      expect.objectContaining({
        cliprVoiceId: "Puck (Male)",
        id: "avatar_1",
      }),
    );
  });

  it("saves generated avatar photos", async () => {
    const state = usePhotoLibraryState();

    await state.saveGeneratedPhotos(
      [
        {
          blob: new Blob(["generated"], { type: "image/jpeg" }),
          variant: {
            lighting: "studio",
            locationDescription: "City cafe",
            outfitDescription: "linen shirt",
            poseDescription: "standing",
            style: "editorial",
          },
        },
      ],
      {
        avatarId: "avatar_1",
        sourceAvatarName: "Avatar",
      },
    );

    expect(getMutation("photoAssets.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        avatarId: "avatar_1",
        originalName: "Avatar-generated-1.jpg",
        tags: expect.arrayContaining(["generated", "photo"]),
      }),
    );
  });

  it("removes avatar and photo records with related media cleanup", async () => {
    const state = usePhotoLibraryState();
    const deleteResponse = {
      json: vi.fn(async () => ({})),
      ok: true,
    };

    vi.stubGlobal("fetch", vi.fn(async () => deleteResponse));
    await state.removeAvatar("avatar_1");
    await state.removePhoto("photo_1");

    expect(fetch).toHaveBeenCalledWith("/api/avatars/avatar_1", {
      method: "DELETE",
    });
    expect(mocks.deleteObjectsFromR2).toHaveBeenCalledWith([
      expect.objectContaining({
        key: "users/user_123/photos/photo_1/photo.jpg",
      }),
      expect.objectContaining({
        key: "users/user_123/photos/photo_1/original.png",
      }),
      expect.objectContaining({
        key: "users/user_123/photos/photo_1/thumbnail.jpg",
      }),
    ]);
    expect(getMutation("photoAssets.remove")).toHaveBeenCalledWith({
      id: "photo_1",
    });

    vi.unstubAllGlobals();
  });
});
