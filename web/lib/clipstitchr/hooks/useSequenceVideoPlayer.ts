"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import type { VideoSequenceSegment } from "@/lib/clipstitchr/types/VideoSequenceSegment";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clamp } from "@/lib/clipstitchr/utils/clamp";
import { getNextQuickEditSourceTime } from "@/lib/clipstitchr/utils/getNextQuickEditSourceTime";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";
import { getQuickEditPlaybackTimeForSourceTime } from "@/lib/clipstitchr/utils/getQuickEditPlaybackTimeForSourceTime";
import { getQuickEditSourceTimeForPlaybackTime } from "@/lib/clipstitchr/utils/getQuickEditSourceTimeForPlaybackTime";

type UseSequenceVideoPlayerOptions = {
  demoPlaybackRate?: VideoPlaybackRate;
  demoQuickEdit?: QuickEditSuggestions;
  demoSourceDuration?: number;
  ugcTrimRange: VideoTrimRange;
  demoTrimRange: VideoTrimRange;
  ugcQuickEdit?: QuickEditSuggestions;
  ugcPlaybackRate?: VideoPlaybackRate;
  ugcSourceDuration?: number;
};

const SEQUENCE_TRANSITION_EPSILON_SECONDS = 0.03;

export function useSequenceVideoPlayer({
  demoPlaybackRate = 1,
  demoQuickEdit,
  demoSourceDuration,
  ugcTrimRange,
  demoTrimRange,
  ugcQuickEdit,
  ugcPlaybackRate = 1,
  ugcSourceDuration,
}: UseSequenceVideoPlayerOptions) {
  const ugcVideoRef = useRef<HTMLVideoElement | null>(null);
  const demoVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeSegmentRef = useRef<VideoSequenceSegment>("ugc");
  const currentTimeRef = useRef(0);
  const isPlayingRef = useRef(false);
  const [activeSegment, setActiveSegmentState] =
    useState<VideoSequenceSegment>("ugc");
  const [currentTime, setCurrentTimeState] = useState(0);
  const [isPlaying, setIsPlayingState] = useState(false);
  const safeUgcSourceDuration = ugcSourceDuration ?? ugcTrimRange.end;
  const safeDemoSourceDuration = demoSourceDuration ?? demoTrimRange.end;
  const ugcDuration = getQuickEditPlaybackDuration(
    ugcTrimRange,
    safeUgcSourceDuration,
    ugcQuickEdit?.removeRanges,
    ugcPlaybackRate,
  );
  const demoDuration = getQuickEditPlaybackDuration(
    demoTrimRange,
    safeDemoSourceDuration,
    demoQuickEdit?.removeRanges,
    demoPlaybackRate,
  );
  const totalDuration = ugcDuration + demoDuration;

  const setActiveSegment = useCallback((segment: VideoSequenceSegment) => {
    activeSegmentRef.current = segment;
    setActiveSegmentState(segment);
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    currentTimeRef.current = time;
    setCurrentTimeState(time);
  }, []);

  const setIsPlaying = useCallback((playing: boolean) => {
    isPlayingRef.current = playing;
    setIsPlayingState(playing);
  }, []);

  const getSegmentVideo = useCallback((segment: VideoSequenceSegment) => {
    return segment === "ugc" ? ugcVideoRef.current : demoVideoRef.current;
  }, []);

  const getActiveTrimRange = useCallback(
    (segment: VideoSequenceSegment) =>
      segment === "ugc" ? ugcTrimRange : demoTrimRange,
    [demoTrimRange, ugcTrimRange],
  );
  const getActivePlaybackRate = useCallback(
    (segment: VideoSequenceSegment) =>
      segment === "ugc" ? ugcPlaybackRate : demoPlaybackRate,
    [demoPlaybackRate, ugcPlaybackRate],
  );
  const getActiveQuickEdit = useCallback(
    (segment: VideoSequenceSegment) =>
      segment === "ugc" ? ugcQuickEdit : demoQuickEdit,
    [demoQuickEdit, ugcQuickEdit],
  );
  const getActiveSourceDuration = useCallback(
    (segment: VideoSequenceSegment) =>
      segment === "ugc" ? safeUgcSourceDuration : safeDemoSourceDuration,
    [safeDemoSourceDuration, safeUgcSourceDuration],
  );

  const updateCurrentTime = useCallback(
    (segment: VideoSequenceSegment = activeSegmentRef.current) => {
      const video = getSegmentVideo(segment);
      const trimRange = getActiveTrimRange(segment);
      const playbackRate = getActivePlaybackRate(segment);
      const quickEdit = getActiveQuickEdit(segment);
      const sourceDuration = getActiveSourceDuration(segment);
      const segmentDuration = segment === "ugc" ? ugcDuration : demoDuration;
      const rawSegmentTime = getQuickEditPlaybackTimeForSourceTime(
        video?.currentTime ?? trimRange.start,
        trimRange,
        sourceDuration,
        quickEdit?.removeRanges,
        playbackRate,
      );
      const segmentTime = clamp(rawSegmentTime, 0, segmentDuration);

      setCurrentTime(
        clamp(
          segment === "ugc" ? segmentTime : ugcDuration + segmentTime,
          0,
          totalDuration,
        ),
      );
    },
    [
      demoDuration,
      getActivePlaybackRate,
      getActiveQuickEdit,
      getActiveSourceDuration,
      getActiveTrimRange,
      getSegmentVideo,
      setCurrentTime,
      totalDuration,
      ugcDuration,
    ],
  );

  const pauseSegment = useCallback(
    (segment: VideoSequenceSegment) => {
      getSegmentVideo(segment)?.pause();
    },
    [getSegmentVideo],
  );

  const playActiveSegment = useCallback(() => {
    const segment = activeSegmentRef.current;
    const video = getSegmentVideo(segment);
    const trimRange = getActiveTrimRange(segment);
    const playbackRate = getActivePlaybackRate(segment);
    const quickEdit = getActiveQuickEdit(segment);
    const sourceDuration = getActiveSourceDuration(segment);

    if (!video) {
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
    setIsPlaying(true);
    void video.play().catch(() => {
      setIsPlaying(false);
    });
  }, [
    getActivePlaybackRate,
    getActiveQuickEdit,
    getActiveSourceDuration,
    getActiveTrimRange,
    getSegmentVideo,
    setIsPlaying,
  ]);

  const completeSequence = useCallback(() => {
    pauseSegment("ugc");
    pauseSegment("demo");
    setActiveSegment("demo");
    setCurrentTime(totalDuration);
    setIsPlaying(false);

    const demoVideo = demoVideoRef.current;

    if (demoVideo) {
      demoVideo.currentTime = demoTrimRange.end;
    }
  }, [
    demoTrimRange.end,
    pauseSegment,
    setActiveSegment,
    setCurrentTime,
    setIsPlaying,
    totalDuration,
  ]);

  const transitionToDemo = useCallback(() => {
    const ugcVideo = ugcVideoRef.current;
    const demoVideo = demoVideoRef.current;
    const shouldKeepPlaying = isPlayingRef.current;

    if (ugcVideo) {
      ugcVideo.pause();
      ugcVideo.currentTime = ugcTrimRange.end;
    }

    setActiveSegment("demo");
    setCurrentTime(ugcDuration);

    if (!demoVideo || demoDuration <= 0) {
      completeSequence();
      return;
    }

    demoVideo.currentTime = getNextQuickEditSourceTime(
      demoTrimRange.start,
      demoTrimRange,
      safeDemoSourceDuration,
      demoQuickEdit?.removeRanges,
    );
    demoVideo.playbackRate = demoPlaybackRate;

    if (shouldKeepPlaying) {
      setIsPlaying(true);
      void demoVideo.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [
    completeSequence,
    demoDuration,
    demoPlaybackRate,
    demoQuickEdit?.removeRanges,
    safeDemoSourceDuration,
    demoTrimRange,
    setActiveSegment,
    setCurrentTime,
    setIsPlaying,
    ugcDuration,
    ugcTrimRange.end,
  ]);

  const handlePlaybackFrame = useCallback(() => {
    const segment = activeSegmentRef.current;
    const video = getSegmentVideo(segment);
    const trimRange = getActiveTrimRange(segment);
    const quickEdit = getActiveQuickEdit(segment);
    const sourceDuration = getActiveSourceDuration(segment);

    updateCurrentTime(segment);

    if (!video) {
      return;
    }

    const nextSourceTime = getNextQuickEditSourceTime(
      video.currentTime,
      trimRange,
      sourceDuration,
      quickEdit?.removeRanges,
    );

    if (
      nextSourceTime > video.currentTime + SEQUENCE_TRANSITION_EPSILON_SECONDS &&
      nextSourceTime < trimRange.end
    ) {
      video.currentTime = nextSourceTime;
      return;
    }

    if (video.currentTime < trimRange.end - SEQUENCE_TRANSITION_EPSILON_SECONDS) {
      return;
    }

    if (segment === "ugc") {
      transitionToDemo();
      return;
    }

    completeSequence();
  }, [
    completeSequence,
    getActiveQuickEdit,
    getActiveSourceDuration,
    getActiveTrimRange,
    getSegmentVideo,
    transitionToDemo,
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

  const handleLoadedMetadata = useCallback(
    (segment: VideoSequenceSegment) => {
      const video = getSegmentVideo(segment);
      const trimRange = getActiveTrimRange(segment);
      const playbackRate = getActivePlaybackRate(segment);
      const quickEdit = getActiveQuickEdit(segment);
      const sourceDuration = getActiveSourceDuration(segment);

      if (!video) {
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

      if (segment === activeSegmentRef.current) {
        updateCurrentTime(segment);
      }
    },
    [
      getActivePlaybackRate,
      getActiveQuickEdit,
      getActiveSourceDuration,
      getActiveTrimRange,
      getSegmentVideo,
      updateCurrentTime,
    ],
  );

  const handleTimeUpdate = useCallback(
    (segment: VideoSequenceSegment) => {
      const video = getSegmentVideo(segment);
      const trimRange = getActiveTrimRange(segment);
      const quickEdit = getActiveQuickEdit(segment);
      const sourceDuration = getActiveSourceDuration(segment);

      if (segment !== activeSegmentRef.current) {
        return;
      }

      updateCurrentTime(segment);

      if (!video) {
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

      if (segment === "ugc") {
        transitionToDemo();
        return;
      }

      completeSequence();
    },
    [
      completeSequence,
      getActiveQuickEdit,
      getActiveSourceDuration,
      getActiveTrimRange,
      getSegmentVideo,
      transitionToDemo,
      updateCurrentTime,
    ],
  );

  const handleEnded = useCallback(
    (segment: VideoSequenceSegment) => {
      if (segment !== activeSegmentRef.current) {
        return;
      }

      if (segment === "ugc") {
        transitionToDemo();
        return;
      }

      completeSequence();
    },
    [completeSequence, transitionToDemo],
  );

  const pause = useCallback(() => {
    pauseSegment("ugc");
    pauseSegment("demo");
    updateCurrentTime();
    setIsPlaying(false);
  }, [pauseSegment, setIsPlaying, updateCurrentTime]);

  const seekTo = useCallback(
    (sequenceTime: number) => {
      const nextTime = clamp(sequenceTime, 0, totalDuration);
      const nextSegment =
        nextTime < ugcDuration || demoDuration <= 0 ? "ugc" : "demo";
      const nextTrimRange = getActiveTrimRange(nextSegment);
      const nextSegmentTime =
        nextSegment === "ugc" ? nextTime : nextTime - ugcDuration;
      const nextPlaybackRate = getActivePlaybackRate(nextSegment);
      const nextQuickEdit = getActiveQuickEdit(nextSegment);
      const nextSourceDuration = getActiveSourceDuration(nextSegment);
      const nextVideoTime = getQuickEditSourceTimeForPlaybackTime(
        nextSegmentTime,
        nextTrimRange,
        nextSourceDuration,
        nextQuickEdit?.removeRanges,
        nextPlaybackRate,
      );
      const nextVideo = getSegmentVideo(nextSegment);
      const otherSegment = nextSegment === "ugc" ? "demo" : "ugc";
      const shouldKeepPlaying = isPlayingRef.current;

      pauseSegment(otherSegment);
      setActiveSegment(nextSegment);
      setCurrentTime(nextTime);

      if (nextVideo) {
        nextVideo.currentTime = nextVideoTime;
        nextVideo.playbackRate = nextPlaybackRate;
      }

      if (nextTime >= totalDuration) {
        completeSequence();
        return;
      }

      if (shouldKeepPlaying) {
        playActiveSegment();
      }
    },
    [
      completeSequence,
      demoDuration,
      getActivePlaybackRate,
      getActiveQuickEdit,
      getActiveSourceDuration,
      getActiveTrimRange,
      getSegmentVideo,
      pauseSegment,
      playActiveSegment,
      setActiveSegment,
      setCurrentTime,
      totalDuration,
      ugcDuration,
    ],
  );

  const play = useCallback(() => {
    if (currentTimeRef.current >= totalDuration) {
      seekTo(0);
    }

    playActiveSegment();
  }, [playActiveSegment, seekTo, totalDuration]);

  const togglePlayback = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
      return;
    }

    play();
  }, [pause, play]);

  const restart = useCallback(() => {
    pauseSegment("demo");
    setActiveSegment("ugc");
    setCurrentTime(0);

    if (ugcVideoRef.current) {
      ugcVideoRef.current.currentTime = getNextQuickEditSourceTime(
        ugcTrimRange.start,
        ugcTrimRange,
        safeUgcSourceDuration,
        ugcQuickEdit?.removeRanges,
      );
      ugcVideoRef.current.playbackRate = ugcPlaybackRate;
    }

    if (demoVideoRef.current) {
      demoVideoRef.current.currentTime = getNextQuickEditSourceTime(
        demoTrimRange.start,
        demoTrimRange,
        safeDemoSourceDuration,
        demoQuickEdit?.removeRanges,
      );
      demoVideoRef.current.playbackRate = demoPlaybackRate;
    }

    playActiveSegment();
  }, [
    demoQuickEdit?.removeRanges,
    safeDemoSourceDuration,
    demoTrimRange,
    demoPlaybackRate,
    pauseSegment,
    playActiveSegment,
    setActiveSegment,
    setCurrentTime,
    ugcTrimRange,
    ugcQuickEdit?.removeRanges,
    safeUgcSourceDuration,
    ugcPlaybackRate,
  ]);

  return useMemo(
    () => ({
      ugcVideoRef,
      demoVideoRef,
      activeSegment,
      currentTime,
      isPlaying,
      handleEnded,
      handleLoadedMetadata,
      handleTimeUpdate,
      restart,
      seekTo,
      togglePlayback,
    }),
    [
      activeSegment,
      currentTime,
      handleEnded,
      handleLoadedMetadata,
      handleTimeUpdate,
      isPlaying,
      restart,
      seekTo,
      togglePlayback,
    ],
  );
}
