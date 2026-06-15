"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clamp } from "@/lib/clipstitchr/utils/clamp";
import { getNextQuickEditSourceTime } from "@/lib/clipstitchr/utils/getNextQuickEditSourceTime";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";
import { getQuickEditPlaybackTimeForSourceTime } from "@/lib/clipstitchr/utils/getQuickEditPlaybackTimeForSourceTime";
import { getQuickEditSourceTimeForPlaybackTime } from "@/lib/clipstitchr/utils/getQuickEditSourceTimeForPlaybackTime";

type UseLongrSequenceVideoPlayerOptions = {
  playbackRates?: VideoPlaybackRate[];
  quickEdits?: (QuickEditSuggestions | undefined)[];
  sourceDurations?: number[];
  trimRanges: VideoTrimRange[];
};

const LONGR_SEQUENCE_TRANSITION_EPSILON_SECONDS = 0.03;

export function useLongrSequenceVideoPlayer({
  playbackRates = [],
  quickEdits = [],
  sourceDurations = [],
  trimRanges,
}: UseLongrSequenceVideoPlayerOptions) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const activeIndexRef = useRef(0);
  const currentTimeRef = useRef(0);
  const isPlayingRef = useRef(false);
  const [activeIndex, setActiveIndexState] = useState(0);
  const [currentTime, setCurrentTimeState] = useState(0);
  const [isPlaying, setIsPlayingState] = useState(false);
  const segmentDurations = useMemo(
    () =>
      trimRanges.map((trimRange, index) =>
        getQuickEditPlaybackDuration(
          trimRange,
          sourceDurations[index] ?? trimRange.end,
          quickEdits[index]?.removeRanges,
          playbackRates[index] ?? 1,
        ),
      ),
    [playbackRates, quickEdits, sourceDurations, trimRanges],
  );
  const segmentOffsets = useMemo(() => {
    return segmentDurations.map((_, index) =>
      segmentDurations
        .slice(0, index)
        .reduce((total, duration) => total + duration, 0),
    );
  }, [segmentDurations]);
  const totalDuration = useMemo(
    () => segmentDurations.reduce((total, duration) => total + duration, 0),
    [segmentDurations],
  );

  const setVideoRef = useCallback(
    (index: number, video: HTMLVideoElement | null) => {
      videoRefs.current[index] = video;
    },
    [],
  );

  const setActiveIndex = useCallback((index: number) => {
    activeIndexRef.current = index;
    setActiveIndexState(index);
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    currentTimeRef.current = time;
    setCurrentTimeState(time);
  }, []);

  const setIsPlaying = useCallback((playing: boolean) => {
    isPlayingRef.current = playing;
    setIsPlayingState(playing);
  }, []);

  const getVideo = useCallback((index: number) => {
    return videoRefs.current[index] ?? null;
  }, []);
  const getQuickEdit = useCallback(
    (index: number) => quickEdits[index],
    [quickEdits],
  );
  const getSourceDuration = useCallback(
    (index: number) => sourceDurations[index] ?? trimRanges[index]?.end ?? 0,
    [sourceDurations, trimRanges],
  );

  const pauseAllExcept = useCallback((indexToKeep: number | null) => {
    videoRefs.current.forEach((video, index) => {
      if (index !== indexToKeep) {
        video?.pause();
      }
    });
  }, []);

  const getNextPlayableIndex = useCallback(
    (startIndex: number) => {
      for (let index = startIndex; index < segmentDurations.length; index += 1) {
        if ((segmentDurations[index] ?? 0) > 0) {
          return index;
        }
      }

      return -1;
    },
    [segmentDurations],
  );

  const updateCurrentTime = useCallback(
    (index: number = activeIndexRef.current) => {
      const video = getVideo(index);
      const trimRange = trimRanges[index];
      const playbackRate = playbackRates[index] ?? 1;
      const quickEdit = getQuickEdit(index);
      const sourceDuration = getSourceDuration(index);
      const segmentDuration = segmentDurations[index] ?? 0;
      const segmentOffset = segmentOffsets[index] ?? 0;

      if (!trimRange) {
        setCurrentTime(0);
        return;
      }

      const rawSegmentTime = getQuickEditPlaybackTimeForSourceTime(
        video?.currentTime ?? trimRange.start,
        trimRange,
        sourceDuration,
        quickEdit?.removeRanges,
        playbackRate,
      );
      const segmentTime = clamp(rawSegmentTime, 0, segmentDuration);

      setCurrentTime(clamp(segmentOffset + segmentTime, 0, totalDuration));
    },
    [
      getVideo,
      getQuickEdit,
      getSourceDuration,
      segmentDurations,
      segmentOffsets,
      setCurrentTime,
      totalDuration,
      playbackRates,
      trimRanges,
    ],
  );

  const completeSequence = useCallback(() => {
    pauseAllExcept(null);
    setActiveIndex(Math.max(0, trimRanges.length - 1));
    setCurrentTime(totalDuration);
    setIsPlaying(false);

    const finalIndex = trimRanges.length - 1;
    const finalVideo = getVideo(finalIndex);
    const finalTrimRange = trimRanges[finalIndex];

    if (finalVideo && finalTrimRange) {
      finalVideo.currentTime = finalTrimRange.end;
    }
  }, [
    getVideo,
    pauseAllExcept,
    setActiveIndex,
    setCurrentTime,
    setIsPlaying,
    totalDuration,
    trimRanges,
  ]);

  const playActiveClip = useCallback(() => {
    const index = activeIndexRef.current;
    const video = getVideo(index);
    const trimRange = trimRanges[index];
    const playbackRate = playbackRates[index] ?? 1;
    const quickEdit = getQuickEdit(index);
    const sourceDuration = getSourceDuration(index);

    if (!video || !trimRange || totalDuration <= 0) {
      setIsPlaying(false);
      return;
    }

    if (
      video.currentTime < trimRange.start ||
      video.currentTime >= trimRange.end
    ) {
      video.currentTime = getNextQuickEditSourceTime(
        trimRange.start,
        trimRange,
        sourceDuration,
        quickEdit?.removeRanges,
      );
    } else {
      const nextSourceTime = getNextQuickEditSourceTime(
        video.currentTime,
        trimRange,
        sourceDuration,
        quickEdit?.removeRanges,
      );

      if (nextSourceTime > video.currentTime + 0.01) {
        video.currentTime = nextSourceTime;
      }
    }

    video.playbackRate = playbackRate;
    pauseAllExcept(index);
    setIsPlaying(true);
    void video.play().catch(() => {
      setIsPlaying(false);
    });
  }, [
    getVideo,
    getQuickEdit,
    getSourceDuration,
    pauseAllExcept,
    playbackRates,
    setIsPlaying,
    totalDuration,
    trimRanges,
  ]);

  const transitionToIndex = useCallback(
    (nextIndex: number) => {
      const playableIndex = getNextPlayableIndex(nextIndex);
      const shouldKeepPlaying = isPlayingRef.current;

      if (playableIndex < 0) {
        completeSequence();
        return;
      }

      const nextTrimRange = trimRanges[playableIndex];
      const nextVideo = getVideo(playableIndex);
      const nextQuickEdit = getQuickEdit(playableIndex);
      const nextSourceDuration = getSourceDuration(playableIndex);

      pauseAllExcept(playableIndex);
      setActiveIndex(playableIndex);
      setCurrentTime(segmentOffsets[playableIndex] ?? 0);

      if (nextVideo && nextTrimRange) {
        nextVideo.currentTime = getNextQuickEditSourceTime(
          nextTrimRange.start,
          nextTrimRange,
          nextSourceDuration,
          nextQuickEdit?.removeRanges,
        );
        nextVideo.playbackRate = playbackRates[playableIndex] ?? 1;
      }

      if (shouldKeepPlaying) {
        playActiveClip();
      }
    },
    [
      completeSequence,
      getNextPlayableIndex,
      getQuickEdit,
      getSourceDuration,
      getVideo,
      pauseAllExcept,
      playActiveClip,
      playbackRates,
      segmentOffsets,
      setActiveIndex,
      setCurrentTime,
      trimRanges,
    ],
  );

  const handlePlaybackFrame = useCallback(() => {
    const index = activeIndexRef.current;
    const video = getVideo(index);
    const trimRange = trimRanges[index];
    const quickEdit = getQuickEdit(index);
    const sourceDuration = getSourceDuration(index);

    updateCurrentTime(index);

    if (!video || !trimRange) {
      return;
    }

    const nextSourceTime = getNextQuickEditSourceTime(
      video.currentTime,
      trimRange,
      sourceDuration,
      quickEdit?.removeRanges,
    );

    if (
      nextSourceTime > video.currentTime + LONGR_SEQUENCE_TRANSITION_EPSILON_SECONDS &&
      nextSourceTime < trimRange.end
    ) {
      video.currentTime = nextSourceTime;
      return;
    }

    if (video.currentTime < trimRange.end - LONGR_SEQUENCE_TRANSITION_EPSILON_SECONDS) {
      return;
    }

    transitionToIndex(index + 1);
  }, [
    getQuickEdit,
    getSourceDuration,
    getVideo,
    transitionToIndex,
    trimRanges,
    updateCurrentTime,
  ]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    let animationFrame = 0;

    const updateFrame = () => {
      handlePlaybackFrame();

      if (isPlayingRef.current) {
        animationFrame = window.requestAnimationFrame(updateFrame);
      }
    };

    animationFrame = window.requestAnimationFrame(updateFrame);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [handlePlaybackFrame, isPlaying]);

  useEffect(() => {
    if (!trimRanges.length) {
      void Promise.resolve().then(() => {
        pauseAllExcept(null);
        setActiveIndex(0);
        setCurrentTime(0);
        setIsPlaying(false);
      });

      return;
    }

    if (activeIndexRef.current >= trimRanges.length) {
      void Promise.resolve().then(() => {
        setActiveIndex(0);
        setCurrentTime(0);
      });
    }
  }, [
    pauseAllExcept,
    setActiveIndex,
    setCurrentTime,
    setIsPlaying,
    trimRanges.length,
  ]);

  const handleLoadedMetadata = useCallback(
    (index: number) => {
      const video = getVideo(index);
      const trimRange = trimRanges[index];
      const playbackRate = playbackRates[index] ?? 1;
      const quickEdit = getQuickEdit(index);
      const sourceDuration = getSourceDuration(index);

      if (!video || !trimRange) {
        return;
      }

      if (
        video.currentTime < trimRange.start ||
        video.currentTime >= trimRange.end
      ) {
        video.currentTime = getNextQuickEditSourceTime(
          trimRange.start,
          trimRange,
          sourceDuration,
          quickEdit?.removeRanges,
        );
      }

      video.playbackRate = playbackRate;

      if (index === activeIndexRef.current) {
        updateCurrentTime(index);
      }
    },
    [
      getQuickEdit,
      getSourceDuration,
      getVideo,
      playbackRates,
      trimRanges,
      updateCurrentTime,
    ],
  );

  const handleTimeUpdate = useCallback(
    (index: number) => {
      const video = getVideo(index);
      const trimRange = trimRanges[index];
      const quickEdit = getQuickEdit(index);
      const sourceDuration = getSourceDuration(index);

      if (index !== activeIndexRef.current) {
        return;
      }

      updateCurrentTime(index);

      if (!video || !trimRange) {
        return;
      }

      const nextSourceTime = getNextQuickEditSourceTime(
        video.currentTime,
        trimRange,
        sourceDuration,
        quickEdit?.removeRanges,
      );

      if (nextSourceTime > video.currentTime + 0.01 && nextSourceTime < trimRange.end) {
        video.currentTime = nextSourceTime;
        return;
      }

      if (video.currentTime < trimRange.end) {
        return;
      }

      transitionToIndex(index + 1);
    },
    [
      getQuickEdit,
      getSourceDuration,
      getVideo,
      transitionToIndex,
      trimRanges,
      updateCurrentTime,
    ],
  );

  const handleEnded = useCallback(
    (index: number) => {
      if (index !== activeIndexRef.current) {
        return;
      }

      transitionToIndex(index + 1);
    },
    [transitionToIndex],
  );

  const pause = useCallback(() => {
    pauseAllExcept(null);
    updateCurrentTime();
    setIsPlaying(false);
  }, [pauseAllExcept, setIsPlaying, updateCurrentTime]);

  const findIndexForTime = useCallback(
    (sequenceTime: number) => {
      for (let index = 0; index < segmentDurations.length; index += 1) {
        const offset = segmentOffsets[index] ?? 0;
        const duration = segmentDurations[index] ?? 0;

        if (
          sequenceTime < offset + duration ||
          index === segmentDurations.length - 1
        ) {
          return index;
        }
      }

      return 0;
    },
    [segmentDurations, segmentOffsets],
  );

  const seekTo = useCallback(
    (sequenceTime: number) => {
      const nextTime = clamp(sequenceTime, 0, totalDuration);
      const shouldKeepPlaying = isPlayingRef.current;

      if (!trimRanges.length || nextTime >= totalDuration) {
        completeSequence();
        return;
      }

      const nextIndex = findIndexForTime(nextTime);
      const nextTrimRange = trimRanges[nextIndex];
      const nextVideo = getVideo(nextIndex);
      const nextPlaybackRate = playbackRates[nextIndex] ?? 1;
      const nextQuickEdit = getQuickEdit(nextIndex);
      const nextSourceDuration = getSourceDuration(nextIndex);
      const nextSegmentTime = nextTime - (segmentOffsets[nextIndex] ?? 0);
      const nextVideoTime = nextTrimRange
        ? getQuickEditSourceTimeForPlaybackTime(
            nextSegmentTime,
            nextTrimRange,
            nextSourceDuration,
            nextQuickEdit?.removeRanges,
            nextPlaybackRate,
          )
        : 0;

      pauseAllExcept(nextIndex);
      setActiveIndex(nextIndex);
      setCurrentTime(nextTime);

      if (nextVideo) {
        nextVideo.currentTime = nextVideoTime;
        nextVideo.playbackRate = nextPlaybackRate;
      }

      if (shouldKeepPlaying) {
        playActiveClip();
      }
    },
    [
      completeSequence,
      findIndexForTime,
      getQuickEdit,
      getSourceDuration,
      getVideo,
      pauseAllExcept,
      playbackRates,
      playActiveClip,
      segmentOffsets,
      setActiveIndex,
      setCurrentTime,
      totalDuration,
      trimRanges,
    ],
  );

  const play = useCallback(() => {
    if (!trimRanges.length || totalDuration <= 0) {
      setIsPlaying(false);
      return;
    }

    if (currentTimeRef.current >= totalDuration) {
      seekTo(0);
    }

    playActiveClip();
  }, [playActiveClip, seekTo, setIsPlaying, totalDuration, trimRanges.length]);

  const togglePlayback = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
      return;
    }

    play();
  }, [pause, play]);

  const restart = useCallback(() => {
    const firstPlayableIndex = getNextPlayableIndex(0);

    if (firstPlayableIndex < 0) {
      completeSequence();
      return;
    }

    pauseAllExcept(firstPlayableIndex);
    setActiveIndex(firstPlayableIndex);
    setCurrentTime(segmentOffsets[firstPlayableIndex] ?? 0);

    trimRanges.forEach((trimRange, index) => {
      const video = getVideo(index);
      const quickEdit = getQuickEdit(index);
      const sourceDuration = getSourceDuration(index);

      if (video) {
        video.currentTime = getNextQuickEditSourceTime(
          trimRange.start,
          trimRange,
          sourceDuration,
          quickEdit?.removeRanges,
        );
        video.playbackRate = playbackRates[index] ?? 1;
      }
    });

    playActiveClip();
  }, [
    completeSequence,
    getQuickEdit,
    getNextPlayableIndex,
    getSourceDuration,
    getVideo,
    pauseAllExcept,
    playbackRates,
    playActiveClip,
    segmentOffsets,
    setActiveIndex,
    setCurrentTime,
    trimRanges,
  ]);

  return useMemo(
    () => ({
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
      totalDuration,
    }),
    [
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
      totalDuration,
    ],
  );
}
