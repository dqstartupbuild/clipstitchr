import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StitchSourceSettingsPanel } from "@/app/_components/dashboard/StitchSourceSettingsPanel";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

const mocks = vi.hoisted(() => ({
  clipSelects: [] as Array<{
    label: string;
    onChange: (clipId: string) => void;
    value: string;
  }>,
  playbackRateControls: null as null | {
    onDemoPlaybackRateChange: (playbackRate: VideoPlaybackRate) => void;
    onUgcPlaybackRateChange: (playbackRate: VideoPlaybackRate) => void;
  },
  cropControls: [] as Array<{
    onChange: (cropBounds: VideoCropBounds) => void;
    title: string;
  }>,
  trimControls: [] as Array<{
    onChange: (trimRange: VideoTrimRange) => void;
    title: string;
  }>,
}));

vi.mock("@/app/_components/dashboard/StitchSourceClipSelect", () => ({
  StitchSourceClipSelect: (props: {
    label: string;
    onChange: (clipId: string) => void;
    value: string;
  }) => {
    mocks.clipSelects.push(props);
    return <div>{props.label}</div>;
  },
}));

vi.mock("@/app/_components/dashboard/StitchSourceTrimControl", () => ({
  StitchSourceTrimControl: (props: {
    onChange: (trimRange: VideoTrimRange) => void;
    title: string;
  }) => {
    mocks.trimControls.push(props);
    return <div>{props.title}</div>;
  },
}));

vi.mock("@/app/_components/dashboard/StitchSourceCropControl", () => ({
  StitchSourceCropControl: (props: {
    onChange: (cropBounds: VideoCropBounds) => void;
    title: string;
  }) => {
    mocks.cropControls.push(props);
    return <div>{props.title}</div>;
  },
}));

vi.mock("@/app/_components/controls/SourcePlaybackRateControls", () => ({
  SourcePlaybackRateControls: (props: {
    onDemoPlaybackRateChange: (playbackRate: VideoPlaybackRate) => void;
    onUgcPlaybackRateChange: (playbackRate: VideoPlaybackRate) => void;
  }) => {
    mocks.playbackRateControls = props;
    return <div>SourcePlaybackRateControls</div>;
  },
}));

function createClip(id: string, name: string): VideoClipMetadata {
  return {
    clipType: id.startsWith("demo") ? "demo" : "ugc",
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 10,
    height: 1920,
    id,
    mimeType: "video/mp4",
    name,
    originalName: `${name}.mp4`,
    originalSize: 100,
    size: 100,
    sourceMimeType: "video/mp4",
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: `${id}.mp4`,
      size: 100,
    },
    width: 1080,
  } as VideoClipMetadata;
}

describe("StitchSourceSettingsPanel", () => {
  beforeEach(() => {
    mocks.clipSelects = [];
    mocks.cropControls = [];
    mocks.playbackRateControls = null;
    mocks.trimControls = [];
  });

  it("renders source controls and forwards selection, trim, and speed changes", () => {
    const onDemoClipChange = vi.fn();
    const onDemoCropChange = vi.fn();
    const onDemoPlaybackRateChange = vi.fn();
    const onDemoTrimChange = vi.fn();
    const onUgcClipChange = vi.fn();
    const onUgcCropChange = vi.fn();
    const onUgcPlaybackRateChange = vi.fn();
    const onUgcTrimChange = vi.fn();
    const neutralCropBounds = {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    };
    const nextCropBounds = {
      bottom: 0.15,
      left: 0,
      right: 0,
      top: 0.1,
    };
    const markup = renderToStaticMarkup(
      <StitchSourceSettingsPanel
        demoClips={[createClip("demo_1", "Demo 1")]}
        demoCropBounds={neutralCropBounds}
        demoFallbackClip={{
          id: "demo_1",
          name: "Demo 1",
        }}
        demoPlaybackRate={1}
        demoTrimDuration={10}
        demoTrimRange={{
          end: 8,
          start: 1,
        }}
        error="Source save failed."
        selectedDemoClipId="demo_1"
        selectedUgcClipId="ugc_1"
        totalDuration={12}
        ugcClips={[createClip("ugc_1", "UGC 1")]}
        ugcCropBounds={neutralCropBounds}
        ugcFallbackClip={{
          id: "ugc_1",
          name: "UGC 1",
        }}
        ugcPlaybackRate={2}
        ugcTrimDuration={10}
        ugcTrimRange={{
          end: 5,
          start: 0,
        }}
        onDemoClipChange={onDemoClipChange}
        onDemoCropChange={onDemoCropChange}
        onDemoPlaybackRateChange={onDemoPlaybackRateChange}
        onDemoTrimChange={onDemoTrimChange}
        onUgcClipChange={onUgcClipChange}
        onUgcCropChange={onUgcCropChange}
        onUgcPlaybackRateChange={onUgcPlaybackRateChange}
        onUgcTrimChange={onUgcTrimChange}
      />,
    );

    mocks.clipSelects[0].onChange("ugc_2");
    mocks.clipSelects[1].onChange("demo_2");
    mocks.trimControls[0].onChange({ end: 5, start: 2 });
    mocks.trimControls[1].onChange({ end: 8, start: 3 });
    mocks.cropControls[0].onChange(nextCropBounds);
    mocks.cropControls[1].onChange(nextCropBounds);
    mocks.playbackRateControls?.onUgcPlaybackRateChange(1);

    expect(markup).toContain("Sources");
    expect(markup).toContain("Source save failed.");
    expect(onUgcClipChange).toHaveBeenCalledWith("ugc_2");
    expect(onDemoClipChange).toHaveBeenCalledWith("demo_2");
    expect(onUgcTrimChange).toHaveBeenCalledWith({
      end: 5,
      start: 2,
    });
    expect(onDemoTrimChange).toHaveBeenCalledWith({
      end: 8,
      start: 3,
    });
    expect(onUgcCropChange).toHaveBeenCalledWith(nextCropBounds);
    expect(onDemoCropChange).toHaveBeenCalledWith(nextCropBounds);
    expect(onUgcPlaybackRateChange).toHaveBeenCalledWith(1);
    expect(onDemoPlaybackRateChange).not.toHaveBeenCalled();
  });
});
