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
    downloadCachedR2ImageBlobs: vi.fn(),
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
    stateQueue: [] as unknown[],
    useStateSetter: vi.fn(),
  };
});

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useEffect: mocks.useEffect,
  useMemo: (factory: () => unknown) => factory(),
  useRef: (value: unknown) => ({ current: value }),
  useState: (initialValue: unknown) => {
    const value = mocks.stateQueue.length
      ? mocks.stateQueue.shift()
      : typeof initialValue === "function"
        ? (initialValue as () => unknown)()
        : initialValue;

    return [
      value,
      (nextValue: unknown) => {
        mocks.useStateSetter(nextValue);

        if (typeof nextValue === "function") {
          return (nextValue as (currentValue: unknown) => unknown)(value);
        }

        return nextValue;
      },
    ];
  },
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
    avatarPreferences: {
      get: "avatarPreferences.get",
      setDefaultAvatar: "avatarPreferences.setDefaultAvatar",
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

vi.mock("@/lib/clipstitchr/client/r2/downloadCachedR2ImageBlobs", () => ({
  downloadCachedR2ImageBlobs: mocks.downloadCachedR2ImageBlobs,
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

      if (queryId === "avatarPreferences.get") {
        return null;
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
    mocks.downloadCachedR2ImageBlobs.mockImplementation(async (objects) => {
      return new Map(
        objects.map((object: { key: string }) => [
          object.key,
          new Blob(["thumbnail"], { type: "image/jpeg" }),
        ]),
      );
    });
    mocks.createPhotoAssetFromConvexDocument.mockReturnValue({
      id: "photo_1",
      name: "Loaded photo",
    });
    mocks.createPhotoAssetMetadataFromConvexDocument.mockReturnValue({
      id: "photo_1",
      name: "Hydrated photo",
    });
    mocks.stateQueue = [];
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
    expect(mocks.useQuery).toHaveBeenCalledWith("avatarPreferences.get", {});
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
    expect(mocks.useQuery).toHaveBeenCalledWith(
      "avatarPreferences.get",
      "skip",
    );
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

  it("surfaces create-avatar persistence failures", async () => {
    const state = usePhotoLibraryState();
    getMutation("avatars.save").mockRejectedValueOnce("save failed");

    await expect(
      state.createAvatar({
        name: "Creator",
      }),
    ).rejects.toBe("save failed");
    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      "Unable to create this avatar.",
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
    expect(mocks.downloadBlobFromR2).toHaveBeenCalledTimes(2);
    expect(mocks.downloadCachedR2ImageBlobs).toHaveBeenCalledWith([
      expect.objectContaining({
        key: "users/user_123/photos/photo_1/thumbnail.jpg",
      }),
    ]);
    expect(mocks.createPhotoAssetFromConvexDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        blob: expect.any(Blob),
        originalBlob: expect.any(Blob),
        thumbnailBlob: expect.any(Blob),
      }),
    );
  });

  it("loads a photo from listed documents without querying Convex", async () => {
    mocks.useQuery.mockImplementation((queryId: string) => {
      if (queryId === "photoAssets.list") {
        return [createPhotoDocument({ id: "listed_photo" })];
      }

      if (queryId === "avatars.list") {
        return [{ id: "avatar_doc_1" }];
      }

      if (queryId === "avatarPreferences.get") {
        return null;
      }

      return undefined;
    });
    const state = usePhotoLibraryState();

    await expect(state.loadPhoto("listed_photo")).resolves.toEqual({
      id: "photo_1",
      name: "Loaded photo",
    });

    expect(mocks.convex.query).not.toHaveBeenCalled();
  });

  it("returns null for missing photos and loads photos without optional objects", async () => {
    mocks.convex.query
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(
        createPhotoDocument({
          id: "photo_minimal",
          originalObject: undefined,
          thumbnailObject: undefined,
        }),
      );
    const state = usePhotoLibraryState();

    await expect(state.loadPhoto("missing_photo")).resolves.toBeNull();
    await expect(state.loadPhoto("photo_minimal")).resolves.toEqual({
      id: "photo_1",
      name: "Loaded photo",
    });
    expect(mocks.downloadCachedR2ImageBlobs).not.toHaveBeenCalled();
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

  it("rejects oversized batches and uploads without avatar selection", async () => {
    const state = usePhotoLibraryState();

    await expect(
      state.saveFiles(
        Array.from({ length: 101 }, (_, index) =>
          createImageFile(`avatar-${index}.png`),
        ),
        { avatarName: "Avatar" },
      ),
    ).resolves.toBe(false);
    await expect(state.saveFiles([createImageFile()])).resolves.toBe(false);
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

  it("expands outpainted uploads and fills missing existing avatar descriptions", async () => {
    mocks.createAvatarFromConvexDocument.mockReturnValue(
      createAvatar({ description: "" }),
    );
    mocks.getImageDimensions.mockResolvedValue({ height: 900, width: 1600 });
    mocks.createSwaprOutpaintInputs.mockResolvedValue({
      imageBlob: new Blob(["image"], { type: "image/png" }),
      maskBlob: new Blob(["mask"], { type: "image/png" }),
    });
    mocks.expandSwaprPhotoWithAi.mockResolvedValue(
      new Blob(["expanded"], { type: "image/png" }),
    );
    const state = usePhotoLibraryState();

    await expect(
      state.saveFiles([createImageFile()], {
        avatarId: "avatar_1",
        shouldExpandWithAi: true,
      }),
    ).resolves.toBe(true);

    expect(mocks.createSwaprOutpaintInputs).toHaveBeenCalledWith(
      expect.any(File),
    );
    expect(mocks.expandSwaprPhotoWithAi).toHaveBeenCalled();
    expect(getMutation("avatars.update")).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Generated avatar",
        id: "avatar_1",
      }),
    );
    expect(getMutation("photoAssets.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        avatarId: "avatar_1",
        preparation: "ai-outpaint",
      }),
    );
  });

  it("falls back to file names when upload analysis fails", async () => {
    mocks.analyzeUploadAsset.mockRejectedValueOnce(new Error("analysis failed"));
    const state = usePhotoLibraryState();

    await expect(
      state.saveFiles([createImageFile("portrait.png")], {
        avatarName: "Fallback Avatar",
      }),
    ).resolves.toBe(true);

    expect(getMutation("photoAssets.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "portrait",
        tags: ["photo"],
      }),
    );
  });

  it("returns false when photo upload work fails", async () => {
    mocks.uploadBlobsToR2.mockRejectedValueOnce(new Error("upload failed"));
    const state = usePhotoLibraryState();

    await expect(
      state.saveFiles([createImageFile()], {
        avatarName: "Avatar",
      }),
    ).resolves.toBe(false);
  });

  it("returns false if generated upload avatar ids are unusable", async () => {
    mocks.createId.mockReset();
    mocks.createId.mockReturnValue("");
    const state = usePhotoLibraryState();

    await expect(
      state.saveFiles([createImageFile()], {
        avatarName: "Avatar",
      }),
    ).resolves.toBe(false);

    expect(getMutation("photoAssets.save")).not.toHaveBeenCalled();
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

  it("updates photo metadata without optional description fields", async () => {
    const state = usePhotoLibraryState();

    await state.updatePhotoMetadata(createPhotoDocument(), {
      name: "Minimal",
      tags: [],
    });

    expect(getMutation("photoAssets.updateMetadata")).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "photo_1",
        name: "Minimal",
        tags: ["photo"],
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

  it("reads and updates the default avatar preference", async () => {
    mocks.useQuery.mockImplementation((queryId: string) => {
      if (queryId === "photoAssets.list") {
        return [];
      }

      if (queryId === "avatars.list") {
        return [{ id: "avatar_doc_1" }];
      }

      if (queryId === "avatarPreferences.get") {
        return { defaultAvatarId: "avatar_1" };
      }

      return undefined;
    });
    const state = usePhotoLibraryState();

    expect(state.defaultAvatarId).toBe("avatar_1");
    await state.setDefaultAvatar(createAvatar({ id: "avatar_2" }));

    expect(getMutation("avatarPreferences.setDefaultAvatar")).toHaveBeenCalledWith(
      expect.objectContaining({
        avatarId: "avatar_2",
      }),
    );
  });

  it("surfaces avatar update failures", async () => {
    const state = usePhotoLibraryState();
    const avatar = createAvatar();

    await expect(state.renameAvatar(avatar, "   ")).rejects.toThrow(
      "Avatar name is required.",
    );

    getMutation("avatars.update").mockRejectedValueOnce(
      new Error("rename failed"),
    );
    await expect(state.renameAvatar(avatar, "Valid")).rejects.toThrow(
      "rename failed",
    );

    getMutation("avatars.update").mockRejectedValueOnce(
      new Error("wardrobe failed"),
    );
    await expect(
      state.updateAvatarWardrobeStyle(avatar, "female"),
    ).rejects.toThrow("wardrobe failed");

    getMutation("avatars.update").mockRejectedValueOnce(
      new Error("voice failed"),
    );
    await expect(
      state.updateAvatarCliprVoice(avatar, "Puck (Male)"),
    ).rejects.toThrow("voice failed");
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

  it("skips empty generated photo saves and propagates generated save errors", async () => {
    const state = usePhotoLibraryState();

    await expect(
      state.saveGeneratedPhotos([], {
        avatarId: "avatar_1",
        sourceAvatarName: "Avatar",
      }),
    ).resolves.toBeUndefined();

    mocks.uploadBlobsToR2.mockRejectedValueOnce(new Error("generated failed"));

    await expect(
      state.saveGeneratedPhotos(
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
      ),
    ).rejects.toThrow("generated failed");
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

  it("removes avatars when the response body is unreadable and clears listed photo media", async () => {
    mocks.stateQueue = [[createPhotoDocument({ avatarId: "avatar_1" })]];
    mocks.useQuery.mockImplementation((queryId: string) => {
      if (queryId === "photoAssets.list") {
        return [createPhotoDocument({ id: "listed_photo" })];
      }

      if (queryId === "avatars.list") {
        return [{ id: "avatar_doc_1" }];
      }

      if (queryId === "avatarPreferences.get") {
        return null;
      }

      return undefined;
    });
    const state = usePhotoLibraryState();
    const deleteResponse = {
      json: vi.fn(async () => {
        throw new Error("bad json");
      }),
      ok: true,
    };

    vi.stubGlobal("fetch", vi.fn(async () => deleteResponse));
    await state.removeAvatar("avatar_1");
    await state.removePhoto("listed_photo");

    expect(mocks.convex.query).not.toHaveBeenCalled();
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

    vi.unstubAllGlobals();
  });

  it("surfaces avatar delete errors and removes missing photo metadata", async () => {
    const state = usePhotoLibraryState();
    const deleteResponse = {
      json: vi.fn(async () => ({ error: "Delete blocked" })),
      ok: false,
    };

    vi.stubGlobal("fetch", vi.fn(async () => deleteResponse));

    await expect(state.removeAvatar("avatar_1")).rejects.toThrow(
      "Delete blocked",
    );

    mocks.convex.query.mockResolvedValueOnce(null);
    await state.removePhoto("missing_photo");

    expect(getMutation("photoAssets.remove")).toHaveBeenCalledWith({
      id: "missing_photo",
    });

    vi.unstubAllGlobals();
  });

  it("hydrates photo documents inside the sync effect", async () => {
    mocks.useQuery.mockImplementation((queryId: string) => {
      if (queryId === "photoAssets.list") {
        return [createPhotoDocument()];
      }

      if (queryId === "avatars.list") {
        return [{ id: "avatar_doc_1" }];
      }

      if (queryId === "avatarPreferences.get") {
        return null;
      }

      return undefined;
    });
    mocks.useEffect.mockImplementationOnce((effect: () => void) => {
      effect();
    });

    usePhotoLibraryState();

    for (let index = 0; index < 5; index += 1) {
      await Promise.resolve();
    }
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocks.downloadCachedR2ImageBlobs).toHaveBeenCalledWith([
      expect.objectContaining({
        key: "users/user_123/photos/photo_1/thumbnail.jpg",
      }),
    ]);
    expect(mocks.createPhotoAssetMetadataFromConvexDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: "photo_1" }),
      expect.any(Blob),
    );
  });

  it("hydrates photos even when thumbnail cache reads fail", async () => {
    mocks.useQuery.mockImplementation((queryId: string) => {
      if (queryId === "photoAssets.list") {
        return [createPhotoDocument()];
      }

      if (queryId === "avatars.list") {
        return [{ id: "avatar_doc_1" }];
      }

      if (queryId === "avatarPreferences.get") {
        return null;
      }

      return undefined;
    });
    mocks.downloadCachedR2ImageBlobs.mockRejectedValueOnce(
      new Error("thumbnail cache unavailable"),
    );
    mocks.useEffect.mockImplementationOnce((effect: () => void) => {
      effect();
    });

    usePhotoLibraryState();

    for (let index = 0; index < 5; index += 1) {
      await Promise.resolve();
    }

    expect(mocks.createPhotoAssetMetadataFromConvexDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: "photo_1" }),
      undefined,
    );
  });

  it("surfaces photo hydration failures from the sync effect", async () => {
    mocks.useQuery.mockImplementation((queryId: string) => {
      if (queryId === "photoAssets.list") {
        return [createPhotoDocument()];
      }

      if (queryId === "avatars.list") {
        return [{ id: "avatar_doc_1" }];
      }

      if (queryId === "avatarPreferences.get") {
        return null;
      }

      return undefined;
    });
    mocks.createPhotoAssetMetadataFromConvexDocument.mockImplementationOnce(() => {
      throw "hydration failed";
    });
    mocks.useEffect.mockImplementationOnce((effect: () => void) => {
      effect();
    });

    usePhotoLibraryState();

    for (let index = 0; index < 5; index += 1) {
      await Promise.resolve();
    }

    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      "Unable to load saved photos.",
    );
  });

  it("cancels photo hydration cleanup without applying late updates", async () => {
    let cleanup: (() => void) | undefined;

    mocks.useQuery.mockImplementation((queryId: string) => {
      if (queryId === "photoAssets.list") {
        return [createPhotoDocument()];
      }

      if (queryId === "avatars.list") {
        return [{ id: "avatar_doc_1" }];
      }

      if (queryId === "avatarPreferences.get") {
        return null;
      }

      return undefined;
    });
    mocks.useEffect.mockImplementationOnce((effect: () => void | (() => void)) => {
      cleanup = effect() ?? undefined;
    });

    usePhotoLibraryState();
    cleanup?.();

    await Promise.resolve();

    expect(cleanup).toBeTypeOf("function");
  });

  it("clears hydrated photos from the sync effect when signed out", async () => {
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    mocks.useEffect.mockImplementationOnce((effect: () => void) => {
      effect();
    });

    usePhotoLibraryState();

    await Promise.resolve();

    expect(mocks.useStateSetter).toHaveBeenCalledWith([]);
  });
});
