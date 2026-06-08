import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VideoClipCard } from "@/app/_components/dashboard/VideoClipCard";
import type { MediaCardActionMenuItem } from "@/app/_components/ui/MediaCardActionMenu";
import type { CliprMetadata } from "@/lib/clipstitchr/types/CliprMetadata";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

const mocks = vi.hoisted(() => ({
  actionItems: [] as MediaCardActionMenuItem[],
  avatarDialogProps: null as null | {
    onClose: () => void;
    onCreate: (options: unknown) => Promise<boolean>;
  },
  createVideoBlobWithPosterMetadata: vi.fn(),
  closeDetails: vi.fn(),
  downloadBlob: vi.fn(),
  downloadMusicBlob: vi.fn(),
  metadataDialogProps: null as null | {
    onClose: () => void;
    onSave: (metadata: unknown) => Promise<void>;
  },
  metadataEditor: null as null | {
    onSave: (metadata: unknown) => Promise<void>;
  },
  loadFullClip: vi.fn(),
  openDetails: vi.fn(),
  renderCliprVideoWithMusic: vi.fn(),
  setState: vi.fn(),
  stateQueue: [] as unknown[],
  trimEditor: null as null | {
    onSave: (trimRange: { start: number; end: number }) => void | Promise<void>;
  },
  cliprMusicEditor: null as null | {
    onGenerate: () => Promise<CliprMusicMetadata | null>;
    onRemove: () => void | Promise<void>;
    onSave: (music: CliprMusicMetadata | null) => void | Promise<void>;
  },
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useState: (initialValue: unknown) => [
      mocks.stateQueue.length ? mocks.stateQueue.shift() : initialValue,
      mocks.setState,
    ],
  };
});

vi.mock("@/app/_components/dashboard/VideoClipPreviewCard", () => ({
  VideoClipPreviewCard: ({
    actions,
    cliprMusicEditor,
    footer,
    metadataEditor,
    trimEditor,
  }: {
    actions: (input: {
      closeDetails: () => void;
      isLoading: boolean;
      loadFullClip: () => Promise<VideoClip | null>;
      openDetails: (options?: unknown) => void;
    }) => MediaCardActionMenuItem[];
    cliprMusicEditor?: typeof mocks.cliprMusicEditor;
    footer: () => React.ReactNode;
    metadataEditor?: typeof mocks.metadataEditor;
    trimEditor: typeof mocks.trimEditor;
  }) => {
    mocks.trimEditor = trimEditor;
    mocks.cliprMusicEditor = cliprMusicEditor ?? null;
    mocks.metadataEditor = metadataEditor ?? null;
    mocks.actionItems = actions({
      closeDetails: mocks.closeDetails,
      isLoading: false,
      loadFullClip: mocks.loadFullClip,
      openDetails: mocks.openDetails,
    });
    footer();
    return "VideoClipPreviewCard";
  },
}));

vi.mock("@/app/_components/uploads/AssetMetadataEditDialog", () => ({
  AssetMetadataEditDialog: (props: {
    onClose: () => void;
    onSave: (metadata: unknown) => Promise<void>;
  }) => {
    mocks.metadataDialogProps = props;
    return "AssetMetadataEditDialog";
  },
}));

vi.mock("@/app/_components/dashboard/CreateAvatarFromClipDialog", () => ({
  CreateAvatarFromClipDialog: (props: {
    onClose: () => void;
    onCreate: (options: unknown) => Promise<boolean>;
  }) => {
    mocks.avatarDialogProps = props;
    return "CreateAvatarFromClipDialog";
  },
}));

vi.mock("@/lib/clipstitchr/client/r2/downloadMusicBlob", () => ({
  downloadMusicBlob: mocks.downloadMusicBlob,
}));

vi.mock("@/lib/clipstitchr/media/createVideoBlobWithPosterMetadata", () => ({
  createVideoBlobWithPosterMetadata: mocks.createVideoBlobWithPosterMetadata,
}));

vi.mock("@/lib/clipstitchr/media/renderCliprVideoWithMusic", () => ({
  renderCliprVideoWithMusic: mocks.renderCliprVideoWithMusic,
}));

vi.mock("@/lib/clipstitchr/utils/downloadBlob", () => ({
  downloadBlob: mocks.downloadBlob,
}));

