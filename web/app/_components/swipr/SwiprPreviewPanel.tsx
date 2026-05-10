/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef } from "react";
import { TextOverlayBox } from "@/app/_components/stitchr/TextOverlayBox";
import { Panel } from "@/app/_components/ui/Panel";
import { SWIPR_STATIC_DURATION } from "@/lib/clipstitchr/constants/swiprStaticDuration";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { SwiprBackground } from "@/lib/clipstitchr/types/SwiprBackground";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

type SwiprPreviewPanelProps = {
  background: SwiprBackground | null;
  activeSlide: SwiprSlide | null;
  activeSlideIndex: number;
  onTextOverlayChange: (textOverlay: TextOverlay) => void;
};

export function SwiprPreviewPanel({
  background,
  activeSlide,
  activeSlideIndex,
  onTextOverlayChange,
}: SwiprPreviewPanelProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const backgroundUrl = useObjectUrl(background?.blob);

  return (
    <Panel className="p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-accent-dark">Preview</p>
        <h2 className="mt-1 text-lg font-bold text-text-primary">
          Image {activeSlideIndex + 1}
        </h2>
      </div>
      <div
        ref={stageRef}
        className="relative mx-auto aspect-[9/16] max-h-[calc(100vh-11rem)] overflow-hidden rounded-lg bg-slate-950"
        style={{ containerType: "size" }}
      >
        {backgroundUrl ? (
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            src={backgroundUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Background unavailable
          </div>
        )}
        {activeSlide && activeSlide.textOverlay.text.trim() ? (
          <TextOverlayBox
            textOverlay={activeSlide.textOverlay}
            stageRef={stageRef}
            totalDuration={SWIPR_STATIC_DURATION}
            onChange={onTextOverlayChange}
          />
        ) : null}
      </div>
    </Panel>
  );
}
