"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { VideoSequenceSegment } from "@/lib/clipstitchr/types/VideoSequenceSegment";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clamp } from "@/lib/clipstitchr/utils/clamp";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";

type UseSequenceVideoPlayerOptions = {
  demoPlaybackRate?: VideoPlaybackRate;
  ugcTrimRange: VideoTrimRange;
  demoTrimRange: VideoTrimRange;
  ugcPlaybackRate?: VideoPlaybackRate;
};

const SEQUENCE_TRANSITION_EPSILON_SECONDS = 0.03;

export function useSequenceVideoPlayer({
  demoPlaybackRate = 1,
  ugcTrimRange,
  demoTrimRange,
  ugcPlaybackRate = 1,
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
  const ugcDuration = getPlaybackRateDuration(ugcTrimRange, ugcPlaybackRate);
  const demoDuration = getPlaybackRateDuration(
    demoTrimRange,
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

  const updateCurrentTime = useCallback(
    (segment: VideoSequenceSegment = activeSegmentRef.current) => {
      const video = getSegmentVideo(segment);
      const trimRange = getActiveTrimRange(segment);
      const playbackRate = getActivePlaybackRate(segment);
      const segmentDuration = segment === "ugc" ? ugcDuration : demoDuration;
      const rawSegmentTime =
        ((video?.currentTime ?? trimRange.start) - trimRange.start) /
        playbackRate;
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

    if (!video) {
      setIsPlaying(false);
      return;
    }

    if (
      video.currentTime < trimRange.start ||
      video.currentTime >= trimRange.end
    ) {
      video.currentTime = trimRange.start;
    }

    video.playbackRate = playbackRate;
    setIsPlaying(true);
    void video.play().catch(() => {
      setIsPlaying(false);
    });
  }, [getActivePlaybackRate, getActiveTrimRange, getSegmentVideo, setIsPlaying]);

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

    demoVideo.currentTime = demoTrimRange.start;
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
    demoTrimRange.start,
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

    updateCurrentTime(segment);

    if (
      !video ||
      video.currentTime <
        trimRange.end - SEQUENCE_TRANSITION_EPSILON_SECONDS
    ) {
      return;
    }

    if (segment === "ugc") {
      transitionToDemo();
      return;
    }

    completeSequence();
  }, [
    completeSequence,
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

      if (!video) {
        return;
      }

      if (
        video.currentTime < trimRange.start ||
        video.currentTime >= trimRange.end
      ) {
        video.currentTime = trimRange.start;
      }

      video.playbackRate = playbackRate;

      if (segment === activeSegmentRef.current) {
        updateCurrentTime(segment);
      }
    },
    [
      getActivePlaybackRate,
      getActiveTrimRange,
      getSegmentVideo,
      updateCurrentTime,
    ],
  );

  const handleTimeUpdate = useCallback(
    (segment: VideoSequenceSegment) => {
      const video = getSegmentVideo(segment);
      const trimRange = getActiveTrimRange(segment);

      if (segment !== activeSegmentRef.current) {
        return;
      }

      updateCurrentTime(segment);

      if (!video || video.currentTime < trimRange.end) {
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
      const nextVideoTime = clamp(
        nextTrimRange.start + nextSegmentTime * nextPlaybackRate,
        nextTrimRange.start,
        nextTrimRange.end,
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
      ugcVideoRef.current.currentTime = ugcTrimRange.start;
      ugcVideoRef.current.playbackRate = ugcPlaybackRate;
    }

    if (demoVideoRef.current) {
      demoVideoRef.current.currentTime = demoTrimRange.start;
      demoVideoRef.current.playbackRate = demoPlaybackRate;
    }

    playActiveSegment();
  }, [
    demoTrimRange.start,
    demoPlaybackRate,
    pauseSegment,
    playActiveSegment,
    setActiveSegment,
    setCurrentTime,
    ugcTrimRange.start,
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