function createCliprMusic(
  overrides: Partial<CliprMusicMetadata> = {},
): CliprMusicMetadata {
  return {
    audioObject: {
      contentType: "audio/mpeg",
      key: "music.mp3",
      size: 100,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    durationSeconds: 30,
    enabled: true,
    prompt: "Upbeat Clipr music",
    providerModel: "music-model",
    providerPredictionId: "prediction_1",
    title: "Music",
    updatedAt: "2026-05-20T00:00:00.000Z",
    volume: 1,
    ...overrides,
  };
}

function createCliprMetadata(overrides: Partial<CliprMetadata> = {}): CliprMetadata {
  return {
    avatarId: "avatar_1",
    avatarPhotoId: "photo_1",
    createdAt: "2026-05-20T00:00:00.000Z",
    finalDurationSeconds: 8,
    filledHook: "Stop scrolling",
    hookStyleKey: "direct",
    hookTemplateId: "hook_1",
    jobId: "job_1",
    productId: "product_1",
    productName: "Launch Kit",
    providerModels: ["model-a"],
    sceneCount: 2,
    script: "Script",
    targetDurationSeconds: 30,
    variablesUsed: {},
    voiceId: "voice_1",
    ...overrides,
  };
}

function createClipMetadata(
  overrides: Partial<VideoClipMetadata> = {},
): VideoClipMetadata {
  return {
    aspectRatio: 9 / 16,
    clipType: "ugc",
    cliprMetadata: createCliprMetadata(),
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 8,
    hasAudio: true,
    height: 1920,
    id: "clip_1",
    mimeType: "video/mp4",
    name: "UGC Clip",
    originalName: "clip.mp4",
    originalSize: 100,
    size: 100,
    sourceMimeType: "video/mp4",
    tags: ["ugc"],
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: "clip.mp4",
      size: 100,
    },
    width: 1080,
    ...overrides,
  };
}

