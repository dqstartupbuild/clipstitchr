"use client";

import { useCallback, useState } from "react";
import type { StudioClipsOutput } from "./StudioClipsOutput";
import type { StudioClipsOutputEdit } from "./StudioClipsOutputEdit";
import { createStudioClipsOutputMaterializeRequest } from "./createStudioClipsOutputMaterializeRequest";
import { createStudioClipsOutputUpdateRequest } from "./createStudioClipsOutputUpdateRequest";
import { readStudioClipsJsonResponse } from "./readStudioClipsJsonResponse";

export function useStudioClipsOutputActions(productId: string | undefined) {
  const [busyOutputId, setBusyOutputId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const update = useCallback(
    async (taskId: string, output: StudioClipsOutput, edit: StudioClipsOutputEdit) => {
      if (!productId) return null;
      setBusyOutputId(output.id);
      setError(null);
      setStatusMessage(null);

      try {
        const response = await fetch(
          `/api/studio/clips/outputs/${encodeURIComponent(output.id)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              createStudioClipsOutputUpdateRequest(
                productId,
                taskId,
                output,
                edit,
              ),
            ),
          },
        );
        const body = await readStudioClipsJsonResponse<{
          output: StudioClipsOutput;
          updated: boolean;
        }>(response);
        setStatusMessage(
          edit.kind === "accept"
            ? "Approval saved."
            : "Output choice saved.",
        );
        return body.output;
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to save that change.");
        return null;
      } finally {
        setBusyOutputId(null);
      }
    },
    [productId],
  );

  const getDownloadUrl = useCallback(
    async (taskId: string, outputId: string) => {
      if (!productId) return null;
      setBusyOutputId(outputId);
      setError(null);

      try {
        const response = await fetch(
          `/api/studio/clips/outputs/${encodeURIComponent(outputId)}/download-url`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, taskId }),
          },
        );
        return await readStudioClipsJsonResponse<{ expiresIn: number; url: string }>(
          response,
        );
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to prepare the download.");
        return null;
      } finally {
        setBusyOutputId(null);
      }
    },
    [productId],
  );

  const materialize = useCallback(
    async (taskId: string, output: StudioClipsOutput) => {
      if (!productId) return null;
      if (output.libraryClipId) {
        return { created: false, libraryClipId: output.libraryClipId, output };
      }
      setBusyOutputId(output.id);
      setError(null);
      setStatusMessage(null);
      try {
        const response = await fetch(
          `/api/studio/clips/outputs/${encodeURIComponent(output.id)}/materialize`,
          {
            body: JSON.stringify(
              createStudioClipsOutputMaterializeRequest(
                productId,
                taskId,
                output,
              ),
            ),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          },
        );
        const body = await readStudioClipsJsonResponse<{
          created: boolean;
          libraryClipId: string;
          output: StudioClipsOutput;
        }>(response);
        setStatusMessage(
          body.created
            ? "Saved to this Product's Library."
            : "This clip is already in this Product's Library.",
        );
        return body;
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to save this clip to the Library.",
        );
        return null;
      } finally {
        setBusyOutputId(null);
      }
    },
    [productId],
  );

  return {
    busyOutputId,
    error,
    getDownloadUrl,
    materialize,
    statusMessage,
    update,
  };
}
