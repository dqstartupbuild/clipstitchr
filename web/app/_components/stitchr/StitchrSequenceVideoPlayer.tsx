"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SelectableTextOverlayPreviewBox } from "@/app/_components/stitchr/SelectableTextOverlayPreviewBox";
import { StitchrSequenceVideoLayer } from "@/app/_components/stitchr/StitchrSequenceVideoLayer";
import { TextOverlayBox } from "@/app/_components/stitchr/TextOverlayBox";
import { TextOverlayQuickControls } from "@/app/_components/stitchr/TextOverlayQuickControls";
import { IconButton } from "@/app/_components/ui/IconButton";
import { useLongrSequenceVideoPlayer } from "@/lib/clipstitchr/hooks/useLongrSequenceVideoPlayer";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getTextOverlayIsInRange } from "@/lib/clipstitchr/utils/getTextOverlayIsInRange";
import { getTextOverlayIsVisible } from "@/lib/clipstitchr/utils/getTextOverlayIsVisible";
import { getTextOverlayId } from "@/lib/clipstitchr/utils/getTextOverlayId";

type StitchrSequenceVideoPlayerProps = {
  clips: VideoClip[];
  includeAudioFlags: boolean[];
  playbackRates: VideoPlaybackRate[];
  textOverlays: TextOverlay[];
  activeTextOverlayId: string | null;
  totalDuration: number;
  trimRanges: VideoTrimRange[];
  onActiveTextOverlayIdChange: (textOverlayId: string) => void;
  onPlaybackTimeChange: (currentTime: number) => void;
  onTextOverlayChange: (textOverlay: TextOverlay) => void;
};

export function StitchrSequenceVideoPlayer({
  clips,
  includeAudioFlags,
  playbackRates,
  textOverlays,
  activeTextOverlayId,
  totalDuration,
  trimRanges,
  onActiveTextOverlayIdChange,
  onPlaybackTimeChange,
  onTextOverlayChange,
}: StitchrSequenceVideoPlayerProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [areTextControlsOpen, setAreTextControlsOpen] = useState(false);
  const {
    activeIndex,
    currentTime,
    handleEnded,
    handleLoadedMetadata,
    handleTimeUpdate,
    isPlaying,
    restart,
    seekTo,
    setVideoRef,
    togglePlayback,
  } = useLongrSequenceVideoPlayer({ playbackRates, trimRanges });
  const progressValue = Math.min(currentTime, totalDuration);
  const renderedTextOverlays = textOverlays
    .map((textOverlay, index) => {
      const textOverlayId = getTextOverlayId(textOverlay, index);

      return {
        id: textOverlayId,
        isActive: textOverlayId === activeTextOverlayId,
        textOverlay,
      };
    })
    .filter(
      ({ isActive, textOverlay }) =>
        isActive
          ? getTextOverlayIsInRange(textOverlay, currentTime)
          : getTextOverlayIsVisible(textOverlay, currentTime),
    );
  const activeTextOverlay =
    renderedTextOverlays.find((textOverlay) => textOverlay.isActive)
      ?.textOverlay ?? null;

  useEffect(() => {
    onPlaybackTimeChange(currentTime);
  }, [currentTime, onPlaybackTimeChange]);

  return (
    <div>
      <div
        ref={stageRef}
        className="relative mx-auto aspect-[9/16] w-full max-w-[292px] overflow-hidden rounded-lg bg-slate-950"
        style={{ containerType: "size" }}
      >
        {clips.length ? (
          clips.map((clip, index) => (
            <StitchrSequenceVideoLayer
              key={`${clip.id}-${index}`}
              clip={clip}
              isActive={activeIndex === index}
              isMuted={!includeAudioFlags[index]}
              playbackRate={playbackRates[index] ?? 1}
              videoRef={(video) => setVideoRef(index, video)}
              onEnded={() => handleEnded(index)}
              onLoadedMetadata={() => handleLoadedMetadata(index)}
              onTimeUpdate={() => handleTimeUpdate(index)}
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Preview unavailable
          </div>
        )}
        {renderedTextOverlays.map(({ id, isActive, textOverlay }) =>
          isActive ? (
            <TextOverlayBox
              key={id}
              emptyLabel="Text"
              textOverlay={textOverlay}
              stageRef={stageRef}
              totalDuration={totalDuration}
              onChange={onTextOverlayChange}
              onOpenStyleControls={() => setAreTextControlsOpen(true)}
            />
          ) : (
            <SelectableTextOverlayPreviewBox
              key={id}
              textOverlay={textOverlay}
              onSelect={() => onActiveTextOverlayIdChange(id)}
            />
          ),
        )}
        {activeTextOverlay && areTextControlsOpen ? (
          <TextOverlayQuickControls
            textOverlay={activeTextOverlay}
            totalDuration={totalDuration}
            onChange={onTextOverlayChange}
            onClose={() => setAreTextControlsOpen(false)}
          />
        ) : null}
      </div>
      <div className="mt-3 flex justify-end">
        <div className="flex items-center gap-2">
          <IconButton
            type="button"
            label={isPlaying ? "Pause preview" : "Play preview"}
            icon={
              isPlaying ? (
                <Pause aria-hidden className="h-4 w-4" />
              ) : (
                <Play aria-hidden className="h-4 w-4" />
              )
            }
            onClick={togglePlayback}
          />
          <IconButton
            type="button"
            label="Restart preview"
            icon={<RotateCcw aria-hidden className="h-4 w-4" />}
            onClick={restart}
          />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          aria-label="Preview time"
          min={0}
          max={totalDuration}
          step={0.05}
          value={progressValue}
          className="min-w-0 flex-1 accent-accent"
          onChange={(event) => seekTo(Number(event.target.value))}
        />
        <p className="w-24 text-right text-xs font-semibold text-text-tertiary">
          {formatDuration(progressValue)} / {formatDuration(totalDuration)}
        </p>
      </div>
    </div>
  );
}
