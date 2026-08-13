"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useLazyReelSavedReportArchive(productId: string) {
  const archive = useMutation(api.studioLazyReelSavedReports.archive.archive);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return {
    archivingId,
    error,
    archive: async (id: string) => {
      setError(null);
      setArchivingId(id);

      try {
        await archive({ id, productId });
      } catch (archiveError) {
        setError(
          archiveError instanceof Error
            ? archiveError.message
            : "The report could not be archived.",
        );
      } finally {
        setArchivingId(null);
      }
    },
  } as const;
}
