/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef } from "react";
import { TextOverlayBox } from "@/app/_components/stitchr/TextOverlayBox";
import { SwiprPreviewActions } from "@/app/_components/swipr/SwiprPreviewActions";
import { Panel } from "@/app/_components/ui/Panel";
import { SWIPR_STATIC_DURATION } from "@/lib/clipstitchr/constants/swiprStaticDuration";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { SwiprBackground } from "@/lib/clipstitchr/types/SwiprBackground";
import type { SwiprExportStatus } from "@/lib/clipstitchr/types/SwiprExportStatus";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

type SwiprPreviewPanelProps = {
  background: SwiprBackground | null;
  activeSlide: SwiprSlide | null;
  activeSlideIndex: number;
  saveMessage: string | null;
  isSaveDisabled: boolean;
  isSaving: boolean;
  exportStatus: SwiprExportStatus;
  exportProgress: number;
  exportError: string | null;
  isExportDisabled: boolean;
  onSave: () => void;
  onExport: () => void;
  onTextOverlayChange: (textOverlay: TextOverlay) => void;
};

export function SwiprPreviewPanel({
  background,
  activeSlide,
  activeSlideIndex,
  saveMessage,
  isSaveDisabled,
  isSaving,
  exportStatus,
  exportProgress,
  exportError,
  isExportDisabled,
  onSave,
  onExport,
  onTextOverlayChange,
}: SwiprPreviewPanelProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const backgroundUrl = useObjectUrl(background?.blob);

  return (
    <Panel className="mx-auto w-full max-w-[340px] p-3 xl:mx-0">
      <div className="mb-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Preview</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Image {activeSlideIndex + 1}
          </h2>
        </div>
        <SwiprPreviewActions
          saveMessage={saveMessage}
          isSaveDisabled={isSaveDisabled}
          isSaving={isSaving}
          exportStatus={exportStatus}
          exportProgress={exportProgress}
          exportError={exportError}
          isExportDisabled={isExportDisabled}
          onSave={onSave}
          onExport={onExport}
        />
      </div>
      <div
        ref={stageRef}
        className="relative mx-auto aspect-[9/16] w-full max-w-[292px] overflow-hidden rounded-lg bg-slate-950"
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
            Photo unavailable
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
