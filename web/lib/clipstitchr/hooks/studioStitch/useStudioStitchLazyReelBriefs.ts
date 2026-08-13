"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { StudioStitchCreativeBriefOption } from "./StudioStitchCreativeBriefOption";
import { parseLazyReelStudioStitchBrief } from "./parseLazyReelStudioStitchBrief";

export function useStudioStitchLazyReelBriefs(productId: string | undefined) {
  const documents = useQuery(
    api.studioLazyReelCreativeBriefs.list.list,
    productId ? { productId, limit: 30 } : "skip",
  );

  return useMemo(() => {
    if (!documents) return [];
    return documents.flatMap((document): StudioStitchCreativeBriefOption[] => {
      if (
        document.approvalState !== "approved" ||
        document.handoffDestination !== "studio_stitch"
      ) {
        return [];
      }
      const brief = parseLazyReelStudioStitchBrief(
        document.briefSnapshot.payloadJson,
      );
      return brief
        ? [
            {
              id: document.id,
              source: "lazyReel",
              title: document.title,
              note: "Approved in Research and handed to Studio Stitch.",
              brief,
            },
          ]
        : [];
    });
  }, [documents]);
}
