import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CliprAvatarPanel } from "@/app/_components/clipr/CliprAvatarPanel";
import { CliprDemoClipPanel } from "@/app/_components/clipr/CliprDemoClipPanel";
import { CliprGenerationProgress } from "@/app/_components/clipr/CliprGenerationProgress";
import { CliprJobResult } from "@/app/_components/clipr/CliprJobResult";
import { CliprModeToggle } from "@/app/_components/clipr/CliprModeToggle";
import { CliprMusicControl } from "@/app/_components/clipr/CliprMusicControl";
import { CliprProductPanel } from "@/app/_components/clipr/CliprProductPanel";
import { CliprScriptIdeaPanel } from "@/app/_components/clipr/CliprScriptIdeaPanel";
import { CliprVoiceSelect } from "@/app/_components/clipr/CliprVoiceSelect";
import { SegmentedControl } from "@/app/_components/ui/SegmentedControl";
import { cliprScriptIdeaMaxLength } from "@/lib/clipstitchr/constants/cliprScriptIdeaMaxLength";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { CliprClientJob } from "@/lib/clipstitchr/types/CliprClientJob";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

vi.mock("@/app/_components/music/MusicSelectorButton", () => ({
  MusicSelectorButton: ({
    selectedTrackId,
  }: {
    selectedTrackId?: string;
  }) => <button type="button">Select sound {selectedTrackId}</button>,
}));

function findElements(
  value: unknown,
  predicate: (element: {
    props?: Record<string, unknown>;
    type?: unknown;
  }) => boolean,
): Array<{ props: Record<string, unknown>; type?: unknown }> {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((child) => findElements(child, predicate));
  }

  const element = value as {
    props?: { children?: unknown };
    type?: unknown;
  };
  const matches = predicate(
    element as { props?: Record<string, unknown>; type?: unknown },
  )
    ? [element as { props: Record<string, unknown>; type?: unknown }]
    : [];

  return [...matches, ...findElements(element.props?.children, predicate)];
}

function createAvatar(overrides: Partial<Avatar> = {}): Avatar {
  return {
    cliprVoiceId: "Rachel",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "avatar_1",
    name: "Alex",
    updatedAt: "2026-05-20T00:00:00.000Z",
    wardrobeStyle: "any",
    ...overrides,
  };
}

function createPhoto(
  overrides: Partial<PhotoAssetMetadata> = {},
): PhotoAssetMetadata {
  return {
    avatarId: "avatar_1",
    createdAt: "2026-05-20T00:00:00.000Z",
    height: 1280,
    id: "photo_1",
    mimeType: "image/png",
    name: "Headshot",
    originalName: "headshot.png",
    photoObject: {
      contentType: "image/png",
      key: "users/user_123/photos/headshot.png",
      size: 1234,
    },
    size: 1234,
    updatedAt: "2026-05-20T00:00:00.000Z",
    width: 720,
    ...overrides,
  };
}

function createProduct(overrides: Partial<ProductProfile> = {}): ProductProfile {
  return {
    audienceDetails: "Creators",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    productDetails: "Landing page builder",
    updatedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  };
}

function createTrack(overrides: Partial<SharedMusicTrack> = {}): SharedMusicTrack {
  return {
    audioObject: {
      contentType: "audio/mpeg",
      key: "users/user_123/music/track.mp3",
      size: 1234,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    durationSeconds: 30,
    id: "track_1",
    isOwnedByCurrentUser: true,
    mimeType: "audio/mpeg",
    size: 1234,
    source: "clipr",
    tags: ["bright"],
    title: "Bright Hook",
    uploadedByOwnerId: "user_123",
    ...overrides,
  };
}

function createDemoClip(
  overrides: Partial<VideoClipMetadata> = {},
): VideoClipMetadata {
  return {
    aspectRatio: 9 / 16,
    clipType: "demo",
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 8,
    hasAudio: false,
    height: 1280,
    id: "demo_1",
    libraryKind: "demo",
    mimeType: "video/mp4",
    name: "Phone demo",
    originalName: "phone-demo.mp4",
    originalSize: 1234,
    size: 1234,
    sourceMimeType: "video/mp4",
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: "users/user_123/demos/phone-demo.mp4",
      size: 1234,
    },
    width: 720,
    ...overrides,
  };
}

