import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AvatarsPageClient } from "@/app/dashboard/avatars/AvatarsPageClient";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

type ChildrenProps = {
  children?: unknown;
};

const mocks = vi.hoisted(() => ({
  avatarGenerationPanelProps: null as Record<string, unknown> | null,
  avatarLibrarySectionProps: null as Record<string, unknown> | null,
  avatarPhotoUploadControlsProps: null as Record<string, unknown> | null,
  filterSelectProps: null as Record<string, unknown> | null,
  generatorState: {
    error: null as string | null,
    generate: vi.fn(),
    generatedCount: 0,
    isGenerating: false,
  },
  photoLibraryState: {
    avatars: [] as Avatar[],
    defaultAvatarId: undefined as string | undefined,
    error: null as string | null,
    isSaving: false,
    loadPhoto: vi.fn(),
    photos: [] as PhotoAssetMetadata[],
    refresh: vi.fn(),
    removeAvatar: vi.fn(),
    removePhoto: vi.fn(),
    renameAvatar: vi.fn(),
    saveFiles: vi.fn(),
    saveGeneratedPhotos: vi.fn(),
    setDefaultAvatar: vi.fn(),
    updateAvatarCliprVoice: vi.fn(),
    updateAvatarWardrobeStyle: vi.fn(),
    updatePhotoMetadata: vi.fn(),
  },
  searchInputProps: null as Record<string, unknown> | null,
  selectedAvatarActionsProps: null as Record<string, unknown> | null,
  showUploadControls: true,
  stateQueue: [] as unknown[],
  stateSetters: [] as ReturnType<typeof vi.fn>[],
  uploadPanelProps: null as Record<string, unknown> | null,
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useMemo: (factory: () => unknown) => factory(),
    useState: (initialValue: unknown) => {
      const value =
        mocks.stateQueue.length > 0
          ? mocks.stateQueue.shift()
          : typeof initialValue === "function"
            ? (initialValue as () => unknown)()
            : initialValue;
      const setter = vi.fn((nextValue: unknown) => {
        if (typeof nextValue === "function") {
          return (nextValue as (currentValue: unknown) => unknown)(value);
        }

        return nextValue;
      });

      mocks.stateSetters.push(setter);

      return [value, setter];
    },
  };
});

vi.mock("@/app/_components/dashboard/DashboardShell", () => ({
  DashboardShell: ({ children }: ChildrenProps) => children,
}));

vi.mock("@/app/_components/dashboard/LibraryPageHeader", () => ({
  LibraryPageHeader: ({ title }: { title: string }) => `Header:${title}`,
}));

vi.mock("@/app/_components/dashboard/UploadPanel", () => ({
  UploadPanel: (props: Record<string, unknown>) => {
    mocks.uploadPanelProps = props;
    const photoControls = props.photoControls as
      | { props?: Record<string, unknown> }
      | undefined;

    if (photoControls?.props) {
      mocks.avatarPhotoUploadControlsProps = photoControls.props;
    }

    return "UploadPanel";
  },
}));

vi.mock("@/app/_components/avatars/AvatarPhotoUploadControls", () => ({
  AvatarPhotoUploadControls: (props: Record<string, unknown>) => {
    mocks.avatarPhotoUploadControlsProps = props;
    return "AvatarPhotoUploadControls";
  },
}));

vi.mock("@/app/_components/avatars/AvatarFilterSelect", () => ({
  AvatarFilterSelect: (props: Record<string, unknown>) => {
    mocks.filterSelectProps = props;
    return "AvatarFilterSelect";
  },
}));

vi.mock("@/app/_components/avatars/SelectedAvatarActions", () => ({
  SelectedAvatarActions: (props: Record<string, unknown>) => {
    mocks.selectedAvatarActionsProps = props;
    return "SelectedAvatarActions";
  },
}));

vi.mock("@/app/_components/avatars/AvatarGenerationPanel", () => ({
  AvatarGenerationPanel: (props: Record<string, unknown>) => {
    mocks.avatarGenerationPanelProps = props;
    return "AvatarGenerationPanel";
  },
}));

vi.mock("@/app/_components/avatars/AvatarLibrarySection", () => ({
  AvatarLibrarySection: (props: Record<string, unknown>) => {
    mocks.avatarLibrarySectionProps = props;
    return "AvatarLibrarySection";
  },
}));

vi.mock("@/app/_components/ui/SearchInput", () => ({
  SearchInput: (props: Record<string, unknown>) => {
    mocks.searchInputProps = props;
    return "SearchInput";
  },
}));

vi.mock("@/lib/clipstitchr/hooks/usePhotoLibrary", () => ({
  usePhotoLibrary: () => mocks.photoLibraryState,
}));

vi.mock("@/lib/clipstitchr/hooks/useShowUploadControls", () => ({
  useShowUploadControls: () => mocks.showUploadControls,
}));

