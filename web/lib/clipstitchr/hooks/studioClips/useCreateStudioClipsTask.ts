"use client";

import { useCallback, useState } from "react";
import { uploadStudioBetaBlobToR2 } from "@/lib/clipstitchr/client/r2/uploadStudioBetaBlobToR2";
import { createId } from "@/lib/clipstitchr/utils/createId";
import type { StudioClipsCreateDraft } from "./StudioClipsCreateDraft";
import type { StudioClipsTaskDetail } from "./StudioClipsTaskDetail";
import type { StudioClipsTaskSource } from "./StudioClipsTaskSource";
import { createStudioClipsCreateRequest } from "./createStudioClipsCreateRequest";
import { readStudioClipsJsonResponse } from "./readStudioClipsJsonResponse";
import { readStudioClipsYouTubeSource } from "./readStudioClipsYouTubeSource";
import { validateStudioClipsVideoFile } from "./validateStudioClipsVideoFile";
import { validateStudioClipsFontFile } from "./validateStudioClipsFontFile";

export function useCreateStudioClipsTask(productId: string | undefined) {
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const createTask = useCallback(
    async (draft: StudioClipsCreateDraft) => {
      if (!productId) throw new Error("Choose a Product before saving a clip task.");
      setError(null);
      setIsCreating(true);

      try {
        let source: StudioClipsTaskSource;
        let customFontObjectKey: string | undefined;

        if (draft.style.customFont) {
          const font = draft.style.customFont;
          const verifiedFont = await validateStudioClipsFontFile(font);
          setStatusMessage("Uploading your caption font...");
          customFontObjectKey = (
            await uploadStudioBetaBlobToR2({
              blob: verifiedFont,
              kind: "font",
              productId,
              recordId: createId(),
            })
          ).key;
        }

        if (draft.source.kind === "youtube") {
          setStatusMessage("Checking the YouTube link...");
          source = {
            kind: "youtube",
            url: readStudioClipsYouTubeSource(draft.source.url).canonicalUrl,
          };
        } else {
          if (!draft.source.file) throw new Error("Choose a video to upload.");
          const file = validateStudioClipsVideoFile(draft.source.file);
          setStatusMessage("Uploading your source video...");
          const uploaded = await uploadStudioBetaBlobToR2({
            blob: file,
            kind: "media-source",
            productId,
            recordId: createId(),
          });
          source = {
            contentType: uploaded.contentType,
            kind: "r2",
            objectKey: uploaded.key,
            sizeBytes: uploaded.size,
          };
        }

        setStatusMessage("Saving the clip task...");
        const response = await fetch("/api/studio/clips/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            createStudioClipsCreateRequest(
              productId,
              source,
              draft,
              customFontObjectKey,
            ),
          ),
        });
        const body = await readStudioClipsJsonResponse<{
          created: boolean;
          task: StudioClipsTaskDetail;
        }>(response);

        setStatusMessage(
          body.created ? "Task saved." : "That task was already saved.",
        );
        return body.task;
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : "Unable to save this clip task.";
        setError(message);
        setStatusMessage(null);
        throw caught;
      } finally {
        setIsCreating(false);
      }
    },
    [productId],
  );

  return { createTask, error, isCreating, statusMessage };
}