function createJob(overrides: Partial<CliprClientJob> = {}): CliprClientJob {
  return {
    avatarId: "avatar_1",
    avatarPhotoId: "photo_1",
    completedAt: "2026-05-20T00:02:00.000Z",
    createdAt: "2026-05-20T00:00:00.000Z",
    filledHook: "Stop losing demo viewers",
    id: "job_1",
    music: {
      audioObject: {
        contentType: "audio/mpeg",
        key: "users/user_123/music/generated.mp3",
        size: 1234,
      },
      createdAt: "2026-05-20T00:00:00.000Z",
      durationSeconds: 30,
      enabled: true,
      prompt: "bright music",
      providerModel: "test-model",
      providerPredictionId: "prediction_1",
      title: "Generated music",
      updatedAt: "2026-05-20T00:00:00.000Z",
      volume: 0.2,
    },
    productId: "product_1",
    productName: "Launch Kit",
    progress: 1,
    requestedGenerationMode: "script",
    generationMode: "script",
    requestedVideoModelId: "prunaai/p-video-avatar",
    videoModelId: "prunaai/p-video-avatar",
    scenePlan: [
      {
        estimatedDurationSeconds: 30,
        id: "scene_1",
        index: 0,
        sceneType: "avatar",
        scriptText: "Here is the generated avatar line.",
        visualPrompt: "Creator in a studio",
      },
    ],
    script: "Here is the generated avatar line.",
    stage: "finalized",
    status: "completed",
    targetDurationSeconds: 30,
    updatedAt: "2026-05-20T00:02:00.000Z",
    voiceId: "Rachel",
    ...overrides,
  };
}