vi.mock("@/lib/clipstitchr/hooks/useAvatarPhotoGeneration", () => ({
  useAvatarPhotoGeneration: () => mocks.generatorState,
}));

function createAvatar(overrides: Partial<Avatar> = {}): Avatar {
  return {
    cliprVoiceId: "Zephyr (Female)",
    createdAt: "2026-01-01T00:00:00.000Z",
    description: "Studio avatar",
    id: "avatar_1",
    name: "Avatar",
    updatedAt: "2026-01-01T00:00:00.000Z",
    wardrobeStyle: "any",
    ...overrides,
  };
}

function createPhoto(
  overrides: Partial<PhotoAssetMetadata> = {},
): PhotoAssetMetadata {
  return {
    avatarId: "avatar_1",
    createdAt: "2026-01-01T00:00:00.000Z",
    height: 1920,
    id: "photo_1",
    mimeType: "image/jpeg",
    name: "Avatar Photo",
    originalName: "avatar.jpg",
    originalSize: 100,
    photoObject: {
      contentType: "image/jpeg",
      key: "users/user_1/photos/photo_1.jpg",
      size: 100,
    },
    size: 100,
    tags: ["photo", "studio"],
    updatedAt: "2026-01-01T00:00:00.000Z",
    width: 1080,
    ...overrides,
  };
}

function queueAvatarState(
  overrides: {
    avatarFilterId?: string;
    context?: string;
    count?: number;
    lighting?: string;
    location?: string;
    newAvatarName?: string;
    outfit?: string;
    pendingPhotoFiles?: File[];
    pendingPhotoShouldExpandWithAi?: boolean;
    searchQuery?: string;
    selectedPhotoId?: string;
    style?: string;
    uploadAvatarId?: string;
  } = {},
) {
  mocks.stateQueue.push(
    overrides.selectedPhotoId,
    overrides.avatarFilterId ?? "all",
    overrides.uploadAvatarId ?? "",
    overrides.newAvatarName ?? "",
    overrides.pendingPhotoFiles ?? [],
    overrides.pendingPhotoShouldExpandWithAi ?? false,
    overrides.searchQuery ?? "",
    overrides.context ?? "",
    overrides.count ?? 3,
    overrides.lighting ?? "any",
    overrides.location ?? "",
    overrides.outfit ?? "",
    overrides.style ?? "editorial",
  );
}