describe("VideoClipCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.actionItems = [];
    mocks.avatarDialogProps = null;
    mocks.metadataDialogProps = null;
    mocks.metadataEditor = null;
    mocks.trimEditor = null;
    mocks.cliprMusicEditor = null;
    mocks.stateQueue = [];
    mocks.loadFullClip.mockResolvedValue({
      ...createClipMetadata(),
      blob: new Blob(["clip"], { type: "video/mp4" }),
      cliprMetadata: createCliprMetadata({
        music: createCliprMusic({ volume: 0.8 }),
      }),
    });
    mocks.downloadMusicBlob.mockResolvedValue(
      new Blob(["music"], { type: "audio/mpeg" }),
    );
    mocks.renderCliprVideoWithMusic.mockResolvedValue({
      blob: new Blob(["rendered"], { type: "video/mp4" }),
    });
    mocks.createVideoBlobWithPosterMetadata.mockResolvedValue(
      new Blob(["export"], { type: "video/mp4" }),
    );
  });

  it("builds clip action items and invokes download, edit, trim, music, avatar, and delete callbacks", async () => {
    const onCreateAvatarFromClip = vi.fn(async () => true);
    const onDelete = vi.fn();
    const onGenerateCliprMusic = vi.fn(async () =>
      createCliprMusic({
        audioObject: {
          contentType: "audio/mpeg",
          key: "new-music.mp3",
          size: 100,
        },
        title: "New music",
      }),
    );
    const onUpdateCliprMusic = vi.fn(async () => undefined);
    const onUpdateMetadata = vi.fn(async () => undefined);
    const onUpdateTrim = vi.fn(async () => undefined);

    const markup = renderToStaticMarkup(
      <VideoClipCard
        clip={createClipMetadata()}
        products={[]}
        productName="Launch Kit"
        onCreateAvatarFromClip={onCreateAvatarFromClip}
        onDelete={onDelete}
        onGenerateCliprMusic={onGenerateCliprMusic}
        onLoadClip={vi.fn()}
        onUpdateCliprMusic={onUpdateCliprMusic}
        onUpdateMetadata={onUpdateMetadata}
        onUpdateTrim={onUpdateTrim}
      />,
    );

    expect(markup).toContain("VideoClipPreviewCard");
    expect(mocks.actionItems.map((item) => item.label)).toEqual([
      "Use in Stitchr",
      "Use in Swapr",
      "Download clip",
      "Edit clip",
      "Create avatar from UGC",
      "Delete clip",
    ]);

    mocks.actionItems.find((item) => item.label === "Download clip")?.onClick?.();
    mocks.actionItems.find((item) => item.label === "Edit clip")?.onClick?.();
    mocks.actionItems
      .find((item) => item.label === "Create avatar from UGC")
      ?.onClick?.();
    mocks.actionItems.find((item) => item.label === "Delete clip")?.onClick?.();
    await mocks.trimEditor?.onSave({ start: 1, end: 3 });
    await mocks.cliprMusicEditor?.onGenerate();
    await mocks.cliprMusicEditor?.onSave(createCliprMusic());
    await mocks.cliprMusicEditor?.onRemove();

    for (let index = 0; index < 5; index += 1) {
      await Promise.resolve();
    }

    expect(mocks.downloadMusicBlob).toHaveBeenCalled();
    expect(mocks.renderCliprVideoWithMusic).toHaveBeenCalled();
    expect(mocks.createVideoBlobWithPosterMetadata).toHaveBeenCalled();
    expect(mocks.downloadBlob).toHaveBeenCalledWith(
      expect.any(Blob),
      "ugc-clip.mp4",
    );
    expect(mocks.setState).toHaveBeenCalledWith(true);
    expect(mocks.closeDetails).toHaveBeenCalledTimes(2);
    expect(mocks.openDetails).toHaveBeenCalledWith({
      showEditDialog: true,
    });
    expect(onDelete).toHaveBeenCalledWith("clip_1");
    expect(onUpdateTrim).toHaveBeenCalledWith(createClipMetadata(), {
      start: 1,
      end: 3,
    });
    expect(onGenerateCliprMusic).toHaveBeenCalledWith(createClipMetadata());
    expect(onUpdateCliprMusic).toHaveBeenCalled();
  });

  it("omits Swapr/avatar/music actions when a demo clip lacks those capabilities", () => {
    renderToStaticMarkup(
      <VideoClipCard
        clip={createClipMetadata({
          clipType: "demo",
          cliprMetadata: undefined,
        })}
        onDelete={vi.fn()}
        onLoadClip={vi.fn()}
        onUpdateMetadata={vi.fn()}
        onUpdateTrim={vi.fn()}
      />,
    );

    expect(mocks.actionItems.map((item) => item.label)).toEqual([
      "Use in Stitchr",
      "Download clip",
      "Edit clip",
      "Delete clip",
    ]);
  });

  it("marks video clips as posted and active", async () => {
    const onUpdatePostedStatus = vi.fn(async () => undefined);

    renderToStaticMarkup(
      <VideoClipCard
        clip={createClipMetadata()}
        onDelete={vi.fn()}
        onLoadClip={vi.fn()}
        onUpdateMetadata={vi.fn()}
        onUpdatePostedStatus={onUpdatePostedStatus}
        onUpdateTrim={vi.fn()}
      />,
    );

    mocks.actionItems
      .find((item) => item.label === "Mark as posted")
      ?.onClick?.();
    await Promise.resolve();

    expect(onUpdatePostedStatus).toHaveBeenCalledWith(createClipMetadata(), true);

    const postedClip = createClipMetadata({ isPosted: true });

    renderToStaticMarkup(
      <VideoClipCard
        clip={postedClip}
        onDelete={vi.fn()}
        onLoadClip={vi.fn()}
        onUpdateMetadata={vi.fn()}
        onUpdatePostedStatus={onUpdatePostedStatus}
        onUpdateTrim={vi.fn()}
      />,
    );

    mocks.actionItems
      .find((item) => item.label === "Mark as active")
      ?.onClick?.();
    await Promise.resolve();

    expect(onUpdatePostedStatus).toHaveBeenCalledWith(postedClip, false);
  });

  it("skips clip download when the full clip cannot be loaded", async () => {
    mocks.loadFullClip.mockResolvedValueOnce(null);

    renderToStaticMarkup(
      <VideoClipCard
        clip={createClipMetadata()}
        onDelete={vi.fn()}
        onLoadClip={vi.fn()}
        onUpdateMetadata={vi.fn()}
        onUpdateTrim={vi.fn()}
      />,
    );

    mocks.actionItems.find((item) => item.label === "Download clip")?.onClick?.();
    await Promise.resolve();

    expect(mocks.downloadBlob).not.toHaveBeenCalled();
  });

  it("downloads raw video when music is disabled and uses the clip MIME fallback", async () => {
    mocks.loadFullClip.mockResolvedValueOnce({
      ...createClipMetadata({
        cliprMetadata: createCliprMetadata({
          music: createCliprMusic({ enabled: false }),
        }),
      }),
      blob: new Blob(["clip"], { type: "video/mp4" }),
    });
    mocks.createVideoBlobWithPosterMetadata.mockResolvedValueOnce(
      new Blob(["export"]),
    );

    renderToStaticMarkup(
      <VideoClipCard
        clip={createClipMetadata()}
        onDelete={vi.fn()}
        onLoadClip={vi.fn()}
        onUpdateMetadata={vi.fn()}
        onUpdateTrim={vi.fn()}
      />,
    );

    mocks.actionItems.find((item) => item.label === "Download clip")?.onClick?.();

    for (let index = 0; index < 3; index += 1) {
      await Promise.resolve();
    }

    expect(mocks.renderCliprVideoWithMusic).not.toHaveBeenCalled();
    expect(mocks.downloadBlob).toHaveBeenCalledWith(
      expect.any(Blob),
      "ugc-clip.mp4",
    );
  });

  it("reports download and music failures from card actions", async () => {
    const onGenerateCliprMusic = vi
      .fn()
      .mockRejectedValueOnce(new Error("Generation failed"));
    const onUpdateCliprMusic = vi
      .fn()
      .mockRejectedValueOnce(new Error("Save failed"));

    mocks.createVideoBlobWithPosterMetadata.mockRejectedValueOnce(
      new Error("Export failed"),
    );

    renderToStaticMarkup(
      <VideoClipCard
        clip={createClipMetadata()}
        onDelete={vi.fn()}
        onGenerateCliprMusic={onGenerateCliprMusic}
        onLoadClip={vi.fn()}
        onUpdateCliprMusic={onUpdateCliprMusic}
        onUpdateMetadata={vi.fn()}
        onUpdateTrim={vi.fn()}
      />,
    );

    mocks.actionItems.find((item) => item.label === "Download clip")?.onClick?.();
    await mocks.cliprMusicEditor?.onGenerate();
    await expect(
      mocks.cliprMusicEditor?.onSave(createCliprMusic()),
    ).rejects.toThrow("Save failed");

    for (let index = 0; index < 4; index += 1) {
      await Promise.resolve();
    }

    expect(mocks.setState).toHaveBeenCalledWith("Export failed");
    expect(mocks.setState).toHaveBeenCalledWith("Generation failed");
    expect(mocks.setState).toHaveBeenCalledWith("Save failed");
  });

  it("uses fallback failure messages for non-Error download and music failures", async () => {
    const onGenerateCliprMusic = vi.fn().mockRejectedValueOnce("no music");
    const onUpdateCliprMusic = vi.fn().mockRejectedValueOnce("no save");

    mocks.createVideoBlobWithPosterMetadata.mockRejectedValueOnce("no export");

    renderToStaticMarkup(
      <VideoClipCard
        clip={createClipMetadata()}
        onDelete={vi.fn()}
        onGenerateCliprMusic={onGenerateCliprMusic}
        onLoadClip={vi.fn()}
        onUpdateCliprMusic={onUpdateCliprMusic}
        onUpdateMetadata={vi.fn()}
        onUpdateTrim={vi.fn()}
      />,
    );

    mocks.actionItems.find((item) => item.label === "Download clip")?.onClick?.();
    await mocks.cliprMusicEditor?.onGenerate();
    await expect(mocks.cliprMusicEditor?.onSave(null)).rejects.toBe("no save");

    for (let index = 0; index < 4; index += 1) {
      await Promise.resolve();
    }

    expect(mocks.setState).toHaveBeenCalledWith("Unable to export this Clip.");
    expect(mocks.setState).toHaveBeenCalledWith(
      "Unable to generate music for this Clip.",
    );
    expect(mocks.setState).toHaveBeenCalledWith(
      "Unable to update music for this Clip.",
    );
  });

  it("saves metadata through the edit dialog and creates avatars from open dialogs", async () => {
    const onCreateAvatarFromClip = vi.fn(async () => true);
    const onUpdateMetadata = vi.fn(async () => undefined);

    renderToStaticMarkup(
      <VideoClipCard
        clip={createClipMetadata()}
        onCreateAvatarFromClip={onCreateAvatarFromClip}
        onDelete={vi.fn()}
        onLoadClip={vi.fn()}
        onUpdateMetadata={onUpdateMetadata}
        onUpdateTrim={vi.fn()}
      />,
    );

    await mocks.metadataEditor?.onSave({
      name: "Updated",
      tags: ["ugc"],
    });

    mocks.stateQueue = [true, false, false, false, null, null];
    renderToStaticMarkup(
      <VideoClipCard
        clip={createClipMetadata()}
        onCreateAvatarFromClip={onCreateAvatarFromClip}
        onDelete={vi.fn()}
        onLoadClip={vi.fn()}
        onUpdateMetadata={vi.fn()}
        onUpdateTrim={vi.fn()}
      />,
    );

    mocks.avatarDialogProps?.onClose();
    await mocks.avatarDialogProps?.onCreate({ avatarName: "Ava" });

    expect(onUpdateMetadata).toHaveBeenCalledWith(createClipMetadata(), {
      name: "Updated",
      tags: ["ugc"],
    });
    expect(onCreateAvatarFromClip).toHaveBeenCalledWith(createClipMetadata(), {
      avatarName: "Ava",
    });
    expect(mocks.setState).toHaveBeenCalledWith(false);
  });
});
