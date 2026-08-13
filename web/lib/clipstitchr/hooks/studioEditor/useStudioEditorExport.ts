"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { deleteObjectsFromR2 } from "@/lib/clipstitchr/client/r2/deleteObjectsFromR2";
import { createStudioEditorVideoClipSaveArgs } from "@/lib/clipstitchr/media/studioEditor/createStudioEditorVideoClipSaveArgs";
import { renderStudioEditorProject } from "@/lib/clipstitchr/media/studioEditor/renderStudioEditorProject";
import { uploadStudioEditorExportObjects } from "@/lib/clipstitchr/media/studioEditor/uploadStudioEditorExportObjects";
import type { StudioEditorExportResult } from "@/lib/clipstitchr/types/StudioEditorExportResult";
import type { StudioEditorMediaSourceCatalog } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceCatalog";
import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";
import { createId } from "@/lib/clipstitchr/utils/createId";

type UseStudioEditorExportOptions = {
  catalog: StudioEditorMediaSourceCatalog;
  productId: string;
  project: StudioEditorProjectV1;
};

export function useStudioEditorExport({
  catalog,
  productId,
  project,
}: UseStudioEditorExportOptions) {
  const saveVideoClip = useMutation(api.videoClips.save);
  const [exported, setExported] = useState<StudioEditorExportResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [savedClipId, setSavedClipId] = useState<string | null>(null);

  const exportAndSave = useCallback(async () => {
    setIsExporting(true);
    setProgress(0);
    setError(null);
    setSavedClipId(null);

    try {
      const result = await renderStudioEditorProject({
        catalog,
        project,
        onProgress: (value) => setProgress(value * 0.82),
      });
      const clipId = createId();
      const uploaded = await uploadStudioEditorExportObjects({
        clipId,
        productId,
        videoBlob: result.blob,
      });
      setProgress(0.94);

      try {
        await saveVideoClip(
          createStudioEditorVideoClipSaveArgs({
            clipId,
            exported: result,
            posterObject: uploaded.posterObject,
            productId,
            project,
            updatedAt: new Date().toISOString(),
            videoObject: uploaded.videoObject,
          }),
        );
      } catch (caught) {
        await deleteObjectsFromR2([
          uploaded.videoObject,
          uploaded.posterObject,
        ]).catch(() => undefined);
        throw caught;
      }

      setExported(result);
      setSavedClipId(clipId);
      setProgress(1);
      return result;
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "This export did not finish.",
      );
      throw caught;
    } finally {
      setIsExporting(false);
    }
  }, [catalog, productId, project, saveVideoClip]);

  return {
    error,
    exportAndSave,
    exported,
    isExporting,
    progress,
    savedClipId,
  };
}