describe("AvatarsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.photoLibraryState.avatars = [createAvatar()];
    mocks.photoLibraryState.defaultAvatarId = undefined;
    mocks.photoLibraryState.error = null;
    mocks.photoLibraryState.isSaving = false;
    mocks.photoLibraryState.photos = [createPhoto()];
    mocks.photoLibraryState.refresh.mockResolvedValue(undefined);
    mocks.photoLibraryState.removeAvatar.mockResolvedValue(undefined);
    mocks.photoLibraryState.removePhoto.mockResolvedValue(undefined);
    mocks.photoLibraryState.renameAvatar.mockResolvedValue(undefined);
    mocks.photoLibraryState.saveFiles.mockResolvedValue(true);
    mocks.photoLibraryState.saveGeneratedPhotos.mockResolvedValue(undefined);
    mocks.photoLibraryState.setDefaultAvatar.mockResolvedValue(undefined);
    mocks.photoLibraryState.updateAvatarCliprVoice.mockResolvedValue(undefined);
    mocks.photoLibraryState.updateAvatarWardrobeStyle.mockResolvedValue(undefined);
    mocks.photoLibraryState.updatePhotoMetadata.mockResolvedValue(undefined);
    mocks.generatorState.error = null;
    mocks.generatorState.generate.mockResolvedValue(undefined);
    mocks.generatorState.generatedCount = 0;
    mocks.generatorState.isGenerating = false;
    mocks.showUploadControls = true;
    mocks.avatarGenerationPanelProps = null;
    mocks.avatarLibrarySectionProps = null;
    mocks.avatarPhotoUploadControlsProps = null;
    mocks.filterSelectProps = null;
    mocks.searchInputProps = null;
    mocks.selectedAvatarActionsProps = null;
    mocks.stateQueue.length = 0;
    mocks.stateSetters.length = 0;
    mocks.uploadPanelProps = null;
  });

  it("renders upload, filters, generation, and library sections", () => {
    const markup = renderToStaticMarkup(<AvatarsPageClient />);

    expect(markup).toContain("Header:Avatars");
    expect(markup).toContain("UploadPanel");
    expect(markup).toContain("AvatarFilterSelect");
    expect(markup).toContain("SelectedAvatarActions");
    expect(markup).toContain("AvatarGenerationPanel");
    expect(markup).toContain("AvatarLibrarySection");
  });

  it("surfaces library, generation, and generated-count messages", () => {
    mocks.photoLibraryState.error = "Photo library unavailable.";
    expect(renderToStaticMarkup(<AvatarsPageClient />)).toContain(
      "Photo library unavailable.",
    );

    mocks.photoLibraryState.error = null;
    mocks.generatorState.error = "Generation unavailable.";
    expect(renderToStaticMarkup(<AvatarsPageClient />)).toContain(
      "Generation unavailable.",
    );

    mocks.generatorState.error = null;
    mocks.generatorState.generatedCount = 2;
    expect(renderToStaticMarkup(<AvatarsPageClient />)).toContain(
      "Queued 2 generated photos.",
    );
  });

  it("handles pending upload save and new-avatar reset", async () => {
    const pendingFile = new File(["avatar"], "avatar.jpg", {
      type: "image/jpeg",
    });

    queueAvatarState({
      newAvatarName: "New Avatar",
      pendingPhotoFiles: [pendingFile],
      pendingPhotoShouldExpandWithAi: true,
      uploadAvatarId: "new",
    });
    renderToStaticMarkup(<AvatarsPageClient />);

    const photoControls = mocks.avatarPhotoUploadControlsProps as {
      onSave: () => void;
    };

    photoControls.onSave();
    await Promise.resolve();

    expect(mocks.photoLibraryState.saveFiles).toHaveBeenCalledWith(
      [pendingFile],
      {
        avatarId: undefined,
        avatarName: "New Avatar",
        shouldExpandWithAi: true,
      },
    );
    expect(
      mocks.stateSetters.some((setter) =>
        setter.mock.calls.some((call) => Array.isArray(call[0]) && !call[0].length),
      ),
    ).toBe(true);
  });

  it("handles upload selection, filters, avatar delete, generation, and library callbacks", async () => {
    queueAvatarState({
      avatarFilterId: "avatar_1",
      context: "coffee shop",
      count: 4,
      lighting: "studio",
      location: "Cafe",
      outfit: "navy workout set",
      searchQuery: "studio",
      selectedPhotoId: "photo_1",
    });
    renderToStaticMarkup(<AvatarsPageClient />);

    const uploadProps = mocks.uploadPanelProps as {
      onPhotoExpandPreferenceChange: (value: boolean) => void;
      onPhotoUploaded: (
        files: File[],
        options?: { shouldExpandWithAi?: boolean },
      ) => void;
      onUploaded: () => void;
    };
    const filterProps = mocks.filterSelectProps as {
      onChange: (id: string) => void;
    };
    const searchProps = mocks.searchInputProps as {
      onChange: (value: string) => void;
    };
    const selectedActions = mocks.selectedAvatarActionsProps as {
      onSetDefault: (avatar: Avatar) => Promise<void>;
      onDelete: (avatar: Avatar) => Promise<void>;
    };
    const generationProps = mocks.avatarGenerationPanelProps as {
      onGenerate: () => void;
    };
    const libraryProps = mocks.avatarLibrarySectionProps as {
      onDelete: (id: string) => Promise<void>;
      onSelect: (photo: PhotoAssetMetadata) => void;
      onUpdateMetadata: (...args: unknown[]) => Promise<void>;
    };

    uploadProps.onPhotoUploaded(
      [
        new File(["avatar"], "avatar.jpg", { type: "image/jpeg" }),
        new File(["notes"], "notes.txt", { type: "text/plain" }),
      ],
      { shouldExpandWithAi: true },
    );
    uploadProps.onPhotoExpandPreferenceChange(false);
    uploadProps.onUploaded();
    filterProps.onChange("avatar_1");
    searchProps.onChange("avatar");
    await selectedActions.onDelete(createAvatar());
    await selectedActions.onSetDefault(createAvatar());
    generationProps.onGenerate();
    libraryProps.onSelect(createPhoto());
    await libraryProps.onDelete("photo_1");
    await libraryProps.onUpdateMetadata(createPhoto(), { name: "Updated" });

    expect(mocks.photoLibraryState.removeAvatar).toHaveBeenCalledWith(
      "avatar_1",
    );
    expect(mocks.photoLibraryState.setDefaultAvatar).toHaveBeenCalledWith(
      expect.objectContaining({ id: "avatar_1" }),
    );
    expect(mocks.generatorState.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        avatar: expect.objectContaining({ id: "avatar_1" }),
        count: 4,
        outfit: "navy workout set",
        referencePhoto: expect.objectContaining({ id: "photo_1" }),
      }),
    );
    expect(mocks.photoLibraryState.refresh).toHaveBeenCalled();
    expect(mocks.photoLibraryState.removePhoto).toHaveBeenCalledWith("photo_1");
  });

  it("omits the upload panel when upload controls are hidden and guards generation without a selection", () => {
    mocks.showUploadControls = false;

    const markup = renderToStaticMarkup(<AvatarsPageClient />);

    expect(markup).not.toContain("UploadPanel");
    (mocks.avatarGenerationPanelProps as { onGenerate: () => void }).onGenerate();

    expect(mocks.generatorState.generate).not.toHaveBeenCalled();
  });
});
