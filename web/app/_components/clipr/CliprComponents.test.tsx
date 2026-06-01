import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CliprAvatarPanel } from "@/app/_components/clipr/CliprAvatarPanel";
import { CliprDurationControl } from "@/app/_components/clipr/CliprDurationControl";
import { CliprGenerationProgress } from "@/app/_components/clipr/CliprGenerationProgress";
import { CliprJobResult } from "@/app/_components/clipr/CliprJobResult";
import { CliprMusicControl } from "@/app/_components/clipr/CliprMusicControl";
import { CliprProductPanel } from "@/app/_components/clipr/CliprProductPanel";
import { CliprVoiceSelect } from "@/app/_components/clipr/CliprVoiceSelect";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { CliprClientJob } from "@/lib/clipstitchr/types/CliprClientJob";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

vi.mock("@/app/_components/music/MusicSelectorButton", () => ({
  MusicSelectorButton: ({
    selectedTrackId,
  }: {
    selectedTrackId?: string;
  }) => <button type="button">Select music {selectedTrackId}</button>,
}));

vi.mock("@/app/_components/clipr/CliprVoicePreviewButton", () => ({
  CliprVoicePreviewButton: ({ voiceName }: { voiceName: string }) => (
    <button type="button">Preview {voiceName}</button>
  ),
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
    cliprVoiceId: "Zephyr (Female)",
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
    voiceId: "Zephyr (Female)",
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

    expect(emptyMarkup).toContain("Queued Clips will appear");
    expect(populatedMarkup).toContain("Stop losing demo viewers");
    expect(populatedMarkup).toContain("Music generated for export.");
    expect(populatedMarkup).toContain("Here is the generated avatar line.");
    expect(populatedMarkup).toContain("View Clip");
    expect(fallbackTitleMarkup).toContain("Clipr script");
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

  it("forwards duration, voice, and music control changes", () => {
    const onDurationChange = vi.fn();
    const onVoiceChange = vi.fn();
    const onMusicChange = vi.fn();
    const onClearTrack = vi.fn();
    const selectedTrack = createTrack();
    const durationTree = CliprDurationControl({
      onChange: onDurationChange,
      value: 30,
    });
    const voiceTree = CliprVoiceSelect({
      onVoiceChange,
      value: "Unknown voice",
    });
    const musicTree = CliprMusicControl({
      checked: true,
      onChange: onMusicChange,
      onClearTrack,
      onSelectTrack: vi.fn(),
      selectedTrack,
    });
    const [durationButton] = findElements(
      durationTree,
      (element) =>
        element.type === "button" &&
        Array.isArray(element.props?.children) &&
        element.props.children[0] === 60,
    );
    const [voiceSelect] = findElements(
      voiceTree,
      (element) =>
        typeof element.type === "function" && element.type.name === "SelectInput",
    );
    const [musicCheckbox] = findElements(
      musicTree,
      (element) => element.type === "input",
    );
    const [clearButton] = findElements(
      musicTree,
      (element) =>
        typeof element.type === "function" && element.type.name === "IconButton",
    );
    const voiceMarkup = renderToStaticMarkup(voiceTree);
    const musicMarkup = renderToStaticMarkup(musicTree);

    (durationButton.props.onClick as () => void)();
    (voiceSelect.props.onChange as (event: {
      target: { value: string };
    }) => void)({ target: { value: "Puck (Male)" } });
    (musicCheckbox.props.onChange as (event: {
      currentTarget: { checked: boolean };
    }) => void)({ currentTarget: { checked: false } });
    (clearButton.props.onClick as () => void)();

    expect(onDurationChange).toHaveBeenCalledWith(60);
    expect(onVoiceChange).toHaveBeenCalledWith("Puck (Male)");
    expect(onMusicChange).toHaveBeenCalledWith(false);
    expect(onClearTrack).toHaveBeenCalledOnce();
    expect(voiceMarkup).toContain("Preview Zephyr");
    expect(musicMarkup).toContain("Bright Hook");
    expect(musicMarkup).toContain("Select music track_1");
  });
});