describe("Clipr components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders generation progress labels and errors for every status", () => {
    const markup = renderToStaticMarkup(
      <>
        {[
          "idle",
          "reading",
          "normalizing",
          "saving",
          "stitching",
          "queued",
          "complete",
          "error",
        ].map((status) => (
          <CliprGenerationProgress
            key={status}
            error={status === "error" ? "Generation failed." : null}
            message={`Message ${status}`}
            progress={status === "idle" ? 0.126 : 1}
            status={
              status as React.ComponentProps<
                typeof CliprGenerationProgress
              >["status"]
            }
          />
        ))}
      </>,
    );

    expect(markup).toContain("Ready");
    expect(markup).toContain("Generating avatar video");
    expect(markup).toContain("Preparing clip");
    expect(markup).toContain("Saving clip");
    expect(markup).toContain("Preparing final clip");
    expect(markup).toContain("Clip queued");
    expect(markup).toContain("Clip saved");
    expect(markup).toContain("Queued");
    expect(markup).toContain("Generation stopped");
    expect(markup).toContain("13%");
    expect(markup).toContain("Generation failed.");
  });

  it("renders empty and completed job result states", () => {
    const emptyMarkup = renderToStaticMarkup(
      <CliprJobResult finalClipId={null} job={null} />,
    );
    const populatedMarkup = renderToStaticMarkup(
      <CliprJobResult finalClipId="clip_1" job={createJob()} />,
    );
    const fallbackTitleMarkup = renderToStaticMarkup(
      <CliprJobResult
        finalClipId={null}
        job={createJob({
          filledHook: undefined,
          music: undefined,
          script: undefined,
        })}
      />,
    );

    expect(emptyMarkup).toContain("Queued clips will appear");
    expect(populatedMarkup).toContain("Stop losing demo viewers");
    expect(populatedMarkup).toContain("Music generated for export.");
    expect(populatedMarkup).toContain("Here is the generated avatar line.");
    expect(populatedMarkup).toContain("View opener clips");
    expect(fallbackTitleMarkup).toContain("Talking avatar clip");
  });

  it("renders avatar and product selectors with empty states", () => {
    const populatedMarkup = renderToStaticMarkup(
      <>
        <CliprAvatarPanel
          avatars={[createAvatar()]}
          photos={[createPhoto(), createPhoto({ id: "photo_2" })]}
          selectedAvatarId="avatar_1"
          onChange={vi.fn()}
        />
        <CliprProductPanel
          products={[createProduct()]}
          selectedProductId="product_1"
          onChange={vi.fn()}
        />
      </>,
    );
    const emptyMarkup = renderToStaticMarkup(
      <>
        <CliprAvatarPanel
          avatars={[]}
          photos={[]}
          selectedAvatarId=""
          onChange={vi.fn()}
        />
        <CliprProductPanel
          products={[]}
          selectedProductId=""
          onChange={vi.fn()}
        />
      </>,
    );

    expect(populatedMarkup).toContain("Alex (2)");
    expect(populatedMarkup).toContain("Launch Kit");
    expect(emptyMarkup).toContain("Add avatar photos");
    expect(emptyMarkup).toContain("Save a product in Settings");
  });

  it("renders demo source selector with empty state", () => {
    const populatedMarkup = renderToStaticMarkup(
      <CliprDemoClipPanel
        clips={[createDemoClip()]}
        selectedClipId="demo_1"
        onChange={vi.fn()}
      />,
    );
    const emptyMarkup = renderToStaticMarkup(
      <CliprDemoClipPanel clips={[]} selectedClipId="" onChange={vi.fn()} />,
    );

    expect(populatedMarkup).toContain("Phone demo");
    expect(emptyMarkup).toContain("Add a demo video");
  });


  it("forwards voice and music clear controls", () => {
    const onVoiceChange = vi.fn();
    const onClearTrack = vi.fn();
    const selectedTrack = createTrack();
    const voiceTree = CliprVoiceSelect({
      onVoiceChange,
      value: "Unknown voice",
    });
    const musicTree = CliprMusicControl({
      onClearTrack,
      onSelectTrack: vi.fn(),
      selectedTrack,
    });
    const [voiceSelect] = findElements(
      voiceTree,
      (element) =>
        typeof element.type === "function" && element.type.name === "SelectInput",
    );
    const [clearButton] = findElements(
      musicTree,
      (element) =>
        typeof element.type === "function" && element.type.name === "IconButton",
    );
    const voiceMarkup = renderToStaticMarkup(voiceTree);
    const musicMarkup = renderToStaticMarkup(musicTree);

    (voiceSelect.props.onChange as (event: {
      target: { value: string };
    }) => void)({ target: { value: "Drew" } });
    (clearButton.props.onClick as () => void)();

    expect(onVoiceChange).toHaveBeenCalledWith("Drew");
    expect(onClearTrack).toHaveBeenCalledOnce();
    expect(voiceMarkup).toContain("Rachel - Balanced creator");
    expect(musicMarkup).toContain("Bright Hook");
    expect(musicMarkup).toContain("Select sound track_1");
  });

  it("forwards Clipr mode and script idea changes", () => {
    const onModeChange = vi.fn();
    const onScriptIdeaChange = vi.fn();
    const modeTree = CliprModeToggle({
      onChange: onModeChange,
      value: "reaction",
    });
    const scriptIdeaTree = CliprScriptIdeaPanel({
      onChange: onScriptIdeaChange,
      value: "Founder confession",
    });
    const [modeControl] = findElements(
      modeTree,
      (element) => element.type === SegmentedControl,
    );
    const [textarea] = findElements(
      scriptIdeaTree,
      (element) => element.type === "textarea",
    );
    const markup = renderToStaticMarkup(
      <>
        {modeTree}
        {scriptIdeaTree}
      </>,
    );
    const modeMarkup = renderToStaticMarkup(modeTree);

    (modeControl.props.onChange as (value: string) => void)("reaction");
    (textarea.props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "New idea" } });

    expect(onModeChange).toHaveBeenCalledWith("reaction");
    expect(onScriptIdeaChange).toHaveBeenCalledWith("New idea");
    expect(textarea.props.maxLength).toBe(cliprScriptIdeaMaxLength);
    expect(modeMarkup).toContain("Reaction");
    expect(modeMarkup).toContain("B-roll");
    expect(modeMarkup).not.toContain("Any");
    expect(modeMarkup).not.toContain("Script");
    expect(modeMarkup).not.toContain("Demo");
    expect(markup).toContain("Founder confession");
  });
});
