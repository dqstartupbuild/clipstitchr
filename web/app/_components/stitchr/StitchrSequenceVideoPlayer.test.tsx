import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { StitchrSequenceVideoPlayer } from "@/app/_components/stitchr/StitchrSequenceVideoPlayer";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

const mocks = vi.hoisted(() => ({
  layerProps: [] as Array<{ quickEdit?: { crop?: unknown } }>,
}));

vi.mock("@/lib/clipstitchr/hooks/useLongrSequenceVideoPlayer", () => ({
  useLongrSequenceVideoPlayer: () => ({
    activeIndex: 0,
    currentTime: 0,
    handleEnded: vi.fn(),
    handleLoadedMetadata: vi.fn(),
    handleTimeUpdate: vi.fn(),
    isPlaying: false,
    restart: vi.fn(),
    seekTo: vi.fn(),
    setVideoRef: vi.fn(),
    togglePlayback: vi.fn(),
  }),
}));

vi.mock("@/app/_components/stitchr/StitchrSequenceVideoLayer", () => ({
  StitchrSequenceVideoLayer: (props: { quickEdit?: { crop?: unknown } }) => {
    mocks.layerProps.push(props);
    return <div />;
  },
}));

describe("StitchrSequenceVideoPlayer", () => {
  it("passes canonical segment crop settings through to the active preview layer", () => {
    const clip = {
      blob: new Blob(["video"], { type: "video/mp4" }),
      clipType: "ugc",
      duration: 5,
      height: 1920,
      id: "ugc_1",
      name: "UGC",
      width: 1080,
    } as VideoClip;
    const quickEdit = {
      crop: { mode: "smart-9x16" as const, positionX: 0.25, scale: 1.5 },
      removeRanges: [],
    };

    renderToStaticMarkup(
      <StitchrSequenceVideoPlayer
        activeTextOverlayId={null}
        clips={[clip]}
        includeAudioFlags={[true]}
        playbackRates={[1]}
        quickEdits={[quickEdit]}
        textOverlays={[]}
        totalDuration={5}
        trimRanges={[{ end: 5, start: 0 }]}
        onActiveTextOverlayIdChange={vi.fn()}
        onPlaybackTimeChange={vi.fn()}
        onTextOverlayChange={vi.fn()}
      />,
    );

    expect(mocks.layerProps).toEqual([expect.objectContaining({ quickEdit })]);
  });
});
