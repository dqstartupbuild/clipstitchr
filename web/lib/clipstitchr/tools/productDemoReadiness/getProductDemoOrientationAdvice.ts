import { getClipShouldUseUploadBackgroundLayout } from "@/lib/clipstitchr/utils/getClipShouldUseUploadBackgroundLayout";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";

export function getProductDemoOrientationAdvice(
  inspection: LocalVideoInspection,
) {
  if (
    !getClipShouldUseUploadBackgroundLayout({
      clipType: "demo",
      sourceAspectRatio: inspection.aspectRatio,
    })
  ) {
    return null;
  }

  return "This wide demo is not an automatic failure. ClipStitchr can preserve the full app screen on a vertical canvas with its fit-with-background layout.";
}
