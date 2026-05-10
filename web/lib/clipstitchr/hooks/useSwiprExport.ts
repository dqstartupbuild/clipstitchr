"use client";

import { useCallback, useState } from "react";
import { createZipBlob } from "@/lib/clipstitchr/utils/createZipBlob";
import { downloadBlob } from "@/lib/clipstitchr/utils/downloadBlob";
import { getSwiprExportFileName } from "@/lib/clipstitchr/utils/getSwiprExportFileName";
import { getSwiprSlideFileName } from "@/lib/clipstitchr/utils/getSwiprSlideFileName";
import { renderSwiprSlideBlob } from "@/lib/clipstitchr/media/renderSwiprSlideBlob";
import type { SwiprBackground } from "@/lib/clipstitchr/types/SwiprBackground";
import type { SwiprExportStatus } from "@/lib/clipstitchr/types/SwiprExportStatus";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";
import type { ZipFileEntry } from "@/lib/clipstitchr/types/ZipFileEntry";

type ExportSwiprOptions = {
  background: SwiprBackground | null;
  slides: SwiprSlide[];
  productName: string;
};

export function useSwiprExport() {
  const [status, setStatus] = useState<SwiprExportStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const exportCarousel = useCallback(
    async ({ background, slides, productName }: ExportSwiprOptions) => {
      if (!background) {
        setStatus("error");
        setError("Choose a background before exporting.");
        return;
      }

      setStatus("rendering");
      setProgress(0);
      setError(null);

      try {
        const files: ZipFileEntry[] = [];

        for (let index = 0; index < slides.length; index += 1) {
          const slideBlob = await renderSwiprSlideBlob(
            background.blob,
            slides[index],
          );

          files.push({
            name: getSwiprSlideFileName(index),
            blob: slideBlob,
          });
          setProgress((index + 0.72) / slides.length);
        }

        const zipBlob = await createZipBlob(files);

        downloadBlob(zipBlob, getSwiprExportFileName(productName));
        setProgress(1);
        setStatus("complete");
      } catch (nextError) {
        setStatus("error");
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to export this carousel.",
        );
      }
    },
    [],
  );

  return {
    status,
    progress,
    error,
    exportCarousel,
  };
}
