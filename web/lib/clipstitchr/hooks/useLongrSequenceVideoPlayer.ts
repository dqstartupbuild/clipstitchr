"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clamp } from "@/lib/clipstitchr/utils/clamp";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type UseLongrSequenceVideoPlayerOptions = {
  trimRanges: VideoTrimRange[];
};

const LONGR_SEQUENCE_TRANSITION_EPSILON_SECONDS = 0.03;

export function useLongrSequenceVideoPlayer({
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
    () => trimRanges.map((trimRange) => getVideoTrimRangeDuration(trimRange)),
    [trimRanges],
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
      const segmentDuration = segmentDurations[index] ?? 0;
      const segmentOffset = segmentOffsets[index] ?? 0;

      if (!trimRange) {
        setCurrentTime(0);
        return;
      }

      const rawSegmentTime =
        (video?.currentTime ?? trimRange.start) - trimRange.start;
      const segmentTime = clamp(rawSegmentTime, 0, segmentDuration);

      setCurrentTime(clamp(segmentOffset + segmentTime, 0, totalDuration));
    },
    [
      getVideo,
      segmentDurations,
      segmentOffsets,
      setCurrentTime,
      totalDuration,
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

    if (!video || !trimRange || totalDuration <= 0) {
      setIsPlaying(false);
      return;
    }

    if (
      video.currentTime < trimRange.start ||
      video.currentTime >= trimRange.end
    ) {
      video.currentTime = trimRange.start;
    }

    pauseAllExcept(index);
    setIsPlaying(true);
    void video.play().catch(() => {
      setIsPlaying(false);
    });
  }, [getVideo, pauseAllExcept, setIsPlaying, totalDuration, trimRanges]);

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

      pauseAllExcept(playableIndex);
      setActiveIndex(playableIndex);
      setCurrentTime(segmentOffsets[playableIndex] ?? 0);

      if (nextVideo && nextTrimRange) {
        nextVideo.currentTime = nextTrimRange.start;
      }

      if (shouldKeepPlaying) {
        playActiveClip();
      }
    },
    [
      completeSequence,
      getNextPlayableIndex,
      getVideo,
      pauseAllExcept,
      playActiveClip,
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

    updateCurrentTime(index);

    if (
      !video ||
      !trimRange ||
      video.currentTime <
        trimRange.end - LONGR_SEQUENCE_TRANSITION_EPSILON_SECONDS
    ) {
      return;
    }

    transitionToIndex(index + 1);
  }, [getVideo, transitionToIndex, trimRanges, updateCurrentTime]);

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

      if (!video || !trimRange) {
        return;
      }

      if (
        video.currentTime < trimRange.start ||
        video.currentTime >= trimRange.end
      ) {
        video.currentTime = trimRange.start;
      }

      if (index === activeIndexRef.current) {
        updateCurrentTime(index);
      }
    },
    [getVideo, trimRanges, updateCurrentTime],
  );

  const handleTimeUpdate = useCallback(
    (index: number) => {
      const video = getVideo(index);
      const trimRange = trimRanges[index];

      if (index !== activeIndexRef.current) {
        return;
      }

      updateCurrentTime(index);

      if (!video || !trimRange || video.currentTime < trimRange.end) {
        return;
      }

      transitionToIndex(index + 1);
    },
    [getVideo, transitionToIndex, trimRanges, updateCurrentTime],
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
      const nextSegmentTime = nextTime - (segmentOffsets[nextIndex] ?? 0);
      const nextVideoTime = nextTrimRange
        ? clamp(
            nextTrimRange.start + nextSegmentTime,
            nextTrimRange.start,
            nextTrimRange.end,
          )
        : 0;

      pauseAllExcept(nextIndex);
      setActiveIndex(nextIndex);
      setCurrentTime(nextTime);

      if (nextVideo) {
        nextVideo.currentTime = nextVideoTime;
      }

      if (shouldKeepPlaying) {
        playActiveClip();
      }
    },
    [
      completeSequence,
      findIndexForTime,
      getVideo,
      pauseAllExcept,
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

      if (video) {
        video.currentTime = trimRange.start;
      }
    });

    playActiveClip();
  }, [
    completeSequence,
    getNextPlayableIndex,
    getVideo,
    pauseAllExcept,
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
