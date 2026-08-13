"use client";

import { useStudioEditorSourceCatalog } from "@/lib/clipstitchr/hooks/studioEditor/useStudioEditorSourceCatalog";

export function useStudioStitchSourceCatalog(productId: string | undefined) {
  return useStudioEditorSourceCatalog(productId);
}
