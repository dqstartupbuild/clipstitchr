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
    onCreate: (options: unknown) => Promise<boolean>;
  },
  createVideoBlobWithPosterMetadata: vi.fn(),
  downloadBlob: vi.fn(),
  downloadMusicBlob: vi.fn(),
  metadataDialogProps: null as null | {
    onSave: (metadata: unknown) => Promise<void>;
  },
  renderCliprVideoWithMusic: vi.fn(),
  trimEditor: null as null | {
    onSave: (trimRange: { start: number; end: number }) => void | Promise<void>;
  },
  cliprMusicEditor: null as null | {
    onGenerate: () => Promise<CliprMusicMetadata | null>;
    onRemove: () => void | Promise<void>;
    onSave: (music: CliprMusicMetadata | null) => void | Promise<void>;
  },
}));

vi.mock("@/app/_components/dashboard/VideoClipPreviewCard", () => ({
  VideoClipPreviewCard: ({
    actions,
    cliprMusicEditor,
    footer,
    trimEditor,
  }: {
    actions: (input: {
      isLoading: boolean;
      loadFullClip: () => Promise<VideoClip | null>;
      openDetails: (options?: unknown) => void;
    }) => MediaCardActionMenuItem[];
    cliprMusicEditor?: typeof mocks.cliprMusicEditor;
    footer: () => React.ReactNode;
    trimEditor: typeof mocks.trimEditor;
  }) => {
    mocks.trimEditor = trimEditor;
    mocks.cliprMusicEditor = cliprMusicEditor ?? null;
    mocks.actionItems = actions({
      isLoading: false,
      loadFullClip: vi.fn(async () => ({
        ...createClipMetadata(),
        blob: new Blob(["clip"], { type: "video/mp4" }),
        cliprMetadata: createCliprMetadata({
          music: createCliprMusic({ volume: 0.8 }),
        }),
      })),
      openDetails: vi.fn(),
    });
    footer();
    return "VideoClipPreviewCard";
  },
}));

vi.mock("@/app/_components/uploads/AssetMetadataEditDialog", () => ({
  AssetMetadataEditDialog: (props: {
    onSave: (metadata: unknown) => Promise<void>;
  }) => {
    mocks.metadataDialogProps = props;
    return "AssetMetadataEditDialog";
  },
}));

vi.mock("@/app/_components/dashboard/CreateAvatarFromClipDialog", () => ({
  CreateAvatarFromClipDialog: (props: {
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
    mocks.trimEditor = null;
    mocks.cliprMusicEditor = null;
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

  it("builds clip action items and invokes download, metadata, trim, music, avatar, and delete callbacks", async () => {
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
      "Edit clip details",
      "Edit trim and music",
      "Create avatar from UGC",
      "Delete clip",
    ]);

    mocks.actionItems.find((item) => item.label === "Download clip")?.onClick?.();
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
      "Edit clip details",
      "Edit default trim",
      "Delete clip",
    ]);
  });
});
