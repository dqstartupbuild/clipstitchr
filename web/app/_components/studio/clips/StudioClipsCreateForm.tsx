"use client";

import { useState } from "react";
import { StudioClipsCaptionStyleControls } from "./StudioClipsCaptionStyleControls";
import { StudioClipsProcessingOptions } from "./StudioClipsProcessingOptions";
import { StudioClipsSourcePicker } from "./StudioClipsSourcePicker";
import { submitStudioClipsTaskForm } from "./submitStudioClipsTaskForm";
import type { StudioClipsCapabilities } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCapabilities";
import type { StudioClipsSourceDraft } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsSourceDraft";
import type { StudioClipsStyleDraft } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsStyleDraft";
import type { StudioClipsTaskDetail } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTaskDetail";
import type { StudioClipsTaskOptions } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTaskOptions";
import { useCreateStudioClipsTask } from "@/lib/clipstitchr/hooks/studioClips/useCreateStudioClipsTask";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsCreateFormProps = {
  activeWorkId: string | null;
  capabilities: StudioClipsCapabilities;
  isTaskHistoryLoading: boolean;
  onCreated: (task: StudioClipsTaskDetail) => void;
  productId: string;
};

export function StudioClipsCreateForm({
  activeWorkId,
  capabilities,
  isTaskHistoryLoading,
  onCreated,
  productId,
}: StudioClipsCreateFormProps) {
  const creator = useCreateStudioClipsTask(productId);
  const [source, setSource] = useState<StudioClipsSourceDraft>({ kind: "youtube", url: "" });
  const [options, setOptions] = useState<StudioClipsTaskOptions>({
    addSubtitles: true,
    includeBroll: false,
    outputFormat: "vertical",
  });
  const [style, setStyle] = useState<StudioClipsStyleDraft>({
    captionTemplate: capabilities.captionStyle.templates[0]?.id ?? "default",
    customFont: null,
    fontColor: capabilities.captionStyle.templates[0]?.fontColorHex ?? "#FFFFFF",
    fontFamily:
      capabilities.captionStyle.templates[0]?.fontFamily ??
      capabilities.captionStyle.builtInFonts[0]?.id ??
      "TikTokSans-Regular",
    fontSizePx:
      capabilities.captionStyle.templates[0]?.fontSizePx ??
      capabilities.captionStyle.fontSizeOptionsPx[0] ??
      32,
  });
  const disabled =
    creator.isCreating || isTaskHistoryLoading || Boolean(activeWorkId);

  return (
    <form
      className={styles.createForm}
      onSubmit={(event) =>
        void submitStudioClipsTaskForm(
          event,
          () => creator.createTask({ options, source, style }),
          onCreated,
        )
      }
    >
      <div className={styles.sectionLead}>
        <h2>Start with the source</h2>
        <p>One task can process at a time. Your Product owns the source, history, and outputs.</p>
      </div>
      {activeWorkId ? (
        <p className={styles.activeJobBlock} role="status">
          One clip job is already running. Open it, or cancel it before starting another.
        </p>
      ) : isTaskHistoryLoading ? (
        <p className={styles.activeJobBlock} role="status">
          Checking whether this Product already has a task in progress...
        </p>
      ) : null}
      <StudioClipsSourcePicker
        disabled={disabled}
        onChange={setSource}
        source={source}
      />
      <StudioClipsProcessingOptions capabilities={capabilities} disabled={disabled} onChange={setOptions} options={options} />
      {options.addSubtitles ? (
        <StudioClipsCaptionStyleControls capabilities={capabilities} disabled={disabled} onChange={setStyle} style={style} />
      ) : null}
      <div className={styles.createAction}>
        <button disabled={disabled} type="submit">
          {creator.isCreating
            ? "Saving task..."
            : capabilities.execution.state === "available"
              ? "Create clip task"
              : "Save task for later"}
        </button>
        {capabilities.execution.state === "unavailable" ? (
          <p>
            This saves your source and choices. Processing has not started
            because it is unavailable in this environment.
          </p>
        ) : null}
      </div>
      {creator.statusMessage ? <p className={styles.inlineStatus} role="status">{creator.statusMessage}</p> : null}
      {creator.error ? <p className={styles.inlineError} role="alert">{creator.error}</p> : null}
    </form>
  );
}
